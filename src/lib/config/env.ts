import { z } from "zod";

export const apiBaseUrlSchema = z
  .string()
  .trim()
  .min(1, "NEXT_PUBLIC_API_BASE_URL cannot be empty")
  .refine(
    (val) => {
      if (val.startsWith("/")) {
        return !val.startsWith("//") && !val.includes(" ");
      }
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message:
        "NEXT_PUBLIC_API_BASE_URL must be a valid absolute HTTP/HTTPS URL or a relative path starting with '/'",
    }
  )
  .default("/api/v1");

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: apiBaseUrlSchema,
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
