# How to change the website (text, prices, pictures, sections)

This guide is for **crefolo.com**. It explains what to change, where, and exactly which steps
bring your change to the live website. No prior coding knowledge needed.

There are no deadlines and nothing can break permanently: if you ever save a file with a small
mistake, the live website simply **keeps the last working version** until the mistake is fixed
(see "Safety net" at the end).

---

## The big picture (how a change reaches the live site)

```
   You edit a file   ->   You "publish" it   ->   Cloudflare rebuilds   ->   Live on crefolo.com
                                                     (about 2 minutes)
```

- All the website's words and prices live in **two files**: one German, one English.
- "Publishing" means saving your change to GitHub. Cloudflare watches GitHub and rebuilds
  the site automatically. You do **not** touch Cloudflare for normal changes.

There are two ways to publish. Pick whichever feels comfortable:

- **Way A – in the web browser (easiest, no programs to open).** Good for text and prices.
- **Way B – on your computer.** Needed for pictures and for previewing before publishing.

---

## The files you will edit

Everything is in this folder on your PC:

```
D:\07_Website\crefolo-website
```

The important files for content:

| File | What it controls |
|---|---|
| `src\content\de.ts` | **All German text and prices** (the main website) |
| `src\content\en.ts` | **All English text and prices** (the EN version) |
| `src\content\schedule.ts` | **Dates:** trial lessons, the next group start, class-free periods (both languages) |
| `src\content\legal-de.ts` | German Impressum and Datenschutz |
| `src\content\legal-en.ts` | English Imprint and Privacy |
| `src\pages\index.astro` | The **order of sections** on the German home page |
| `src\pages\en.astro` | The order of sections on the English home page |

You will spend 95% of your time in `de.ts` and `en.ts`.

---

## Five golden rules for editing `de.ts` / `en.ts`

These files are lists of text pieces. Keep the punctuation around your words exactly as it is.

1. **Only change the words between the single quotes.**
   `title: 'Kostenlose Probestunde buchen',` -> change only `Kostenlose Probestunde buchen`.
2. **Keep the single quotes `'  '` and the comma at the end.** Don't delete them.
3. **An apostrophe inside the text must be written as `\'`** (a backslash before it).
   Example: `'So geht\'s'`. This is why you see `\'` in a few places.
4. **Don't delete brackets** `{ }` `[ ]` or the words before the colon (like `title:`).
   Those are labels the website needs.
5. **German text stays in `de.ts`, English in `en.ts`.** If you change something in one language,
   change the matching line in the other so both versions stay in sync.

If in doubt, change one thing, publish, and check the result before doing more.

---

## Way A – publish from the web browser (easiest)

Best for changing a word, a sentence, or a price.

1. Go to **https://github.com/Nitin-Kabadi-Srinivasa/crefolo-website** and sign in.
2. Open the file: click the folders `src` -> `content` -> and the file, e.g. `de.ts`.
3. Click the **pencil icon** (top right of the file) to edit.
4. Change your text, following the five golden rules above.
5. Scroll down, leave the short "Commit changes" note as is (or write what you changed),
   and click the green **Commit changes** button.
6. Wait about **2 minutes**. Cloudflare rebuilds and publishes automatically.
7. Open **https://crefolo.com** and refresh (Ctrl+F5) to see the change.

That's it. Repeat for `en.ts` if the change also applies to the English version.

---

## Way B – publish from your computer (needed for pictures / previewing)

Open **PowerShell** (Start menu -> type "PowerShell" -> Enter). Then:

**1. Go to the project folder** (copy-paste this line, press Enter):

```powershell
cd D:\07_Website\crefolo-website
```

**2. (Optional) Preview your change before publishing.** Run:

```powershell
npm run dev
```

Then open **http://localhost:4321** in your browser to see the site with your edits.
The booking form does not work in this preview, that is normal; it is only for checking
text and layout. Press **Ctrl+C** in PowerShell to stop the preview when done.

**3. Publish.** Run these three lines one after another:

```powershell
git add -A
git commit -m "Kurze Beschreibung der Änderung"
git push
```

**4. Wait about 2 minutes**, then check **https://crefolo.com** (refresh with Ctrl+F5).

---

## Recipes for common changes

### Change a price
Open `src\content\de.ts`, find the `pricing:` section. Change the number inside the quotes,
for example `price: '85 €'`. Do the same in `en.ts` (`price: '€85'`). The price is also
mentioned in the FAQ answer "Wie funktioniert die Bezahlung?", so update that sentence too. Publish.

### Change trial dates, the next group start or the class-free periods
All dates live in **one file for both languages**: `src\content\schedule.ts`.

- **Trial lessons:** each line under `trials:` is one group trial, for example
  ```
  { date: '2026-10-01', time: '17:00', ages: [5, 7] },
  ```
  Date as `'YYYY-MM-DD'`, time in German time, `ages` is the age band (from, to).
  Add a line for a new date, delete a line to cancel a date. Past dates disappear automatically.
- **Places per trial:** `trialCapacity: 3`.
- **Next group start:** `nextGroup: { date: '2026-11-05', time: '17:00' },`
  This drives the "Neue Mini-Gruppe" banner under the photo. It hides itself after the start.
  To remove the banner completely, write `nextGroup: null,`
- **Days or periods without lessons:** each line under `breaks:` has a German and English name
  and a `from` / `to` date. For a single day, use the same date twice, for example
  ```
  { name: { de: 'Heiligabend', en: 'Christmas Eve' }, from: '2026-12-24', to: '2026-12-24' },
  ```
  For a longer break, for example your own holiday, give the first and last day without lessons.
  They appear in the prices section; past entries disappear automatically.

