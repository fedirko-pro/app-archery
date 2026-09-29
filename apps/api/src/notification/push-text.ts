import { NotificationType, NotificationTypes } from '@sokil/shared-types';
import { PUSH_LOCALES, PushLocaleCopy } from './push-locales';

const LOCALE_NORMALIZE: Record<string, string> = { ua: 'uk' };
const DEFAULT_LOCALE = 'pt';

export interface PushContent {
  type: NotificationType | string;
  params?: Record<string, unknown>;
  link?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

function localeCopy(locale?: string | null): PushLocaleCopy {
  const raw = locale ?? DEFAULT_LOCALE;
  const normalised = LOCALE_NORMALIZE[raw] ?? raw;
  return PUSH_LOCALES[normalised] ?? PUSH_LOCALES[DEFAULT_LOCALE];
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replaceAll(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

function stringParam(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  return typeof value === 'string' ? value : '';
}

export function renderPushText(
  locale: string | null | undefined,
  content: PushContent,
): PushPayload {
  const copy = localeCopy(locale);
  const params = { ...(content.params ?? {}) };
  const url = content.link?.startsWith('/') ? content.link : '/notifications';

  if (content.type === NotificationTypes.Announcement) {
    const senderName = stringParam(params, 'senderName');
    const customTitle = stringParam(params, 'title').trim();
    const template = copy.notifications.announcementMessage;
    return {
      title: customTitle || interpolate(template?.title ?? 'Sokil', { senderName }),
      body: stringParam(params, 'message'),
      url,
    };
  }

  const suffix =
    content.type === NotificationTypes.TrainingStreakAtRisk
      ? 'trainingStreakAtRisk'
      : templateSuffix(content.type);
  const template = copy.notifications[suffix];

  const achievementKey = stringParam(params, 'achievementTitleKey');
  if (achievementKey) {
    const id = achievementKey.split('.')[1] ?? '';
    params.achievementName = copy.achievements[id] ?? id;
  }

  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' || typeof value === 'number') {
      vars[key] = String(value);
    }
  }

  return {
    title: interpolate(template?.title ?? 'Sokil', vars) || 'Sokil',
    body: interpolate(template?.body ?? '', vars),
    url,
  };
}

function templateSuffix(type: string): string {
  const known: Record<string, string> = {
    [NotificationTypes.AchievementUnlocked]: 'achievementUnlocked',
    [NotificationTypes.TournamentApplicationApproved]: 'tournamentApplicationApproved',
    [NotificationTypes.TournamentApplicationRejected]: 'tournamentApplicationRejected',
    [NotificationTypes.ClubInvitationReceived]: 'clubInvitationReceived',
    [NotificationTypes.ClubJoinApproved]: 'clubJoinApproved',
    [NotificationTypes.ClubJoinRejected]: 'clubJoinRejected',
    [NotificationTypes.FederationMembershipApproved]: 'federationMembershipApproved',
    [NotificationTypes.FederationMembershipRejected]: 'federationMembershipRejected',
    [NotificationTypes.Announcement]: 'announcementMessage',
    [NotificationTypes.TrainingStreakAtRisk]: 'trainingStreakAtRisk',
  };
  return known[type] ?? '';
}
