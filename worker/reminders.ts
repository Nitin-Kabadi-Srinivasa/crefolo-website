// Daily cron: remind parents (and the teacher, once per trial lesson) of tomorrow's trial lessons;
// alert the teacher if Google is unreachable.
import { type AppEnv, timeZoneOf } from './env';
import { getServices } from './services';
import { bookingInfoFromEvent } from './booking';
import { parentReminder, teacherReminder, teacherAlert, type BookingInfo } from './emails';
import { addDays, zonedParts, zonedToUtc } from './time';

export async function runReminders(env: AppEnv): Promise<void> {
  const { calendar, mailer, mock } = getServices(env);
  const tz = timeZoneOf(env);
  const now = new Date();
  const today = zonedParts(now, tz);
  const t1 = addDays(today.year, today.month, today.day, 1);
  const t2 = addDays(today.year, today.month, today.day, 2);
  const min = zonedToUtc(t1.year, t1.month, t1.day, 0, 0, tz);
  const max = zonedToUtc(t2.year, t2.month, t2.day, 0, 0, tz);

  let events;
  try {
    events = await calendar.listEvents('trial', min, max);
  } catch (e) {
    console.error('reminders: google failed', e);
    if (!mock) {
      try {
        await mailer.send(
          teacherAlert(
            env.TEACHER_EMAIL,
            'Google Calendar connection failed',
            `The daily check could not read your Google Calendar, so online bookings on crefolo.com may be failing.\n\nError: ${String(e)}\n\nPlease check the Google connection (see SETUP.md, section "Google reconnect").`,
          ),
        );
      } catch (mailErr) {
        console.error('reminders: alert email failed', mailErr);
      }
    }
    return;
  }

  // Group the children by lesson start, so the teacher gets one reminder per trial lesson
  const byStart = new Map<number, BookingInfo[]>();
  for (const event of events) {
    const props = event.extendedProperties?.private || {};
    if (props.reminderSent === '1') continue;
    const info = await bookingInfoFromEvent(env, event);
    if (!info || !info.parentEmail) continue;

    try {
      await mailer.send(parentReminder(info));
      await calendar.patchEvent(event.id, { privateProps: { reminderSent: '1' } });
    } catch (e) {
      console.error('reminders: parent reminder failed', e);
    }
    const key = info.start.getTime();
    byStart.set(key, [...(byStart.get(key) || []), info]);
  }

  for (const list of byStart.values()) {
    try {
      await mailer.send(teacherReminder(list));
    } catch (e) {
      console.error('reminders: teacher reminder failed', e);
    }
  }
  console.log(`reminders: ${events.length} booking(s) in ${byStart.size} lesson(s) for ${t1.year}-${t1.month}-${t1.day}`);
}
