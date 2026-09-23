// Shape of the editable site text. de.ts and en.ts must follow this structure;
// the build fails with a clear message if something is missing.

export type Locale = 'de' | 'en';

export type IconName =
  | 'sparkles'
  | 'graduation'
  | 'group'
  | 'heart'
  | 'clock'
  | 'home'
  | 'calendar'
  | 'video'
  | 'rocket'
  | 'book'
  | 'palette'
  | 'headphones'
  | 'check'
  | 'star'
  | 'whatsapp'
  | 'mail'
  | 'phone';

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteContent {
  locale: Locale;
  meta: {
    title: string;
    description: string;
  };
  nav: {
    items: NavItem[];
    cta: string;
    menuLabel: string;
    otherLanguage: string; // label of the language toggle, e.g. "EN"
    otherLanguageTitle: string;
  };
  hero: {
    eyebrow: string;
    title: string; // may contain <em> for the highlighted word
    text: string;
    ctaPrimary: string;
    ctaSecondary: string;
    chips: string[];
    photoAlt: string;
  };
  // Banner under the hero announcing the next group start. Dates come from schedule.ts.
  announcement: {
    eyebrow: string;
    title: string; // {date}
    text: string; // {weekdays}, {time}
    trials: string; // {dates}, {time}
    ages: string; // {bands}
    cta: string;
  };
  steps: {
    title: string;
    intro: string;
    items: { icon: IconName; title: string; text: string }[];
  };
  philosophy: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    points: { icon: IconName; title: string; text: string }[];
  };
  features: {
    title: string;
    intro: string;
    items: { icon: IconName; title: string; text: string }[];
  };
  pricing: {
    title: string;
    intro: string;
    course: string;
    details: string[];
    plans: {
      name: string;
      price: string;
      unit: string;
      text: string;
      highlight?: boolean;
      badge?: string;
    }[];
    invoice: string;
    breaks: { title: string; intro: string; holidayNote: string }; // the periods come from schedule.ts
    discounts: { title: string; items: string[] };
    terms: { title: string; items: string[] };
    note: { title: string; text: string };
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    photoAlt: string;
    facts: string[];
  };
  reviews: {
    title: string;
    intro: string;
    source: string;
    items: { name: string; role: string; text: string }[];
    more: string;
    less: string;
  };
  faq: {
    title: string;
    intro: string;
    items: { q: string; a: string }[];
  };
  ctaBand: {
    title: string;
    text: string;
    button: string;
  };
  booking: BookingStrings;
  contact: {
    title: string;
    text: string;
    email: string;
    phoneDisplay: string;
    phoneHref: string;
    whatsappHref: string;
    whatsappLabel: string;
    emailLabel: string;
    phoneLabel: string;
  };
  footer: {
    tagline: string;
    madeWith: string;
    links: NavItem[];
    rights: string;
  };
  mobileCta: string;
}

export interface BookingStrings {
  title: string;
  intro: string;
  steps: [string, string, string];
  loading: string;
  timezone: string;
  noSlotsAll: string;
  seatsFree: string; // "{n} Plätze frei"
  seatFree: string; // "1 Platz frei"
  full: string; // "ausgebucht"
  agesLabel: string; // "{from} bis {to} Jahre"
  ageHint: string; // shown when the child's age is outside the trial's age band; {from} {to}
  summary: string; // "{day}, {date} · {time} · {ages}"
  changeSlot: string;
  form: {
    childName: string;
    childNamePlaceholder: string;
    childAge: string;
    ageUnit: string;
    parentName: string;
    email: string;
    emailHint: string;
    phone: string;
    message: string;
    privacy: string; // HTML with link to the privacy page
    submit: string;
    submitting: string;
    required: string;
  };
  success: {
    title: string;
    text: string; // {email} and {child}
    meet: string;
    calendar: string;
    cancelHint: string;
    another: string;
  };
  errors: {
    generic: string;
    slot_taken: string;
    invalid: string;
    turnstile: string;
    turnstile_failed: string;
    unavailable: string;
  };
  fallback: {
    title: string;
    text: string;
  };
  weekdaysShort: string[]; // Sunday first, like Date.getDay()
  weekdaysLong: string[];
  months: string[];
}

export interface LegalContent {
  imprint: {
    title: string;
    metaDescription: string;
    blocks: { heading?: string; lines: string[] }[];
  };
  privacy: {
    title: string;
    metaDescription: string;
    updated: string;
    note?: string;
    sections: { heading: string; paragraphs: string[] }[]; // paragraphs may contain simple HTML
  };
}
