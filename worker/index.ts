// Cloudflare Worker: serves the static site (dist/) and the booking API under /api/*.
import { type AppEnv, isMock } from './env';
import { handleAvailability, handleBook, handleCancel, handleIcs, handleHealth, json } from './handlers';
import { runReminders } from './reminders';
import { devEmailPreview } from './dev';

function sameOrigin(request: Request, env: AppEnv): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser or same-origin form post without Origin
  try {
    const host = new URL(origin).hostname;
    const siteHost = new URL(env.SITE_URL).hostname;
    return host === siteHost || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.workers.dev') || host.endsWith('.crefolo.com');
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        switch (url.pathname) {
          case '/api/availability':
            if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
            return await handleAvailability(env);
          case '/api/book':
            if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
            if (!sameOrigin(request, env)) return json({ ok: false, error: 'forbidden' }, 403);
            return await handleBook(request, env, ctx);
          case '/api/cancel':
            if (request.method !== 'GET' && request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
            return await handleCancel(request, env, ctx);
          case '/api/ics':
            if (request.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
            return await handleIcs(request, env);
          case '/api/health':
            return await handleHealth(env);
          case '/api/dev/email':
            // local design preview only, never available with the real calendar
            if (!isMock(env)) return json({ ok: false, error: 'not_found' }, 404);
            return devEmailPreview(url, env);
          default:
            return json({ ok: false, error: 'not_found' }, 404);
        }
      } catch (e) {
        console.error('unhandled api error', e);
        return json({ ok: false, error: 'generic' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, ctx): Promise<void> {
    ctx.waitUntil(runReminders(env));
  },
} satisfies ExportedHandler<AppEnv>;
