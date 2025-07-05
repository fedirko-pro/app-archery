const validateEnv = () => {
  const requiredEnvVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_GOOGLE_AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL,
  };

  const missingVars = [];
  const invalidVars = [];

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

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  GOOGLE_AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL,
};

validateEnv();

export default env; 