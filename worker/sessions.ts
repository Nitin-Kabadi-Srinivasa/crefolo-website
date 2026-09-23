// Group trial sessions, read from src/content/schedule.ts (the single source of truth for dates).
import { schedule } from '../src/content/schedule';
import { addDays, zonedParts, zonedToUtc } from './time';

export interface Session {
  start: Date;
  end: Date;
  ages: [number, number];
  agesKey: string; // "5-7", stored on calendar events
}

export const trialCapacity = (): number => Math.max(1, Math.floor(schedule.trialCapacity || 3));

/** All configured trial sessions, oldest first. Invalid entries are skipped (and logged). */
export function allSessions(tz: string): Session[] {
  const minutes = Math.max(15, Math.floor(schedule.trialMinutes || 60));
  const out: Session[] = [];
  for (const t of schedule.trials) {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.date);
    const h = /^(\d{1,2}):(\d{2})$/.exec(t.time);
    if (!d || !h || !Array.isArray(t.ages) || t.ages.length !== 2) {
      console.error('schedule: invalid trial entry skipped', t);
      continue;
    }
    const start = zonedToUtc(Number(d[1]), Number(d[2]), Number(d[3]), Number(h[1]), Number(h[2]), tz);
    if (!Number.isFinite(start.getTime())) continue;
    out.push({
      start,
      end: new Date(start.getTime() + minutes * 60_000),
      ages: [t.ages[0], t.ages[1]],
      agesKey: `${t.ages[0]}-${t.ages[1]}`,
    });
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Sessions parents can still book: from today + minDaysAhead (local date) onwards. */
export function bookableSessions(now: Date, tz: string, minDaysAhead: number): Session[] {
  const today = zonedParts(now, tz);
  const first = addDays(today.year, today.month, today.day, Math.max(0, minDaysAhead));
  const firstStart = zonedToUtc(first.year, first.month, first.day, 0, 0, tz);
  return allSessions(tz).filter((s) => s.start >= firstStart && s.start > now);
}

export function findSession(sessions: Session[], startIso: string): Session | undefined {
  const t = Date.parse(startIso);
  if (!Number.isFinite(t)) return undefined;
  return sessions.find((s) => s.start.getTime() === t);
}

/** "5-7" -> "5 bis 7 Jahre" / "ages 5 to 7". Empty for legacy bookings without an age band. */
export function agesText(agesKey: string | undefined, lang: 'de' | 'en'): string {
  const m = /^(\d+)-(\d+)$/.exec(agesKey || '');
  if (!m) return '';
  return lang === 'de' ? `${m[1]} bis ${m[2]} Jahre` : `ages ${m[1]} to ${m[2]}`;
}
