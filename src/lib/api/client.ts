import { env } from "@/lib/config/env";
import {
  ApiClientError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  ValidationError,
  normalizeApiError,
} from "./errors";
import type { ApiResponse, HttpMethod, RequestOptions } from "./types";

export interface ApiClientConfig {
  baseUrl: string;
  defaultTimeoutMs?: number;
  getOrganizationId?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;
  private getOrganizationId?: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 15000;
    this.getOrganizationId = config.getOrganizationId;
    this.onUnauthorized = config.onUnauthorized;
  }

  public setOrganizationIdGetter(getter: () => string | null): void {
    this.getOrganizationId = getter;
  }

  public setUnauthorizedHandler(handler: () => void): void {
    this.onUnauthorized = handler;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options.params);
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        controller.abort();
      });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    };

    if (data !== undefined && !(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const organizationId = options.organizationId ?? this.getOrganizationId?.();
    if (organizationId) {
      headers["X-Organization-Id"] = organizationId;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body:
          data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
        signal: controller.signal,
        credentials: options.credentials ?? "include",
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        let errorData: unknown;
        if (isJson) {
          try {
            errorData = await response.json();
          } catch {
            errorData = null;
          }
        }

        const fallbackMessage = `Request failed with status ${response.status}`;
        const errorDetail =
          typeof errorData === "object" && errorData !== null && "error" in errorData
            ? (
                errorData as {
                  error: { message?: string; code?: string; details?: Record<string, string[]> };
                }
              ).error
            : { message: fallbackMessage, code: "HTTP_ERROR" };

        const message = errorDetail.message || fallbackMessage;
        const code = errorDetail.code || `HTTP_${response.status}`;
        const details = errorDetail.details;

        if (response.status === 401) {
          this.onUnauthorized?.();
          throw new AuthenticationError(message);
        }

        if (response.status === 403) {
          throw new ForbiddenError(message);
        }

        if (response.status === 404) {
          throw new NotFoundError(message);
        }

        if (response.status === 422 || response.status === 400) {
          throw new ValidationError(message, details);
        }

        throw new ApiClientError({
          status: response.status,
          code,
          message,
          details,
        });
      }

      if (response.status === 204) {
        return { success: true, data: undefined as unknown as T };
      }

      if (isJson) {
        const json = await response.json();
        return json as ApiResponse<T>;
      }

      return {
        success: true,
        data: (await response.text()) as unknown as T,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (controller.signal.aborted && !options.signal?.aborted) {
        throw new TimeoutError(timeoutMs);
      }

      throw normalizeApiError(error);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  public post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data, options);
  }

  public put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  public patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  public delete<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, data, options);
  }
}

export const apiClient = new ApiClient({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  defaultTimeoutMs: env.NEXT_PUBLIC_API_TIMEOUT_MS,
});
