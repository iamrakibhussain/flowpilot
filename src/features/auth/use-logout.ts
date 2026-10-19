"use client";

import * as React from "react";
import { logoutUser } from "./api";
import { clearSessionCache } from "@/lib/api/query-client";

export interface UseLogoutReturn {
  logout: (options?: { allDevices?: boolean }) => Promise<void>;
  isLoggingOut: boolean;
}

/**
 * Enterprise-grade secure logout hook.
 *
 * Enforces defense-in-depth session termination:
 * 1. Server-side session invalidation in PostgreSQL (SHA-256 token purging).
 * 2. Optional global multi-device revocation across all active sessions.
 * 3. Clearing HttpOnly session cookie on the server.
 * 4. Immediate client-side TanStack React Query cache cancellation and purge.
 * 5. Clearing client-side storage to eliminate cross-session data leaks.
 * 6. Hard browser window navigation to /login?logged_out=true to reset memory and bfcache.
 */
export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const logout = React.useCallback(async (options?: { allDevices?: boolean }) => {
    setIsLoggingOut(true);
    try {
      // 1. Invalidate session record on backend
      await logoutUser(options);
    } catch {
      // Graceful client fallback: even if the network or backend is unreachable,
      // client-side security teardown MUST continue to protect the user.
    } finally {
      // 2. Clear client query cache (protects customer CRM, invoices, appointment details)
      try {
        await clearSessionCache();
      } catch {
        // Ignore cache cleanup failures
      }

      // 3. Wipe client storage
      if (typeof window !== "undefined") {
        try {
          sessionStorage.clear();
          localStorage.removeItem("flowpilot_active_org");
          localStorage.removeItem("flowpilot_user_preferences");
        } catch {
          // Ignore storage access restrictions
        }

        // 4. Hard location redirection resets JavaScript heap memory and disables bfcache inspection
        window.location.href = "/login?logged_out=true";
      }
    }
  }, []);

  return {
    logout,
    isLoggingOut,
  };
}
