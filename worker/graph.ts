// Sends email as info@crefolo.com through Microsoft Graph (app-only, client credentials).
import type { AppEnv } from './env';

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  ics?: { filename: string; content: string };
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

let tokenCache: { value: string; exp: number } | null = null;

export async function getGraphToken(env: AppEnv): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 30_000) return tokenCache.value;
  if (!env.MS_TENANT_ID || !env.MS_CLIENT_ID || !env.MS_CLIENT_SECRET) throw new Error('Microsoft 365 credentials are not configured');
  const body = new URLSearchParams({
    client_id: env.MS_CLIENT_ID,
    client_secret: env.MS_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(env.MS_TENANT_ID)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`graph token failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { value: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function graphMailer(env: AppEnv): Mailer {
  return {
    async send(mail) {
      const token = await getGraphToken(env);
      const message: Record<string, unknown> = {
        subject: mail.subject,
        body: { contentType: 'HTML', content: mail.html },
        toRecipients: [{ emailAddress: { address: mail.to } }],
        replyTo: mail.replyTo ? [{ emailAddress: { address: mail.replyTo } }] : undefined,
        attachments: mail.ics
          ? [
              {
                '@odata.type': '#microsoft.graph.fileAttachment',
                name: mail.ics.filename,
                contentType: 'text/calendar; method=PUBLISH',
                contentBytes: toBase64(mail.ics.content),
              },
            ]
          : undefined,
      };
      const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.TEACHER_EMAIL)}/sendMail`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ message, saveToSentItems: true }),
      });
      if (!res.ok && res.status !== 202) throw new Error(`sendMail failed: ${res.status} ${await res.text()}`);
    },
  };
}
