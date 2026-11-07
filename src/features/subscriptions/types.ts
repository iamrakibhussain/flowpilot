export type SubscriptionStatus =
  "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED" | "INCOMPLETE";

export type SubscriptionBillingInterval = "MONTHLY" | "ANNUALLY";

export type SubscriptionTier = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface SubscriptionPlanItem {
  id: string;
  slug: string;
  name: string;
  tier: SubscriptionTier;
  description: string | null;
  price: number;
  currency: string;
  interval: SubscriptionBillingInterval;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  isActive: boolean;
  limits: {
    maxMembers: number;
    maxCustomers: number;
    maxProjects: number;
    maxServices: number;
  };
  features: {
    hasFlowRules: boolean;
    hasCustomDomain: boolean;
    hasAnalytics: boolean;
    hasRecurring: boolean;
    hasClientPortal: boolean;
  };
}

export interface MetricProgress {
  current: number;
  limit: number;
  percentage: number;
  exceeded: boolean;
}

export interface SubscriptionUsageMetrics {
  members: MetricProgress;
  customers: MetricProgress;
  projects: MetricProgress;
  services: MetricProgress;
}

export interface OrganizationSubscriptionResponse {
  id: string;
  organizationId: string;
  status: SubscriptionStatus;
  billingInterval: SubscriptionBillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlanItem;
  usage: SubscriptionUsageMetrics;
  isOwner: boolean;
}

export interface SubscriptionBillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  stripeInvoiceId: string | null;
  invoicePdfUrl: string | null;
  paidAt: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  createdAt: string;
}

export interface CreateCheckoutSessionPayload {
  planSlug: string;
  billingInterval: SubscriptionBillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}

export interface ChangePlanPayload {
  planSlug: string;
  billingInterval: SubscriptionBillingInterval;
}

export interface CancelSubscriptionPayload {
  immediately?: boolean;
}
