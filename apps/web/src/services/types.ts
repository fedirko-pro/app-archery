import type {
  ApplicationStatus,
  CustomFieldDto,
  CreatedBy,
  AttachmentDto,
  ApiError,
  TournamentStubDto,
  ApplicantStubDto,
  TournamentApplicationDto,
  ApplicationStatsDto,
  CreateTournamentApplicationDto,
  TournamentFeedbackDto,
  TournamentFeedbackSummaryDto,
  TournamentFeedbackItemDto,
  TournamentFeedbackListDto,
  PendingTournamentFeedbackDto,
  PatrolMemberUserDto,
  PatrolMemberDto,
  PatrolDto,
} from '@sokil/shared-types';

export type {
  ApplicationStatus,
  CustomFieldDto,
  CreatedBy,
  AttachmentDto,
  ApiError,
  TournamentStubDto,
  ApplicantStubDto,
  TournamentApplicationDto,
  ApplicationStatsDto,
  CreateTournamentApplicationDto,
  TournamentFeedbackDto,
  TournamentFeedbackSummaryDto,
  TournamentFeedbackItemDto,
  TournamentFeedbackListDto,
  PendingTournamentFeedbackDto,
  PatrolMemberUserDto,
  PatrolMemberDto,
  PatrolDto,
};

export interface EquipmentSetDto {
  id: string;
  name: string;
  bowType?: string;
  manufacturer?: string;
  model?: string;
  drawWeight?: string;
  arrowLength?: string;
  arrowSpine?: string;
  arrowWeight?: string;
  arrowMaterial?: string;
  customFields?: CustomFieldDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentSetDto {
  name: string;
  bowType?: string;
  manufacturer?: string;
  model?: string;
  drawWeight?: string;
  arrowLength?: string;
  arrowSpine?: string;
  arrowWeight?: string;
  arrowMaterial?: string;
  customFields?: CustomFieldDto[];
}

export interface TrainingSessionDto {
  id: string;
  date: string;
  status?: string;
  shotsCount?: number;
  arrowsPerSet?: number;
  distance?: string;
  targetType?: string;
  equipmentSetId?: string;
  scoreTotal?: number;
  notes?: string;
  mood?: string;
  customFields?: CustomFieldDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingSessionDto {
  date: string;
  status?: string;
  shotsCount?: number;
  arrowsPerSet?: number;
  distance?: string;
  targetType?: string;
  equipmentSetId?: string;
  scoreTotal?: number;
  notes?: string;
  mood?: string;
  customFields?: CustomFieldDto[];
}

export interface ShotPeriodStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}

export interface MetersPeriodStats {
  total: number;
  thisMonth: number;
  thisYear: number;
}

export interface ApplicationStatsForUser {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  withdrawn: number;
}

export interface MonthlyDataPoint {
  month: string;
  count: number;
}

export interface TrainingStatsDto {
  registrationDate: string;
  totalSessions: number;
  currentStreakWeeks: number;
  shots: ShotPeriodStats;
  metersTraveled: MetersPeriodStats;
  avgShotsPerSession: number;
  mostUsedDistance: string | null;
  mostUsedTargetType: string | null;
  shotsByMonth: MonthlyDataPoint[];
  sessionsByMonth: MonthlyDataPoint[];
  tournamentApplications: ApplicationStatsForUser;
}

export interface TournamentDto {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  address?: string;
  country?: string;
  allowMultipleApplications?: boolean;
  collectFeedback?: boolean;
  applicationDeadline?: string;
  banner?: string;
  attachments?: AttachmentDto[];
  ruleCode?: string;
  targetCount?: number;
  rule?: { id: string; ruleCode: string; ruleName: string };
  createdBy?: CreatedBy;
  createdAt: string;
}

export interface CategoryDto {
  id?: string;
  code: string;
  name: string;
  description?: string;
  description_en?: string;
  description_pt?: string;
  description_it?: string;
  description_uk?: string;
  description_es?: string;
  rule_reference?: string;
  rule_citation?: string;
}

export interface BowCategory {
  id: string;
  code: string;
  name: string;
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  ruleReference?: string;
  ruleCitation?: string;
  rule?: RuleDto;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateBowCategoryDto {
  code: string;
  name: string;
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  ruleReference?: string;
  ruleCitation?: string;
  ruleId: string;
}

export interface UpdateBowCategoryDto {
  code?: string;
  name?: string;
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  ruleReference?: string;
  ruleCitation?: string;
  ruleId?: string;
}

export interface RuleDto {
  id?: string;
  ruleCode: string;
  ruleName: string;
  edition?: string;
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  link?: string;
  downloadLink?: string;
  divisions?: unknown[];
  bowCategories?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateRuleDto = Omit<
  RuleDto,
  'id' | 'createdAt' | 'updatedAt' | 'divisions' | 'bowCategories'
>;

export type UpdateRuleDto = Partial<CreateRuleDto>;

export interface ClubDto {
  id?: string;
  name: string;
  shortCode?: string;
  description?: string;
  location?: string;
  clubLogo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DivisionDto {
  id?: string;
  name: string;
  description?: string;
  rule_id?: string;
  rule_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicProgressStatsDto {
  memberSince: string;
  totalSessions: number;
  currentStreakWeeks: number;
  shotsThisWeek: number;
  shotsTotal: number;
}

export interface PublicProfileDto {
  id: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  bio?: string;
  location?: string;
  country?: string;
  club?: { id: string; name: string } | null;
  profileVisibility: 'public' | 'limited';
  progress?: PublicProgressStatsDto;
}

export interface PublicAchievementShareDto {
  id: string;
  title: string;
  description: string;
  rarity: string;
  earned: boolean;
  earnedDate?: string | null;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
}
