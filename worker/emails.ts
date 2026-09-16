// Email templates (parent: de/en, teacher: en). Plain, warm, no external images.
import type { Mail } from './graph';
import { formatDateLong, formatRange } from './time';

export type Lang = 'de' | 'en';

export interface BookingInfo {
  eventId: string;
  start: Date;
  end: Date;
  timeZone: string;
  childName: string;
  childAge: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  message: string;
  lang: Lang;
  meetLink: string;
  cancelUrl: string;
  icsUrl: string;
  eventLink: string;
  siteUrl: string;
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  whatsappUrl: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function layout(title: string, bodyHtml: string, footerHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#fff4f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#2e1a47;">
<div style="max-width:600px;margin:0 auto;padding:24px 12px;">
  <div style="background:#ea1889;color:#fff;border-radius:20px 20px 0 0;padding:18px 28px;font-size:22px;font-weight:800;letter-spacing:.02em;">Crefolo</div>
  <div style="background:#fff;border-radius:0 0 20px 20px;padding:28px;font-size:16px;line-height:1.6;">
    ${bodyHtml}
  </div>
  <div style="padding:18px 8px;font-size:13px;color:#6b5f7a;line-height:1.5;">${footerHtml}</div>
</div></body></html>`;
}

function button(href: string, label: string, color = '#d6127a'): string {
  return `<p style="margin:22px 0;"><a href="${esc(href)}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px;">${esc(label)}</a></p>`;
}

function detailsBox(rows: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;background:#fff4f9;border-radius:14px;margin:18px 0;" cellpadding="0" cellspacing="0">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 16px;font-weight:700;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="padding:10px 16px;">${v}</td></tr>`,
    )
    .join('')}</table>`;
}

function when(b: BookingInfo, lang: Lang): { date: string; time: string } {
  return { date: formatDateLong(b.start, b.timeZone, lang), time: formatRange(b.start, b.end, b.timeZone, lang) };
}

// ---------------------------------------------------------------- parent: confirmation
export function parentConfirmation(b: BookingInfo, ics: string): Mail {
  const { date, time } = when(b, b.lang);
  const greet = b.parentName ? (b.lang === 'de' ? `Hallo ${esc(b.parentName)},` : `Hello ${esc(b.parentName)},`) : b.lang === 'de' ? 'Liebe Eltern,' : 'Dear parents,';

  if (b.lang === 'de') {
    const subject = `Ihre Probestunde bei Crefolo: ${date}, ${time}`;
    const html = layout(
      subject,
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">Die Probestunde für ${esc(b.childName)} ist gebucht! 🎉</p>
<p>${greet}</p>
<p>vielen Dank für Ihre Buchung. Ich freue mich darauf, ${esc(b.childName)} kennenzulernen. Hier sind alle Details:</p>
${detailsBox([
  ['Datum', esc(date)],
  ['Uhrzeit', `${esc(time)} (deutsche Zeit)`],
  ['Dauer', '60 Minuten'],
  ['Wo', `Online per Google Meet`],
])}
${b.meetLink ? button(b.meetLink, 'Zur Probestunde (Google Meet)') : ''}
<p><strong>So bereiten Sie sich vor:</strong></p>
<ul style="padding-left:20px;margin:8px 0 18px;">
  <li>Laptop, PC oder Tablet mit Kamera und Mikrofon</li>
  <li>Ein ruhiger Platz, an dem ${esc(b.childName)} sitzen kann</li>
  <li>Gute Laune, den Rest bringe ich mit 😊</li>
</ul>
<p>Sie können den Termin über die angehängte Kalenderdatei in Ihren Kalender übernehmen.</p>
<p style="font-size:14px;color:#6b5f7a;">Etwas dazwischengekommen? Kein Problem, sagen Sie den Termin einfach hier ab: <a href="${esc(b.cancelUrl)}" style="color:#c0106d;">Termin absagen</a></p>
<p>Bei Fragen antworten Sie einfach auf diese E-Mail oder schreiben Sie mir auf <a href="${esc(b.whatsappUrl)}" style="color:#c0106d;">WhatsApp</a>.</p>
<p>Herzliche Grüße<br><strong>${esc(b.teacherName)}</strong><br>Crefolo · <a href="${esc(b.siteUrl)}" style="color:#c0106d;">crefolo.com</a></p>`,
      `Crefolo · ${esc(b.teacherEmail)} · ${esc(b.teacherPhone)}<br>Sie erhalten diese E-Mail, weil über crefolo.com eine Probestunde gebucht wurde.`,
    );
    const text = `Die Probestunde für ${b.childName} ist gebucht!

Datum: ${date}
Uhrzeit: ${time} (deutsche Zeit)
Dauer: 60 Minuten
Google Meet: ${b.meetLink}

Absagen: ${b.cancelUrl}

Herzliche Grüße
${b.teacherName} · Crefolo · ${b.siteUrl}`;
    return { to: b.parentEmail, subject, html, text, replyTo: b.teacherEmail, ics: { filename: 'probestunde-crefolo.ics', content: ics } };
  }

  const subject = `Your trial lesson at Crefolo: ${date}, ${time}`;
  const html = layout(
    subject,
    `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">The trial lesson for ${esc(b.childName)} is booked! 🎉</p>
<p>${greet}</p>
<p>thank you for booking. I look forward to meeting ${esc(b.childName)}. Here are all the details:</p>
${detailsBox([
  ['Date', esc(date)],
  ['Time', `${esc(time)} (German time)`],
  ['Duration', '60 minutes'],
  ['Where', 'Online via Google Meet'],
])}
${b.meetLink ? button(b.meetLink, 'Join the trial lesson (Google Meet)') : ''}
<p><strong>How to prepare:</strong></p>
<ul style="padding-left:20px;margin:8px 0 18px;">
  <li>A laptop, PC or tablet with camera and microphone</li>
  <li>A quiet spot where ${esc(b.childName)} can sit</li>
  <li>A good mood, I will bring the rest 😊</li>
</ul>
<p>You can add the appointment to your calendar with the attached calendar file.</p>
<p style="font-size:14px;color:#6b5f7a;">Something came up? No problem, cancel here: <a href="${esc(b.cancelUrl)}" style="color:#c0106d;">Cancel appointment</a></p>
<p>If you have questions, simply reply to this email or message me on <a href="${esc(b.whatsappUrl)}" style="color:#c0106d;">WhatsApp</a>.</p>
<p>Kind regards<br><strong>${esc(b.teacherName)}</strong><br>Crefolo · <a href="${esc(b.siteUrl)}" style="color:#c0106d;">crefolo.com</a></p>`,
    `Crefolo · ${esc(b.teacherEmail)} · ${esc(b.teacherPhone)}<br>You receive this email because a trial lesson was booked on crefolo.com.`,
  );
  const text = `The trial lesson for ${b.childName} is booked!

Date: ${date}
Time: ${time} (German time)
Duration: 60 minutes
Google Meet: ${b.meetLink}

Cancel: ${b.cancelUrl}

Kind regards
${b.teacherName} · Crefolo · ${b.siteUrl}`;
  return { to: b.parentEmail, subject, html, text, replyTo: b.teacherEmail, ics: { filename: 'trial-lesson-crefolo.ics', content: ics } };
}

