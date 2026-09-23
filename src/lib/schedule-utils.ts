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

/** "1., 8. und 15. Oktober sowie 5. November" / "1, 8 and 15 October and 5 November" */
export function dayList(dates: string[], locale: Locale): string {
  const monthName = (ymd: string) => new Intl.DateTimeFormat(intl(locale), { month: 'long', timeZone: 'UTC' }).format(noon(ymd));
  const groups: { month: string; days: number[] }[] = [];
  for (const d of [...dates].sort()) {
    const key = d.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.days.push(Number(d.slice(8)));
    else groups.push({ month: key, days: [Number(d.slice(8))] });
  }
  const and = locale === 'de' ? 'und' : 'and';
  const join = (items: string[], sep: string) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${sep} ${items[items.length - 1]}`);
  const parts = groups.map((g) => {
    const days = g.days.map((n) => (locale === 'de' ? `${n}.` : String(n)));
    return `${join(days, and)} ${monthName(`${g.month}-01`)}`;
  });
  return join(parts, locale === 'de' ? 'sowie' : 'and');
}

/** "5 bis 7 und 8 bis 10 Jahre" / "ages 5 to 7 and 8 to 10" */
export function bandsText(bands: [number, number][], locale: Locale): string {
  const items = bands.map(([a, b]) => (locale === 'de' ? `${a} bis ${b}` : `${a} to ${b}`));
  const list = items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${locale === 'de' ? 'und' : 'and'} ${items[items.length - 1]}`;
  return locale === 'de' ? `${list} Jahre` : `ages ${list}`;
}

export function upcomingTrials(today = todayYmd()): TrialSession[] {
  return schedule.trials.filter((t) => t.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function upcomingBreaks(today = todayYmd()): ClassBreak[] {
  return schedule.breaks.filter((b) => b.to >= today).sort((a, b) => a.from.localeCompare(b.from));
}

export function uniqueBands(trials: TrialSession[]): [number, number][] {
  const seen = new Map<string, [number, number]>();
  for (const t of trials) seen.set(`${t.ages[0]}-${t.ages[1]}`, [t.ages[0], t.ages[1]]);
  return [...seen.values()].sort((a, b) => a[0] - b[0]);
}
