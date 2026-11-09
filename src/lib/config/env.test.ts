import { describe, it, expect } from "vitest";
import { env, apiBaseUrlSchema } from "./env";

describe("Environment Configuration Validator", () => {
  it("provides valid default configuration values", () => {
    expect(env.NEXT_PUBLIC_APP_ENV).toBeDefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_API_TIMEOUT_MS).toBeGreaterThan(0);
    expect(typeof env.NEXT_PUBLIC_ENABLE_MOCKS).toBe("boolean");
  });

  it("ensures API base URL is a valid URL or relative path string", () => {
    expect(env.NEXT_PUBLIC_API_BASE_URL).toMatch(/^(\/|https?:\/\/)/);
  });

  describe("API Base URL Schema Validator", () => {
    it("accepts relative /api/v1 path", () => {
      const result = apiBaseUrlSchema.safeParse("/api/v1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("/api/v1");
      }
    });

    it("accepts absolute same-origin API URLs", () => {
      const vercelUrl = "https://flowpilot-saas-app.vercel.app/api/v1";
      const result = apiBaseUrlSchema.safeParse(vercelUrl);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(vercelUrl);
      }

      const deltaUrl = "https://flowpilot-delta-flax.vercel.app/api/v1";
      const resultDelta = apiBaseUrlSchema.safeParse(deltaUrl);
      expect(resultDelta.success).toBe(true);

      const localUrl = "http://localhost:4000/api/v1";
      const resultLocal = apiBaseUrlSchema.safeParse(localUrl);
      expect(resultLocal.success).toBe(true);
    });

    it("rejects invalid API base URLs without weakening validation", () => {
      const invalidCases = [
        "",
        "   ",
        "api/v1", // Missing leading slash
        "not-a-url", // Not a valid URL
        "//evil.com", // Protocol-relative URL forbidden
        "ftp://example.com/api/v1", // Non-HTTP protocol forbidden
        "javascript:alert(1)", // XSS vector forbidden
      ];

      for (const invalidInput of invalidCases) {
        const result = apiBaseUrlSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      }
    });

    it("defaults to /api/v1 when undefined", () => {
      const result = apiBaseUrlSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("/api/v1");
      }
    });
  });
});
