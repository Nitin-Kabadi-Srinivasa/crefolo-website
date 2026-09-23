// Formatting helpers for the dates in src/content/schedule.ts (used at build time by the pages).
import { schedule, type ClassBreak, type TrialSession } from '@/content/schedule';
import type { Locale } from '@/content/types';
import { zonedToUtc } from '../../worker/time';

const TZ = 'Europe/Berlin';
const intl = (locale: Locale) => (locale === 'de' ? 'de-DE' : 'en-GB');
const noon = (ymd: string) => new Date(`${ymd}T12:00:00Z`);

/** Today's date in Germany as 'YYYY-MM-DD'. */
export function todayYmd(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** UTC instant of a German date + time, e.g. ('2026-11-05', '17:00'). */
export function berlinInstant(ymd: string, time: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return zonedToUtc(y, m, d, hh, mm, TZ);
}

/** "Donnerstag, 5. November 2026" / "Thursday 5 November 2026" */
export function longDate(ymd: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intl(locale), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(noon(ymd));
}

/** "21.12.2026" / "21 Dec 2026" */
export function shortDate(ymd: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intl(locale), { dateStyle: 'medium', timeZone: 'UTC' }).format(noon(ymd));
}

/** "donnerstags" / "Thursdays" */
export function weekdaysPlural(ymd: string, locale: Locale): string {
  const wd = new Intl.DateTimeFormat(intl(locale), { weekday: 'long', timeZone: 'UTC' }).format(noon(ymd));
  return locale === 'de' ? `${wd.toLowerCase()}s` : `${wd}s`;
}

/** '2026-10-01' -> "01.10.2026" (same format in both languages) */
export function numericDate(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  return `${d}.${m}.${y}`;
}

/** ["a", "b", "c"] -> "a, b und c" / "a, b and c" */
export function joinList(items: string[], locale: Locale): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${locale === 'de' ? 'und' : 'and'} ${items[items.length - 1]}`;
}

/**
 * The trial times per date, e.g. "17:00 Uhr für 5 bis 7 Jahre und 18:00 Uhr für 8 bis 10 Jahre".
 * Empty when the dates do not all have the same times and age bands (then the booking form shows the details).
 */
export function slotsText(trials: TrialSession[], locale: Locale): string {
  const slotKey = (t: TrialSession) => `${t.time}|${t.ages[0]}-${t.ages[1]}`;
  const perDate = new Map<string, Set<string>>();
  for (const t of trials) perDate.set(t.date, (perDate.get(t.date) || new Set()).add(slotKey(t)));
  const sets = [...perDate.values()].map((s) => [...s].sort().join(','));
  if (!sets.length || sets.some((s) => s !== sets[0])) return '';
  const slots = sets[0].split(',').map((k) => {
    const [time, ages] = k.split('|');
    const [a, b] = ages.split('-');
    return locale === 'de' ? `${time} Uhr für ${a} bis ${b} Jahre` : `${time} for ages ${a} to ${b}`;
  });
  return joinList(slots, locale);
}

export function upcomingTrials(today = todayYmd()): TrialSession[] {
  return schedule.trials.filter((t) => t.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function upcomingBreaks(today = todayYmd()): ClassBreak[] {
  return schedule.breaks.filter((b) => b.to >= today).sort((a, b) => a.from.localeCompare(b.from));
}

