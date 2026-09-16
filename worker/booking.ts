// Shared booking logic: turn a calendar event into the info the emails need, build links.
import type { AppEnv } from './env';
import type { CalendarEvent } from './google';
import { meetLinkOf } from './google';
import { signToken } from './crypto';
import type { BookingInfo, Lang } from './emails';

export const WHATSAPP_URL = 'https://wa.me/491628904641';
export const TEACHER_PHONE = '+49 162 890 4641';

// origin = the address the booking was made on (localhost, workers.dev or crefolo.com); falls back to SITE_URL for cron jobs
export async function linksFor(env: AppEnv, eventId: string, lang: Lang, origin?: string): Promise<{ cancelUrl: string; icsUrl: string; token: string }> {
  const secret = env.CANCEL_SECRET || 'missing-cancel-secret';
  const token = await signToken(secret, 'cancel', eventId);
  const site = (origin || env.SITE_URL).replace(/\/$/, '');
  return {
    token,
    cancelUrl: `${site}/api/cancel?id=${encodeURIComponent(eventId)}&t=${token}&lang=${lang}`,
    icsUrl: `${site}/api/ics?id=${encodeURIComponent(eventId)}&t=${token}&lang=${lang}`,
  };
}

export async function bookingInfoFromEvent(env: AppEnv, event: CalendarEvent, origin?: string): Promise<BookingInfo | null> {
  const p = event.extendedProperties?.private || {};
  if (p.crefolo !== 'trial' || !event.start?.dateTime || !event.end?.dateTime) return null;
  const lang: Lang = p.lang === 'en' ? 'en' : 'de';
  const links = await linksFor(env, event.id, lang, origin);
  return {
    eventId: event.id,
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
    timeZone: env.TIMEZONE || 'Europe/Berlin',
    childName: p.childName || '',
    childAge: p.childAge || '',
    parentName: p.parentName || '',
    parentEmail: p.parentEmail || event.attendees?.[0]?.email || '',
    parentPhone: p.parentPhone || '',
    message: p.message || '',
    lang,
    meetLink: meetLinkOf(event),
    cancelUrl: links.cancelUrl,
    icsUrl: links.icsUrl,
    eventLink: event.htmlLink || '',
    siteUrl: (origin || env.SITE_URL).replace(/\/$/, ''),
    teacherName: env.TEACHER_NAME || 'Nitin',
    teacherEmail: env.TEACHER_EMAIL,
    teacherPhone: TEACHER_PHONE,
    whatsappUrl: WHATSAPP_URL,
  };
}

export function eventSummary(childName: string, childAge: string, lang: Lang): string {
  return lang === 'de' ? `Probestunde Englisch: ${childName} (${childAge} J.)` : `English trial lesson: ${childName} (${childAge} y.)`;
}

export function eventDescription(input: { childName: string; childAge: string; parentName: string; parentEmail: string; parentPhone: string; message: string; lang: Lang; cancelUrl: string }): string {
  return [
    `Probestunde Englisch: ${input.childName} (${input.childAge} Jahre)`,
    `Eltern: ${input.parentName || '-'}`,
    `E-Mail: ${input.parentEmail}`,
    `Telefon: ${input.parentPhone || '-'}`,
    `Nachricht: ${input.message || '-'}`,
    `Sprache: ${input.lang}`,
    `Gebucht über crefolo.com`,
    `Absagen: ${input.cancelUrl}`,
  ].join('\n');
}
