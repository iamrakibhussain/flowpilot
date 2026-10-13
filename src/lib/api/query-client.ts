import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./errors";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2, // 2 minutes before refetching in background
        gcTime: 1000 * 60 * 10, // 10 minutes cache retention
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiClientError) {
            // Do not retry on client-side or authorization errors
            if ([400, 401, 403, 404, 422].includes(error.status)) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new query client per request to prevent cross-request leakage
    return createQueryClient();
  } else {
    // Browser: reuse singleton query client
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}

/**
 * Resets and clears all cached server state on logout or organization context switch.
 */
export async function clearSessionCache(): Promise<void> {
  if (browserQueryClient) {
    await browserQueryClient.cancelQueries();
    browserQueryClient.clear();
  }
}
