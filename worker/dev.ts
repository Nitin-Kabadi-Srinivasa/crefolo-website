// Local-only email preview (MOCK=1): /api/dev/email?type=confirm|notify|reminder|teacher-reminder|cancel&lang=de|en
import type { AppEnv } from './env';
import { parentConfirmation, parentReminder, parentCancellation, teacherNotification, teacherReminder, type BookingInfo, type Lang } from './emails';

export function devEmailPreview(url: URL, env: AppEnv): Response {
  const lang: Lang = url.searchParams.get('lang') === 'en' ? 'en' : 'de';
  const type = url.searchParams.get('type') || 'confirm';
  const start = new Date('2026-10-01T15:00:00.000Z');
  const base: BookingInfo = {
    eventId: 'demo',
    start,
    end: new Date(start.getTime() + 60 * 60_000),
    timeZone: 'Europe/Berlin',
    childName: 'Emma',
    childAge: '6',
    parentName: 'Anna Muster',
    parentEmail: 'anna@example.com',
    parentPhone: '+49 170 1234567',
    message: 'Emma freut sich schon sehr!',
    lang,
    ages: '5-7',
    seatsTaken: 2,
    capacity: 3,
    meetLink: 'https://meet.google.com/abc-defg-hij',
    cancelUrl: `${url.origin}/api/cancel?id=demo`,
    icsUrl: `${url.origin}/api/ics?id=demo`,
    eventLink: 'https://calendar.google.com/',
    siteUrl: url.origin,
    teacherName: env.TEACHER_NAME || 'Nitin',
    teacherEmail: env.TEACHER_EMAIL || 'info@crefolo.com',
    teacherPhone: '+49 162 890 4641',
    whatsappUrl: 'https://wa.me/491628904641',
  };
  const second: BookingInfo = { ...base, childName: 'Ben', childAge: '7', parentName: 'Tom Beispiel', parentEmail: 'tom@example.com', parentPhone: '', message: '' };

  const mail =
    type === 'notify'
      ? teacherNotification(base)
      : type === 'reminder'
        ? parentReminder(base)
        : type === 'teacher-reminder'
          ? teacherReminder([base, second])
          : type === 'cancel'
            ? parentCancellation(base)
            : parentConfirmation(base, '');
  return new Response(mail.html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
