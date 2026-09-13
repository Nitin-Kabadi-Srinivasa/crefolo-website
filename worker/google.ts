// Google Calendar access with a long-lived refresh token (OAuth client of the teacher's Google account).
import type { AppEnv } from './env';
import type { BusyRange } from './slots';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CAL = 'https://www.googleapis.com/calendar/v3';

export class GoogleError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface CalendarEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  hangoutLink?: string;
  htmlLink?: string;
  attendees?: { email: string }[];
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[]; createRequest?: { status?: { statusCode?: string } } };
  extendedProperties?: { private?: Record<string, string> };
}

export interface CreateEventInput {
  start: Date;
  end: Date;
  timeZone: string;
  summary: string;
  description: string;
  attendeeEmail?: string;
  privateProps: Record<string, string>;
}

export interface CalendarService {
  getBusy(min: Date, max: Date): Promise<BusyRange[]>;
  createEvent(input: CreateEventInput): Promise<CalendarEvent>;
  getEvent(id: string): Promise<CalendarEvent | null>;
  deleteEvent(id: string): Promise<void>;
  listTrialEvents(min: Date, max: Date): Promise<CalendarEvent[]>;
  patchPrivateProps(id: string, props: Record<string, string>): Promise<void>;
}

let tokenCache: { value: string; exp: number } | null = null;
let calendarCache: { ids: string[]; exp: number } | null = null;

export async function getAccessToken(env: AppEnv): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 30_000) return tokenCache.value;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    throw new GoogleError(500, 'Google credentials are not configured');
  }
  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  const res = await fetch(TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
  if (!res.ok) throw new GoogleError(res.status, `token refresh failed: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { value: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function api<T>(env: AppEnv, path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken(env);
  const res = await fetch(CAL + path, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers || {}) },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) throw new GoogleError(res.status, `${init.method || 'GET'} ${path} -> ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

async function listCalendarIds(env: AppEnv): Promise<string[]> {
  if (calendarCache && calendarCache.exp > Date.now()) return calendarCache.ids;
  const json = await api<{ items?: { id: string; hidden?: boolean; deleted?: boolean }[] }>(
    env,
    '/users/me/calendarList?minAccessRole=reader&fields=items(id,hidden,deleted)',
  );
  const ids = (json.items || []).filter((c) => !c.hidden && !c.deleted).map((c) => c.id);
  if (ids.length === 0) ids.push('primary');
  calendarCache = { ids, exp: Date.now() + 10 * 60_000 };
  return ids;
}

export function realCalendar(env: AppEnv): CalendarService {
  return {
    async getBusy(min, max) {
      const ids = await listCalendarIds(env);
      const json = await api<{ calendars: Record<string, { busy?: { start: string; end: string }[] }> }>(env, '/freeBusy', {
        method: 'POST',
        body: JSON.stringify({ timeMin: min.toISOString(), timeMax: max.toISOString(), items: ids.map((id) => ({ id })) }),
      });
      const busy: BusyRange[] = [];
      for (const cal of Object.values(json.calendars || {})) {
        for (const b of cal.busy || []) busy.push({ start: new Date(b.start), end: new Date(b.end) });
      }
      return busy;
    },

    async createEvent(input) {
      const body = {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
        end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
        attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : undefined,
        conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
        extendedProperties: { private: input.privateProps },
        reminders: { useDefault: true },
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: false,
      };
      let event = await api<CalendarEvent>(env, '/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      // The Meet link is normally created synchronously; poll once if it is still pending.
      if (!meetLinkOf(event)) {
        await new Promise((r) => setTimeout(r, 1500));
        event = await api<CalendarEvent>(env, `/calendars/primary/events/${encodeURIComponent(event.id)}?conferenceDataVersion=1`);
      }
      return event;
    },

    async getEvent(id) {
      try {
        const ev = await api<CalendarEvent>(env, `/calendars/primary/events/${encodeURIComponent(id)}?conferenceDataVersion=1`);
        return ev.status === 'cancelled' ? null : ev;
      } catch (e) {
        if (e instanceof GoogleError && (e.status === 404 || e.status === 410)) return null;
        throw e;
      }
    },

    async deleteEvent(id) {
      try {
        await api<void>(env, `/calendars/primary/events/${encodeURIComponent(id)}?sendUpdates=none`, { method: 'DELETE' });
      } catch (e) {
        if (e instanceof GoogleError && (e.status === 404 || e.status === 410)) return;
        throw e;
      }
    },

    async listTrialEvents(min, max) {
      const params = new URLSearchParams({
        privateExtendedProperty: 'crefolo=trial',
        timeMin: min.toISOString(),
        timeMax: max.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        showDeleted: 'false',
        conferenceDataVersion: '1',
        maxResults: '50',
      });
      const json = await api<{ items?: CalendarEvent[] }>(env, `/calendars/primary/events?${params}`);
      return (json.items || []).filter((e) => e.status !== 'cancelled');
    },

    async patchPrivateProps(id, props) {
      await api<CalendarEvent>(env, `/calendars/primary/events/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ extendedProperties: { private: props } }),
      });
    },
  };
}

export function meetLinkOf(event: CalendarEvent): string {
  if (event.hangoutLink) return event.hangoutLink;
  const video = event.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video');
  return video?.uri || '';
}
