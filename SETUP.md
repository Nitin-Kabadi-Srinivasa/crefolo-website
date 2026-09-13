# Setup and go-live guide

Everything the new crefolo.com needs, in the order to do it. Each step takes about 10 minutes. Secrets never go into the code: locally they live in `.dev.vars`, in production they are stored as Cloudflare secrets.

## 1. GitHub (code + automatic publishing)

1. Create a free account at https://github.com/signup (use info@crefolo.com or your private address).
2. Create a new **private** repository named `crefolo-website` (no README, no .gitignore – the project already has them).
3. Tell Claude the repository URL; the code is pushed from this PC.

## 2. Cloudflare (hosting, free plan)

Nothing to buy. The domain crefolo.com already lives in this account.

1. Log in at https://dash.cloudflare.com.
2. **Workers & Pages → Create → Import a repository** → connect GitHub → choose `crefolo-website`.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
3. After the first deploy the site is reachable at `crefolo-website.<account>.workers.dev`.
4. **Turnstile** (spam protection): dashboard → Turnstile → Add widget → hostname `crefolo.com` (and the workers.dev address for testing), mode *Managed*. Note the **Site key** and the **Secret key**.
5. Secrets (Workers & Pages → crefolo-website → Settings → Variables and Secrets → Add → type *Secret*):
   - `TURNSTILE_SECRET` – from step 4
   - `CANCEL_SECRET` – any long random text (40+ characters)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` – from section 3
   - `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` – from section 4
6. Variables (same page, type *Text*): `MOCK` = `0` (already the default in `wrangler.jsonc`).
7. Build variable for the pages: Settings → Build → Variables → `PUBLIC_TURNSTILE_SITE_KEY` = the Turnstile **site key**.

## 3. Google Calendar + Google Meet (booking)

Uses the Google account **info@crefolo.com**. The website reads busy times from *all* calendars of that account and creates the trial-lesson events in the primary calendar.

1. Go to https://console.cloud.google.com and sign in with info@crefolo.com.
2. Create a project, e.g. `crefolo-website`.
3. **APIs & Services → Library** → search *Google Calendar API* → **Enable**.
4. **APIs & Services → OAuth consent screen** (Google Auth Platform):
   - App name `Crefolo Website`, support email info@crefolo.com, audience **External**, contact email info@crefolo.com.
   - Scopes: add `.../auth/calendar.readonly` and `.../auth/calendar.events`.
   - Under *Audience* click **Publish app** (status "In production"). Google shows an "unverified app" warning at the consent step – that is fine, only you will ever see it. Do **not** leave the app in "Testing", otherwise the connection expires after 7 days.
5. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Desktop app** → name `crefolo-website`. Copy the **Client ID** and **Client secret**.
6. On this PC run (Claude can do this with you):
   ```bash
   node scripts/google-auth.mjs <CLIENT_ID> <CLIENT_SECRET>
   ```
   A browser window opens: choose info@crefolo.com → *Advanced* → *Go to Crefolo Website (unsafe)* → allow both calendar permissions. The script prints `GOOGLE_REFRESH_TOKEN=…`.
7. Put all three values into `.dev.vars` (local) and into the Cloudflare secrets (section 2, step 5).

**Google reconnect:** if the daily check ever emails "Google Calendar connection failed", repeat step 6 and update the `GOOGLE_REFRESH_TOKEN` secret.

**Blocking a day** (holidays etc.): create an event in Google Calendar that covers the time. All-day events must be set to *Busy* (not *Free*) to block trial slots.

## 4. Microsoft 365 (sending the emails as info@crefolo.com)

1. Go to https://entra.microsoft.com (sign in as the admin of the tenant).
2. **Identity → Applications → App registrations → New registration**: name `Crefolo Website Mailer`, supported account types *Accounts in this organizational directory only*, no redirect URI → Register.
3. On the overview page copy **Application (client) ID** and **Directory (tenant) ID**.
4. **API permissions → Add a permission → Microsoft Graph → Application permissions** → tick `Mail.Send` → Add. Then click **Grant admin consent for …** → Yes.
5. **Certificates & secrets → New client secret** → description `crefolo-website`, expiry **24 months** → Add. Copy the **Value** immediately (it is shown only once). Put a reminder in your calendar for the renewal date.
6. Test from this PC:
   ```bash
   node scripts/ms-test.mjs <TENANT_ID> <CLIENT_ID> <CLIENT_SECRET>
   ```
   A test email should arrive at info@crefolo.com.
7. Put the three values into `.dev.vars` (local) and the Cloudflare secrets.

Optional hardening (recommended later): restrict the app to the one mailbox with an Exchange *ApplicationAccessPolicy*.

## 5. Test the real booking

1. In `.dev.vars` set `MOCK=0` and run `npm run preview`.
2. Book a trial lesson on http://localhost:8787/probestunde with your own email address.
3. Check: event with Meet link in Google Calendar, confirmation email (with .ics) in your inbox, notification email at info@crefolo.com, the cancel link works.
4. Same test on the workers.dev address after the Cloudflare secrets are set.

## 6. Go-live (domain switch)

1. Cloudflare → Workers & Pages → crefolo-website → Settings → Domains & Routes → **Add custom domain** `crefolo.com` and `www.crefolo.com`. Cloudflare creates the DNS records (this replaces the old A record pointing to Hostinger; mail records stay untouched).
2. `learn.crefolo.com`: keep a proxied DNS record (orange cloud) and add a **Redirect Rule** (Rules → Redirect Rules): if hostname equals `learn.crefolo.com` → dynamic redirect to `concat("https://crefolo.com", http.request.uri.path)`, status 301. Old flyer QR codes and Kleinanzeigen links keep working.
3. DNS clean-up: remove `include:spf.titan.email` from the SPF TXT record (Titan mail is no longer used). Keep the Microsoft 365 records.
4. Update the Kleinanzeigen ad link to https://crefolo.com.
5. Keep Hostinger for a few weeks as a fallback, download a WordPress backup, then cancel.

## Costs

Cloudflare Workers free plan, Turnstile free, Google Cloud free (Calendar API has no cost at this volume), Microsoft 365 – already paid. Domain renewal as before.
