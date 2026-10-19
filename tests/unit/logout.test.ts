import { describe, it, expect, vi, beforeEach } from "vitest";
import { logoutUser } from "../../src/features/auth/api";
import { apiClient } from "../../src/lib/api/client";

describe("Logout Security & Session Invalidation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches POST /auth/logout with empty payload on standard single-device logout", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      success: true,
      data: { message: "Logged out successfully" },
    });

    await logoutUser();

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith("/auth/logout", {});
  });

  it("dispatches POST /auth/logout with allDevices: true flag on global revocation", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
      success: true,
      data: { message: "All sessions logged out successfully" },
    });

    await logoutUser({ allDevices: true });

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith("/auth/logout", { allDevices: true });
  });
});
