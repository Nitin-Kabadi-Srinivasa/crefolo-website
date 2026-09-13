// One-time helper: obtain a long-lived Google refresh token for the teacher's Google account.
//   node scripts/google-auth.mjs <CLIENT_ID> <CLIENT_SECRET>
// Opens the Google consent screen in the browser, receives the code on http://localhost:8765/callback,
// exchanges it for tokens and prints GOOGLE_REFRESH_TOKEN. Requires an OAuth client of type "Desktop app".
import http from 'node:http';
import { exec } from 'node:child_process';

const clientId = process.argv[2] || process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Usage: node scripts/google-auth.mjs <CLIENT_ID> <CLIENT_SECRET>');
  process.exit(1);
}

const port = 8765;
const redirect = `http://localhost:${port}/callback`;
const scope = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'].join(' ');

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end();
    return;
  }
  const code = url.searchParams.get('code');
  if (!code) {
    res.end(`Error: ${url.searchParams.get('error') || 'missing code'}`);
    server.close();
    return;
  }
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirect, grant_type: 'authorization_code' }),
  });
  const json = await tokenRes.json();
  if (!json.refresh_token) {
    res.end('No refresh token received. Remove the app at https://myaccount.google.com/permissions and run the script again.');
    console.error('Token response without refresh_token:', json);
    server.close();
    return;
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<h1 style="font-family:sans-serif">Done ✅</h1><p style="font-family:sans-serif">You can close this window and go back to the terminal.</p>');

  const cal = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { headers: { authorization: `Bearer ${json.access_token}` } }).then((r) => r.json());
  console.log('\nConnected calendars:', (cal.items || []).map((c) => c.summary).join(', ') || '(none)');
  console.log('\nAdd this line to .dev.vars and set it as a Cloudflare secret (wrangler secret put GOOGLE_REFRESH_TOKEN):\n');
  console.log(`GOOGLE_REFRESH_TOKEN=${json.refresh_token}\n`);
  server.close();
});

server.listen(port, () => {
  console.log('Opening the Google consent screen in your browser…');
  console.log('If it does not open, visit:\n' + authUrl + '\n');
  exec(`start "" "${authUrl}"`);
});
