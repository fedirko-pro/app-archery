import { IMPORTANT_NOTIFICATION_TYPES, NotificationTypes } from '@sokil/shared-types';
import { PUSH_LOCALES } from './push-locales';
import { renderPushText } from './push-text';

describe('renderPushText', () => {
  it('renders the dormant streak reminder with the number of days', () => {
    const payload = renderPushText('en', {
      type: NotificationTypes.TrainingStreakReminder,
      params: { days: 6 },
      link: '/trainings',
    });
    expect(payload.title).toBe('Time to train');
    expect(payload.body).toContain('6 days');
    expect(payload.url).toBe('/trainings');
  });

  it('renders the streak reminder in every locale without leftover placeholders', () => {
    for (const locale of Object.keys(PUSH_LOCALES)) {
      const payload = renderPushText(locale, {
        type: NotificationTypes.TrainingStreakReminder,
        params: { days: 7 },
      });
      expect(payload.title).not.toBe('Sokil');
      expect(payload.body).toContain('7');
      expect(payload.body).not.toContain('{{');
    }
  });

  it('has a push template in every locale for every important notification type', () => {
    const suffixes = new Set<string>();
    for (const type of IMPORTANT_NOTIFICATION_TYPES) {
      const payload = renderPushText('en', {
        type,
        params: { message: 'hi', senderName: 'x' },
      });
      expect(payload.title.length + payload.body.length).toBeGreaterThan(0);
      if (type !== NotificationTypes.Announcement) {
        expect(payload.title).not.toBe('Sokil');
        expect(payload.body).not.toBe('');
      }
      suffixes.add(type);
    }
    expect(suffixes.size).toBe(IMPORTANT_NOTIFICATION_TYPES.length);
    for (const [locale, copy] of Object.entries(PUSH_LOCALES)) {
      expect(Object.keys(copy.notifications).length).toBeGreaterThanOrEqual(
        Object.keys(PUSH_LOCALES.en.notifications).length,
      );
      expect(locale).toBeTruthy();
    }
  });
});
