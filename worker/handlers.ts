import { type AppEnv, getSlotConfig } from './env';
import { generateSlots, windowOf, overlapsBusy, findSlot } from './slots';
import { getServices } from './services';
import { verifyTurnstile } from './turnstile';
import { verifyToken } from './crypto';
import { buildIcs } from './ics';
import { bookingInfoFromEvent, eventSummary, eventDescription } from './booking';
import { parentConfirmation, teacherNotification, parentCancellation, teacherCancellation, type Lang } from './emails';
import { cancelConfirmPage, cancelledPage, invalidLinkPage, errorPage } from './pages';
import { formatDateLong, formatRange } from './time';
import { GoogleError, getAccessToken } from './google';
import { getGraphToken } from './graph';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

export const json = (data: unknown, status = 200): Response => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
const html = (body: string, status = 200): Response =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

// Availability is cached briefly per isolate to keep Google API calls low while parents browse.
let availabilityCache: { exp: number; body: string } | null = null;
export const invalidateAvailability = () => {
  availabilityCache = null;
};

// ------------------------------------------------------------------ GET /api/availability
export async function handleAvailability(env: AppEnv): Promise<Response> {
  if (availabilityCache && availabilityCache.exp > Date.now()) return new Response(availabilityCache.body, { headers: JSON_HEADERS });
  const cfg = getSlotConfig(env);
  const { calendar } = getServices(env);
  const now = new Date();
  const slots = generateSlots(now, cfg);
  const win = windowOf(slots);
  const busy = win ? await calendar.getBusy(win.min, win.max) : [];

  const days = new Map<string, { date: string; slots: { start: string; end: string; available: boolean }[] }>();
  for (const s of slots) {
    let day = days.get(s.date);
    if (!day) {
      day = { date: s.date, slots: [] };
      days.set(s.date, day);
    }
    day.slots.push({ start: s.start.toISOString(), end: s.end.toISOString(), available: !overlapsBusy(s, busy) });
  }
  const body = JSON.stringify({ ok: true, timezone: cfg.timeZone, generatedAt: now.toISOString(), days: [...days.values()] });
  availabilityCache = { exp: Date.now() + 45_000, body };
  return new Response(body, { headers: JSON_HEADERS });
}

// ------------------------------------------------------------------ POST /api/book
interface BookPayload {
  start: string;
  childName: string;
  childAge: number;
  parentName: string;
  email: string;
  phone: string;
  message: string;
  lang: Lang;
  turnstileToken: string;
}

function parsePayload(raw: unknown): BookPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const start = str(r.start, 40);
  const childName = str(r.childName, 40);
  const childAge = Number(r.childAge);
  const parentName = str(r.parentName, 60);
  const email = str(r.email, 120);
  const phone = str(r.phone, 30);
  const message = str(r.message, 500);
  const lang: Lang = r.lang === 'en' ? 'en' : 'de';
  const turnstileToken = str(r.turnstileToken, 4000);
  if (!start || !Number.isFinite(Date.parse(start))) return null;
  if (childName.length < 1) return null;
  if (!Number.isInteger(childAge) || childAge < 3 || childAge > 17) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  if ((phone.match(/\d/g) || []).length < 6) return null;
  return { start, childName, childAge, parentName, email, phone, message, lang, turnstileToken };
}

export async function handleBook(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid' }, 400);
  }
  const data = parsePayload(raw);
  if (!data) return json({ ok: false, error: 'invalid' }, 400);

  const ip = request.headers.get('cf-connecting-ip');
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, data.turnstileToken, ip))) return json({ ok: false, error: 'turnstile' }, 400);

  const cfg = getSlotConfig(env);
  const slot = findSlot(generateSlots(new Date(), cfg), data.start);
  if (!slot) return json({ ok: false, error: 'slot_taken' }, 409);

  const { calendar, mailer } = getServices(env);
  try {
    const busy = await calendar.getBusy(slot.start, slot.end);
    if (overlapsBusy(slot, busy)) return json({ ok: false, error: 'slot_taken' }, 409);

    const childAge = String(data.childAge);
    const privateProps: Record<string, string> = {
      crefolo: 'trial',
      lang: data.lang,
      childName: data.childName,
      childAge,
      parentName: data.parentName,
      parentEmail: data.email,
      parentPhone: data.phone,
      message: data.message,
      bookedAt: new Date().toISOString(),
    };
    const event = await calendar.createEvent({
      start: slot.start,
      end: slot.end,
      timeZone: cfg.timeZone,
      summary: eventSummary(data.childName, childAge, data.lang),
      description: eventDescription({ ...data, childAge, parentEmail: data.email, parentPhone: data.phone, cancelUrl: '' }),
      attendeeEmail: data.email,
      privateProps,
    });
    invalidateAvailability();

    // Make sure the info object sees the private props even if the API response omitted them
    event.extendedProperties = { private: { ...privateProps, ...(event.extendedProperties?.private || {}) } };
    const info = await bookingInfoFromEvent(env, event);
    if (!info) throw new Error('booking info could not be built');

    // Add the cancel link to the calendar event description (best effort, in the background)
    ctx.waitUntil(
      calendar
        .patchPrivateProps(event.id, { cancelUrl: info.cancelUrl })
        .catch((e) => console.error('patch cancel url failed', e)),
    );

    const ics = buildIcs({
      uid: event.id,
      start: info.start,
      end: info.end,
      summary: eventSummary(info.childName, info.childAge, info.lang),
      description: (info.lang === 'de' ? 'Google Meet: ' : 'Google Meet: ') + info.meetLink,
      location: info.meetLink,
      url: info.meetLink || info.siteUrl,
      organizerEmail: info.teacherEmail,
      organizerName: `${info.teacherName} (Crefolo)`,
    });

    const results = await Promise.allSettled([mailer.send(parentConfirmation(info, ics)), mailer.send(teacherNotification(info))]);
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(i === 0 ? 'parent email failed' : 'teacher email failed', r.reason);
    });
    const emailSent = results[0].status === 'fulfilled';

    return json({
      ok: true,
      booking: {
        id: event.id,
        start: info.start.toISOString(),
        end: info.end.toISOString(),
        meetLink: info.meetLink,
        cancelUrl: info.cancelUrl,
        icsUrl: info.icsUrl,
        emailSent,
      },
    });
  } catch (e) {
    console.error('booking failed', e);
    if (e instanceof GoogleError) return json({ ok: false, error: 'unavailable' }, 503);
    return json({ ok: false, error: 'generic' }, 500);
  }
}

