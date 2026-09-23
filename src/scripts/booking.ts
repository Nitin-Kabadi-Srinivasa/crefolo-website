// Booking widget: loads the group trial dates from /api/availability, lets the parent pick one,
// collects the details and posts to /api/book.
import type { BookingStrings } from '@/content/types';

type Session = { start: string; end: string; ages: [number, number]; taken: number };
type Availability = { ok: boolean; timezone: string; capacity: number; sessions: Session[] };
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
  const partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' });
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const q = <T extends HTMLElement>(role: string) => root.querySelector<T>(`[data-role="${role}"]`)!;
  const els = {
    status: q('status'),
    error: q('error'),
    errorText: q('error-text'),
    sessions: q('sessions'),
    sessionsList: q('sessions-list'),
    form: q<HTMLFormElement>('form'),
    ageSelect: root.querySelector<HTMLSelectElement>('select[name="childAge"]')!,
    ageHint: q('age-hint'),
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
  let selected: Session | null = null;
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

  /** Date parts of an instant in German time */
  const berlin = (iso: string) => {
    const p: Record<string, string> = {};
    for (const part of partsFmt.formatToParts(new Date(iso))) p[part.type] = part.value;
    return { day: Number(p.day), month: Number(p.month) - 1, weekday: WD.indexOf(p.weekday) };
  };
  const timeLabel = (x: Session) => `${timeFmt.format(new Date(x.start))}–${timeFmt.format(new Date(x.end))}`;
  const agesLabel = (x: Session) => s.agesLabel.replace('{from}', String(x.ages[0])).replace('{to}', String(x.ages[1]));
  const dateOnly = (x: Session) => {
    const d = berlin(x.start);
    return locale === 'de' ? `${d.day}. ${s.months[d.month]}` : `${d.day} ${s.months[d.month]}`;
  };
  const summaryFor = (x: Session) =>
    s.summary
      .replace('{day}', s.weekdaysLong[berlin(x.start).weekday])
      .replace('{date}', dateOnly(x))
      .replace('{time}', timeLabel(x))
      .replace('{ages}', agesLabel(x));
  const seatsText = (free: number) => (free <= 0 ? s.full : free === 1 ? s.seatFree : s.seatsFree.replace('{n}', String(free)));

  // ---------- load dates ----------
  async function load() {
    show(els.status, true);
    clearError();
    try {
      const res = await fetch(`${api}/availability`, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      availability = (await res.json()) as Availability;
      if (!availability.ok || !Array.isArray(availability.sessions)) throw new Error('not ok');
      renderSessions();
      show(els.status, false);
      show(els.sessions, true);
      setStep(1);
    } catch (err) {
      console.error('availability failed', err);
      show(els.status, false);
      showError(s.errors.unavailable);
    }
  }

  function renderSessions() {
    els.sessionsList.innerHTML = '';
    const cap = availability!.capacity || 3;
    const list = availability!.sessions;
    if (!list.some((x) => x.taken < cap)) {
      const p = document.createElement('p');
      p.className = 'muted sessions-empty';
      p.textContent = s.noSlotsAll;
      els.sessionsList.appendChild(p);
      return;
    }
    for (const x of list) {
      const d = berlin(x.start);
      const free = cap - x.taken;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'session-card';
      btn.disabled = free <= 0;
      if (selected && selected.start === x.start) btn.classList.add('is-selected');
      btn.setAttribute('aria-label', `${summaryFor(x)}, ${seatsText(free)}`);
      const seatsClass = free <= 0 ? 'session-card__seats--full' : free === 1 ? 'session-card__seats--last' : '';
      btn.innerHTML =
        `<span class="session-card__date">` +
        `<span class="session-card__wd">${s.weekdaysShort[d.weekday]}</span>` +
        `<span class="session-card__day">${d.day}</span>` +
        `<span class="session-card__month">${s.months[d.month].slice(0, 3)}</span>` +
        `</span>` +
        `<span class="session-card__info">` +
        `<span class="session-card__time">${timeLabel(x)}${locale === 'de' ? ' Uhr' : ''}</span>` +
        `<span class="session-card__ages">${agesLabel(x)}</span>` +
        `<span class="session-card__seats ${seatsClass}">${seatsText(free)}</span>` +
        `</span>`;
      btn.addEventListener('click', () => choose(x));
      els.sessionsList.appendChild(btn);
    }
  }

  function choose(x: Session) {
    selected = x;
    clearError();
    els.summaryText.textContent = summaryFor(x);
    show(els.summary, true);
    show(els.sessions, false);
    show(els.form, true);
    setStep(2);
    updateAgeHint();
    ensureTurnstile();
    els.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    (els.form.querySelector<HTMLInputElement>('input[name="childName"]') || els.form).focus({ preventScroll: true });
  }

  function backToDates() {
    show(els.summary, false);
    show(els.form, false);
    renderSessions();
    show(els.sessions, true);
    setStep(1);
    els.sessions.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Gentle hint (not a blocker) when the child's age is outside the chosen trial's age band
  function updateAgeHint() {
    const age = Number(els.ageSelect.value);
    const off = !!selected && Number.isFinite(age) && age > 0 && (age < selected.ages[0] || age > selected.ages[1]);
    if (off && selected) els.ageHint.textContent = s.ageHint.replace('{from}', String(selected.ages[0])).replace('{to}', String(selected.ages[1]));
    show(els.ageHint, off);
  }
  els.ageSelect.addEventListener('change', updateAgeHint);

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
  const resetTurnstile = () => {
    turnstileToken = '';
    if (window.turnstile && turnstileId) window.turnstile.reset(turnstileId);
  };

  // ---------- submit ----------
  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    if (!selected) {
      backToDates();
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
        resetTurnstile();
        return;
      }
    }

    const fd = new FormData(els.form);
    const booked = selected;
    const payload = {
      start: booked.start,
      end: booked.end,
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
        if (code === 'slot_taken') {
          // the trial just filled up: reload the dates and let the parent pick another one
          selected = null;
          await load();
          backToDates();
        }
        showError(msg);
        resetTurnstile();
        return;
      }
      showSuccess(data.booking, payload, booked);
    } catch (err) {
      console.error('booking failed', err);
      showError(s.errors.generic);
      resetTurnstile();
    } finally {
      els.submit.disabled = false;
      els.submitLabel.textContent = s.form.submit;
    }
  });

  function showSuccess(b: Extract<BookResponse, { ok: true }>['booking'], payload: { email: string; childName: string }, booked: Session) {
    show(els.form, false);
    show(els.summary, false);
    show(els.sessions, false);
    setStep(4);
    els.successText.textContent = s.success.text.replace('{email}', payload.email).replace('{child}', payload.childName);
    els.successSlot.textContent = summaryFor(booked);
    els.meetLink.href = b.meetLink || '#';
    els.meetLink.hidden = !b.meetLink;
    els.icsLink.href = b.icsUrl;
    const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = locale === 'de' ? `Probestunde Englisch: ${payload.childName} (Crefolo)` : `English trial lesson: ${payload.childName} (Crefolo)`;
    const details = 'Google Meet: ' + (b.meetLink || '');
    els.gcalLink.href =
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(title)}&dates=${fmt(b.start)}/${fmt(b.end)}` +
      `&details=${encodeURIComponent(details)}&location=${encodeURIComponent(b.meetLink || '')}`;
    show(els.success, true);
    els.success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  els.change.addEventListener('click', backToDates);
  els.another.addEventListener('click', async () => {
    show(els.success, false);
    els.form.reset();
    show(els.ageHint, false);
    selected = null;
    resetTurnstile();
    await load();
  });

  // live-remove the invalid state while typing
  els.form.addEventListener('input', (e) => {
    (e.target as HTMLElement).closest('.field')?.classList.remove('is-invalid');
  });

  load();
}
