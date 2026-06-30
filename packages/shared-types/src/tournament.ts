export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export type PatrolRole = 'leader' | 'member' | 'judge';

export interface CreatedBy {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface TournamentStubDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
}

export interface ApplicantStubDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  gender?: string;
}

export interface TournamentApplicationDto {
  id: string;
  tournament: TournamentStubDto;
  applicant?: ApplicantStubDto;
  status: ApplicationStatus;
  category?: string;
  division?: string | { id: string; name: string } | null;
  bowCategory?: { id: string; name: string; code?: string } | null;
  equipment?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ApplicationStatsDto {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

export interface CreateTournamentApplicationDto {
  tournamentId: string;
  category?: string;
  division?: string;
  equipment?: string;
  notes?: string;
}

export interface TournamentFeedbackDto {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface TournamentFeedbackSummaryDto {
  averageRating: number | null;
  totalCount: number;
}

export interface TournamentFeedbackItemDto {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface TournamentFeedbackListDto {
  summary: TournamentFeedbackSummaryDto;
  items: TournamentFeedbackItemDto[];
}

export interface PendingTournamentFeedbackDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface PatrolMemberUserDto {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  club?: { name: string };
  division?: string;
  bowCategory?: string;
  gender?: string;
}

export interface PatrolMemberDto {
  userId: string;
  role: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  user?: PatrolMemberUserDto;
}

export interface PatrolDto {
  id: string;
  name?: string;
  tournamentId?: string;
  members?: PatrolMemberDto[];
}
