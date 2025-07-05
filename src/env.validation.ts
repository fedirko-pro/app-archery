const required: string[] = [
  'VITE_API_BASE_URL',
  'VITE_GOOGLE_AUTH_URL',
];

const missing = required.filter((key) => !import.meta.env[key]);
if (missing.length) {
  throw new Error('Missing required env variables: ' + missing.join(', '));
} 