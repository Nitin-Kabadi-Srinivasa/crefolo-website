// Impressum und Datenschutzhinweise (Deutsch).
// Absätze dürfen einfaches HTML enthalten (<a>, <strong>, <br>).

import type { LegalContent } from './types';

const legalDe: LegalContent = {
  imprint: {
    title: 'Impressum',
    metaDescription: 'Impressum von Crefolo – Online-Englischunterricht für Kinder.',
    blocks: [
      {
        lines: ['Crefolo', 'Stadtseestraße 25', '74189 Weinsberg'],
      },
      {
        lines: ['Besteuerung als Kleinunternehmer gemäß §19 UStG', 'Umsatzsteuernummer: DE357055821'],
      },
      {
        heading: 'Kontakt',
        lines: ['E-Mail: <a href="mailto:info@crefolo.com">info@crefolo.com</a>', 'Tel.: <a href="tel:+491628904641">+49 162 890 4641</a>'],
      },
      {
        heading: 'Bildrechte',
        lines: ['klimkin © pixabay.com'],
      },
    ],
  },

  privacy: {
    title: 'Datenschutzhinweise',
    metaDescription: 'Datenschutzhinweise von Crefolo – Online-Englischunterricht für Kinder.',
    updated: 'Stand der Datenschutzhinweise: 13.09.2026',
    sections: [
      {
        heading: '1. Information über die Erhebung personenbezogener Daten',
        paragraphs: [
          '1.1 Im Folgenden informieren wir über die Erhebung personenbezogener Daten bei Nutzung unserer Website im Zusammenhang mit der Teilnahme an Online-Nachhilfeunterricht durch die Crefolo. Personenbezogene Daten sind alle Daten, die auf Sie persönlich beziehbar sind, zum Beispiel Name, Adresse, E-Mail-Adressen und Bestellinformationen.',
          '1.2 Verantwortlich für die nachfolgend dargestellte Datenerhebung und -verarbeitung ist die Crefolo, Keilstraße 17/1, 74080 Heilbronn, Telefonnummer 0162 890 4641, E-Mail <a href="mailto:info@crefolo.com">info@crefolo.com</a>. Anlaufstelle für Kundenanliegen ist Nitin.',
          'Einen möglichen Widerspruch können Betroffene darüber hinaus an <a href="mailto:info@crefolo.com">info@crefolo.com</a> richten.',
          '1.3 Bei Ihrer Kontaktaufnahme mit uns per E-Mail, WhatsApp oder über das Buchungsformular werden die von Ihnen mitgeteilten Daten (Ihre E-Mail-Adresse, ggf. Ihr Name und Ihre Telefonnummer) von uns gespeichert, um Ihre Fragen zu beantworten. Wie auch sonst löschen wir die in diesem Zusammenhang anfallenden Daten, nachdem die Speicherung nicht mehr erforderlich ist, oder schränken die Verarbeitung ein, falls gesetzliche Aufbewahrungspflichten bestehen.',
        ],
      },
      {
        heading: '2. Erhebung personenbezogener Daten bei der Buchung einer Probestunde',
        paragraphs: [
          '2.1 Wenn Sie über unsere Website eine Probestunde buchen, erheben wir folgende zur Vertragserfüllung und für vorvertragliche Maßnahmen erforderliche Daten (Rechtsgrundlage ist Artikel 6 Abs. 1 S. 1 lit. b DSGVO):',
          'Vorname und Alter Ihres Kindes<br>Ihr Name (freiwillige Angabe)<br>Kontaktdaten wie E-Mail-Adresse und Telefonnummer<br>Gewählter Termin sowie Datum und Uhrzeit der Buchung<br>Ihre freiwillige Nachricht an uns',
          '2.2 Zweck dieser Datenerhebung ist es, die Probestunde zu organisieren, Ihnen die Bestätigung mit dem Zugangslink zuzusenden, Sie an den Termin zu erinnern und Ihnen weitere vertragsrelevante Informationen zum Online-Nachhilfeunterricht zukommen zu lassen.',
          '2.3 Zur Organisation der Probestunde wird ein Termin in unserem Google-Kalender angelegt und ein Google-Meet-Link für die Videoverbindung erzeugt. Dabei werden der Vorname und das Alter Ihres Kindes sowie Ihre Kontaktdaten an Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland, übermittelt. Google kann Daten auch in den USA verarbeiten; Google ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://policies.google.com/privacy" rel="noopener" target="_blank">https://policies.google.com/privacy</a>.',
          '2.4 Die Bestätigungs-, Erinnerungs- und Absage-E-Mails versenden wir über unser E-Mail-Postfach bei Microsoft 365 (Microsoft Ireland Operations Ltd., One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Irland). Weitere Informationen: <a href="https://privacy.microsoft.com/de-de/privacystatement" rel="noopener" target="_blank">https://privacy.microsoft.com/de-de/privacystatement</a>.',
          '2.5 Bei der bloß informatorischen Nutzung unserer Website erheben wir nur die personenbezogenen Daten, die Ihr Browser an unseren Server übermittelt (siehe Ziffer 3).',
        ],
      },
      {
        heading: '3. Hosting, Bot-Schutz und Cookies',
        paragraphs: [
          '3.1 Unsere Website wird bei Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA, gehostet (Cloudflare Germany GmbH, Rosental 7, 80331 München, als Vertretung in der EU). Beim Aufruf der Website verarbeitet Cloudflare technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Browsertyp und Betriebssystem, um die Website auszuliefern und vor Angriffen zu schützen. Rechtsgrundlage ist Artikel 6 Abs. 1 S. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und schnellen Betrieb der Website). Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener" target="_blank">https://www.cloudflare.com/privacypolicy/</a>.',
          '3.2 Zum Schutz des Buchungsformulars vor automatisierten Anfragen (Spam) verwenden wir Cloudflare Turnstile. Turnstile prüft anhand technischer Merkmale des Browsers, ob eine Anfrage von einem Menschen stammt, und kann dazu ein technisch notwendiges Cookie setzen. Es werden keine Nutzungsprofile erstellt. Rechtsgrundlage ist Artikel 6 Abs. 1 S. 1 lit. f DSGVO.',
          '3.3 Unsere Website verwendet keine Analyse-, Tracking- oder Marketing-Cookies und keine Web-Analyse-Dienste.',
        ],
      },
      {
        heading: '4. Erhebung personenbezogener Daten bei E-Mail- oder WhatsApp-Kontakt',
        paragraphs: [
          'Wenn Sie mit uns in Kontakt treten (zum Beispiel per E-Mail, Telefon oder WhatsApp), speichern wir Ihre Angaben zur Bearbeitung der Anfrage sowie für den Fall, dass Anschlussfragen entstehen. Hierin liegt auch unser berechtigtes Interesse gemäß Artikel 6 Abs. 1 S. 1 lit. f DSGVO. Weitere personenbezogene Daten speichern und nutzen wir nur, wenn Sie dazu einwilligen oder dies ohne besondere Einwilligung gesetzlich zulässig ist.',
          'Bei der Kontaktaufnahme über WhatsApp werden Daten durch WhatsApp Ireland Limited, 4 Grand Canal Square, Dublin 2, Irland, verarbeitet. Die Nutzung von WhatsApp ist freiwillig; Sie können uns jederzeit auch per E-Mail oder Telefon erreichen. Weitere Informationen: <a href="https://www.whatsapp.com/legal/privacy-policy-eea" rel="noopener" target="_blank">https://www.whatsapp.com/legal/privacy-policy-eea</a>.',
        ],
      },
      {
        heading: '5. Weitergabe personenbezogener Daten an Dritte',
        paragraphs: [
          'Ihre persönlichen Daten wie Name, E-Mail und Telefon werden ausschließlich für die Kommunikation mit Ihnen und die Organisation des Unterrichts verwendet.',
          'Wir werden Ihre Daten keinesfalls an Dritte verkaufen und – abgesehen von den in diesen Hinweisen genannten technischen Dienstleistern – nicht weitergeben.',
          'Wir verwenden Ihre Daten keinesfalls für Marketingzwecke.',
          'Darüber hinaus sind wir in bestimmten Fällen gesetzlich verpflichtet, personenbezogene Daten deutschen und internationalen Behörden zur Verfügung zu stellen, Artikel 6 Abs. 1 S. 1 lit. c DSGVO.',
        ],
      },
      {
        heading: '6. Ihre Rechte',
        paragraphs: [
          '6.1 Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:',
          'Recht auf Auskunft zu Kategorien der verarbeiteten Daten, Verarbeitungszwecken, etwaigen Empfängern der Daten, der geplanten Speicherdauer (Artikel 15 DSGVO);<br>Recht auf Berichtigung beziehungsweise Ergänzung unrichtiger oder unvollständiger Daten (Artikel 16 DSGVO);<br>Recht auf jederzeitigen Widerruf der erteilten Einwilligung mit Wirkung für die Zukunft (Artikel 7 Abs. 3 DSGVO);<br>Recht auf Widerspruch gegen die Datenverarbeitung, die aufgrund eines berechtigten Interesses erfolgen soll, aus Gründen, die sich aus Ihrer besonderen Situation ergeben (Artikel 21 Abs. 1 DSGVO);<br>Recht auf Löschung von Daten in bestimmten Fällen (Artikel 17 DSGVO);<br>Recht auf Einschränkung der Verarbeitung, soweit eine Löschung nicht möglich beziehungsweise die Löschpflicht streitig ist (Artikel 18 DSGVO);<br>Recht auf Datenübertragbarkeit (Artikel 20 DSGVO).',
          '6.2 Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren (Artikel 77 Abs. 1 DSGVO). Zuständige Aufsichtsbehörde in datenschutzrechtlichen Fragen ist der Landesdatenschutzbeauftragte des Bundeslandes, in dem unser Unternehmen seinen Sitz hat. Eine Liste der Datenschutzbeauftragten sowie deren Kontaktdaten können folgendem Link entnommen werden: <a href="https://www.bfdi.bund.de/DE/Service/Anschriften/anschriften_table.html" rel="noopener" target="_blank">https://www.bfdi.bund.de</a>',
        ],
      },
      {
        heading: '7. Dauer der Speicherung',
        paragraphs: [
          'Gespeicherte Daten werden, soweit gesetzliche Bestimmungen nicht entgegenstehen, gelöscht, sobald das Vertragsverhältnis beendet und sämtliche im Zusammenhang damit stehenden Angelegenheiten abgewickelt sind. Daten einer Probestunde, auf die kein Unterrichtsverhältnis folgt, löschen wir spätestens sechs Monate nach dem Termin.',
        ],
      },
    ],
  },
};

export default legalDe;
