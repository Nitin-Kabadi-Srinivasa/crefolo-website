import type { SlotConfig } from './env';
import { addDays, zonedParts, zonedToUtc } from './time';

export interface Slot {
  date: string; // local YYYY-MM-DD
  start: Date;
  end: Date;
}

export interface BusyRange {
  start: Date;
  end: Date;
}

/** All bookable slots in the booking window, ignoring the calendar. */
export function generateSlots(now: Date, cfg: SlotConfig): Slot[] {
  const today = zonedParts(now, cfg.timeZone);
  const slots: Slot[] = [];
  for (let i = cfg.minDaysAhead; i <= cfg.maxDaysAhead; i++) {
    const d = addDays(today.year, today.month, today.day, i);
    const iso = d.weekday === 0 ? 7 : d.weekday;
    if (!cfg.weekdays.includes(iso)) continue;
    const date = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    for (const hour of cfg.startHours) {
      const start = zonedToUtc(d.year, d.month, d.day, hour, 0, cfg.timeZone);
      const end = new Date(start.getTime() + cfg.minutes * 60_000);
      if (start.getTime() <= now.getTime()) continue;
      slots.push({ date, start, end });
    }
  }
  return slots;
}

export function windowOf(slots: Slot[]): { min: Date; max: Date } | null {
  if (slots.length === 0) return null;
  return { min: slots[0].start, max: slots[slots.length - 1].end };
}

export function overlapsBusy(slot: { start: Date; end: Date }, busy: BusyRange[]): boolean {
  return busy.some((b) => slot.start < b.end && slot.end > b.start);
}

/** Find the generated slot that exactly matches a requested start instant. */
export function findSlot(slots: Slot[], startIso: string): Slot | undefined {
  const t = Date.parse(startIso);
  if (!Number.isFinite(t)) return undefined;
  return slots.find((s) => s.start.getTime() === t);
}
