import type { ApiErrorDetail } from "./types";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(detail: ApiErrorDetail) {
    super(detail.message);
    this.name = "ApiClientError";
    this.status = detail.status;
    this.code = detail.code;
    this.details = detail.details;
  }
}

export class NetworkError extends ApiClientError {
  constructor(message = "Network connection failed. Please check your internet connectivity.") {
    super({
      status: 0,
      code: "NETWORK_ERROR",
      message,
    });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiClientError {
  constructor(timeoutMs: number) {
    super({
      status: 408,
      code: "REQUEST_TIMEOUT",
      message: `The request timed out after ${timeoutMs}ms. Please try again.`,
    });
    this.name = "TimeoutError";
  }
}

export class AuthenticationError extends ApiClientError {
  constructor(message = "Your session has expired or you are not authenticated.") {
    super({
      status: 401,
      code: "UNAUTHENTICATED",
      message,
    });
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends ApiClientError {
  constructor(message = "You do not have permission to perform this action.") {
    super({
      status: 403,
      code: "FORBIDDEN",
      message,
    });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiClientError {
  constructor(message = "The requested resource could not be found.") {
    super({
      status: 404,
      code: "NOT_FOUND",
      message,
    });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiClientError {
  constructor(message: string, details?: Record<string, string[]>) {
    super({
      status: 422,
      code: "VALIDATION_ERROR",
      message,
      details,
    });
    this.name = "ValidationError";
  }
}

export function normalizeApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new NetworkError("Request was cancelled.");
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    return new ApiClientError({
      status: 500,
      code: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred.",
    });
  }

  return new ApiClientError({
    status: 500,
    code: "UNKNOWN_ERROR",
    message: "An unknown system error occurred.",
  });
}
