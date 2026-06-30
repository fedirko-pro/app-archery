import type { Environment } from './types';

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
}

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const validateEnv = (): ValidationResult => {
  const requiredEnvVars: Record<string, string | undefined> = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_GOOGLE_AUTH_URL: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL,
  };

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    } else if (key === 'NEXT_PUBLIC_API_BASE_URL' && !isValidUrlOrPath(value)) {
      invalidVars.push(`${key}: "${value}" is not a valid URL or path (use /api for dev proxy)`);
    } else if (key === 'NEXT_PUBLIC_GOOGLE_AUTH_URL' && !isValidUrl(value)) {
      invalidVars.push(`${key}: "${value}" is not a valid URL`);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check the root .env file');
  }

  if (invalidVars.length > 0) {
    console.error('❌ Invalid environment variables:', invalidVars);
  }

  if (isDev && (missingVars.length > 0 || invalidVars.length > 0)) {
    console.warn('⚠️ Environment validation failed. Some features may not work correctly.');
  }

  if (isProd && (missingVars.length > 0 || invalidVars.length > 0)) {
    throw new Error(
      `Environment validation failed: ${[...missingVars, ...invalidVars].join(', ')}`,
    );
  }

  return {
    isValid: missingVars.length === 0 && invalidVars.length === 0,
    missingVars,
    invalidVars,
  };
};

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

/** Allow absolute URLs or paths like /api for dev proxy. */
const isValidUrlOrPath = (string: string): boolean => {
  if (string.startsWith('/')) return true;
  return isValidUrl(string);
};

export const env: Environment = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || (isDev ? '/api' : ''),
  GOOGLE_AUTH_URL: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || (isDev ? '/api/auth/google' : ''),
};

export { isDev, isProd };

validateEnv();

export default env;
