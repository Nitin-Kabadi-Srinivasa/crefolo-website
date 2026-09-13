// Small branded HTML pages served by the Worker (cancel confirmation etc.).
export type Lang = 'de' | 'en';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function page(lang: Lang, title: string, body: string, siteUrl: string): string {
  const home = lang === 'de' ? siteUrl : `${siteUrl}/en`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} – Crefolo</title>
<style>
body{margin:0;background:#fff9f4;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#2e1a47;line-height:1.6}
.wrap{max-width:560px;margin:0 auto;padding:40px 20px}
.card{background:#fff;border-radius:24px;padding:32px;box-shadow:0 10px 30px rgba(46,26,71,.08)}
.brand{display:inline-block;background:#ea1889;color:#fff;font-weight:800;font-size:22px;padding:8px 18px;border-radius:999px;margin-bottom:22px;text-decoration:none}
h1{font-size:26px;margin:0 0 12px;line-height:1.2}
.btn{display:inline-block;padding:14px 22px;border-radius:999px;font-weight:700;text-decoration:none;border:0;cursor:pointer;font-size:16px;font-family:inherit}
.btn--primary{background:#d6127a;color:#fff}
.btn--ghost{background:#fff;color:#2e1a47;border:2px solid #eadfe8;margin-left:8px}
.box{background:#fff4f9;border-radius:14px;padding:14px 18px;margin:18px 0;font-weight:700}
.muted{color:#6b5f7a;font-size:14px}
form{margin-top:22px}
</style></head><body><div class="wrap"><a class="brand" href="${esc(home)}">Crefolo</a><div class="card">${body}</div></div></body></html>`;
}

export function cancelConfirmPage(lang: Lang, dateLabel: string, timeLabel: string, childName: string, actionUrl: string, siteUrl: string): string {
  const home = lang === 'de' ? siteUrl : `${siteUrl}/en`;
  const body =
    lang === 'de'
      ? `<h1>Probestunde absagen?</h1>
<p>Möchten Sie die Probestunde für <strong>${esc(childName)}</strong> wirklich absagen?</p>
<div class="box">${esc(dateLabel)}<br>${esc(timeLabel)}</div>
<form method="post" action="${esc(actionUrl)}">
  <button class="btn btn--primary" type="submit">Ja, Termin absagen</button>
  <a class="btn btn--ghost" href="${esc(home)}">Nein, zurück</a>
</form>`
      : `<h1>Cancel the trial lesson?</h1>
<p>Do you really want to cancel the trial lesson for <strong>${esc(childName)}</strong>?</p>
<div class="box">${esc(dateLabel)}<br>${esc(timeLabel)}</div>
<form method="post" action="${esc(actionUrl)}">
  <button class="btn btn--primary" type="submit">Yes, cancel</button>
  <a class="btn btn--ghost" href="${esc(home)}">No, go back</a>
</form>`;
  return page(lang, lang === 'de' ? 'Termin absagen' : 'Cancel appointment', body, siteUrl);
}

export function cancelledPage(lang: Lang, siteUrl: string): string {
  const booking = lang === 'de' ? `${siteUrl}/probestunde` : `${siteUrl}/en/trial-lesson`;
  const body =
    lang === 'de'
      ? `<h1>Der Termin wurde abgesagt.</h1><p>Schade – aber kein Problem. Sie können jederzeit einen neuen Termin buchen.</p><p><a class="btn btn--primary" href="${esc(booking)}">Neuen Termin buchen</a></p>`
      : `<h1>The appointment has been cancelled.</h1><p>A pity – but no problem. You can book a new time whenever you like.</p><p><a class="btn btn--primary" href="${esc(booking)}">Book a new time</a></p>`;
  return page(lang, lang === 'de' ? 'Abgesagt' : 'Cancelled', body, siteUrl);
}

export function invalidLinkPage(lang: Lang, siteUrl: string): string {
  const body =
    lang === 'de'
      ? `<h1>Dieser Link ist ungültig.</h1><p class="muted">Der Termin wurde möglicherweise bereits abgesagt. Bei Fragen schreiben Sie mir einfach an <a href="mailto:info@crefolo.com">info@crefolo.com</a>.</p>`
      : `<h1>This link is not valid.</h1><p class="muted">The appointment may already have been cancelled. If you have questions, just write to <a href="mailto:info@crefolo.com">info@crefolo.com</a>.</p>`;
  return page(lang, lang === 'de' ? 'Ungültiger Link' : 'Invalid link', body, siteUrl);
}

export function errorPage(lang: Lang, siteUrl: string): string {
  const body =
    lang === 'de'
      ? `<h1>Das hat leider nicht geklappt.</h1><p class="muted">Bitte versuchen Sie es später noch einmal oder schreiben Sie mir an <a href="mailto:info@crefolo.com">info@crefolo.com</a>.</p>`
      : `<h1>Something went wrong.</h1><p class="muted">Please try again later or write to <a href="mailto:info@crefolo.com">info@crefolo.com</a>.</p>`;
  return page(lang, lang === 'de' ? 'Fehler' : 'Error', body, siteUrl);
}
