import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BillingPage from "@/app/(dashboard)/dashboard/billing/page";
import * as WorkspaceHook from "@/features/organizations/use-workspace-session";
import * as SubHooks from "@/features/subscriptions/use-subscription";
import type { SubscriptionPlanItem } from "./types";

const mockPlans: SubscriptionPlanItem[] = [
  {
    id: "plan_starter_monthly",
    slug: "starter-monthly",
    name: "Starter",
    tier: "STARTER",
    description: "Essential business operations foundation.",
    price: 0,
    currency: "USD",
    interval: "MONTHLY",
    isActive: true,
    limits: {
      maxMembers: 3,
      maxCustomers: 50,
      maxProjects: 5,
      maxServices: 10,
    },
    features: {
      hasFlowRules: false,
      hasCustomDomain: false,
      hasAnalytics: true,
      hasRecurring: false,
      hasClientPortal: true,
    },
  },
  {
    id: "plan_pro_monthly",
    slug: "pro-monthly",
    name: "Professional",
    tier: "PRO",
    description: "Advanced automations for growing teams.",
    price: 49,
    currency: "USD",
    interval: "MONTHLY",
    isActive: true,
    limits: {
      maxMembers: 10,
      maxCustomers: 500,
      maxProjects: 25,
      maxServices: 50,
    },
    features: {
      hasFlowRules: true,
      hasCustomDomain: true,
      hasAnalytics: true,
      hasRecurring: true,
      hasClientPortal: true,
    },
  },
  {
    id: "plan_enterprise_monthly",
    slug: "enterprise-monthly",
    name: "Enterprise",
    tier: "ENTERPRISE",
    description: "Unlimited capacity and dedicated support.",
    price: 149,
    currency: "USD",
    interval: "MONTHLY",
    isActive: true,
    limits: {
      maxMembers: 999,
      maxCustomers: 50000,
      maxProjects: 1000,
      maxServices: 500,
    },
    features: {
      hasFlowRules: true,
      hasCustomDomain: true,
      hasAnalytics: true,
      hasRecurring: true,
      hasClientPortal: true,
    },
  },
];

const mockSubscription = {
  id: "sub_123",
  organizationId: "org-100",
  status: "ACTIVE" as const,
  billingInterval: "MONTHLY" as const,
  currentPeriodStart: "2026-11-01T00:00:00.000Z",
  currentPeriodEnd: "2026-12-01T00:00:00.000Z",
  trialEndsAt: null,
  canceledAt: null,
  cancelAtPeriodEnd: false,
  plan: mockPlans[0]!,
  usage: {
    members: { current: 2, limit: 3, percentage: 67, exceeded: false },
    customers: { current: 15, limit: 50, percentage: 30, exceeded: false },
    projects: { current: 3, limit: 5, percentage: 60, exceeded: false },
    services: { current: 4, limit: 10, percentage: 40, exceeded: false },
  },
  isOwner: true,
};

describe("BillingPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(WorkspaceHook, "useWorkspaceSession").mockReturnValue({
      session: null,
      userName: "Alice",
      userEmail: "alice@test.internal",
      organizationId: "org-100",
      organizationName: "Apex Studio",
      organizationRole: "OWNER",
      memberships: [],
      isLoading: false,
      isAuthenticated: true,
    });

    vi.spyOn(SubHooks, "useCurrentSubscription").mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof SubHooks.useCurrentSubscription>);

    vi.spyOn(SubHooks, "useSubscriptionPlans").mockReturnValue({
      data: mockPlans,
      isLoading: false,
    } as unknown as ReturnType<typeof SubHooks.useSubscriptionPlans>);

    vi.spyOn(SubHooks, "useBillingHistory").mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof SubHooks.useBillingHistory>);

    vi.spyOn(SubHooks, "useCreateCheckoutSession").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof SubHooks.useCreateCheckoutSession>);

    vi.spyOn(SubHooks, "useCustomerPortal").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof SubHooks.useCustomerPortal>);

    vi.spyOn(SubHooks, "useChangeSubscriptionPlan").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof SubHooks.useChangeSubscriptionPlan>);

    vi.spyOn(SubHooks, "useCancelSubscription").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof SubHooks.useCancelSubscription>);

    vi.spyOn(SubHooks, "useResumeSubscription").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof SubHooks.useResumeSubscription>);

    vi.spyOn(SubHooks, "useVerifyCheckoutSession").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof SubHooks.useVerifyCheckoutSession>);
  });

  it("renders page header and active plan overview", () => {
    render(<BillingPage />);

    expect(screen.getByText("Subscription & Billing")).toBeInTheDocument();
    expect(screen.getByText(/Apex Studio/)).toBeInTheDocument();
    expect(screen.getByText("Starter Plan")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("displays real-time operational usage quotas", () => {
    render(<BillingPage />);

    expect(screen.getByText("Plan Quotas & Live Usage")).toBeInTheDocument();
    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText("of 3 allowed")).toBeInTheDocument();
    expect(screen.getByText("Active Clients")).toBeInTheDocument();
    expect(screen.getByText("of 50 allowed")).toBeInTheDocument();
  });

  it("renders tier options with action buttons", () => {
    render(<BillingPage />);

    expect(screen.getByText("Select SaaS Plan")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Current Plan" })).toBeDisabled();

    const upgradeButtons = screen.getAllByRole("button", { name: "Upgrade Plan" });
    expect(upgradeButtons.length).toBe(2);
    expect(upgradeButtons[0]).toBeEnabled();
  });

  it("renders Manage Cards and Manage Invoices buttons for OWNER", () => {
    render(<BillingPage />);

    expect(screen.getByRole("button", { name: /Manage Cards/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Manage Invoices/i })).toBeInTheDocument();
  });

  it("handles non-OWNER view by disabling billing mutations", () => {
    vi.spyOn(WorkspaceHook, "useWorkspaceSession").mockReturnValue({
      session: null,
      userName: "Bob",
      userEmail: "bob@test.internal",
      organizationId: "org-100",
      organizationName: "Apex Studio",
      organizationRole: "MEMBER",
      memberships: [],
      isLoading: false,
      isAuthenticated: true,
    });

    render(<BillingPage />);

    expect(
      screen.getByText(/Plan upgrades and payment modifications require workspace Owner privileges/)
    ).toBeInTheDocument();

    const ownerRequiredButtons = screen.getAllByRole("button", { name: "Owner Required" });
    expect(ownerRequiredButtons.length).toBe(2);
    expect(ownerRequiredButtons[0]).toBeDisabled();
  });
});
