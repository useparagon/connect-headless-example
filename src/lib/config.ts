import { z } from 'zod';

export function getAppConfig() {
  return z
    .object({
      VITE_PARAGON_PROJECT_ID: z.string(),
      VITE_PARAGON_JWT_TOKEN: z.string(),
    })
    .safeParse(import.meta.env);
}
