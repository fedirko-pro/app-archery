export const NotificationTypes = {
  AchievementUnlocked: 'achievement.unlocked',
  TournamentApplicationApproved: 'tournament.application.approved',
  TournamentApplicationRejected: 'tournament.application.rejected',
  TournamentApplicationSubmitted: 'tournament.application.submitted',
  ClubInvitationReceived: 'club.invitation.received',
  ClubJoinApproved: 'club.join.approved',
  ClubJoinRejected: 'club.join.rejected',
  ClubJoinSubmitted: 'club.join.submitted',
  FederationMembershipApproved: 'federation.membership.approved',
  FederationMembershipRejected: 'federation.membership.rejected',
  PrivacyVisibilityChanged: 'privacy.visibility.changed',
  PasswordChanged: 'password.changed',
  Announcement: 'announcement.message',
} as const;

export type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes];

/** Types that drive the avatar / menu unread badge. */
export const IMPORTANT_NOTIFICATION_TYPES: readonly NotificationType[] = [
  NotificationTypes.AchievementUnlocked,
  NotificationTypes.TournamentApplicationApproved,
  NotificationTypes.TournamentApplicationRejected,
  NotificationTypes.ClubInvitationReceived,
  NotificationTypes.ClubJoinApproved,
  NotificationTypes.ClubJoinRejected,
  NotificationTypes.FederationMembershipApproved,
  NotificationTypes.FederationMembershipRejected,
  NotificationTypes.Announcement,
] as const;

export function isImportantNotificationType(type: string): boolean {
  return (IMPORTANT_NOTIFICATION_TYPES as readonly string[]).includes(type);
}

export interface NotificationDto {
  id: string;
  type: NotificationType | string;
  titleKey: string;
  bodyKey: string;
  params?: Record<string, unknown> | null;
  link?: string | null;
  important: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsListDto {
  items: NotificationDto[];
  total: number;
  lastLoginAt: string | null;
}

export interface NotificationUnreadCountDto {
  count: number;
}

export type AnnouncementAudienceType = 'all' | 'users' | 'tournament';

export interface SendAnnouncementRequest {
  mode: 'all' | 'users';
  userIds?: string[];
  title?: string;
  message: string;
  link?: string;
}

export interface AnnouncementDto {
  id: string;
  audienceType: AnnouncementAudienceType;
  title: string | null;
  message: string;
  link: string | null;
  recipientCount: number;
  tournamentId: string | null;
  tournamentTitle: string | null;
  createdAt: string;
}

export interface AnnouncementsListDto {
  items: AnnouncementDto[];
  total: number;
}

export interface AudienceCountDto {
  count: number;
}
