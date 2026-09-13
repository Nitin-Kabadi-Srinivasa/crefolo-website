// One-time check: send a test email from info@crefolo.com through Microsoft Graph.
//   node scripts/ms-test.mjs <TENANT_ID> <CLIENT_ID> <CLIENT_SECRET> [to@example.com]
const [tenant, clientId, clientSecret, to = 'info@crefolo.com'] = process.argv.slice(2);
if (!tenant || !clientId || !clientSecret) {
  console.error('Usage: node scripts/ms-test.mjs <TENANT_ID> <CLIENT_ID> <CLIENT_SECRET> [to]');
  process.exit(1);
}
const from = 'info@crefolo.com';

const tokenRes = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }),
});
const token = await tokenRes.json();
if (!token.access_token) {
  console.error('Token error:', token);
  process.exit(1);
}
console.log('Token OK. Sending test email to', to, '…');

const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token.access_token}`, 'content-type': 'application/json' },
  body: JSON.stringify({
    message: {
      subject: 'crefolo.com – Test-E-Mail',
      body: { contentType: 'Text', content: 'Wenn diese E-Mail ankommt, funktioniert der Versand über Microsoft 365. 🎉' },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  }),
});
if (res.status === 202) console.log('Sent! Check the inbox of', to);
else console.error('Send failed:', res.status, await res.text());
