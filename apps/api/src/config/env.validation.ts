import { config } from 'dotenv';
config();

const required: string[] = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FRONTEND_URL',
  'BACKEND_URL',
  'GOOGLE_CALLBACK_URL',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error('Missing required env variables: ' + missing.join(', '));
}
