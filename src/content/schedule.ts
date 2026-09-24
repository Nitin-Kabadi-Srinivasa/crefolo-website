// ============================================================
//  TERMINE  –  Probestunden, Kursstart und unterrichtsfreie Zeiten
// ============================================================
//  - Datum immer als 'JJJJ-MM-TT', Uhrzeit als 'HH:MM' (deutsche Zeit).
//  - Probestunden: ein Eintrag pro Termin. 'ages' ist die Altersgruppe, z. B. [5, 7].
//  - Vergangene Termine werden automatisch ausgeblendet.
//  - Nach dem Ändern veröffentlichen, wie in HOW-TO-edit-website.md beschrieben.
// ============================================================

export interface TrialSession {
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM', German time
  ages: [number, number]; // age band, e.g. [5, 7]
}

export interface ClassBreak {
  name: { de: string; en: string };
  from: string; // first day without classes, 'YYYY-MM-DD'
  to: string; // last day without classes, 'YYYY-MM-DD'
}

export interface Schedule {
  trialCapacity: number; // children per trial lesson
  trialMinutes: number; // length of a trial lesson in minutes
  trials: TrialSession[];
  nextGroup: { date: string; time: string } | null; // announced on the home page; null = no announcement
  breaks: ClassBreak[];
}

export const schedule: Schedule = {
  // Kostenlose Gruppen-Probestunden
  trialCapacity: 3,
  trialMinutes: 60,
  trials: [
    { date: '2026-10-02', time: '17:00', ages: [5, 7] },
    { date: '2026-10-02', time: '18:00', ages: [8, 12] },
    { date: '2026-10-09', time: '17:00', ages: [5, 7] },
    { date: '2026-10-09', time: '18:00', ages: [8, 12] },
    { date: '2026-10-16', time: '17:00', ages: [5, 7] },
    { date: '2026-10-16', time: '18:00', ages: [8, 12] },
    { date: '2026-10-23', time: '17:00', ages: [5, 7] },
    { date: '2026-10-23', time: '18:00', ages: [8, 12] },
    { date: '2026-10-30', time: '17:00', ages: [5, 7] },
    { date: '2026-10-30', time: '18:00', ages: [8, 12] },
  ],

  // Start der nächsten neuen Gruppe (Ankündigung auf der Startseite)
  nextGroup: { date: '2026-11-06', time: '17:00' },

  // Unterrichtsfreie Tage (in den Schulferien läuft der Unterricht sonst weiter).
  // Für einen einzelnen Tag bei 'from' und 'to' dasselbe Datum eintragen.
  breaks: [
    { name: { de: 'Heiligabend', en: 'Christmas Eve' }, from: '2026-12-24', to: '2026-12-24' },
    { name: { de: 'Silvester', en: 'New Year\'s Eve' }, from: '2026-12-31', to: '2026-12-31' },
    { name: { de: 'Gründonnerstag', en: 'Maundy Thursday' }, from: '2027-03-25', to: '2027-03-25' },
  ],
};
