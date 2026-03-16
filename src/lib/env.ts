const DEFAULT_DATABASE_PATH = "tiny-notes.sqlite";
const DEFAULT_BETTER_AUTH_SECRET = "dev-only-better-auth-secret-123456";
const DEFAULT_BETTER_AUTH_URL = "http://localhost:3000";

export const env = {
  DATABASE_PATH: process.env.DATABASE_PATH?.trim() || DEFAULT_DATABASE_PATH,
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET?.trim() || DEFAULT_BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL?.trim() || DEFAULT_BETTER_AUTH_URL,
  NODE_ENV: process.env.NODE_ENV,
} as const;
