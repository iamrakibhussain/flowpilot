import { apiClient } from "@/lib/api/client";
import type {
  SubscriptionPlanItem,
  OrganizationSubscriptionResponse,
  SubscriptionUsageMetrics,
  SubscriptionBillingHistoryItem,
  CreateCheckoutSessionPayload,
  ChangePlanPayload,
  CancelSubscriptionPayload,
} from "./types";

/**
 * Fetch available SaaS subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlanItem[]> {
  const response = await apiClient.get<SubscriptionPlanItem[]>("/subscriptions/plans");
  return response.data;
}

/**
 * Fetch current organization subscription and usage state
 */
export async function getCurrentSubscription(
  organizationId?: string
): Promise<OrganizationSubscriptionResponse> {
  const response = await apiClient.get<OrganizationSubscriptionResponse>("/subscriptions/current", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch organization usage limits and metrics
 */
export async function getSubscriptionUsage(
  organizationId?: string
): Promise<SubscriptionUsageMetrics> {
  const response = await apiClient.get<SubscriptionUsageMetrics>("/subscriptions/usage", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch billing history and past invoices
 */
export async function getBillingHistory(
  organizationId?: string
): Promise<SubscriptionBillingHistoryItem[]> {
  const response = await apiClient.get<SubscriptionBillingHistoryItem[]>(
    "/subscriptions/billing-history",
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Create Stripe Checkout session for subscription start or upgrade
 */
export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload,
  organizationId?: string
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const response = await apiClient.post<{ checkoutUrl: string; sessionId: string }>(
    "/subscriptions/checkout",
    payload,
    {
      organizationId,
    }
  );
  return response.data;
}

export interface CustomerPortalOptions {
  returnUrl?: string;
  flowType?: "payment_method_update" | "invoices" | "default";
}

/**
 * Create Customer Portal session for billing management
 */
export async function createCustomerPortalSession(
  options?: string | CustomerPortalOptions,
  organizationId?: string
): Promise<{ portalUrl: string }> {
  const payload = typeof options === "string" ? { returnUrl: options } : options || {};
  const response = await apiClient.post<{ portalUrl: string }>("/subscriptions/portal", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Verify and activate a completed Stripe checkout session
 */
export async function verifyCheckoutSession(
  sessionId: string,
  organizationId?: string
): Promise<OrganizationSubscriptionResponse> {
  const response = await apiClient.post<OrganizationSubscriptionResponse>(
    "/subscriptions/verify-checkout",
    { sessionId },
    { organizationId }
  );
  return response.data;
}

/**
 * Change / switch subscription plan directly
 */
export async function changeSubscriptionPlan(
  payload: ChangePlanPayload,
  organizationId?: string
): Promise<OrganizationSubscriptionResponse> {
  const response = await apiClient.post<OrganizationSubscriptionResponse>(
    "/subscriptions/change-plan",
    payload,
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Schedule cancellation or cancel subscription
 */
export async function cancelSubscription(
  payload: CancelSubscriptionPayload,
  organizationId?: string
): Promise<OrganizationSubscriptionResponse> {
  const response = await apiClient.post<OrganizationSubscriptionResponse>(
    "/subscriptions/cancel",
    payload,
    {
      organizationId,
    }
  );
  return response.data;
}

/**
 * Resume a canceled subscription before the period end date
 */
export async function resumeSubscription(
  organizationId?: string
): Promise<OrganizationSubscriptionResponse> {
  const response = await apiClient.post<OrganizationSubscriptionResponse>(
    "/subscriptions/resume",
    {},
    {
      organizationId,
    }
  );
  return response.data;
}
