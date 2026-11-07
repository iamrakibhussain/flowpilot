import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  getSubscriptionUsage,
  getBillingHistory,
  createCheckoutSession,
  createCustomerPortalSession,
  changeSubscriptionPlan,
  cancelSubscription,
  resumeSubscription,
  type CustomerPortalOptions,
} from "./api";
import type {
  CreateCheckoutSessionPayload,
  ChangePlanPayload,
  CancelSubscriptionPayload,
} from "./types";

export const SUBSCRIPTION_QUERY_KEYS = {
  all: ["subscriptions"] as const,
  plans: () => [...SUBSCRIPTION_QUERY_KEYS.all, "plans"] as const,
  current: (orgId?: string) => [...SUBSCRIPTION_QUERY_KEYS.all, "current", orgId] as const,
  usage: (orgId?: string) => [...SUBSCRIPTION_QUERY_KEYS.all, "usage", orgId] as const,
  history: (orgId?: string) => [...SUBSCRIPTION_QUERY_KEYS.all, "history", orgId] as const,
};

/**
 * Hook to retrieve available SaaS subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.plans(),
    queryFn: () => getSubscriptionPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to retrieve current active subscription for current workspace
 */
export function useCurrentSubscription() {
  const { organizationId } = useWorkspaceSession();

  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.current(organizationId || undefined),
    queryFn: () => getCurrentSubscription(organizationId || undefined),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to retrieve organization usage limits and metrics
 */
export function useSubscriptionUsage() {
  const { organizationId } = useWorkspaceSession();

  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.usage(organizationId || undefined),
    queryFn: () => getSubscriptionUsage(organizationId || undefined),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to retrieve past invoices and billing history
 */
export function useBillingHistory() {
  const { organizationId, organizationRole } = useWorkspaceSession();
  const canViewBilling = organizationRole === "OWNER" || organizationRole === "ADMIN";

  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.history(organizationId || undefined),
    queryFn: () => getBillingHistory(organizationId || undefined),
    enabled: Boolean(organizationId) && canViewBilling,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to initiate Stripe checkout
 */
export function useCreateCheckoutSession() {
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (payload: CreateCheckoutSessionPayload) =>
      createCheckoutSession(payload, organizationId || undefined),
  });
}

/**
 * Hook to access billing customer portal
 */
export function useCustomerPortal() {
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (options?: string | CustomerPortalOptions) =>
      createCustomerPortalSession(options, organizationId || undefined),
  });
}

/**
 * Hook to switch subscription plan
 */
export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (payload: ChangePlanPayload) =>
      changeSubscriptionPlan(payload, organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (payload: CancelSubscriptionPayload) =>
      cancelSubscription(payload, organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to resume canceled subscription
 */
export function useResumeSubscription() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: () => resumeSubscription(organizationId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.all });
    },
  });
}
