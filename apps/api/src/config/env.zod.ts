import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
    DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
    DATABASE_PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'DATABASE_PORT must be a valid number'),
    DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
    DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
    DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    COOKIE_DOMAIN: z.string().optional(),
    SESSION_TTL_SECONDS: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 604800)),
    OAUTH_CODE_TTL_SECONDS: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 120)),
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
    SMTP_PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'SMTP_PORT must be a valid number'),
    SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
    SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
    SMTP_FROM_EMAIL: z.string().email('SMTP_FROM_EMAIL must be a valid email'),
    SMTP_FROM_NAME: z.string().min(1, 'SMTP_FROM_NAME is required'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && data.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'JWT_SECRET must be at least 32 characters in production',
        path: ['JWT_SECRET'],
      });
    }
  });
