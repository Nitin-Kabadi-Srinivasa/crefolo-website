// Fake calendar + mailer for local design work (MOCK=1): no network calls, everything lives in memory.
// A few demo bookings are seeded so the widget shows free, partly booked and full trial dates.
import type { CalendarService, CalendarEvent, EventKind } from './google';
import type { Mail, Mailer } from './graph';
import { allSessions } from './sessions';

const events = new Map<string, CalendarEvent>();
let seeded = false;
let counter = 0;

function nextId(): string {
  counter += 1;
  return `mock-${Date.now().toString(36)}-${counter}`;
}

function seed(): void {
  if (seeded) return;
  seeded = true;
  const now = Date.now();
  const upcoming = allSessions('Europe/Berlin').filter((s) => s.start.getTime() > now);
  // 2nd upcoming session: one child booked; 3rd: full
  const plan: [number, number][] = [
    [1, 1],
    [2, 3],
  ];
  const names = ['Mia', 'Ben', 'Lina'];
  for (const [index, count] of plan) {
    const s = upcoming[index];
    if (!s) continue;
    for (let i = 0; i < count; i++) {
      const id = nextId();
      events.set(id, {
        id,
        status: 'confirmed',
        created: new Date(now - (10 - i) * 60_000).toISOString(),
        summary: `Probestunde Englisch: ${names[i]} (6 J.)`,
        start: { dateTime: s.start.toISOString() },
        end: { dateTime: s.end.toISOString() },
        extendedProperties: {
          private: {
            crefolo: 'trial',
            ages: s.agesKey,
            childName: names[i],
            childAge: '6',
            parentName: 'Demo',
            parentEmail: `demo${i}@example.com`,
            lang: 'de',
            bookedAt: new Date(now - (10 - i) * 60_000).toISOString(),
          },
        },
      });
    }
  }
}

export function mockCalendar(): CalendarService {
  seed();
  return {
    async createEvent(input) {
      const id = nextId();
      const ev: CalendarEvent = {
        id,
        status: 'confirmed',
        created: new Date().toISOString(),
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
        end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
        hangoutLink: input.withMeet ? `https://meet.google.com/demo-${id.slice(-4)}-grp` : undefined,
        htmlLink: 'https://calendar.google.com/',
        attendees: (input.attendees || []).map((email) => ({ email })),
        extendedProperties: { private: { ...input.privateProps } },
      };
      events.set(id, ev);
      console.log(`[mock] event created ${id}: ${input.summary}`);
      return ev;
    },
    async getEvent(id) {
      return events.get(id) ?? null;
    },
    async deleteEvent(id) {
      events.delete(id);
      console.log(`[mock] event deleted ${id}`);
    },
    async listEvents(kind: EventKind, min, max) {
      return [...events.values()]
        .filter((e) => e.extendedProperties?.private?.crefolo === kind)
        .filter((e) => {
          const s = Date.parse(e.start?.dateTime || '');
          const en = Date.parse(e.end?.dateTime || '');
          return en > min.getTime() && s < max.getTime();
        })
        .sort((a, b) => Date.parse(a.start!.dateTime!) - Date.parse(b.start!.dateTime!));
    },
    async patchEvent(id, patch) {
      const ev = events.get(id);
      if (!ev) return;
      if (patch.summary !== undefined) ev.summary = patch.summary;
      if (patch.description !== undefined) ev.description = patch.description;
      if (patch.attendees) ev.attendees = patch.attendees.map((email) => ({ email }));
      if (patch.privateProps) ev.extendedProperties = { private: { ...(ev.extendedProperties?.private || {}), ...patch.privateProps } };
      console.log(`[mock] event patched ${id}: ${ev.summary}`);
    },
  };
}

export function mockMailer(): Mailer {
  return {
    async send(mail: Mail) {
      console.log(`[mail dry run] to ${mail.to}: ${mail.subject}\n${mail.text}\n`);
    },
  };
}
