// ============================================================
//  DEUTSCHE TEXTE  –  hier ändern Sie Texte, Preise und Details
// ============================================================
//  Tipps:
//  - Text steht immer zwischen einfachen Anführungszeichen: 'so'.
//  - Ein Apostroph im Text bitte als \' schreiben (z. B. 'So geht\'s').
//  - Nach jedem Eintrag ein Komma. Reihenfolge der Listen = Reihenfolge auf der Seite.
// ============================================================

import type { SiteContent } from './types';

const de: SiteContent = {
  locale: 'de',

  meta: {
    title: 'Crefolo – Englisch für Kinder online | Kostenlose Probestunde',
    description:
      'Spielerischer Online-Englischunterricht für Kinder von 5 bis 10 Jahren. Mini-Gruppen mit maximal 3 Kindern, Cambridge-Lehrplan, echte Bücher statt Bildschirmzeit. Jetzt kostenlose Probestunde buchen.',
  },

  nav: {
    items: [
      { label: 'So funktioniert\'s', href: '/#so-gehts' },
      { label: 'Unterricht', href: '/#unterricht' },
      { label: 'Preise', href: '/#preise' },
      { label: 'Über mich', href: '/#ueber-mich' },
      { label: 'Eltern', href: '/#eltern' },
      { label: 'FAQ', href: '/#faq' },
    ],
    cta: 'Probestunde buchen',
    menuLabel: 'Menü',
    otherLanguage: 'EN',
    otherLanguageTitle: 'Switch to English',
  },

  hero: {
    eyebrow: 'Online-Englisch für Kinder von 5 bis 10 Jahren',
    title: 'Englisch lernen wird zum <em>Abenteuer</em>',
    text: 'Online-Unterricht in Mini-Gruppen mit maximal 3 Kindern – mit Geschichten, Spielen, Liedern und echten Cambridge-Büchern zum Anfassen. Viel Spaß, wenig Bildschirmzeit.',
    ctaPrimary: 'Kostenlose Probestunde buchen',
    ctaSecondary: 'Fragen? Auf WhatsApp schreiben',
    chips: ['Cambridge-zertifiziert', 'Max. 3 Kinder pro Gruppe', 'Kostenlos & unverbindlich'],
    bubble: 'Hello!',
    photoAlt: 'Zwei Kinder malen und lernen gemeinsam an einem Tisch',
  },

  steps: {
    title: 'So einfach geht\'s',
    intro: 'Von der Probestunde bis zur ersten richtigen Unterrichtsstunde sind es nur drei kleine Schritte.',
    items: [
      {
        icon: 'calendar',
        title: 'Probestunde buchen',
        text: 'Tag und Uhrzeit wählen, kurz Ihr Kind vorstellen – fertig. Die Probestunde ist kostenlos und völlig unverbindlich.',
      },
      {
        icon: 'video',
        title: 'Kennenlernen per Google Meet',
        text: 'In 60 Minuten lernt Ihr Kind mich und meine Art zu unterrichten kennen. Wir spielen, sprechen ein bisschen Englisch, und Sie stellen alle Ihre Fragen.',
      },
      {
        icon: 'rocket',
        title: 'Loslegen!',
        text: 'Sie wählen eine feste Gruppe, die Cambridge-Materialien kommen zu Ihnen nach Hause – und jede Woche gibt es 40 Minuten Englisch mit Freude.',
      },
    ],
  },

  philosophy: {
    eyebrow: 'Meine Überzeugung',
    title: 'Online-Unterricht – aber nicht am Bildschirm kleben',
    paragraphs: [
      'Kleine Kinder lernen am besten mit Büchern, Spielen, Singen, Basteln und allem, was die Hände beschäftigt. Deshalb ist bei mir nur der Unterricht selbst online. Alles andere passiert offline.',
      'Ihr Kind bekommt die Cambridge-Materialien als echtes Buch nach Hause. Die Hausaufgaben – Malen, Basteln, Singen und kleine Aufgaben – werden mit echten Materialien gemacht, nicht am Laptop.',
      'Audio- und Videoübungen zum Hörverständnis bekommen nur Sie als Eltern. So nutzt Ihr Kind digitale Inhalte ausschließlich unter Ihrer Anleitung.',
    ],
    points: [
      { icon: 'book', title: 'Echte Bücher', text: 'Cambridge-Materialien zum Anfassen, Blättern und Reinmalen.' },
      { icon: 'palette', title: 'Hausaufgaben offline', text: 'Malen, Basteln, Singen – mit Papier und Stiften statt Tablet.' },
      { icon: 'headphones', title: 'Hörübungen mit Ihnen', text: 'Audio und Video gibt es nur für Eltern, zum gemeinsamen Üben.' },
    ],
  },

  features: {
    title: 'Was den Unterricht besonders macht',
    intro: 'Englisch soll sich für Kinder wie ein Spiel anfühlen – mit klarer Struktur und viel persönlicher Aufmerksamkeit.',
    items: [
      {
        icon: 'sparkles',
        title: 'Spielerisch & interaktiv',
        text: 'Geschichten, Spiele, Lieder und kreative Aufgaben. Lesen, Sprechen, Hören und Schreiben – alles dabei, nichts langweilig.',
      },
      {
        icon: 'graduation',
        title: 'Cambridge-Lehrplan',
        text: 'Unterricht nach dem Cambridge-Lehrplan von der Vorstufe A1 bis A1 (GER). Eine sichere Basis – auch für den Weg aufs Gymnasium.',
      },
      {
        icon: 'group',
        title: 'Mini-Gruppen',
        text: 'Maximal 3 Kinder pro Gruppe. Jedes Kind kommt oft zu Wort, lernt im Team und traut sich zu sprechen.',
      },
      {
        icon: 'heart',
        title: 'Volle Aufmerksamkeit',
        text: 'Ich kenne jedes Kind und sein Tempo. Nach jeder Stunde gibt es 3 bis 10 Minuten Austausch mit Ihnen als Eltern.',
      },
      {
        icon: 'clock',
        title: 'Flexible Termine',
        text: 'Mehrere Gruppen zur Auswahl: abends unter der Woche sowie samstags vormittags und abends. Sonntags ist frei.',
      },
      {
        icon: 'home',
        title: 'Bequem von zu Hause',
        text: 'Keine Fahrtzeiten, kein Stress. Laptop oder Tablet aufklappen, und die Englischstunde kann beginnen.',
      },
    ],
  },

  pricing: {
    title: 'Unterricht & Preise',
    intro: 'Klar und einfach: ein Preis pro Unterrichtsstunde, alle Materialien inklusive.',
    course: 'Englisch für absolute Anfänger (GER Vorstufe A1 bis A1)',
    details: [
      'Eine Unterrichtsstunde pro Woche',
      '40 Minuten Unterricht + 3 bis 10 Minuten Gespräch mit den Eltern',
      'Maximal 3 Kinder pro Gruppe',
      'Termine abends unter der Woche, samstags vormittags und abends',
      'Alle Übungsmaterialien inklusive',
      'Unterricht hauptsächlich auf Englisch, Deutsch zur Unterstützung',
    ],
    plans: [
      {
        name: 'Gruppenunterricht',
        price: '22 €',
        unit: 'pro Unterrichtsstunde',
        text: 'In der Mini-Gruppe mit maximal 3 Kindern – lernen, lachen und gemeinsam mutig sprechen.',
        highlight: true,
        badge: 'Beliebt',
      },
      {
        name: 'Einzelunterricht',
        price: '30 €',
        unit: 'pro Unterrichtsstunde',
        text: 'Ganz individuell im eigenen Tempo – ideal, wenn Ihr Kind lieber allein lernt.',
      },
    ],
    invoice: 'Sie erhalten jeden Monat eine Rechnung. Alle Preise sind Endpreise.',
    note: {
      title: 'Kein Kind bleibt außen vor',
      text: 'Wenn Sie sich die Gebühren nicht leisten können, ist das völlig in Ordnung – dann zahlen Sie einfach nichts. Ich bin überzeugt, dass jedes Kind ein Recht auf Bildung hat, unabhängig von den Umständen. Die einzige Bedingung: Ihr Kind hat Lust zu lernen.',
    },
  },

  about: {
    eyebrow: 'Über mich',
    title: 'Hallo, ich bin Nitin!',
    paragraphs: [
      'Ich bin Cambridge-zertifizierter Englischlehrer und habe mich auf den Online-Unterricht für Kinder spezialisiert. Kinder aus Deutschland, Österreich und der Schweiz lernen bei mir Englisch – von den allerersten Wörtern bis zum Niveau A1.',
      'Der Unterricht findet hauptsächlich auf Englisch statt, damit Ihr Kind so viel wie möglich übt. Wenn es nötig ist, helfe ich auf Deutsch weiter.',
      'Alle meine Schülerinnen und Schüler waren bisher sehr zufrieden und haben bemerkenswerte Fortschritte gemacht. Ich freue mich darauf, auch Ihr Kind kennenzulernen!',
    ],
    photoAlt: 'Nitin, Englischlehrer bei Crefolo, lächelt in die Kamera',
    facts: ['Cambridge-zertifiziert', 'Spezialisiert auf Kinder', 'Unterricht auf Englisch, Hilfe auf Deutsch'],
  },

  reviews: {
    title: 'Das sagen Eltern und Schüler',
    intro: 'Echte Stimmen aus den Google-Rezensionen.',
    source: 'Google-Rezension',
    items: [
      {
        name: 'Luba',
        role: 'Mutter einer Schülerin',
        text: 'Unsere Tochter besucht seit letztem Jahr den Englischunterricht bei Crefolo, und ich kann mit voller Überzeugung sagen, dass der Unterricht sowohl anregend als auch effektiv ist. Die Lehrmethoden sind gut strukturiert und auf ihre Bedürfnisse abgestimmt, sodass das Lernen nicht nur produktiv, sondern auch vergnüglich ist. Besonders gefällt ihr der interaktive Ansatz, der sie motiviert und ihr Selbstvertrauen beim Englischsprechen stärkt. Als Mutter schätze ich das Engagement des Lehrers und sein persönliches Feedback, das hilft, Fortschritte zu verfolgen und Verbesserungsmöglichkeiten zu erkennen. Die Kommunikation war immer ausgezeichnet, und man merkt, dass viel Gedanken darin stecken, den Unterricht lehrreich und zugleich unterhaltsam zu gestalten.',
      },
      {
        name: 'Serdal',
        role: 'Vater eines Schülers',
        text: 'Nitin unterrichtet seit knapp einem Jahr meinen achtjährigen Sohn. Er kann mit Kindern gut umgehen und achtet auf deren Lerntempo. Seine modernen, motivierenden Übungstechniken begeistern meinen Sohn. Als Eltern finden wir ihn sehr kooperativ und kommunikativ.',
      },
      {
        name: 'S. V.',
        role: 'Schülerin',
        text: 'Top Englischlehrer, immer gut vorbereitet, und er ist auch sehr gut auf meine Wünsche und Anforderungen eingegangen. Nur zu empfehlen.',
      },
      {
        name: 'Tugba',
        role: 'Schülerin',
        text: 'Sehr guter Englischunterricht! Meine Zeugnisnote hat sich nach dem Unterricht um eine Note verbessert!',
      },
    ],
    more: 'Mehr lesen',
    less: 'Weniger anzeigen',
  },

  faq: {
    title: 'Häufige Fragen',
    intro: 'Noch etwas unklar? Schreiben Sie mir einfach – ich antworte gern.',
    items: [
      {
        q: 'Für welches Alter ist der Unterricht gedacht?',
        a: 'Für Kinder von 5 bis 10 Jahren, die noch kein oder kaum Englisch können. Der Unterricht beginnt bei der Vorstufe A1 und führt bis zum Niveau A1.',
      },
      {
        q: 'Muss mein Kind schon Englisch können?',
        a: 'Nein. Die Kurse sind für absolute Anfänger gemacht. Wir starten bei den allerersten Wörtern.',
      },
      {
        q: 'Was brauchen wir für den Unterricht?',
        a: 'Einen Laptop, PC oder ein Tablet mit Kamera und Mikrofon sowie eine stabile Internetverbindung. Der Unterricht findet über Google Meet statt – das läuft im Browser, ohne Installation. Die Bücher und Materialien bekommen Sie von mir.',
      },
      {
        q: 'Wie läuft die Probestunde ab?',
        a: 'Die Probestunde dauert 60 Minuten, findet per Google Meet statt und ist kostenlos und unverbindlich. Ihr Kind lernt mich kennen, wir spielen und sprechen ein bisschen Englisch, und Sie können alle Fragen stellen. Den Link erhalten Sie nach der Buchung per E-Mail.',
      },
      {
        q: 'Wie groß sind die Gruppen?',
        a: 'Maximal 3 Kinder. So kommt jedes Kind oft zu Wort, und ich kann auf jedes einzeln eingehen.',
      },
      {
        q: 'Wann findet der Unterricht statt?',
        a: 'Unter der Woche abends sowie samstags vormittags und abends. Es gibt mehrere Gruppen, sodass Sie eine passende Zeit finden. Sonntags ist frei.',
      },
      {
        q: 'Wird auf Deutsch oder auf Englisch unterrichtet?',
        a: 'Hauptsächlich auf Englisch, damit Ihr Kind möglichst viel übt. Ich spreche Deutsch auf B2-Niveau und helfe damit, wenn es nötig ist.',
      },
      {
        q: 'Wie funktioniert die Bezahlung?',
        a: 'Sie erhalten jeden Monat eine Rechnung. Die Preise verstehen sich pro Unterrichtsstunde und enthalten alle Materialien.',
      },
      {
        q: 'Unterrichten Sie auch Kinder außerhalb Deutschlands?',
        a: 'Ja, ich unterrichte Kinder aus Deutschland, Österreich und der Schweiz. Alle Zeiten auf der Website sind in deutscher Zeit angegeben.',
      },
    ],
  },

  ctaBand: {
    title: 'Bereit für den ersten Schritt?',
    text: 'Buchen Sie eine kostenlose, unverbindliche Probestunde – oder schreiben Sie mir einfach eine Nachricht. Ich freue mich darauf!',
    button: 'Kostenlose Probestunde buchen',
  },

  booking: {
    title: 'Kostenlose Probestunde buchen',
    intro: 'Wählen Sie einen Tag und eine Uhrzeit. Die Probestunde dauert 60 Minuten, findet per Google Meet statt und ist völlig unverbindlich.',
    steps: ['Tag wählen', 'Uhrzeit wählen', 'Kurz vorstellen'],
    loading: 'Freie Termine werden geladen …',
    timezone: 'Alle Zeiten in deutscher Zeit (Europe/Berlin).',
    noSlotsDay: 'An diesem Tag ist leider schon alles belegt.',
    noSlotsAll: 'Gerade sind alle Termine der nächsten vier Wochen belegt. Schreiben Sie mir kurz – wir finden einen Termin!',
    free: '{n} frei',
    taken: 'belegt',
    summary: '{day}, {date} · {time} Uhr',
    changeSlot: 'Termin ändern',
    form: {
      childName: 'Vorname Ihres Kindes',
      childNamePlaceholder: 'z. B. Emma',
      childAge: 'Alter Ihres Kindes',
      ageUnit: 'Jahre',
      parentName: 'Ihr Name (optional)',
      email: 'Ihre E-Mail-Adresse',
      phone: 'Ihre Telefonnummer',
      message: 'Möchten Sie mir noch etwas mitteilen? (optional)',
      privacy:
        'Ich habe die <a href="/datenschutz">Datenschutzhinweise</a> gelesen und bin einverstanden, dass meine Angaben zur Organisation der Probestunde verwendet werden.',
      submit: 'Probestunde jetzt buchen',
      submitting: 'Wird gebucht …',
      required: 'Pflichtfeld',
    },
    success: {
      title: 'Juhu, die Probestunde ist gebucht!',
      text: 'Eine Bestätigung mit allen Details und dem Google-Meet-Link ist unterwegs an {email}. Ich freue mich auf {child}!',
      meet: 'Google-Meet-Link',
      calendar: 'In den Kalender eintragen',
      cancelHint: 'Etwas dazwischengekommen? In der E-Mail finden Sie einen Link zum Absagen.',
      another: 'Weitere Probestunde buchen',
    },
    errors: {
      generic: 'Das hat leider nicht geklappt. Bitte versuchen Sie es noch einmal oder schreiben Sie mir direkt.',
      slot_taken: 'Oh, dieser Termin wurde gerade vergeben. Bitte wählen Sie einen anderen.',
      invalid: 'Bitte prüfen Sie Ihre Angaben.',
      turnstile: 'Bitte bestätigen Sie kurz, dass Sie kein Roboter sind.',
      unavailable: 'Die Online-Buchung ist gerade nicht erreichbar. Schreiben Sie mir einfach per WhatsApp oder E-Mail – ich melde mich schnell.',
    },
    fallback: {
      title: 'Lieber persönlich?',
      text: 'Schreiben Sie mir einfach auf WhatsApp oder per E-Mail – wir finden gemeinsam einen Termin.',
    },
    weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    weekdaysLong: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  },

  contact: {
    title: 'Kontakt',
    text: 'Sie erreichen mich per E-Mail, Telefon oder WhatsApp.',
    email: 'info@crefolo.com',
    phoneDisplay: '+49 162 890 4641',
    phoneHref: 'tel:+491628904641',
    whatsappHref:
      'https://wa.me/491628904641?text=' +
      encodeURIComponent('Hallo Nitin, ich interessiere mich für eine Probestunde für mein Kind.'),
    whatsappLabel: 'WhatsApp',
    emailLabel: 'E-Mail',
    phoneLabel: 'Telefon',
  },

  footer: {
    tagline: 'Freude am Englischlernen',
    madeWith: 'Mit ♥ gemacht in Weinsberg',
    links: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
    ],
    rights: '© 2022–2026 Crefolo® · Alle Rechte vorbehalten',
  },

  mobileCta: 'Kostenlose Probestunde',
};

export default de;
