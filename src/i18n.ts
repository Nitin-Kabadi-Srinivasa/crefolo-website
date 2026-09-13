import type { Locale, SiteContent, LegalContent } from './content/types';
import de from './content/de';
import en from './content/en';
import legalDe from './content/legal-de';
import legalEn from './content/legal-en';

export const locales: Locale[] = ['de', 'en'];

export function getContent(locale: Locale): SiteContent {
  return locale === 'en' ? en : de;
}

export function getLegal(locale: Locale): LegalContent {
  return locale === 'en' ? legalEn : legalDe;
}

// Every page exists in both languages; this maps a page id to its path per language.
export const routes = {
  home: { de: '/', en: '/en' },
  booking: { de: '/probestunde', en: '/en/trial-lesson' },
  imprint: { de: '/impressum', en: '/en/imprint' },
  privacy: { de: '/datenschutz', en: '/en/privacy' },
} as const;

export type PageId = keyof typeof routes;

export function otherLocale(locale: Locale): Locale {
  return locale === 'de' ? 'en' : 'de';
}

export function bookingAnchor(locale: Locale): string {
  return locale === 'de' ? '/#probestunde' : '/en#trial-lesson';
}

export function bookingSectionId(locale: Locale): string {
  return locale === 'de' ? 'probestunde' : 'trial-lesson';
}

export const sectionIds = {
  de: { steps: 'so-gehts', lessons: 'unterricht', prices: 'preise', about: 'ueber-mich', parents: 'eltern', faq: 'faq' },
  en: { steps: 'how-it-works', lessons: 'lessons', prices: 'prices', about: 'about', parents: 'parents', faq: 'faq' },
} as const;