// ------------------------------------------------------------------ GET|POST /api/cancel
export async function handleCancel(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const token = url.searchParams.get('t') || '';
  const lang: Lang = url.searchParams.get('lang') === 'en' ? 'en' : 'de';
  const site = env.SITE_URL.replace(/\/$/, '');
  const secret = env.CANCEL_SECRET || 'missing-cancel-secret';

  if (!id || !(await verifyToken(secret, 'cancel', id, token))) return html(invalidLinkPage(lang, site), 400);

  const { calendar, mailer } = getServices(env);
  try {
    const event = await calendar.getEvent(id);
    const info = event ? await bookingInfoFromEvent(env, event) : null;
    if (!info) return html(invalidLinkPage(lang, site), 404);

    if (request.method === 'GET') {
      return html(
        cancelConfirmPage(
          lang,
          formatDateLong(info.start, info.timeZone, lang),
          formatRange(info.start, info.end, info.timeZone, lang),
          info.childName,
          url.pathname + url.search,
          site,
        ),
      );
    }

    await calendar.deleteEvent(id);
    invalidateAvailability();
    ctx.waitUntil(
      Promise.allSettled([mailer.send(parentCancellation(info)), mailer.send(teacherCancellation(info))]).then((rs) =>
        rs.forEach((r) => r.status === 'rejected' && console.error('cancel email failed', r.reason)),
      ),
    );
    return html(cancelledPage(lang, site));
  } catch (e) {
    console.error('cancel failed', e);
    return html(errorPage(lang, site), 500);
  }
}

// ------------------------------------------------------------------ GET /api/ics
export async function handleIcs(request: Request, env: AppEnv): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const token = url.searchParams.get('t') || '';
  const secret = env.CANCEL_SECRET || 'missing-cancel-secret';
  if (!id || !(await verifyToken(secret, 'cancel', id, token))) return json({ ok: false, error: 'invalid' }, 400);
  const { calendar } = getServices(env);
  const event = await calendar.getEvent(id);
  const info = event ? await bookingInfoFromEvent(env, event) : null;
  if (!info) return json({ ok: false, error: 'not_found' }, 404);
  const ics = buildIcs({
    uid: info.eventId,
    start: info.start,
    end: info.end,
    summary: eventSummary(info.childName, info.childAge, info.lang),
    description: 'Google Meet: ' + info.meetLink,
    location: info.meetLink,
    url: info.meetLink || info.siteUrl,
    organizerEmail: info.teacherEmail,
    organizerName: `${info.teacherName} (Crefolo)`,
  });
  return new Response(ics, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${info.lang === 'de' ? 'probestunde' : 'trial-lesson'}-crefolo.ics"`,
      'cache-control': 'no-store',
    },
  });
}

// ------------------------------------------------------------------ GET /api/health
let healthCache: { exp: number; body: { ok: boolean; mock: boolean; google: boolean; microsoft: boolean } } | null = null;
export async function handleHealth(env: AppEnv): Promise<Response> {
  const { mock } = getServices(env);
  if (mock) return json({ ok: true, mock: true, google: true, microsoft: true });
  if (healthCache && healthCache.exp > Date.now()) return json(healthCache.body, healthCache.body.ok ? 200 : 503);
  const [g, m] = await Promise.allSettled([getAccessToken(env), getGraphToken(env)]);
  const body = { ok: g.status === 'fulfilled' && m.status === 'fulfilled', mock: false, google: g.status === 'fulfilled', microsoft: m.status === 'fulfilled' };
  if (g.status === 'rejected') console.error('health: google', g.reason);
  if (m.status === 'rejected') console.error('health: microsoft', m.reason);
  healthCache = { exp: Date.now() + 5 * 60_000, body };
  return json(body, body.ok ? 200 : 503);
}
