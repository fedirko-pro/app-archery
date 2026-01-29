/**
 * Standard API error shape returned by backend endpoints.
 */
export interface ApiError {
  message: string;
  status?: number;
}

/** User stub returned in tournament/patrol createdBy and similar. */
export interface CreatedBy {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

/** File attachment metadata (matches FileAttachment from FileAttachments component). */
export interface AttachmentDto {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface TournamentDto {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  address?: string;
  allowMultipleApplications?: boolean;
  applicationDeadline?: string;
  banner?: string;
  attachments?: AttachmentDto[];
  createdBy?: CreatedBy;
  createdAt: string;
}

export interface PatrolMemberDto {
  userId: string;
  role: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

export interface PatrolDto {
  id: string;
  name?: string;
  tournamentId?: string;
  members?: PatrolMemberDto[];
}

/** Tournament stub embedded in application responses. */
export interface TournamentStubDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
}

/** Applicant stub in admin application list. */
export interface ApplicantStubDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface TournamentApplicationDto {
  id: string;
  tournament: TournamentStubDto;
  applicant?: ApplicantStubDto;
  status: ApplicationStatus;
  category?: string;
  division?: string;
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

/**
 * Bow category descriptor used across the app.
 * - description: plain text, multi-line supported
 * - rule_reference: short reference source label (e.g. IFAA, FABP, HDH-IAA)
 * - rule_citation: specific citation text; used as anchor for /rules routing
 */
export interface CategoryDto {
  id?: string;
  code: string;
  name: string;
  // Multilingual descriptions (plain text, multiline supported)
  description?: string;
  description_en?: string;
  description_pt?: string;
  description_it?: string;
  description_uk?: string;
  description_es?: string;
  rule_reference?: string;
  rule_citation?: string;
}

/**
 * Rule descriptor for the Rules page and category references.
 */
export interface RuleDto {
  rule_code: string; // e.g. IFAA, FABP, HDH-IAA
  rule_name: string;
  edition?: string;
  // Multilingual descriptions (plain text)
  description?: string;
  description_en?: string;
  description_pt?: string;
  description_it?: string;
  description_uk?: string;
  description_es?: string;
  link?: string; // external info page
  download_link?: string; // path under public/pdf/rules or external
}
