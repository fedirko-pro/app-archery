export type AppLanguageCode = 'pt' | 'en' | 'it' | 'ua' | 'es';

export interface CustomFieldDto {
  key: string;
  value: string;
}

export interface AttachmentDto {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
