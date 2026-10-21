import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../src/middleware";

describe("Next.js Auth Guard Middleware", () => {
  it("redirects unauthenticated users trying to access /dashboard to /login with redirect query", () => {
    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirect=%2Fdashboard"
    );
  });

  it("allows authenticated users with flowpilot_session cookie to access /dashboard", () => {
    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie:
          "flowpilot_session=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      },
    });
    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects authenticated users away from /login to /dashboard", () => {
    const request = new NextRequest("http://localhost:3000/login", {
      headers: {
        cookie: "flowpilot_session=valid_session_token_example",
      },
    });
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("redirects authenticated users away from /register to /dashboard", () => {
    const request = new NextRequest("http://localhost:3000/register", {
      headers: {
        cookie: "flowpilot_session=valid_session_token_example",
      },
    });
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("allows unauthenticated users to access /login and /register", () => {
    const loginRequest = new NextRequest("http://localhost:3000/login");
    const registerRequest = new NextRequest("http://localhost:3000/register");

    expect(middleware(loginRequest).status).toBe(200);
    expect(middleware(registerRequest).status).toBe(200);
  });

  it("allows access to /login when logged_out=true and purges lingering cookie", () => {
    const logoutRequest = new NextRequest("http://localhost:3000/login?logged_out=true", {
      headers: {
        cookie: "flowpilot_session=old_stale_session_token",
      },
    });
    const response = middleware(logoutRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows public routes to proceed without redirect", () => {
    const publicRequest = new NextRequest("http://localhost:3000/");
    expect(middleware(publicRequest).status).toBe(200);
  });
});
