// Fake calendar + mailer for local design work (MOCK=1): no network calls, bookings live in memory.
import type { CalendarService, CalendarEvent } from './google';
import type { Mailer } from './graph';
import type { BusyRange } from './slots';

const events = new Map<string, CalendarEvent>();

function pseudoBusy(min: Date, max: Date): BusyRange[] {
  // Block a deterministic pattern of slots so the widget shows a realistic mix.
  const busy: BusyRange[] = [];
  const day = 86_400_000;
  for (let t = Math.floor(min.getTime() / day) * day; t < max.getTime(); t += day) {
    const dayIndex = Math.floor(t / day);
    const local = new Date(t);
    const blockHour = 15 + (dayIndex % 4); // UTC hour; roughly 17-20 local in summer
    if (dayIndex % 3 !== 0) {
      const start = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), blockHour, 0));
      busy.push({ start, end: new Date(start.getTime() + 60 * 60_000) });
    }
    if (dayIndex % 7 === 2) {
      const start = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 0, 0));
      busy.push({ start, end: new Date(start.getTime() + day) }); // whole day off
    }
  }
  for (const ev of events.values()) {
    if (ev.start?.dateTime && ev.end?.dateTime) busy.push({ start: new Date(ev.start.dateTime), end: new Date(ev.end.dateTime) });
  }
  return busy;
}

export function mockCalendar(): CalendarService {
  return {
    async getBusy(min, max) {
      return pseudoBusy(min, max);
    },
    async createEvent(input) {
      const id = 'mock-' + crypto.randomUUID().slice(0, 8);
      const ev: CalendarEvent = {
        id,
        status: 'confirmed',
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
        end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
        hangoutLink: 'https://meet.google.com/abc-defg-hij',
        htmlLink: 'https://calendar.google.com/',
        attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : [],
        extendedProperties: { private: { ...input.privateProps } },
      };
      events.set(id, ev);
      console.log('[mock] event created', id, input.summary);
      return ev;
    },
    async getEvent(id) {
      return events.get(id) ?? null;
    },
    async deleteEvent(id) {
      events.delete(id);
      console.log('[mock] event deleted', id);
    },
    async listTrialEvents(min, max) {
      return [...events.values()].filter((e) => {
        const s = e.start?.dateTime ? new Date(e.start.dateTime) : null;
        return !!s && s >= min && s < max;
      });
    },
    async patchPrivateProps(id, props) {
      const ev = events.get(id);
      if (ev) ev.extendedProperties = { private: { ...(ev.extendedProperties?.private || {}), ...props } };
    },
  };
}

export function mockMailer(): Mailer {
  return {
    async send(mail) {
      console.log(`[mock] email to ${mail.to}: ${mail.subject}\n${mail.text}\n`);
    },
  };
}