// ---------------------------------------------------------------- teacher: new booking
export function teacherNotification(b: BookingInfo): Mail {
  const { date, time } = when(b, 'en');
  const subject = `New trial lesson: ${b.childName} (${b.childAge}) – ${date}, ${time}`;
  const html = layout(
    subject,
    `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">New trial lesson booked 🎉</p>
${detailsBox([
  ['Child', `${esc(b.childName)}, ${esc(b.childAge)} years`],
  ['When', `${esc(date)}<br>${esc(time)}`],
  ['Parent', esc(b.parentName || '–')],
  ['Email', `<a href="mailto:${esc(b.parentEmail)}" style="color:#c0106d;">${esc(b.parentEmail)}</a>`],
  ['Phone', b.parentPhone ? `<a href="tel:${esc(b.parentPhone.replace(/\s+/g, ''))}" style="color:#c0106d;">${esc(b.parentPhone)}</a>` : '–'],
  ['Message', esc(b.message || '–')],
  ['Language', b.lang === 'de' ? 'Deutsch' : 'English'],
])}
${b.meetLink ? button(b.meetLink, 'Open Google Meet') : '<p style="color:#8f2323;">No Google Meet link was created – please add one in the calendar event.</p>'}
<p><a href="${esc(b.eventLink)}" style="color:#c0106d;">Open the calendar event</a> · <a href="${esc(b.cancelUrl)}" style="color:#c0106d;">Cancel this booking</a></p>`,
    'Automatic notification from crefolo.com',
  );
  const text = `New trial lesson booked

Child: ${b.childName}, ${b.childAge} years
When: ${date}, ${time}
Parent: ${b.parentName || '-'}
Email: ${b.parentEmail}
Phone: ${b.parentPhone || '-'}
Message: ${b.message || '-'}
Language: ${b.lang}
Google Meet: ${b.meetLink || '(none)'}
Calendar event: ${b.eventLink}
Cancel: ${b.cancelUrl}`;
  return { to: b.teacherEmail, subject, html, text, replyTo: b.parentEmail };
}

