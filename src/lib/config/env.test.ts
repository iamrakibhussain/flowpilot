import { describe, it, expect } from "vitest";
import { env } from "./env";

describe("Environment Configuration Validator", () => {
  it("provides valid default configuration values", () => {
    expect(env.NEXT_PUBLIC_APP_ENV).toBeDefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_API_TIMEOUT_MS).toBeGreaterThan(0);
    expect(typeof env.NEXT_PUBLIC_ENABLE_MOCKS).toBe("boolean");
  });

  it("ensures API base URL is a valid URL string", () => {
    expect(env.NEXT_PUBLIC_API_BASE_URL).toMatch(/^https?:\/\//);
  });
});
