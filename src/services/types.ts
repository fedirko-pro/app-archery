/**
 * Standard API error shape returned by backend endpoints.
 */
export interface ApiError {
  message: string;
  status?: number;
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
  description: string; // plain text (multiline supported)
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
  description: string; // plain text
  link?: string; // external info page
  download_link?: string; // path under public/pdf/rules or external
}
