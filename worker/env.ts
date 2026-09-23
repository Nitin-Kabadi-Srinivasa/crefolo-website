// Bindings, variables and secrets available to the Worker (see wrangler.jsonc and .dev.vars).
// Trial dates, age bands and capacity live in src/content/schedule.ts.
export interface AppEnv {
  ASSETS: Fetcher;
  SITE_URL: string;
  TEACHER_EMAIL: string;
  TEACHER_NAME: string;
  TIMEZONE: string;
  MIN_DAYS_AHEAD: string;
  MOCK: string;
  MAIL_DRY_RUN?: string; // "1" = real calendar, but emails are only logged (local testing)
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  MS_TENANT_ID?: string;
  MS_CLIENT_ID?: string;
  MS_CLIENT_SECRET?: string;
  TURNSTILE_SECRET?: string;
  CANCEL_SECRET?: string;
}

export const isMock = (env: AppEnv) => env.MOCK === '1' || env.MOCK === 'true';
export const timeZoneOf = (env: AppEnv) => env.TIMEZONE || 'Europe/Berlin';
export const minDaysAhead = (env: AppEnv) => {
  const n = Number(env.MIN_DAYS_AHEAD);
  return Number.isFinite(n) ? n : 1;
};
