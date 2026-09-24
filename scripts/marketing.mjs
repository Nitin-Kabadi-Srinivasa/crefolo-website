// Builds the Kleinanzeigen images, the poster and the mailbox flyers from the website content.
//   npm run marketing
// Dates come from src/content/schedule.ts, prices and texts from src/content/de.ts, so after changing
// the dates there just run the command again. Designs: marketing/src/*.html, output: marketing/output.
import puppeteer from 'puppeteer-core';
import QRCode from 'qrcode';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { schedule } from '../src/content/schedule.ts';
import de from '../src/content/de.ts';
import legalDe from '../src/content/legal-de.ts';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'marketing', 'src');
const buildDir = path.join(rootDir, 'marketing', '.build');
const outDir = path.join(rootDir, 'marketing', 'output');
mkdirSync(buildDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const BOOKING_URL = 'https://crefolo.com/probestunde';

// ---------- data from the website content ----------
const today = process.env.FROM_DATE || new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
const next = schedule.nextGroup;
const trials = schedule.trials
  .filter((t) => t.date >= today && (!next || t.date < next.date))
  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
if (!trials.length) {
  console.error('No upcoming trial dates in src/content/schedule.ts. Add new dates there first.');
  process.exit(1);
}

const WD_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const weekday = (ymd) => new Date(`${ymd}T12:00:00Z`).getUTCDay();
const dayMonth = (ymd) => `${ymd.slice(8, 10)}.${ymd.slice(5, 7)}.`;
const fullDate = (ymd) => `${dayMonth(ymd)}${ymd.slice(0, 4)}`;
const joinList = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`);

const dates = [...new Set(trials.map((t) => t.date))];
const slots = [...new Map(trials.map((t) => [`${t.time}|${t.ages[0]}|${t.ages[1]}`, t])).values()]
  .sort((a, b) => a.time.localeCompare(b.time))
  .map((t) => ({ time: `${t.time} Uhr`, ages: `${t.ages[0]} bis ${t.ages[1]} Jahre` }));

const weekdays = [...new Set(dates.map(weekday))];
const sameWeekday = weekdays.length === 1 ? `${WD_LONG[weekdays[0]]}s` : '';
const months = [...new Set(dates.map((d) => d.slice(0, 7)))];
const period = months.length === 1 ? `im ${MONTHS[Number(months[0].slice(5)) - 1]}` : `vom ${dayMonth(dates[0])} bis ${dayMonth(dates[dates.length - 1])}`;
const trialWhen = `${sameWeekday ? `${sameWeekday} ` : ''}${period}, je ${schedule.trialMinutes} Minuten per Google Meet`;

const [groupPlan, singlePlan] = de.pricing.plans;
const groupPrice = `${groupPlan.price} ${groupPlan.unit}`;
const individualPrice = `${singlePlan.price} ${singlePlan.unit.replace('Unterrichtsstunde', 'Stunde')}`;
const phone = de.contact.phoneDisplay.replace(/^\+49\s*/, '0');
const imprintLines = legalDe.imprint.blocks[0].lines;
const nextGroupLine = next ? `Neue Mini-Gruppe ab ${WD_LONG[weekday(next.date)]}, ${fullDate(next.date)}` : 'Danach geht es in einer festen Mini-Gruppe weiter';

const checkIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const qr = await QRCode.toString(BOOKING_URL, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#2e1a47', light: '#ffffff' } });

const tab = `<div class="tab"><div class="v"><b>Englisch für Kinder</b><span>crefolo.com</span><span>${phone}</span></div></div>`;

const data = {
  root: pathToFileURL(rootDir).href,
  eyebrow: de.hero.eyebrow,
  checkIcon,
  qr,
  phone,
  trialWhen,
  trialSub: trialWhen,
  nextGroupLine,
  groupPrice,
  individualPrice,
  priceLine: `Mini-Gruppe ${groupPrice} · Einzelunterricht ${individualPrice}`,
  siblingDiscount: de.pricing.discounts.items[0],
  imprint: imprintLines.join(' · '),
  dateCount: String(dates.length),
  dateChips: dates.map((d) => `<span>${WD_SHORT[weekday(d)]} ${dayMonth(d)}</span>`).join(''),
  dateChipsSmall: dates.map((d) => `<span><small>${WD_SHORT[weekday(d)]}</small>${dayMonth(d)}</span>`).join(''),
  dateCards: dates.map((d) => `<div class="date"><div class="wd">${WD_SHORT[weekday(d)]}</div><div class="d">${dayMonth(d)}</div></div>`).join(''),
  slotLines: slots.map((s) => `<div><b>${s.time}</b> für ${s.ages}</div>`).join(''),
  slotRowsSmall: slots.map((s) => `<div class="slot"><b>${s.time}</b><span>${s.ages}</span></div>`).join(''),
  slotRows: slots.map((s) => `<div class="slot"><span class="time">${s.time}</span><span class="ages">${s.ages}</span></div>`).join(''),
  title: `Gruppen-Probestunden ${period}`,
  subtitle: `${sameWeekday ? `${sameWeekday}, j` : 'J'}e ${schedule.trialMinutes} Minuten per Google Meet, höchstens ${schedule.trialCapacity} Kinder`,
  offerNote: `${sameWeekday ? `${sameWeekday} ` : ''}${period}<br>${slots.map((s) => s.ages.replace(' Jahre', '')).join(' und ')} Jahre`,
  tabs: tab.replace('<div class="tab">', '<div class="tab"><span class="scissors">✂</span>') + tab.repeat(7),
};

// ---------- fill a template (fonts inlined, because Chrome blocks web fonts on file:// pages) ----------
const fontData = (file) => `url(data:font/woff2;base64,${readFileSync(path.join(rootDir, 'public', 'fonts', file)).toString('base64')})`;
const brandCss = readFileSync(path.join(srcDir, 'brand.css'), 'utf8').replace(/url\('\.\.\/\.\.\/public\/fonts\/([^']+)'\)/g, (_, f) => fontData(f));

function build(template, name, extra = {}, css = '') {
  const values = { ...data, ...extra };
  let html = readFileSync(path.join(srcDir, template), 'utf8');
  html = html.replace(/<link rel="stylesheet" href="\{\{root\}\}\/marketing\/src\/brand\.css" \/>/, `<style>${brandCss}</style>`);
  html = html.replace('</head>', `<style>${css}</style>\n</head>`);
  html = html.replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (!(key in values)) throw new Error(`${template}: no value for ${m}`);
    return values[key];
  });
  const file = path.join(buildDir, name);
  writeFileSync(file, html);
  return pathToFileURL(file).href;
}

// ---------- render ----------
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', `--user-data-dir=${path.join(os.tmpdir(), 'crefolo-chrome-profile')}`],
});

async function open(url, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
  });
  return page;
}

async function image(template, out) {
  const page = await open(build(template, template), { width: 1200, height: 1200, deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(outDir, out), type: 'jpeg', quality: 92 });
  await page.close();
}

// size: paper [width, height] in mm; zoom enlarges the A4 poster design to A3
async function pdf(template, out, { extra, size, zoom = 1, css = '' } = {}) {
  const pageCss = `@page { size: ${size[0]}mm ${size[1]}mm; margin: 0; } html { zoom: ${zoom}; } ${css}`;
  const url = build(template, out.replace(/\.pdf$/, '.html'), extra, pageCss);
  const px = (mm) => Math.round((mm / 25.4) * 96);
  const page = await open(url, { width: px(size[0]), height: px(size[1]), deviceScaleFactor: 2 });
  await page.pdf({ path: path.join(outDir, out), printBackground: true, preferCSSPageSize: true });
  // PNG preview for a quick look (not needed for printing)
  await page.screenshot({ path: path.join(buildDir, out.replace(/\.pdf$/, '.png')), fullPage: true });
  await page.close();
}

await image('kleinanzeigen-1.html', 'kleinanzeigen-bild-1.jpg');
await image('kleinanzeigen-2.html', 'kleinanzeigen-bild-2.jpg');
const onePage = 'html, body { overflow: hidden; }';
await pdf('poster.html', 'aushang-a4-mit-abreisszetteln.pdf', { extra: { variant: 'with-tabs' }, size: [210, 297], css: onePage });
await pdf('poster.html', 'aushang-a3.pdf', { extra: { variant: 'no-tabs' }, size: [297, 420], zoom: 297 / 210, css: onePage });
await pdf('flyer.html', 'flyer-a6-4fach-auf-a4.pdf', { extra: { layout: 'sheet' }, size: [210, 297] });
await pdf('flyer.html', 'flyer-a6-fuer-druckerei.pdf', { extra: { layout: 'print' }, size: [111, 154] });
await browser.close();

// ---------- Kleinanzeigen text (no phone, e-mail or links in the description: Kleinanzeigen rules) ----------
const slotSentence = joinList(slots.map((s) => `${s.time} für ${s.ages}`));
const ad = `KLEINANZEIGEN: ANZEIGE AUFGEBEN
===============================

Kategorie:     Unterricht & Kurse > Sprachkurse
Anzeigentyp:   Ich biete
Titel:         Englisch für Kinder von 5 bis 12 online: kostenlose Probestunde
Preis:         ${groupPlan.price} (Festpreis)
PLZ / Ort:     ${imprintLines[imprintLines.length - 1]}
Telefonnummer: ${phone}  (nur in das Feld "Telefonnummer", nicht in den Text)
Bilder:        1. kleinanzeigen-bild-1.jpg (Titelbild), 2. kleinanzeigen-bild-2.jpg


BESCHREIBUNG (ab hier kopieren)
-------------------------------

Hallo, ich bin Nitin, Cambridge-zertifizierter Englischlehrer aus Weinsberg. Ich unterrichte Kinder von 5 bis 12 Jahren online in Mini-Gruppen mit höchstens ${schedule.trialCapacity} Kindern. Spielerisch, mit Geschichten, Spielen und Liedern.

KOSTENLOSE GRUPPEN-PROBESTUNDEN
Je ${schedule.trialMinutes} Minuten per Google Meet, kostenlos und unverbindlich:
${dates.map((d) => `• ${WD_LONG[weekday(d)]}, ${fullDate(d)}`).join('\n')}
Jeweils ${slotSentence}.
${next ? `\n${nextGroupLine}.\n` : ''}
DAS ERWARTET IHR KIND
• Mini-Gruppen mit höchstens 3 Kindern: jedes Kind kommt oft zu Wort
• Cambridge-Lehrplan (GER Vorstufe A1 bis A1) mit echten Büchern zum Anfassen
• Nur der Unterricht ist online. Hausaufgaben mit Papier, Stiften und Liedern statt Tablet
• Nach jeder Stunde ein kurzer Austausch mit Ihnen als Eltern
• Unterricht auch in den Schulferien

PREISE
• Mini-Gruppe: ${groupPrice}
• Einzelunterricht: ${singlePlan.price} ${singlePlan.unit}, Sie zahlen nur die Stunden, die stattfinden
${de.pricing.discounts.items.map((i) => `• ${i.replace(/\.$/, '')}`).join('\n')}

ANMELDUNG
Den passenden Termin wählen Sie auf meiner Webseite crefolo.com. Oder schreiben Sie mir einfach hier eine Nachricht, ich melde mich schnell zurück.

Ich freue mich auf Ihr Kind!
Nitin
`;
writeFileSync(path.join(outDir, 'kleinanzeigen-text.txt'), '\uFEFF' + ad.replace(/\n/g, '\r\n'));

console.log(`Done: ${dates.length} trial dates (${dates.map(dayMonth).join(' ')}), files in marketing/output`);
