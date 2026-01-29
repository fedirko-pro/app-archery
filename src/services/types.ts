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
  ruleCode?: string;
  targetCount?: number;
  rule?: { id: string; ruleCode: string; ruleName: string };
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
  picture?: string;
  gender?: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

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

/**
 * Bow category descriptor used across the app.
 * - description: plain text, multi-line supported
 * - rule_reference: short reference source label (e.g. IFAA, FABP, HDH-IAA)
 * - rule_citation: specific citation text; used as anchor for /rules routing
 * @deprecated Use BowCategory instead. This interface is kept for backward compatibility.
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
 * Bow category from backend API (camelCase format).
 * Matches backend API response format.
 */
export interface BowCategory {
  id: string; // UUID from backend
  code: string;
  name: string;
  // Multilingual descriptions (camelCase format)
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  ruleReference?: string;
  ruleCitation?: string;
  rule?: RuleDto; // Related rule (from backend relation)
  createdAt?: string;
  updatedAt?: string | null;
}

/**
 * DTO for creating a new bow category.
 */
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
  ruleId: string; // Required
}

/**
 * DTO for updating an existing bow category.
 * All fields are optional.
 */
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

/**
 * Rule descriptor for the Rules page and category references.
 * Matches backend API response format (camelCase).
 */
export interface RuleDto {
  id?: string; // UUID from backend
  ruleCode: string; // e.g. IFAA, FABP, HDH-IAA
  ruleName: string;
  edition?: string;
  // Multilingual descriptions (plain text)
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  link?: string; // external info page
  downloadLink?: string; // path under public/pdf/rules or external
  divisions?: any[]; // Related divisions (from backend relation)
  bowCategories?: any[]; // Related bow categories (from backend relation)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Club descriptor for managing archery clubs.
 */
export interface ClubDto {
  id?: string;
  name: string;
  description?: string;
  location?: string;
  clubLogo?: string; // URL to club logo
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Division descriptor (age groups: cub, junior, adult, veteran).
 * Linked to specific rules that define which divisions are available.
 */
export interface DivisionDto {
  id?: string;
  name: string;
  description?: string;
  rule_id?: string; // Foreign key to RuleDto
  rule_code?: string; // For convenience (e.g., IFAA, FABP)
  created_at?: string;
  updated_at?: string;
}
