import type { Environment } from './types';

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: string[];
}

const validateEnv = (): ValidationResult => {
  const requiredEnvVars: Record<string, string | undefined> = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_GOOGLE_AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL,
  };

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    } else if (key === 'VITE_API_BASE_URL' && !isValidUrl(value)) {
      invalidVars.push(`${key}: "${value}" is not a valid URL`);
    } else if (key === 'VITE_GOOGLE_AUTH_URL' && !isValidUrl(value)) {
      invalidVars.push(`${key}: "${value}" is not a valid URL`);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env file');
  }

  if (invalidVars.length > 0) {
    console.error('❌ Invalid environment variables:', invalidVars);
  }

  if (import.meta.env.DEV && (missingVars.length > 0 || invalidVars.length > 0)) {
    console.warn('⚠️ Environment validation failed. Some features may not work correctly.');
  }

  if (import.meta.env.PROD && (missingVars.length > 0 || invalidVars.length > 0)) {
    throw new Error(`Environment validation failed: ${[...missingVars, ...invalidVars].join(', ')}`);
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

export const env: Environment = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  GOOGLE_AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL || 'http://localhost:3000/auth/google',
};

validateEnv();

export default env; 