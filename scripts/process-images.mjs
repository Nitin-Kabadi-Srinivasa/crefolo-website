// One-off image preparation: run with `npm run images`.
// Reads the originals from D:\07_Website and writes optimized copies into the project.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC_LOGO = 'D:/07_Website/Logo/Crefolo_Logo_3_Transparent.png';
const SRC_KIDS = 'D:/07_Website/Stock photos/kids-photo-learning.jpg';
const SRC_NITIN = 'C:/Users/NitinCrefolo/Pictures/IMG_20260525_122617102_HDR.jpg';

const ASSETS = 'src/assets';
const PUBLIC = 'public';

await mkdir(ASSETS, { recursive: true });
await mkdir(PUBLIC, { recursive: true });

// --- Logo: full wordmark, trimmed ------------------------------------------
const logo = sharp(SRC_LOGO).trim({ threshold: 10 });
const logoMeta = await logo.clone().toBuffer({ resolveWithObject: true });
console.log('logo trimmed to', logoMeta.info.width, 'x', logoMeta.info.height);
await sharp(logoMeta.data).resize({ width: 1000 }).png({ compressionLevel: 9 }).toFile(path.join(ASSETS, 'logo.png'));

// --- Logo mark: the framed "C" (top part of the original) ----------------
// In the 1600x900 original the framed C sits roughly at x 548-1052, y 98-608.
// (extract and trim must run in separate sharp instances: sharp applies trim before extract)
const markRegion = await sharp(SRC_LOGO).extract({ left: 540, top: 90, width: 520, height: 526 }).png().toBuffer();
const markBuf = await sharp(markRegion).trim({ threshold: 10 }).png().toBuffer();
await sharp(markBuf).resize({ width: 600, height: 600, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(ASSETS, 'logo-mark.png'));

// --- Logo wordmark: the "CREFOLO" lettering (bottom part of the original) --
const wordRegion = await sharp(SRC_LOGO).extract({ left: 250, top: 680, width: 1100, height: 190 }).png().toBuffer();
const wordBuf = await sharp(wordRegion).trim({ threshold: 10 }).png().toBuffer();
const wordMeta = await sharp(wordBuf).metadata();
console.log('wordmark trimmed to', wordMeta.width, 'x', wordMeta.height);
await sharp(wordBuf).resize({ width: 900 }).png({ compressionLevel: 9 }).toFile(path.join(ASSETS, 'logo-wordmark.png'));

// Favicons: white rounded square with the mark, so it reads well in a browser tab
async function favicon(size, file) {
  const pad = Math.round(size * 0.12);
  const inner = await sharp(markBuf)
    .resize({ width: size - pad * 2, height: size - pad * 2, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  const r = Math.round(size * 0.2);
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#ffffff"/></svg>`,
  );
  await sharp(bg).composite([{ input: inner, gravity: 'centre' }]).png().toFile(path.join(PUBLIC, file));
}
await favicon(32, 'favicon-32.png');
await favicon(180, 'apple-touch-icon.png');
await favicon(192, 'icon-192.png');
await favicon(512, 'icon-512.png');

// --- Kids photo --------------------------------------------------------------
await sharp(SRC_KIDS).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(ASSETS, 'kids.jpg'));

// --- Nitin portrait: square crop around the face ----------------------------
// Original is 6528x4896. Face centre is at about (2580, 1830).
await sharp(SRC_NITIN)
  .rotate() // respect EXIF orientation
  .extract({ left: 900, top: 380, width: 3400, height: 3400 })
  .resize({ width: 1200, height: 1200 })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(ASSETS, 'nitin.jpg'));

// --- Open Graph image (1200x630): kids photo + logo card --------------------
const ogBase = await sharp(SRC_KIDS).resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' }).toBuffer();
const logoSmall = await sharp(logoMeta.data).resize({ width: 380 }).png().toBuffer();
const logoSmallMeta = await sharp(logoSmall).metadata();
const cardW = logoSmallMeta.width + 80;
const cardH = logoSmallMeta.height + 60;
const card = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}"><rect width="${cardW}" height="${cardH}" rx="28" ry="28" fill="#ffffff" fill-opacity="0.96"/></svg>`,
);
await sharp(ogBase)
  .composite([
    { input: card, left: 50, top: 630 - cardH - 50 },
    { input: logoSmall, left: 50 + 40, top: 630 - cardH - 50 + 30 },
  ])
  .jpeg({ quality: 86 })
  .toFile(path.join(PUBLIC, 'og.jpg'));

console.log('done');
