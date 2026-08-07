export type SiteMode = 'test' | 'prod';

export interface Environment {
  API_BASE_URL: string;
  GOOGLE_AUTH_URL: string;
  SITE_MODE: SiteMode;
}
