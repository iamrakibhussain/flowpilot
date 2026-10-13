import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_API_BASE_URL must be a valid URL")
    .default("http://localhost:5000/api/v1"),
  NEXT_PUBLIC_API_TIMEOUT_MS: z.coerce
    .number()
    .positive("Timeout must be a positive integer")
    .default(15000),
  NEXT_PUBLIC_ENABLE_MOCKS: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

export type ClientEnv = z.infer<typeof envSchema>;

function validateEnv(): ClientEnv {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_TIMEOUT_MS: process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
    NEXT_PUBLIC_ENABLE_MOCKS: process.env.NEXT_PUBLIC_ENABLE_MOCKS,
  });

  if (!parsed.success) {
    const formattedErrors = parsed.error.format();
    console.error(
      "❌ Invalid frontend environment configuration:",
      JSON.stringify(formattedErrors, null, 2)
    );
    throw new Error(
      "Frontend environment configuration validation failed. Please inspect your environment variables."
    );
  }

  return parsed.data;
}

export const env: ClientEnv = validateEnv();
