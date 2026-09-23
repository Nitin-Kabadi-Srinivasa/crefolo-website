// Google Calendar access with a long-lived refresh token (OAuth client of the teacher's Google account).
import type { AppEnv } from './env';

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
  created?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  hangoutLink?: string;
  htmlLink?: string;
  attendees?: { email: string }[];
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[]; createRequest?: { status?: { statusCode?: string } } };
  extendedProperties?: { private?: Record<string, string> };
}

/** crefolo=trial: one event per booked child. crefolo=session: one host event per group trial (owns the Meet). */
export type EventKind = 'trial' | 'session';

export interface CreateEventInput {
  start: Date;
  end: Date;
  timeZone: string;
  summary: string;
  description: string;
  location?: string;
  attendees?: string[];
  withMeet?: boolean; // create a Google Meet for this event
  quiet?: boolean; // no pop-up reminders, shown as "free" in the calendar
  privateProps: Record<string, string>;
}

export interface EventPatch {
  summary?: string;
  description?: string;
  attendees?: string[];
  privateProps?: Record<string, string>; // merged into the existing private properties
}

export interface CalendarService {
  createEvent(input: CreateEventInput): Promise<CalendarEvent>;
  getEvent(id: string): Promise<CalendarEvent | null>;
  deleteEvent(id: string): Promise<void>;
  listEvents(kind: EventKind, min: Date, max: Date): Promise<CalendarEvent[]>;
  patchEvent(id: string, patch: EventPatch): Promise<void>;
}

let tokenCache: { value: string; exp: number } | null = null;

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

export function realCalendar(env: AppEnv): CalendarService {
  return {
    async createEvent(input) {
      const body: Record<string, unknown> = {
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
        end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
        attendees: input.attendees?.length ? input.attendees.map((email) => ({ email })) : undefined,
        extendedProperties: { private: input.privateProps },
        reminders: input.quiet ? { useDefault: false, overrides: [] } : { useDefault: true },
        transparency: input.quiet ? 'transparent' : 'opaque',
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: false,
      };
      if (input.withMeet) {
        body.conferenceData = { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } };
      }
      let event = await api<CalendarEvent>(env, '/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      // The Meet link is normally created synchronously; poll once if it is still pending.
      if (input.withMeet && !meetLinkOf(event)) {
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

    async listEvents(kind, min, max) {
      const params = new URLSearchParams({
        privateExtendedProperty: `crefolo=${kind}`,
        timeMin: min.toISOString(),
        timeMax: max.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        showDeleted: 'false',
        conferenceDataVersion: '1',
        maxResults: '250',
      });
      const json = await api<{ items?: CalendarEvent[] }>(env, `/calendars/primary/events?${params}`);
      return (json.items || []).filter((e) => e.status !== 'cancelled');
    },

    async patchEvent(id, patch) {
      const body: Record<string, unknown> = {};
      if (patch.summary !== undefined) body.summary = patch.summary;
      if (patch.description !== undefined) body.description = patch.description;
      if (patch.attendees) body.attendees = patch.attendees.map((email) => ({ email }));
      if (patch.privateProps) body.extendedProperties = { private: patch.privateProps };
      await api<CalendarEvent>(env, `/calendars/primary/events/${encodeURIComponent(id)}?sendUpdates=none`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
  };
}

export function meetLinkOf(event: CalendarEvent): string {
  if (event.hangoutLink) return event.hangoutLink;
  const video = event.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video');
  return video?.uri || '';
}
