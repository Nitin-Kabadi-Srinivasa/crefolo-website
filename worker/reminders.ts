// Daily cron: remind parents (and the teacher) of tomorrow's trial lessons; alert the teacher if Google is unreachable.
import type { AppEnv } from './env';
import { getServices } from './services';
import { bookingInfoFromEvent } from './booking';
import { parentReminder, teacherReminder, teacherAlert } from './emails';
import { addDays, zonedParts, zonedToUtc } from './time';

export async function runReminders(env: AppEnv): Promise<void> {
  const { calendar, mailer, mock } = getServices(env);
  const tz = env.TIMEZONE || 'Europe/Berlin';
  const now = new Date();
  const today = zonedParts(now, tz);
  const t1 = addDays(today.year, today.month, today.day, 1);
  const t2 = addDays(today.year, today.month, today.day, 2);
  const min = zonedToUtc(t1.year, t1.month, t1.day, 0, 0, tz);
  const max = zonedToUtc(t2.year, t2.month, t2.day, 0, 0, tz);

  let events;
  try {
    events = await calendar.listTrialEvents(min, max);
  } catch (e) {
    console.error('reminders: google failed', e);
    if (!mock) {
      try {
        await mailer.send(
          teacherAlert(
            env.TEACHER_EMAIL,
            'Google Calendar connection failed',
            `The daily check could not read your Google Calendar, so online bookings on crefolo.com may be failing.\n\nError: ${String(e)}\n\nPlease check the Google connection (see README, section "Google reconnect").`,
          ),
        );
      } catch (mailErr) {
        console.error('reminders: alert email failed', mailErr);
      }
    }
    return;
  }

  for (const event of events) {
    const props = event.extendedProperties?.private || {};
    if (props.reminderSent === '1') continue;
    const info = await bookingInfoFromEvent(env, event);
    if (!info || !info.parentEmail) continue;
    const results = await Promise.allSettled([mailer.send(parentReminder(info)), mailer.send(teacherReminder(info))]);
    results.forEach((r) => r.status === 'rejected' && console.error('reminder email failed', r.reason));
    if (results[0].status === 'fulfilled') {
      try {
        await calendar.patchPrivateProps(event.id, { reminderSent: '1' });
      } catch (e) {
        console.error('reminders: patch failed', e);
      }
    }
  }
  console.log(`reminders: processed ${events.length} event(s) for ${t1.year}-${t1.month}-${t1.day}`);
}
