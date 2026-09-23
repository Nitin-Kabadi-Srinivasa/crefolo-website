// Group trial lessons: one host event per session owns the Google Meet and lists all parents as guests;
// each booked child is its own (quiet) event, so cancel links and reminders work per child.
import type { CalendarEvent, CalendarService } from './google';
import { meetLinkOf } from './google';
import { agesText, trialCapacity, type Session } from './sessions';

const WINDOW_MS = 60_000;
const startsAt = (e: CalendarEvent, t: number) => Date.parse(e.start?.dateTime || '') === t;
const prop = (e: CalendarEvent, key: string) => e.extendedProperties?.private?.[key] || '';

/** Order of arrival: the earliest bookings keep their seat if two parents book the last seat at once. */
function byArrival(a: CalendarEvent, b: CalendarEvent): number {
  const ka = prop(a, 'bookedAt') || a.created || '';
  const kb = prop(b, 'bookedAt') || b.created || '';
  return ka.localeCompare(kb) || a.id.localeCompare(b.id);
}

function oldestFirst(a: CalendarEvent, b: CalendarEvent): number {
  return (a.created || '').localeCompare(b.created || '') || a.id.localeCompare(b.id);
}

export async function childrenAt(calendar: CalendarService, start: Date): Promise<CalendarEvent[]> {
  const t = start.getTime();
  const events = await calendar.listEvents('trial', start, new Date(t + WINDOW_MS));
  return events.filter((e) => startsAt(e, t)).sort(byArrival);
}

async function hostsAt(calendar: CalendarService, start: Date): Promise<CalendarEvent[]> {
  const t = start.getTime();
  const events = await calendar.listEvents('session', start, new Date(t + WINDOW_MS));
  return events.filter((e) => startsAt(e, t)).sort(oldestFirst);
}

function hostSummary(agesKey: string, taken: number): string {
  return `Crefolo Probestunde ${agesText(agesKey, 'de')} (${taken}/${trialCapacity()})`;
}

function hostDescription(agesKey: string, meetLink: string, children: CalendarEvent[]): string {
  const lines = [`Kostenlose Gruppen-Probestunde, ${agesText(agesKey, 'de')}`, `Angemeldet: ${children.length} von ${trialCapacity()}`, ''];
  for (const c of children) {
    const phone = prop(c, 'parentPhone');
    lines.push(`• ${prop(c, 'childName')}, ${prop(c, 'childAge')} J. · ${prop(c, 'parentName') || '-'} · ${prop(c, 'parentEmail')}${phone ? ` · ${phone}` : ''}`);
    const msg = prop(c, 'message');
    if (msg) lines.push(`  Nachricht: ${msg}`);
  }
  if (meetLink) lines.push('', `Google Meet: ${meetLink}`);
  lines.push('', 'Wird automatisch von crefolo.com aktualisiert.');
  return lines.join('\n');
}

/** Returns the session's host event, creating it (with a Google Meet) on the first booking. */
export async function ensureHost(calendar: CalendarService, session: Session, tz: string): Promise<CalendarEvent> {
  const existing = await hostsAt(calendar, session.start);
  if (existing.length) return existing[0];
  const created = await calendar.createEvent({
    start: session.start,
    end: session.end,
    timeZone: tz,
    summary: hostSummary(session.agesKey, 0),
    description: hostDescription(session.agesKey, '', []),
    withMeet: true,
    privateProps: { crefolo: 'session', ages: session.agesKey },
  });
  // Two parents booking an empty session at the same moment could create two hosts: keep the oldest.
  const all = await hostsAt(calendar, session.start);
  const keep = all[0] || created;
  if (keep.id !== created.id) {
    await calendar.deleteEvent(created.id).catch((e) => console.error('duplicate host cleanup failed', e));
  }
  return keep;
}

/** Brings the host event in line with the booked children: guest list, title, description; deleted when empty. */
export async function syncHost(calendar: CalendarService, start: Date): Promise<void> {
  const hosts = await hostsAt(calendar, start);
  if (!hosts.length) return; // legacy one-to-one trial, nothing to sync
  const children = await childrenAt(calendar, start);
  if (!children.length) {
    for (const h of hosts) await calendar.deleteEvent(h.id);
    return;
  }
  const host = hosts[0];
  const agesKey = prop(host, 'ages');
  const emails = [...new Set(children.map((c) => prop(c, 'parentEmail').toLowerCase()).filter(Boolean))];
  await calendar.patchEvent(host.id, {
    summary: hostSummary(agesKey, children.length),
    description: hostDescription(agesKey, meetLinkOf(host), children),
    attendees: emails,
  });
}
