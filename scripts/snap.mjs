// Visual checks with the locally installed Chrome (puppeteer-core, no browser download).
//   node scripts/snap.mjs pages [/,/en,/probestunde]   -> full-page screenshots, desktop + mobile
//   node scripts/snap.mjs flow                           -> walks through the booking widget (needs MOCK=1 API)
// Output: %TEMP%\crefolo-shots (override with SHOT_DIR). Base URL: BASE_URL (default http://localhost:8787)
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const base = process.env.BASE_URL || 'http://localhost:8787';
const outDir = process.env.SHOT_DIR || path.join(os.tmpdir(), 'crefolo-shots');
mkdirSync(outDir, { recursive: true });
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');

const mode = process.argv[2] || 'pages';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-first-run', '--no-default-browser-check', '--disable-gpu', `--user-data-dir=${path.join(os.tmpdir(), 'crefolo-chrome-profile')}`],
});

async function revealAll(page) {
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')));
  // scroll through the page so lazy-loaded images are fetched before the capture
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await sleep(900);
}

async function split(file, name, chunk) {
  const meta = await sharp(file).metadata();
  let parts = 0;
  for (let top = 0; top < meta.height; top += chunk) {
    const h = Math.min(chunk, meta.height - top);
    await sharp(file)
      .extract({ left: 0, top, width: meta.width, height: h })
      .png()
      .toFile(path.join(outDir, `${name}-${String(parts).padStart(2, '0')}.png`));
    parts++;
  }
  console.log(`${name}: ${parts} part(s), ${meta.width}x${meta.height}`);
}

async function fullShot(page, name, chunk = 1500) {
  const file = path.join(outDir, `${name}-full.png`);
  await page.screenshot({ path: file, fullPage: true });
  await split(file, name, chunk);
}

async function widgetShot(page, name) {
  const el = await page.$('#booking-widget');
  await el.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log(`${name}: widget screenshot`);
}

try {
  if (mode === 'pages') {
    const pages = (process.argv[3] || '/,/en,/probestunde,/impressum').split(',');
    const viewports = [
      { name: 'desktop', width: 1280, height: 800, chunk: 1500 },
      { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2, chunk: 1600 },
    ];
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport(vp);
      for (const p of pages) {
        await page.goto(base + p, { waitUntil: 'networkidle0', timeout: 60000 });
        await revealAll(page);
        const name = `${vp.name}${p === '/' ? '_home' : p.replace(/\//g, '_')}`;
        await fullShot(page, name, vp.chunk);
      }
      await page.close();
    }
  }

  if (mode === 'flow') {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    page.on('console', (m) => m.type() === 'error' && console.log('[browser]', m.text()));
    await page.goto(base + '/probestunde', { waitUntil: 'networkidle0', timeout: 60000 });
    await revealAll(page);
    await page.waitForSelector('.day-chip:not([disabled])', { timeout: 20000 });
    await widgetShot(page, 'flow-1-days');

    await page.click('.day-chip:not([disabled])');
    await page.waitForSelector('.time-btn', { timeout: 5000 });
    await sleep(400);
    await widgetShot(page, 'flow-2-times');

    await page.click('.time-btn:not([disabled])');
    await page.waitForSelector('[data-role="form"]:not([hidden])', { timeout: 5000 });
    await sleep(400);
    await widgetShot(page, 'flow-3-form');

    await page.type('input[name="childName"]', 'Emma');
    await page.select('select[name="childAge"]', '7');
    await page.type('input[name="parentName"]', 'Anna Muster');
    await page.type('input[name="email"]', 'anna.muster@example.com');
    await page.type('input[name="phone"]', '+49 170 1234567');
    await page.type('textarea[name="message"]', 'Emma freut sich schon sehr!');
    await page.click('input[name="privacy"]');
    await page
      .waitForFunction(() => window.turnstile && window.turnstile.getResponse(), { timeout: 20000 })
      .catch(() => console.log('turnstile token not available (offline?) – submitting anyway'));
    await sleep(500);
    await widgetShot(page, 'flow-4-filled');

    await page.click('[data-role="submit"]');
    await page.waitForSelector('[data-role="success"]:not([hidden])', { timeout: 30000 });
    await sleep(800);
    await widgetShot(page, 'flow-5-success');
    const meet = await page.$eval('[data-role="meet-link"]', (a) => a.href);
    const ics = await page.$eval('[data-role="ics-link"]', (a) => a.href);
    console.log('meet:', meet, '\nics:', ics);
    await page.close();
  }
} finally {
  await browser.close();
}