// ---------------------------------------------------------------- cancellation
export function parentCancellation(b: BookingInfo): Mail {
  const { date, time } = when(b, b.lang);
  const bookingUrl = b.lang === 'de' ? `${b.siteUrl}/probestunde` : `${b.siteUrl}/en/trial-lesson`;
  if (b.lang === 'de') {
    const subject = `Probestunde abgesagt: ${date}, ${time}`;
    const html = layout(
      subject,
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">Die Probestunde wurde abgesagt</p>
<p>Die Probestunde für ${esc(b.childName)} am <strong>${esc(date)}, ${esc(time)}</strong> ist abgesagt.</p>
<p>Sie können jederzeit einen neuen Termin wählen, ich freue mich!</p>
${button(bookingUrl, 'Neuen Termin buchen')}
<p>Herzliche Grüße<br><strong>${esc(b.teacherName)}</strong><br>Crefolo</p>`,
      `Crefolo · ${esc(b.teacherEmail)} · ${esc(b.teacherPhone)}`,
    );
    return { to: b.parentEmail, subject, html, text: `Die Probestunde für ${b.childName} am ${date}, ${time} wurde abgesagt. Neuen Termin buchen: ${bookingUrl}`, replyTo: b.teacherEmail };
  }
  const subject = `Trial lesson cancelled: ${date}, ${time}`;
  const html = layout(
    subject,
    `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">The trial lesson has been cancelled</p>
<p>The trial lesson for ${esc(b.childName)} on <strong>${esc(date)}, ${esc(time)}</strong> is cancelled.</p>
<p>You are welcome to pick a new time whenever you like!</p>
${button(bookingUrl, 'Book a new time')}
<p>Kind regards<br><strong>${esc(b.teacherName)}</strong><br>Crefolo</p>`,
    `Crefolo · ${esc(b.teacherEmail)} · ${esc(b.teacherPhone)}`,
  );
  return { to: b.parentEmail, subject, html, text: `The trial lesson for ${b.childName} on ${date}, ${time} was cancelled. Book a new time: ${bookingUrl}`, replyTo: b.teacherEmail };
}

export function teacherCancellation(b: BookingInfo): Mail {
  const { date, time } = when(b, 'en');
  const subject = `Cancelled: trial lesson ${b.childName} – ${date}, ${time}`;
  const html = layout(
    subject,
    `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">Trial lesson cancelled</p>
${detailsBox([
  ['Child', `${esc(b.childName)}, ${esc(b.childAge)} years`],
  ['When', `${esc(date)}<br>${esc(time)}`],
  ['Parent', `${esc(b.parentName || '–')} · ${esc(b.parentEmail)} · ${esc(b.parentPhone || '–')}`],
])}
<p>The calendar event has been removed and the slot is bookable again.</p>`,
    'Automatic notification from crefolo.com',
  );
  return { to: b.teacherEmail, subject, html, text: `Trial lesson cancelled: ${b.childName} (${b.childAge}), ${date}, ${time}. Parent: ${b.parentEmail} ${b.parentPhone}` };
}

// ---------------------------------------------------------------- reminders
export function parentReminder(b: BookingInfo): Mail {
  const { date, time } = when(b, b.lang);
  if (b.lang === 'de') {
    const subject = `Erinnerung: Morgen ist die Probestunde von ${b.childName} (${time})`;
    const html = layout(
      subject,
      `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">Morgen geht's los! 🎈</p>
<p>Kleine Erinnerung: Die Probestunde für ${esc(b.childName)} ist morgen, <strong>${esc(date)}</strong>, um <strong>${esc(time)}</strong> (deutsche Zeit).</p>
${b.meetLink ? button(b.meetLink, 'Zur Probestunde (Google Meet)') : ''}
<p>Ich freue mich auf ${esc(b.childName)}!</p>
<p style="font-size:14px;color:#6b5f7a;">Passt es doch nicht? <a href="${esc(b.cancelUrl)}" style="color:#c0106d;">Termin absagen</a></p>
<p>Herzliche Grüße<br><strong>${esc(b.teacherName)}</strong><br>Crefolo</p>`,
      `Crefolo · ${esc(b.teacherEmail)} · ${esc(b.teacherPhone)}`,
    );
    return { to: b.parentEmail, subject, html, text: `Erinnerung: Probestunde für ${b.childName} morgen, ${date}, ${time}. Google Meet: ${b.meetLink}. Absagen: ${b.cancelUrl}`, replyTo: b.teacherEmail };
  }
  const subject = `Reminder: ${b.childName}'s trial lesson is tomorrow (${time})`;
  const html = layout(
    subject,
    `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">Tomorrow is the day! 🎈</p>
<p>A quick reminder: the trial lesson for ${esc(b.childName)} is tomorrow, <strong>${esc(date)}</strong>, at <strong>${esc(time)}</strong> (German time).</p>
${b.meetLink ? button(b.meetLink, 'Join the trial lesson (Google Meet)') : ''}
<p>I look forward to meeting ${esc(b.childName)}!</p>
<p style="font-size:14px;color:#6b5f7a;">Can't make it after all? <a href="${esc(b.cancelUrl)}" style="color:#c0106d;">Cancel appointment</a></p>
<p>Kind regards<br><strong>${esc(b.teacherName)}</strong><br>Crefolo</p>`,
    `Crefolo · ${esc(b.teacherEmail)} · ${esc(b.teacherPhone)}`,
  );
  return { to: b.parentEmail, subject, html, text: `Reminder: trial lesson for ${b.childName} tomorrow, ${date}, ${time}. Google Meet: ${b.meetLink}. Cancel: ${b.cancelUrl}`, replyTo: b.teacherEmail };
}

export function teacherReminder(b: BookingInfo): Mail {
  const { date, time } = when(b, 'en');
  const subject = `Tomorrow: trial lesson with ${b.childName} (${time})`;
  const html = layout(
    subject,
    `<p style="font-size:20px;font-weight:800;margin:0 0 12px;">Trial lesson tomorrow</p>
${detailsBox([
  ['Child', `${esc(b.childName)}, ${esc(b.childAge)} years`],
  ['When', `${esc(date)}<br>${esc(time)}`],
  ['Parent', `${esc(b.parentName || '–')} · ${esc(b.parentEmail)} · ${esc(b.parentPhone || '–')}`],
  ['Message', esc(b.message || '–')],
])}
${b.meetLink ? button(b.meetLink, 'Open Google Meet') : ''}`,
    'Automatic reminder from crefolo.com',
  );
  return { to: b.teacherEmail, subject, html, text: `Tomorrow: trial lesson with ${b.childName} (${b.childAge}) at ${time}. Parent: ${b.parentEmail} ${b.parentPhone}. Meet: ${b.meetLink}` };
}

export function teacherAlert(teacherEmail: string, subject: string, body: string): Mail {
  return {
    to: teacherEmail,
    subject: `[crefolo.com] ${subject}`,
    html: layout(subject, `<p style="font-size:18px;font-weight:800;">${esc(subject)}</p><p style="white-space:pre-wrap;">${esc(body)}</p>`, 'Automatic alert from crefolo.com'),
    text: `${subject}\n\n${body}`,
  };
}
