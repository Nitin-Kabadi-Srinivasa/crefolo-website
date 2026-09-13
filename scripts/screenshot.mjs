// Full-page screenshot with headless Chrome, split into readable chunks.
// Usage: node scripts/screenshot.mjs <url> <name> [width] [height]
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const [url = 'http://localhost:8787/', name = 'home', width = '1280', height = '12000'] = process.argv.slice(2);
const outDir = process.env.SHOT_DIR || path.join(os.tmpdir(), 'crefolo-shots');
mkdirSync(outDir, { recursive: true });
const profile = path.join(os.tmpdir(), 'crefolo-chrome-profile');

const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => existsSync(p));
if (!chrome) throw new Error('No Chrome/Edge found');

const full = path.join(outDir, `${name}-full.png`);
execFileSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    '--virtual-time-budget=10000',
    `--screenshot=${full}`,
    url,
  ],
  { stdio: 'ignore', timeout: 60000 },
);

const meta = await sharp(full).metadata();
const chunk = Number(process.env.SHOT_CHUNK || 1500);
let parts = 0;
for (let top = 0; top < meta.height; top += chunk) {
  const h = Math.min(chunk, meta.height - top);
  const piece = sharp(full).extract({ left: 0, top, width: meta.width, height: h });
  const stats = await piece.clone().stats();
  const flat = stats.channels.every((c) => c.stdev < 1.5);
  if (flat) continue; // blank area below the page
  await piece.png().toFile(path.join(outDir, `${name}-${String(parts).padStart(2, '0')}.png`));
  parts++;
}
console.log(`${name}: ${parts} parts (${meta.width}x${meta.height}) in ${outDir}`);
