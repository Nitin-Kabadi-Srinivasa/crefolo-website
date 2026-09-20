# How to change the automated emails

This guide explains how to change the wording and look of the automatic emails that go out when
a parent books or cancels a trial lesson. Publishing works the same way as for the website
(save to GitHub -> Cloudflare rebuilds in ~2 minutes).

> The emails are a little more "code-like" than the website text. For simple wording changes the
> steps below are enough. For anything bigger, **just tell me what you want the email to say and
> I'll do it** – that is often the fastest and safest route.

---

## Which emails exist

All emails are in one file:

```
D:\07_Website\crefolo-website\worker\emails.ts
```

Inside that file each email is a named block ("function"):

| Block name in the file | When it is sent | To whom | Language |
|---|---|---|---|
| `parentConfirmation` | right after a booking | the parent | German **and** English |
| `teacherNotification` | right after a booking | **you** (info@crefolo.com) | English |
| `parentReminder` | the morning before the lesson | the parent | German and English |
| `teacherReminder` | the morning before the lesson | you | English |
| `parentCancellation` | when a booking is cancelled | the parent | German and English |
| `teacherCancellation` | when a booking is cancelled | you | English |

The parent emails are written in the parent's chosen language, so each of those blocks contains
**two versions**: a German one and an English one. Your own (teacher) emails are English only.

---

## How a parent email is structured

Open `worker\emails.ts` and find, for example, `parentConfirmation`. You will see two parts:

- A German part, inside `if (b.lang === 'de') { ... }`
- An English part, after it (the `else` case)

Within each part there is:
- a **subject** line (`const subject = ...`)
- an **HTML body** (`const html = layout( subject, \`...the email text...\`, ...)`) – this is what
  the parent actually sees
- a **plain-text body** (`text:`) – a fallback for very old email programs

Change the **German text** in the German part and the **English text** in the English part.

---

## Golden rules for editing emails

1. **Only change the readable words.** Leave everything that looks like code untouched.
2. **Never remove the placeholders.** Things like `${esc(b.childName)}`, `${date}`, `${time}`,
   `${b.meetLink}` are automatically filled in with the real name, date, time and link.
   Keep them exactly as they are, move them if you like, but don't delete or rename them.
3. **Keep the HTML tags.** Text often sits inside tags like `<p>...</p>` or `<li>...</li>`.
   Keep the opening and closing tags around your words.
4. **Keep the surrounding punctuation:** the back-ticks `` ` `` at the start/end of the body,
   the quotes, and the commas. Change only the words in between.
5. **Change both languages** when the change applies to both (German part *and* English part).

Example – changing one line in the confirmation email:

```
  <li>Ein ruhiger Platz, an dem ${esc(b.childName)} sitzen kann</li>
```
You may safely change the words to, say:
```
  <li>Ein ruhiger, gut beleuchteter Platz für ${esc(b.childName)}</li>
```
The `${esc(b.childName)}` stays; only the German words around it changed.

---

## Changing the look (colours, logo word, footer)

Near the top of the file there is a small block called `layout(...)`. It draws the pink header
bar with the word **Crefolo**, the white body, and the grey footer line.

- The pink colour is the value `#ea1889` in that block. Changing it changes the header colour.
- The footer text (contact line) is built further down in each email from your name, email and
  phone – those come from your settings, so you normally don't edit them here.

For visual changes to the emails, I'd recommend asking me, so I can check it still looks right in
Outlook, Gmail and on phones.

---

## Publishing an email change (same as the website)

**Option A – in the browser:** edit `worker/emails.ts` on
**https://github.com/Nitin-Kabadi-Srinivasa/crefolo-website** with the pencil icon, then
**Commit changes**. Wait ~2 minutes.

**Option B – on your computer:** open PowerShell and run:

```powershell
cd D:\07_Website\crefolo-website
git add -A
git commit -m "Änderung an den E-Mails"
git push
```

Then wait about 2 minutes for Cloudflare to publish.

---

## Test after changing an email

The only reliable way to see an email change is to trigger a real one:

1. Go to **https://crefolo.com/probestunde** and book a trial lesson **with your own email
   address** (child name "Test").
2. Check the confirmation email that arrives at your address, and the notification at
   info@crefolo.com.
3. When done, click the **cancel link** in the confirmation email to remove the test booking
   from your calendar (this also lets you check the cancellation email).

---

## Safety net

If you publish `emails.ts` with a small mistake, Cloudflare's build **fails and the live site and
emails keep working with the previous version.** Nothing breaks for real parents. Fix the file
and publish again, or tell me and I'll fix it.

You can always ask me to write or adjust any email – just describe the wording and language you
want, and I'll make the change and publish it.

---

## Quick reference

- Email file: `worker\emails.ts`
- Parent emails = German + English; teacher emails = English only
- Keep every `${...}` placeholder and every HTML tag; change only the words
- Publish: `git add -A` -> `git commit -m "..."` -> `git push` (or the pencil on GitHub)
- Test by booking a trial with your own email on https://crefolo.com/probestunde, then cancel it
