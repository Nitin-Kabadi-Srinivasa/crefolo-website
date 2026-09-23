import { type AppEnv, minDaysAhead, timeZoneOf } from './env';
import { bookableSessions, findSession, trialCapacity, agesText } from './sessions';
import { childrenAt, ensureHost, syncHost } from './group';
import { getServices } from './services';
import { verifyTurnstile } from './turnstile';
import { verifyToken } from './crypto';
import { buildIcs } from './ics';
import { bookingInfoFromEvent, eventSummary, eventDescription } from './booking';
import { parentConfirmation, teacherNotification, parentCancellation, teacherCancellation, type BookingInfo, type Lang } from './emails';
import { cancelConfirmPage, cancelledPage, invalidLinkPage, errorPage } from './pages';
import { formatDateLong, formatRange } from './time';
import { GoogleError, getAccessToken, meetLinkOf } from './google';
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
  const tz = timeZoneOf(env);
  const now = new Date();
  const capacity = trialCapacity();
  const sessions = bookableSessions(now, tz, minDaysAhead(env));

  const taken = new Map<number, number>();
  if (sessions.length) {
    const { calendar } = getServices(env);
    const events = await calendar.listEvents('trial', sessions[0].start, sessions[sessions.length - 1].end);
    for (const e of events) {
      const t = Date.parse(e.start?.dateTime || '');
      if (Number.isFinite(t)) taken.set(t, (taken.get(t) || 0) + 1);
    }
  }

  const body = JSON.stringify({
    ok: true,
    timezone: tz,
    capacity,
    generatedAt: now.toISOString(),
    sessions: sessions.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
      ages: s.ages,
      taken: Math.min(capacity, taken.get(s.start.getTime()) || 0),
    })),
  });
  availabilityCache = { exp: Date.now() + 30_000, body };
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
  if (parentName.length < 1) return null;
  if (!Number.isInteger(childAge) || childAge < 3 || childAge > 17) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  if (phone && (phone.match(/\d/g) || []).length < 6) return null; // phone is optional
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

  const tz = timeZoneOf(env);
  const session = findSession(bookableSessions(new Date(), tz, minDaysAhead(env)), data.start);
  if (!session) return json({ ok: false, error: 'slot_taken' }, 409);

  const capacity = trialCapacity();
  const { calendar, mailer } = getServices(env);
  try {
    if ((await childrenAt(calendar, session.start)).length >= capacity) return json({ ok: false, error: 'slot_taken' }, 409);

    // The session's host event owns the shared Google Meet
    const host = await ensureHost(calendar, session, tz);
    const meetLink = meetLinkOf(host);

    const childAge = String(data.childAge);
    const privateProps: Record<string, string> = {
      crefolo: 'trial',
      ages: session.agesKey,
      meetLink,
      hostId: host.id,
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
      start: session.start,
      end: session.end,
      timeZone: tz,
      summary: eventSummary(data.childName, childAge, data.lang),
      description: eventDescription({
        ...data,
        childAge,
        parentEmail: data.email,
        parentPhone: data.phone,
        agesText: agesText(session.agesKey, 'de'),
        meetLink,
      }),
      location: meetLink,
      quiet: true,
      privateProps,
    });

    // Two parents may have taken the last seat at the same moment: the earlier booking wins.
    const children = await childrenAt(calendar, session.start);
    const seat = children.findIndex((c) => c.id === event.id);
    if (seat >= capacity) {
      await calendar.deleteEvent(event.id);
      ctx.waitUntil(syncHost(calendar, session.start).catch((e) => console.error('host sync failed', e)));
      invalidateAvailability();
      return json({ ok: false, error: 'slot_taken' }, 409);
    }
    invalidateAvailability();

    // Make sure the info object sees the private props even if the API response omitted them
    event.extendedProperties = { private: { ...privateProps, ...(event.extendedProperties?.private || {}) } };
    const info = await bookingInfoFromEvent(env, event, new URL(request.url).origin);
    if (!info) throw new Error('booking info could not be built');
    // If Google's list does not show the new booking yet, count it anyway
    info.seatsTaken = Math.min(seat >= 0 ? children.length : children.length + 1, capacity);
    info.capacity = capacity;

    // Background: invite the parent to the shared lesson, refresh the host's list, store the cancel link
    ctx.waitUntil(
      Promise.allSettled([
        syncHost(calendar, session.start),
        calendar.patchEvent(event.id, { privateProps: { cancelUrl: info.cancelUrl } }),
      ]).then((rs) => rs.forEach((r) => r.status === 'rejected' && console.error('post-booking update failed', r.reason))),
    );

    const ics = icsFor(info);
    const results = await Promise.allSettled([mailer.send(parentConfirmation(info, ics)), mailer.send(teacherNotification(info))]);
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(i === 0 ? 'parent email failed' : 'teacher email failed', r.reason);
    });

    return json({
      ok: true,
      booking: {
        id: event.id,
        start: info.start.toISOString(),
        end: info.end.toISOString(),
        meetLink: info.meetLink,
        cancelUrl: info.cancelUrl,
        icsUrl: info.icsUrl,
        emailSent: results[0].status === 'fulfilled',
      },
    });
  } catch (e) {
    console.error('booking failed', e);
    if (e instanceof GoogleError) return json({ ok: false, error: 'unavailable' }, 503);
    return json({ ok: false, error: 'generic' }, 500);
  }
}

function icsFor(info: BookingInfo): string {
  return buildIcs({
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
}

// ------------------------------------------------------------------ GET|POST /api/cancel
export async function handleCancel(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const token = url.searchParams.get('t') || '';
  const lang: Lang = url.searchParams.get('lang') === 'en' ? 'en' : 'de';
  const site = url.origin;
  const secret = env.CANCEL_SECRET || 'missing-cancel-secret';

  if (!id || !(await verifyToken(secret, 'cancel', id, token))) return html(invalidLinkPage(lang, site), 400);

  const { calendar, mailer } = getServices(env);
  try {
    const event = await calendar.getEvent(id);
    const info = event ? await bookingInfoFromEvent(env, event, site) : null;
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
      Promise.allSettled([
        syncHost(calendar, info.start), // removes the parent from the shared lesson, or deletes it when empty
        mailer.send(parentCancellation(info)),
        mailer.send(teacherCancellation(info)),
      ]).then((rs) => rs.forEach((r) => r.status === 'rejected' && console.error('post-cancel step failed', r.reason))),
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
  const info = event ? await bookingInfoFromEvent(env, event, url.origin) : null;
  if (!info) return json({ ok: false, error: 'not_found' }, 404);
  return new Response(icsFor(info), {
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
