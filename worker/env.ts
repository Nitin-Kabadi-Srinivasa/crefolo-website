// Bindings, variables and secrets available to the Worker (see wrangler.jsonc and .dev.vars)
export interface AppEnv {
  ASSETS: Fetcher;
  SITE_URL: string;
  TEACHER_EMAIL: string;
  TEACHER_NAME: string;
  TIMEZONE: string;
  SLOT_WEEKDAYS: string;
  SLOT_START_HOURS: string;
  SLOT_MINUTES: string;
  MIN_DAYS_AHEAD: string;
  MAX_DAYS_AHEAD: string;
  MOCK: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  MS_TENANT_ID?: string;
  MS_CLIENT_ID?: string;
  MS_CLIENT_SECRET?: string;
  TURNSTILE_SECRET?: string;
  CANCEL_SECRET?: string;
}

export interface SlotConfig {
  timeZone: string;
  weekdays: number[]; // ISO: 1 = Monday … 7 = Sunday
  startHours: number[];
  minutes: number;
  minDaysAhead: number;
  maxDaysAhead: number;
}

export function getSlotConfig(env: AppEnv): SlotConfig {
  const nums = (s: string) =>
    s
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n));
  return {
    timeZone: env.TIMEZONE || 'Europe/Berlin',
    weekdays: nums(env.SLOT_WEEKDAYS || '1,2,3,4,5'),
    startHours: nums(env.SLOT_START_HOURS || '17,18,19,20'),
    minutes: Number(env.SLOT_MINUTES || '60'),
    minDaysAhead: Number(env.MIN_DAYS_AHEAD || '1'),
    maxDaysAhead: Number(env.MAX_DAYS_AHEAD || '28'),
  };
}

export const isMock = (env: AppEnv) => env.MOCK === '1' || env.MOCK === 'true';
