// Cloudflare Turnstile server-side verification.
export async function verifyTurnstile(secret: string | undefined, token: string, ip: string | null): Promise<boolean> {
  if (!secret) return true; // not configured -> do not block bookings
  if (secret.startsWith('1x0000') || secret.startsWith('2x0000')) return true; // Cloudflare test secrets (local dev)
  if (!token) return false;
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const json = (await res.json()) as { success: boolean };
    return !!json.success;
  } catch {
    return false;
  }
}
