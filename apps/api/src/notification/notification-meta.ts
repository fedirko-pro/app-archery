import {
  NotificationType,
  NotificationTypes,
  isImportantNotificationType,
} from '@sokil/shared-types';

const TYPE_I18N_SUFFIX: Record<NotificationType, string> = {
  [NotificationTypes.AchievementUnlocked]: 'achievementUnlocked',
  [NotificationTypes.TournamentApplicationApproved]: 'tournamentApplicationApproved',
  [NotificationTypes.TournamentApplicationRejected]: 'tournamentApplicationRejected',
  [NotificationTypes.TournamentApplicationSubmitted]: 'tournamentApplicationSubmitted',
  [NotificationTypes.ClubInvitationReceived]: 'clubInvitationReceived',
  [NotificationTypes.ClubJoinApproved]: 'clubJoinApproved',
  [NotificationTypes.ClubJoinRejected]: 'clubJoinRejected',
  [NotificationTypes.ClubJoinSubmitted]: 'clubJoinSubmitted',
  [NotificationTypes.FederationMembershipApproved]: 'federationMembershipApproved',
  [NotificationTypes.FederationMembershipRejected]: 'federationMembershipRejected',
  [NotificationTypes.PrivacyVisibilityChanged]: 'privacyVisibilityChanged',
  [NotificationTypes.PasswordChanged]: 'passwordChanged',
};

export function getNotificationTitleKey(type: NotificationType): string {
  return `notifications.${TYPE_I18N_SUFFIX[type]}.title`;
}

export function getNotificationBodyKey(type: NotificationType): string {
  return `notifications.${TYPE_I18N_SUFFIX[type]}.body`;
}

export function resolveImportant(type: NotificationType): boolean {
  return isImportantNotificationType(type);
}
