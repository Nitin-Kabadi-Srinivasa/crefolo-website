// Booking widget: loads free slots from /api/availability, lets the parent pick a day and time,
// collects the details and posts to /api/book.
import type { BookingStrings } from '@/content/types';

type Slot = { start: string; end: string; available: boolean };
type Day = { date: string; slots: Slot[] };
type Availability = { ok: boolean; timezone: string; days: Day[] };
type BookResponse =
  | {
      ok: true;
      booking: { id: string; start: string; end: string; meetLink: string; cancelUrl: string; icsUrl: string; emailSent: boolean };
    }
  | { ok: false; error: string };

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
    onTurnstileLoad?: () => void;
  }
}

const root = document.getElementById('booking-widget');
if (root) init(root);

function init(root: HTMLElement) {
  const locale = (root.dataset.locale === 'en' ? 'en' : 'de') as 'de' | 'en';
  const api = root.dataset.api || '/api';
  const sitekey = root.dataset.sitekey || '';
  const s = JSON.parse(document.getElementById('booking-i18n')!.textContent || '{}') as BookingStrings;
  const tz = 'Europe/Berlin';
  const intl = locale === 'de' ? 'de-DE' : 'en-GB';
  const timeFmt = new Intl.DateTimeFormat(intl, { hour: '2-digit', minute: '2-digit', timeZone: tz });

  const q = <T extends HTMLElement>(role: string) => root.querySelector<T>(`[data-role="${role}"]`)!;
  const els = {
    status: q('status'),
    error: q('error'),
    errorText: q('error-text'),
    days: q('days'),
    daysList: q('days-list'),
    times: q('times'),
    timesList: q('times-list'),
    form: q<HTMLFormElement>('form'),
    submit: q<HTMLButtonElement>('submit'),
    submitLabel: q('submit-label'),
    summary: q('summary'),
    summaryText: q('summary-text'),
    change: q<HTMLButtonElement>('change'),
    success: q('success'),
    successText: q('success-text'),
    successSlot: q('success-slot'),
    meetLink: q<HTMLAnchorElement>('meet-link'),
    gcalLink: q<HTMLAnchorElement>('gcal-link'),
    icsLink: q<HTMLAnchorElement>('ics-link'),
    another: q<HTMLButtonElement>('another'),
    turnstile: q('turnstile'),
  };
  const stepItems = Array.from(root.querySelectorAll<HTMLElement>('.bsteps__item'));

  let availability: Availability | null = null;
  let selectedDay: Day | null = null;
  let selectedSlot: Slot | null = null;
  let turnstileId: string | null = null;
  let turnstileLoading = false;
  let turnstileToken = '';
  let turnstileFailed = false;

  // ---------- helpers ----------
  const show = (el: HTMLElement, on: boolean) => {
    el.hidden = !on;
  };
  const setStep = (n: number) => {
    stepItems.forEach((li, i) => {
      li.classList.toggle('is-active', i + 1 === n);
      li.classList.toggle('is-done', i + 1 < n);
    });
  };
  const showError = (msg: string) => {
    els.errorText.textContent = msg;
    show(els.error, true);
    els.error.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const clearError = () => show(els.error, false);

  const parseDate = (ymd: string) => new Date(`${ymd}T12:00:00Z`);
  const dateLabel = (ymd: string) => {
    const d = parseDate(ymd);
    const wd = s.weekdaysLong[d.getUTCDay()];
    const month = s.months[d.getUTCMonth()];
    return locale === 'de' ? `${wd}, ${d.getUTCDate()}. ${month}` : `${wd}, ${d.getUTCDate()} ${month}`;
  };
  const timeLabel = (slot: { start: string; end: string }) => `${timeFmt.format(new Date(slot.start))}–${timeFmt.format(new Date(slot.end))}`;
  const summaryFor = (day: Day, slot: Slot) => {
    const d = parseDate(day.date);
    const template = s.summary.replace('{day}', s.weekdaysLong[d.getUTCDay()]).replace('{time}', timeLabel(slot));
    const dateOnly = locale === 'de' ? `${d.getUTCDate()}. ${s.months[d.getUTCMonth()]}` : `${d.getUTCDate()} ${s.months[d.getUTCMonth()]}`;
    return template.replace('{date}', dateOnly);
  };

  // ---------- load availability ----------
  async function load() {
    show(els.status, true);
    clearError();
    try {
      const res = await fetch(`${api}/availability`, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      availability = (await res.json()) as Availability;
      if (!availability.ok) throw new Error('not ok');
      renderDays();
      show(els.status, false);
      show(els.days, true);
      setStep(1);
    } catch (err) {
      console.error('availability failed', err);
      show(els.status, false);
      showError(s.errors.unavailable);
    }
  }

  function renderDays() {
    els.daysList.innerHTML = '';
    const days = availability!.days;
    const anyFree = days.some((d) => d.slots.some((x) => x.available));
    if (!anyFree) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = s.noSlotsAll;
      els.daysList.appendChild(p);
      return;
    }
    for (const day of days) {
      const d = parseDate(day.date);
      const free = day.slots.filter((x) => x.available).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-chip';
      btn.disabled = free === 0;
      btn.setAttribute('aria-label', `${dateLabel(day.date)} – ${free === 0 ? s.taken : s.free.replace('{n}', String(free))}`);
      btn.innerHTML =
        `<span class="day-chip__wd">${s.weekdaysShort[d.getUTCDay()]}</span>` +
        `<span class="day-chip__day">${d.getUTCDate()}</span>` +
        `<span class="day-chip__month">${s.months[d.getUTCMonth()].slice(0, 3)}</span>` +
        `<span class="day-chip__free ${free === 0 ? 'day-chip__free--none' : ''}">${free === 0 ? s.taken : s.free.replace('{n}', String(free))}</span>`;
      btn.addEventListener('click', () => selectDay(day, btn));
      els.daysList.appendChild(btn);
    }
  }

  function selectDay(day: Day, btn: HTMLButtonElement) {
    selectedDay = day;
    selectedSlot = null;
    clearError();
    els.daysList.querySelectorAll('.day-chip').forEach((b) => b.classList.toggle('is-selected', b === btn));
    els.timesList.innerHTML = '';
    for (const slot of day.slots) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'time-btn';
      t.disabled = !slot.available;
      t.innerHTML = `<span>${timeLabel(slot)}</span>` + (slot.available ? '' : `<span class="time-btn__taken">${s.taken}</span>`);
      t.addEventListener('click', () => selectSlot(slot, t));
      els.timesList.appendChild(t);
    }
    show(els.times, true);
    show(els.form, false);
    show(els.summary, false);
    setStep(2);
    els.times.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function selectSlot(slot: Slot, btn: HTMLButtonElement) {
    selectedSlot = slot;
    clearError();
    els.timesList.querySelectorAll('.time-btn').forEach((b) => b.classList.toggle('is-selected', b === btn));
    els.summaryText.textContent = summaryFor(selectedDay!, slot);
    show(els.summary, true);
    show(els.days, false);
    show(els.times, false);
    show(els.form, true);
    setStep(3);
    ensureTurnstile();
    els.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    (els.form.querySelector<HTMLInputElement>('input[name="childName"]') || els.form).focus({ preventScroll: true });
  }

  function resetToDays() {
    selectedSlot = null;
    show(els.summary, false);
    show(els.form, false);
    show(els.days, true);
    show(els.times, !!selectedDay);
    setStep(selectedDay ? 2 : 1);
    els.days.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- Turnstile ----------
  function ensureTurnstile() {
    if (!sitekey || turnstileId) return;
    if (window.turnstile) {
      renderTurnstile();
      return;
    }
    if (turnstileLoading) return;
    turnstileLoading = true;
    window.onTurnstileLoad = () => renderTurnstile();
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  function renderTurnstile() {
    if (turnstileId || !window.turnstile) return;
    turnstileId = window.turnstile.render(els.turnstile, {
      sitekey,
      language: locale,
      theme: 'light',
      size: 'flexible',
      appearance: 'always',
      callback: (token: string) => {
        turnstileToken = token;
        turnstileFailed = false;
      },
      'expired-callback': () => {
        turnstileToken = '';
      },
      'error-callback': (code: string) => {
        turnstileToken = '';
        turnstileFailed = true;
        console.error('Turnstile error', code);
        return true; // we handle the error ourselves
      },
    });
  }

  // The check runs in the background; give it a moment if the parent is faster than it.
  async function waitForTurnstileToken(maxMs = 12000): Promise<string> {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      const t = turnstileToken || (window.turnstile && turnstileId ? window.turnstile.getResponse(turnstileId) || '' : '');
      if (t) return t;
      if (turnstileFailed) return '';
      await new Promise((r) => setTimeout(r, 250));
    }
    return '';
  }

  // ---------- submit ----------
  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    if (!selectedSlot || !selectedDay) {
      resetToDays();
      return;
    }
    // native validation with a friendly highlight
    let valid = true;
    els.form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select, textarea').forEach((f) => {
      const ok = f.checkValidity();
      f.closest('.field')?.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      showError(s.errors.invalid);
      els.form.querySelector<HTMLElement>('.is-invalid input, .is-invalid select')?.focus();
      return;
    }
    let token = '';
    if (sitekey) {
      ensureTurnstile();
      els.submit.disabled = true;
      els.submitLabel.textContent = s.form.submitting;
      token = await waitForTurnstileToken();
      if (!token) {
        els.submit.disabled = false;
        els.submitLabel.textContent = s.form.submit;
        showError(turnstileFailed ? s.errors.turnstile_failed : s.errors.turnstile);
        if (window.turnstile && turnstileId) window.turnstile.reset(turnstileId);
        return;
      }
    }

    const fd = new FormData(els.form);
    const payload = {
      start: selectedSlot.start,
      end: selectedSlot.end,
      childName: String(fd.get('childName') || '').trim(),
      childAge: Number(fd.get('childAge')),
      parentName: String(fd.get('parentName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      lang: locale,
      turnstileToken: token,
    };

    els.submit.disabled = true;
    els.submitLabel.textContent = s.form.submitting;
    try {
      const res = await fetch(`${api}/book`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as BookResponse;
      if (!res.ok || !data.ok) {
        const code = (!data.ok && data.error) || 'generic';
        const msg = (s.errors as Record<string, string>)[code] || s.errors.generic;
        showError(msg);
        if (code === 'slot_taken') {
          // refresh availability so the taken slot disappears
          selectedSlot = null;
          await load();
          resetToDays();
        }
        turnstileToken = '';
        if (window.turnstile && turnstileId) window.turnstile.reset(turnstileId);
        return;
      }
      showSuccess(data.booking, payload);
    } catch (err) {
      console.error('booking failed', err);
      showError(s.errors.generic);
      turnstileToken = '';
      if (window.turnstile && turnstileId) window.turnstile.reset(turnstileId);
    } finally {
      els.submit.disabled = false;
      els.submitLabel.textContent = s.form.submit;
    }
  });

  function showSuccess(b: Extract<BookResponse, { ok: true }>['booking'], payload: { email: string; childName: string }) {
    show(els.form, false);
    show(els.summary, false);
    show(els.days, false);
    show(els.times, false);
    setStep(4);
    els.successText.textContent = s.success.text.replace('{email}', payload.email).replace('{child}', payload.childName);
    els.successSlot.textContent = summaryFor(selectedDay!, selectedSlot!);
    els.meetLink.href = b.meetLink || '#';
    els.meetLink.hidden = !b.meetLink;
    els.icsLink.href = b.icsUrl;
    const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = locale === 'de' ? `Probestunde Englisch: ${payload.childName} (Crefolo)` : `English trial lesson: ${payload.childName} (Crefolo)`;
    const details = (locale === 'de' ? 'Google Meet: ' : 'Google Meet: ') + (b.meetLink || '');
    els.gcalLink.href =
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(title)}&dates=${fmt(b.start)}/${fmt(b.end)}` +
      `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(b.meetLink || '')}`;
    show(els.success, true);
    els.success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  els.change.addEventListener('click', resetToDays);
  els.another.addEventListener('click', async () => {
    show(els.success, false);
    els.form.reset();
    selectedDay = null;
    selectedSlot = null;
    turnstileToken = '';
    if (window.turnstile && turnstileId) window.turnstile.reset(turnstileId);
    await load();
  });

  // live-remove the invalid state while typing
  els.form.addEventListener('input', (e) => {
    (e.target as HTMLElement).closest('.field')?.classList.remove('is-invalid');
  });

  load();
}
