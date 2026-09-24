// ============================================================
//  ENGLISH TEXT  –  edit texts, prices and details here
// ============================================================
//  Tips:
//  - Text always sits between single quotes: 'like this'.
//  - Write an apostrophe inside text as \' (e.g. 'That\'s it').
//  - A comma after every entry. Order of lists = order on the page.
// ============================================================

import type { SiteContent } from './types';

const en: SiteContent = {
  locale: 'en',

  meta: {
    title: 'Crefolo – Online English for Kids | Free Trial Lesson',
    description:
      'Playful online English lessons for children aged 5 to 12. Mini groups of max. 3 kids, Cambridge curriculum, real books instead of screen time. Book your free trial lesson now.',
  },

  nav: {
    items: [
      { label: 'How it works', href: '/en#how-it-works' },
      { label: 'Lessons', href: '/en#lessons' },
      { label: 'Prices', href: '/en#prices' },
      { label: 'About me', href: '/en#about' },
      { label: 'Parents', href: '/en#parents' },
      { label: 'FAQ', href: '/en#faq' },
    ],
    cta: 'Book a trial lesson',
    menuLabel: 'Menu',
    otherLanguage: 'DE',
    otherLanguageTitle: 'Zur deutschen Seite wechseln',
  },

  hero: {
    eyebrow: 'Online English for children aged 5 to 12',
    title: 'Learning English becomes an <em>adventure</em>',
    text: 'Online lessons in mini groups of up to 3 children: stories, games, songs and real Cambridge books to hold in your hands. Lots of fun, little screen time.',
    ctaPrimary: 'Book a free trial lesson',
    ctaSecondary: 'Questions? Message me on WhatsApp',
    chips: ['Cambridge certified', 'Max. 3 kids per group', 'Free & non-binding trial class'],
    photoAlt: 'Two children drawing and learning together at a table',
  },

  // The dates themselves live in schedule.ts; {date}, {time} etc. are filled in automatically.
  announcement: {
    eyebrow: 'New mini group',
    title: 'Starting on {date}',
    text: 'Once a week, on {weekdays} at {time}, with at most 3 children.',
    trials: 'Free group trial lessons beforehand: {dates}.',
    slots: 'On each date: {slots}.',
    cta: 'Reserve a trial lesson',
  },

  steps: {
    title: 'As easy as one, two, three',
    intro: 'From the trial lesson to the first real lesson, it is just three small steps.',
    items: [
      {
        icon: 'calendar',
        title: 'Book a trial lesson',
        text: 'Pick a date that suits your child\'s age and tell me a little about your child. The trial lesson is free and comes with no obligation at all.',
      },
      {
        icon: 'video',
        title: 'Meet on Google Meet',
        text: 'In a small trial group of at most 3 children, your child gets to know me and the way I teach. Afterwards I take time for your questions.',
      },
      {
        icon: 'rocket',
        title: 'Off we go!',
        text: 'Your child starts in a fixed mini group, and every week there are 40 to 60 minutes of English with a smile.',
      },
    ],
  },

  philosophy: {
    eyebrow: 'What I believe',
    title: 'Online lessons without being glued to the screen',
    paragraphs: [
      'I firmly believe that young children learn best with books, games, singing, crafts and everything that keeps their hands busy. That is why only the lesson itself happens online. Everything else is offline.',
      'Your child uses the Cambridge materials as a real book at home. Homework, meaning drawing, crafting, singing and small tasks, is done with real materials, not on a laptop.',
    ],
    points: [
      { icon: 'book', title: 'Real books', text: 'Cambridge materials to touch, leaf through and colour in.' },
      { icon: 'palette', title: 'Homework offline', text: 'Drawing, crafting, singing: with paper and pens instead of a tablet.' },
      {
        icon: 'headphones',
        title: 'Listening activities with parents',
        text: 'Audio and video exercises for listening practice go to you as parents only. That way your child uses digital content exclusively under your guidance.',
      },
    ],
  },

  features: {
    title: 'What makes the lessons special',
    intro: 'English should feel like a game to children, with clear structure and plenty of personal attention.',
    items: [
      {
        icon: 'sparkles',
        title: 'Playful & interactive',
        text: 'Stories, games, songs and creative tasks. Reading, speaking, listening and writing: all included, never boring.',
      },
      {
        icon: 'graduation',
        title: 'Cambridge curriculum',
        text: 'Lessons follow the Cambridge curriculum from pre-A1 to A1 (CEFR). A solid foundation, also on the way to the Gymnasium.',
      },
      {
        icon: 'group',
        title: 'Mini groups',
        text: 'A maximum of 3 children per group. Every child speaks often, learns as a team and finds the courage to talk.',
      },
      {
        icon: 'heart',
        title: 'Full attention',
        text: 'I know every child and their pace. After each lesson there are 3 to 10 minutes to talk with you as parents.',
      },
      {
        icon: 'clock',
        title: 'Flexible times',
        text: 'Several groups to choose from: weekday evenings plus Saturday mornings and evenings.',
      },
      {
        icon: 'home',
        title: 'Comfortable at home',
        text: 'No driving, no stress. Open the laptop, and the English lesson can begin.',
      },
    ],
  },

  pricing: {
    title: 'Lessons & prices',
    intro: 'Clear and fair: a fixed monthly fee for groups, one-to-one lessons billed by the lessons held.',
    course: 'English for absolute beginners (CEFR pre-A1 to A1)',
    details: [
      'One lesson per week, also during the school holidays',
      '40 minutes of teaching + 10 minutes of playing English games together + 3 to 10 minutes with the parents',
      'A maximum of 3 children per group',
      'Weekday evenings, Saturday mornings and evenings',
      'All practice materials included. The Cambridge books are bought separately (around 20 to 30 €)',
      'Taught mainly in English, German as support',
      'Eligibility: your child should know the German alphabet and be able to read at least a few simple words in German',
    ],
    plans: [
      {
        name: 'Group lessons',
        price: '€85',
        unit: 'per month',
        text: 'In a mini group of up to 3 children: learn, laugh and find the courage to speak together.',
        highlight: true,
        badge: 'Popular',
      },
      {
        name: 'One-to-one lessons',
        price: '€40',
        unit: 'per lesson',
        text: 'Fully individual, at your child\'s own pace. You only pay for the lessons that take place.',
      },
    ],
    invoice: 'You receive an invoice every month. All prices are final prices.',
    breaks: {
      title: 'Lessons during the holidays',
      intro: 'Lessons continue during the school holidays. Only these days are off:',
      holidayNote: 'If a public holiday falls on the lesson day, you get a replacement date.',
    },
    discounts: {
      title: 'Discounts',
      items: [
        'Siblings: €10 less per month for the second child.',
        'Friends: when a friend\'s family joins, both families get €10 off once.',
      ],
    },
    terms: {
      title: 'Missed lessons & cancellation',
      items: [
        'Groups: if your child is ill, the lesson is credited. Please let me know before the lesson.',
        'If your child misses a lesson, you receive a short summary so they can easily catch up.',
        'One-to-one: lessons cancelled at least 24 hours in advance are rescheduled.',
        'Cancellation with 2 weeks\' notice to the end of a month.',
      ],
    },
    note: {
      title: 'No child left out',
      text: 'If you cannot afford the fees, that is completely fine. Then you simply pay nothing. I firmly believe that every child has a right to education, whatever the circumstances. The only condition: your child wants to learn.',
    },
  },

  about: {
    eyebrow: 'About me',
    title: 'Hello, I\'m Nitin!',
    paragraphs: [
      'I\'m an automotive engineer by profession, but teaching English is something I truly enjoy. So I got Cambridge-certified to teach young learners English online. I\'ve been teaching English for the past five years, with a particular focus on children.',
      'I love teaching kids because every lesson is different. They are curious, energetic and wonderfully creative, which makes it possible to turn learning English into something fun and engaging. I especially enjoy seeing their confidence grow as they start using new words and expressions on their own.',
      'Outside of teaching, I enjoy playing music and riding my bike. I love exploring the countryside around the Neckar and taking longer cycling trips through the Alps whenever I get the chance.',
      'For me, teaching English isn\'t just about learning vocabulary and grammar. It\'s about helping children feel comfortable using English, enjoy the process and gradually become confident communicators.',
      'All my students so far have been very happy and have made remarkable progress. I look forward to meeting your child, too!',
    ],
    photoAlt: 'Nitin, English teacher at Crefolo, smiling at the camera',
    facts: ['Cambridge certified', 'Specialised in children'],
  },

  reviews: {
    title: 'What parents and students say',
    intro: 'Real voices from our Google reviews.',
    source: 'Google review',
    items: [
      {
        name: 'Luba',
        role: 'Mother of a student',
        text: 'Our daughter has been attending English classes with Crefolo since last year, and I can confidently say that the lessons have been both engaging and effective. The teaching methods are well-structured and tailored to her needs, making learning not only productive but also enjoyable. She particularly enjoys the interactive approach, which keeps her motivated and confident in speaking English. As a parent, I appreciate the teacher\'s dedication and personalized feedback, which helps track progress and identify areas for improvement. The communication has always been excellent, and it\'s clear that a lot of thought goes into making the lessons both educational and fun.',
      },
      {
        name: 'Serdal',
        role: 'Father of a student',
        text: 'Nitin has been teaching my eight-year-old son for almost a year. He is good with children and attentive to their learning pace. His modern, motivating exercises really appeal to my son. As parents, we find him very cooperative and communicative.',
      },
      {
        name: 'S. V.',
        role: 'Student',
        text: 'Excellent English teacher, always well prepared, and very responsive to my wishes and requirements. Highly recommended.',
      },
      {
        name: 'Tugba',
        role: 'Student',
        text: 'Excellent English lessons! My grade improved by one level after the lessons!',
      },
    ],
    more: 'Read more',
    less: 'Show less',
  },

  faq: {
    title: 'Frequently asked questions',
    intro: 'Still unsure about something? Just write to me, I am happy to answer.',
    items: [
      {
        q: 'What age are the lessons for?',
        a: 'For children aged 5 to 12 who speak little or no English yet. Lessons start at pre-A1 and lead up to level A1.',
      },
      {
        q: 'Does my child need to know some English already?',
        a: 'No. The courses are made for absolute beginners. We start with the very first words. However, your child should already know the German alphabet and be able to read at least a few simple words in German.',
      },
      {
        q: 'What do we need for the lessons?',
        a: 'A laptop or a PC with a camera and microphone, plus a stable internet connection. Lessons take place on Google Meet. A Google account (Gmail) is handy but not required: with one you join directly, without one you simply click the link and I let you in. The Cambridge books are bought separately (around 20 to 30 €). All other materials such as audio, video, worksheets, photocopiable activities and word cards come from me.',
      },
      {
        q: 'What happens in the trial lesson?',
        a: 'The trial lesson is free with no obligation. It takes place on Google Meet in a small group of at most 3 children, separated by age. The first 30 to 45 minutes belong to the children: we play, sing and speak a little English. After that I explain the practical details and answer your questions. Altogether it takes about an hour. You receive the link by email after booking.',
      },
      {
        q: 'How big are the groups?',
        a: 'A maximum of 3 children. That way every child speaks often, and I can respond to each one individually.',
      },
      {
        q: 'When do lessons take place?',
        a: 'Lessons take place once a week in fixed mini groups, on weekday evenings or on Saturdays. They continue during the school holidays, and only a few days around Christmas and Easter are off. The exact days are listed with the prices. No lessons on Sundays.',
      },
      {
        q: 'Are lessons taught in German or in English?',
        a: 'Mainly in English, so your child practises as much as possible. I speak German at B2 level and use it to help whenever necessary.',
      },
      {
        q: 'How does payment work?',
        a: 'Group lessons cost €85 per month. One-to-one lessons cost €40 per lesson, and you only pay for the lessons that take place. You receive an invoice every month. Siblings and friends get a discount.',
      },
      {
        q: 'What happens if my child misses a lesson?',
        a: 'No problem. You receive a short summary of the missed lesson with the book pages, new words and the song of the lesson. That way your child catches up at home in 10 to 15 minutes. Every lesson also starts with a short review of the last one. In groups, lessons missed due to illness are credited.',
      },
      {
        q: 'Do you also teach children outside Germany?',
        a: 'Yes, I teach children from Germany, Austria and Switzerland. If you live somewhere else and are interested in joining, don\'t hesitate to contact me. All times on this website are German time.',
      },
    ],
  },

  ctaBand: {
    title: 'Ready for the first step?',
    text: 'Book a free, no-obligation trial lesson or simply send me a message. I look forward to it!',
    button: 'Book a free trial lesson',
  },

  booking: {
    title: 'Book a free trial lesson',
    intro: 'The trial lesson takes place on Google Meet in a small group of at most 3 children, separated by age. It takes about an hour and comes with no obligation at all.',
    steps: ['Pick a date', 'Tell me a little', 'Done'],
    loading: 'Loading dates …',
    timezone: 'All times are German time (Europe/Berlin).',
    noSlotsAll: 'No trial lesson is available right now. Send me a short message and I will get back to you with the next date!',
    seatsFree: '{n} places free',
    seatFree: '1 place free',
    full: 'fully booked',
    agesLabel: 'ages {from} to {to}',
    ageHint: 'This date is meant for children aged {from} to {to}. Maybe another date suits better?',
    summary: '{day}, {date} · {time} · {ages}',
    changeSlot: 'Change date',
    form: {
      childName: 'Your child\'s first name',
      childNamePlaceholder: 'e.g. Emma',
      childAge: 'Your child\'s age',
      ageUnit: 'years',
      parentName: 'Your name',
      email: 'Your email address',
      emailHint: 'Any email address works. Tip: with a Gmail address the appointment lands in your Google Calendar and you join the Google Meet without waiting to be let in.',
      phone: 'Your phone number (optional)',
      message: 'Anything else you would like to tell me? (optional)',
      privacy:
        'I have read the <a href="/en/privacy">privacy policy</a> and agree that my details are used to organise the trial lesson.',
      submit: 'Book the trial lesson now',
      submitting: 'Booking …',
      required: 'Required',
    },
    success: {
      title: 'Hooray, the trial lesson is booked!',
      text: 'A confirmation with all details and the Google Meet link is on its way to {email}. I look forward to meeting {child}!',
      meet: 'Google Meet link',
      calendar: 'Add to calendar',
      cancelHint: 'Something came up? You will find a cancellation link in the email.',
      another: 'Book another trial lesson',
    },
    errors: {
      generic: 'That did not work, sorry. Please try again or write to me directly.',
      slot_taken: 'Oh, this trial lesson just filled up. Please choose another date.',
      invalid: 'Please check your details.',
      turnstile: 'The security check has not finished yet. Please wait a moment and click again.',
      turnstile_failed: 'The spam protection could not be loaded. Please reload the page. If it happens again, just message me on WhatsApp or by email.',
      unavailable: 'Online booking is not available right now. Just message me on WhatsApp or by email, I will get back to you quickly.',
    },
    fallback: {
      title: 'Prefer a personal message?',
      text: 'Just write to me on WhatsApp or by email, we will find a time together.',
    },
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },

  contact: {
    title: 'Contact',
    text: 'You can reach me by email, phone or WhatsApp.',
    email: 'info@crefolo.com',
    phoneDisplay: '+49 162 890 4641',
    phoneHref: 'tel:+491628904641',
    whatsappHref:
      'https://wa.me/491628904641?text=' +
      encodeURIComponent('Hello Nitin, I am interested in a trial lesson for my child.'),
    whatsappLabel: 'WhatsApp',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
  },

  footer: {
    tagline: 'The joy of learning English',
    madeWith: 'Made with ♥ in Weinsberg, Germany',
    links: [
      { label: 'Imprint', href: '/en/imprint' },
      { label: 'Privacy', href: '/en/privacy' },
    ],
    rights: '© 2022–2026 Crefolo® · All rights reserved',
  },

  mobileCta: 'Free trial lesson',
};

export default en;