The booking form reads the trial dates from this file, so a new date can be booked as soon
as the change is live. Keep the commas at the end of each line. Publish as usual.

### Change a headline or a paragraph
Search the file for a few words of the current text (Ctrl+F in the editor), change the words
between the quotes, publish. Remember to update both `de.ts` and `en.ts`.

### Change a FAQ question or answer
In `de.ts` find `faq:`. Each item looks like:
```
{ q: 'Question here?', a: 'Answer here.' },
```
Change `q` and/or `a`. Keep the `{ }` and the comma. Mirror it in `en.ts`. Publish.

### Change the "About me" text
In `de.ts` find `about:`. The `paragraphs: [ ... ]` list holds your text, one paragraph per
line between quotes. Edit the words, keep the commas between paragraphs. Mirror in `en.ts`.

### Change the "no child left out" note, the chips, the steps, etc.
All of these are labelled sections in `de.ts` / `en.ts`: `hero`, `steps`, `philosophy`,
`features`, `pricing`, `about`, `reviews`, `faq`, `ctaBand`, `booking`, `contact`, `footer`.
Find the section by name, edit the words, publish.

---

## Rearranging or hiding sections on the home page

The order of the big sections is set in `src\pages\index.astro` (German) and
`src\pages\en.astro` (English). Near the bottom you will see a list like this:

```
<Hero locale={locale} />
<Steps locale={locale} />
<Philosophy locale={locale} />
<Features locale={locale} />
<CtaBand locale={locale} />
<Pricing locale={locale} />
<About locale={locale} />
<Reviews locale={locale} />
<Faq locale={locale} />
<Booking locale={locale} />
```

Each line is one section of the page:

| Line | Section on the page |
|---|---|
| `Hero` | Top banner with the headline and photo |
| `Steps` | "So einfach geht's" (1 · 2 · 3) |
| `Philosophy` | "Online lernen, ohne am Bildschirm zu kleben" |
| `Features` | "Was den Unterricht besonders macht" |
| `CtaBand` | Pink "Bereit für den ersten Schritt?" band |
| `Pricing` | "Unterricht & Preise" |
| `About` | "Hallo, ich bin Nitin!" |
| `Reviews` | "Das sagen Eltern und Schüler" |
| `Faq` | "Häufige Fragen" |
| `Booking` | The booking form |

- **To reorder:** move a whole line up or down.
- **To hide a section:** delete its line (or ask me to hide it).
- Do the same in **both** `index.astro` and `en.astro` so the two languages match.
- Publish (Way A or B). This is a bigger change, so previewing with Way B first is a good idea.

---

## Changing pictures

Pictures are more involved than text. The three main photos are:

| Picture on the site | File used by the site |
|---|---|
| Two kids in the top banner | `src\assets\kids.jpg` |
| Your photo in "About me" | `src\assets\nitin.jpg` |
| The Crefolo logo | `src\assets\logo.png`, `logo-mark.png`, `logo-wordmark.png` |

The simplest and safest way to swap a photo is to **send me the new image and tell me where it
should go** – I'll place, crop and optimise it correctly.

If you want to do it yourself (Way B, on your computer):
1. Save your new photo somewhere on your PC.
2. Open `scripts\process-images.mjs` and change the matching source line at the top,
   for example `const SRC_KIDS = '...path to your new photo...';`
3. In PowerShell (in the project folder) run: `npm run images`
   This creates the optimised versions in `src\assets`.
4. Publish with the three git commands (Way B, step 3).

---

## Flyers, posters and Kleinanzeigen pictures

Everything lives in the `marketing` folder:
- `marketing\output` contains the finished files: the Kleinanzeigen pictures and text, the A4 and A3
  posters, and the A6 flyers (4 per A4 sheet for your own printer, plus a version for a print shop).
- `marketing\src` contains the designs (HTML files, same colours and fonts as the website).

The dates, times, age groups and prices are taken from `schedule.ts` and `de.ts`. After you
change dates there, make fresh files on your computer (Way B) with:
```powershell
cd D:\07_Website\crefolo-website
git pull
npm run marketing
```
Then publish with the three git commands as usual, so the new files are backed up on GitHub too.
This does not change the website.

---

## Checking that your change went live

- Cloudflare dashboard -> **Workers & Pages -> crefolo-website -> Deployments**.
  A green tick next to the newest entry means it is live. A red X means the build failed
  (see Safety net below).
- Then open **https://crefolo.com** and refresh with **Ctrl+F5** (this ignores your browser's
  cached copy).

---

## Safety net (nothing breaks permanently)

If you publish a file with a small mistake (a missing quote or comma), Cloudflare's build
**fails and the live website keeps the previous working version.** Visitors never see a broken
page. In the Deployments list you will see a red X on the failed attempt.

To fix it: correct the file and publish again, or simply **tell me and I'll fix it**. You can
always ask me to make any change for you – just describe what you want and I'll do it and publish it.

---

## Quick reference

- Project folder: `D:\07_Website\crefolo-website`
- German text: `src\content\de.ts` · English text: `src\content\en.ts`
- Section order: `src\pages\index.astro` (DE) and `src\pages\en.astro` (EN)
- Publish from your PC:
  ```powershell
  cd D:\07_Website\crefolo-website
  git add -A
  git commit -m "what I changed"
  git push
  ```
- After publishing: wait ~2 minutes, then Ctrl+F5 on https://crefolo.com
- Emails are covered in the separate guide **HOW-TO-edit-emails.md**
