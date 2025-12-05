// src/config/env.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  // It only reminds in the dev environment and will not affect the operation
  console.warn(
    '[env] VITE_API_BASE_URL is not set. Please check your .env file.'
  );
}
