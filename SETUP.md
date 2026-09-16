# Setup and go-live guide

Everything the new crefolo.com needs, in the order to do it. Each step takes about 10 minutes. Secrets never go into the code: locally they live in `.dev.vars`, in production they are stored as Cloudflare secrets.

## 1. GitHub (code + automatic publishing)

Done: private repository https://github.com/Nitin-Kabadi-Srinivasa/crefolo-website, connected as `origin`.

Pushing the code the first time (a GitHub login window opens once, the Git Credential Manager remembers it):

```powershell
cd D:\07_Website\crefolo-website; $env:Path = "$env:LOCALAPPDATA\Programs\MinGit\cmd;$env:Path"; git push -u origin main
```

## 2. Cloudflare (hosting, free plan)

Nothing to buy. The domain crefolo.com already lives in this account. Important: the GitHub repository must already contain the code (section 1), otherwise the import fails.

1. Log in at https://dash.cloudflare.com.
2. **Workers & Pages → Create → Workers → Import a repository** → connect the GitHub account (allow access to `crefolo-website`) → choose `crefolo-website`.
   - Project name: `crefolo-website`
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
   - Node version is taken from `.node-version` (24).
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

All in the Cloudflare dashboard for the zone crefolo.com. Mail records (MX, autodiscover, DKIM selectors, DMARC) stay untouched.

1. **Remove the old redirect.** Rules → Redirect Rules and Rules → Page Rules: delete any rule that sends crefolo.com to learn.crefolo.com (otherwise the new site loops).
2. **Custom domain:** Workers & Pages → crefolo-website → Settings → Domains & Routes → Add → Custom domain → `crefolo.com`. Confirm that Cloudflare replaces the existing A record. Wait until the status is Active.
3. **www:** DNS → keep `www` as CNAME to `crefolo.com`, proxied (orange cloud). Rules → Redirect Rules → Create → template **"Redirect from WWW to root"** → deploy.
4. **learn.crefolo.com** (old flyers, QR codes, Kleinanzeigen): DNS → edit the `learn` record: type `AAAA`, content `100::`, proxied. Then Rules → Redirect Rules → Create rule "learn to crefolo.com": when hostname equals `learn.crefolo.com`, then Dynamic redirect with expression `concat("https://crefolo.com", http.request.uri.path)`, status 301, preserve query string. The site's `_redirects` file maps the old WordPress paths to the new pages.
5. **SPF clean-up:** DNS → edit the TXT record of crefolo.com to `v=spf1 include:spf.protection.outlook.com ~all` (Hostinger IP and Titan are gone).
6. **Turnstile:** the widget's hostname list must contain `crefolo.com` (it can keep the workers.dev host).
7. **Check:** https://crefolo.com, https://www.crefolo.com, https://learn.crefolo.com/termin-buchen/ (must land on the booking page), https://crefolo.com/api/health, and one real booking + cancellation on crefolo.com.
8. **Afterwards:** disable the workers.dev address (Settings → Domains & Routes → workers.dev → Disable) so the site exists only once. Update the Kleinanzeigen ad and the Google Business Profile link to https://crefolo.com. Cancel Hostinger.

## Costs

Cloudflare Workers free plan, Turnstile free, Google Cloud free (Calendar API has no cost at this volume), Microsoft 365 – already paid. Domain renewal as before.
