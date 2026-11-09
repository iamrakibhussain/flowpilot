import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "./client";
import { AuthenticationError, NotFoundError, ValidationError } from "./errors";

describe("ApiClient HTTP boundary", () => {
  const baseUrl = "https://api.flowpilot.test/api/v1";
  let client: ApiClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new ApiClient({
      baseUrl,
      defaultTimeoutMs: 5000,
    });
  });

  it("handles successful JSON responses correctly", async () => {
    const mockData = { id: "cust_123", name: "Acme Corp" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "content-type" ? "application/json" : null,
        },
        json: async () => ({ success: true, data: mockData }),
      })
    );

    const result = await client.get<{ id: string; name: string }>("/customers/cust_123");
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  it("injects X-Organization-Id header when organization context is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({ success: true, data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    client.setOrganizationIdGetter(() => "org_flow_999");
    await client.get("/services");

    expect(fetchMock).toHaveBeenCalled();
    const calledHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(calledHeaders["X-Organization-Id"]).toBe("org_flow_999");
  });

  it("maps 401 unauthorized status to AuthenticationError and executes callback", async () => {
    const onUnauthorized = vi.fn();
    client.setUnauthorizedHandler(onUnauthorized);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "content-type" ? "application/json" : null,
        },
        json: async () => ({
          success: false,
          error: { message: "Token expired", code: "UNAUTHENTICATED" },
        }),
      })
    );

    await expect(client.get("/profile")).rejects.toThrowError(AuthenticationError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("maps 404 status to NotFoundError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "content-type" ? "application/json" : null,
        },
        json: async () => ({
          success: false,
          error: { message: "Service not found", code: "NOT_FOUND" },
        }),
      })
    );

    await expect(client.get("/services/nonexistent")).rejects.toThrowError(NotFoundError);
  });

  it("maps 422 validation status to ValidationError with detailed errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "content-type" ? "application/json" : null,
        },
        json: async () => ({
          success: false,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: { email: ["Invalid email format"] },
          },
        }),
      })
    );

    await expect(client.post("/auth/register", {})).rejects.toThrowError(ValidationError);
  });

  it("resolves relative baseUrl correctly using base origin", async () => {
    const relativeClient = new ApiClient({
      baseUrl: "/api/v1",
      defaultTimeoutMs: 5000,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({ success: true, data: { status: "healthy" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await relativeClient.get("/health");

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toMatch(/\/api\/v1\/health$/);
  });

  it("prevents duplicate /api/v1 when caller passes /api/v1 in endpoint with relative baseUrl", async () => {
    const relativeClient = new ApiClient({
      baseUrl: "/api/v1",
      defaultTimeoutMs: 5000,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({ success: true, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await relativeClient.post("/api/v1/auth/login", { email: "test@example.com" });

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    expect(calledUrl).toMatch(/\/api\/v1\/auth\/login$/);
    expect(calledUrl).not.toContain("/api/v1/api/v1");
  });

  it("prevents duplicate /api/v1 with absolute same-origin API baseUrl", async () => {
    const absoluteClient = new ApiClient({
      baseUrl: "https://flowpilot-saas-app.vercel.app/api/v1",
      defaultTimeoutMs: 5000,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({ success: true, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    // Call with standard endpoint
    await absoluteClient.get("/auth/me");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://flowpilot-saas-app.vercel.app/api/v1/auth/me",
      expect.anything()
    );

    // Call with duplicate endpoint prefix
    await absoluteClient.post("/api/v1/auth/login", {});
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://flowpilot-saas-app.vercel.app/api/v1/auth/login",
      expect.anything()
    );
  });
});
