// Signed tokens for cancel / .ics links (HMAC-SHA256, base64url, truncated).

const enc = new TextEncoder();

function base64url(bytes: ArrayBuffer): string {
  let bin = '';
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signToken(secret: string, purpose: string, id: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${purpose}:${id}`));
  return base64url(sig).slice(0, 32);
}

export async function verifyToken(secret: string, purpose: string, id: string, token: string): Promise<boolean> {
  if (!token || token.length !== 32) return false;
  const expected = await signToken(secret, purpose, id);
  // constant-time compare
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
