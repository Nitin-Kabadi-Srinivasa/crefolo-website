import { type AppEnv, isMock } from './env';
import { realCalendar, type CalendarService } from './google';
import { graphMailer, type Mailer } from './graph';
import { mockCalendar, mockMailer } from './mock';

export interface Services {
  calendar: CalendarService;
  mailer: Mailer;
  mock: boolean;
}

export function getServices(env: AppEnv): Services {
  if (isMock(env)) return { calendar: mockCalendar(), mailer: mockMailer(), mock: true };
  return { calendar: realCalendar(env), mailer: graphMailer(env), mock: false };
}
