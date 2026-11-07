"use client";

import * as React from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  ArrowUpRight,
  Download,
  AlertCircle,
  Users,
  Briefcase,
  Layers,
  Repeat,
  Receipt,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  useCurrentSubscription,
  useSubscriptionPlans,
  useBillingHistory,
  useCreateCheckoutSession,
  useCustomerPortal,
  useChangeSubscriptionPlan,
  useCancelSubscription,
  useResumeSubscription,
} from "@/features/subscriptions/use-subscription";
import type {
  SubscriptionPlanItem,
  SubscriptionBillingInterval,
} from "@/features/subscriptions/types";

export default function BillingPage() {
  const { organizationRole, organizationName } = useWorkspaceSession();
  const isOwner = organizationRole === "OWNER";

  // Data fetching
  const { data: subscription, refetch: refetchSub } = useCurrentSubscription();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: history = [] } = useBillingHistory();

  // Mutations
  const checkoutMutation = useCreateCheckoutSession();
  const portalMutation = useCustomerPortal();
  const changePlanMutation = useChangeSubscriptionPlan();
  const cancelMutation = useCancelSubscription();
  const resumeMutation = useResumeSubscription();

  // Local state
  const [selectedInterval, setSelectedInterval] =
    React.useState<SubscriptionBillingInterval | null>(null);
  const billingInterval = selectedInterval ?? subscription?.billingInterval ?? "MONTHLY";
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [upgradingSlug, setUpgradingSlug] = React.useState<string | null>(null);
  const [isManagingCards, setIsManagingCards] = React.useState(false);

  const activePlan = subscription?.plan;
  const usage = subscription?.usage;

  const handleCheckoutOrSwitch = async (plan: SubscriptionPlanItem) => {
    setActionError(null);
    setActionSuccess(null);
    setUpgradingSlug(plan.slug);

    if (!isOwner) {
      setActionError("Only workspace Owners are authorized to manage SaaS subscriptions.");
      setUpgradingSlug(null);
      return;
    }

    try {
      if (plan.price === 0) {
        // Free / Starter tier: direct switch
        await changePlanMutation.mutateAsync({
          planSlug: plan.slug,
          billingInterval,
        });
        setActionSuccess(`Switched to ${plan.name} plan successfully.`);
        refetchSub();
      } else {
        // Paid tier: initiate Stripe checkout session
        const res = await checkoutMutation.mutateAsync({
          planSlug: plan.slug,
          billingInterval,
        });
        if (res.checkoutUrl) {
          if (res.checkoutUrl.includes("mock_checkout=success")) {
            setActionSuccess(
              `Simulated checkout session created for ${plan.name} plan (${billingInterval.toLowerCase()}).`
            );
            refetchSub();
          } else {
            window.location.assign(res.checkoutUrl);
          }
        }
      }
    } catch (err: unknown) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to initiate subscription checkout with payment provider"
      );
    } finally {
      setUpgradingSlug(null);
    }
  };

  const handleManageCards = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsManagingCards(true);
    try {
      const res = await portalMutation.mutateAsync({
        returnUrl: window.location.href,
        flowType: "payment_method_update",
      });
      if (res.portalUrl) {
        if (res.portalUrl.includes("portal_mock=true")) {
          setActionSuccess(
            "Stripe customer portal is in test simulation mode. Live payment method updates require real Stripe account setup."
          );
        } else {
          window.location.assign(res.portalUrl);
        }
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to open payment cards portal");
    } finally {
      setIsManagingCards(false);
    }
  };

  const handleManageInvoices = () => {
    setActionError(null);
    setActionSuccess(null);
    const historyElement = document.getElementById("billing-history-section");
    if (historyElement) {
      historyElement.scrollIntoView({ behavior: "smooth", block: "start" });
      historyElement.classList.add("ring-2", "ring-primary/40", "rounded-2xl", "transition-all");
      setTimeout(() => {
        historyElement.classList.remove("ring-2", "ring-primary/40", "rounded-2xl", "transition-all");
      }, 2000);
    }
  };

  const handleCancelSubscription = async () => {
    setActionError(null);
    try {
      await cancelMutation.mutateAsync({ immediately: false });
      setIsCancelModalOpen(false);
      setActionSuccess("Subscription scheduled for cancellation at the end of the billing period.");
      refetchSub();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel subscription");
    }
  };

  const handleResumeSubscription = async () => {
    setActionError(null);
    try {
      await resumeMutation.mutateAsync();
      setActionSuccess("Subscription reactivated. Automatic renewal has been resumed.");
      refetchSub();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to resume subscription");
    }
  };

  // Filter plans according to selected interval toggle
  const displayedPlans = React.useMemo(() => {
    const targetInterval = billingInterval;
    const tierOrder = ["STARTER", "PRO", "ENTERPRISE"];
    return plans
      .filter((p) => p.interval === targetInterval)
      .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
  }, [plans, billingInterval]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="success"
            className="border-emerald-500/20 bg-emerald-500/15 text-emerald-600"
          >
            Active
          </Badge>
        );
      case "TRIALING":
        return (
          <Badge variant="default" className="border-blue-500/20 bg-blue-500/15 text-blue-600">
            Trial
          </Badge>
        );
      case "PAST_DUE":
        return <Badge variant="destructive">Past Due</Badge>;
      case "CANCELED":
        return <Badge variant="warning">Canceled</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <PageHeader
        title="Subscription & Billing"
        description={`Manage the FlowPilot SaaS subscription, capacity quotas, and past invoices for ${organizationName}.`}
      />

      {/* Action Messages */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Cancellation Warning Banner */}
      {subscription?.cancelAtPeriodEnd && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Subscription Ending Soon</p>
              <p className="text-xs text-amber-600/90">
                Your subscription will not renew and will expire at the end of the current period on{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
              </p>
            </div>
          </div>
          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/40 bg-white hover:bg-amber-50"
              onClick={handleResumeSubscription}
              disabled={resumeMutation.isPending}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Resume Subscription
            </Button>
          )}
        </div>
      )}

      {/* 2. Current Plan Overview Card */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-xl font-bold">
                {activePlan?.name || "Starter"} Plan
              </CardTitle>
              {getStatusBadge(subscription?.status)}
            </div>
            <CardDescription className="mt-1">
              {activePlan?.description || "Basic operations foundation for service professionals."}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${activePlan?.price || 0}
              <span className="text-muted-foreground text-xs font-normal">
                /{subscription?.billingInterval === "ANNUALLY" ? "yr" : "mo"}
              </span>
            </div>
            <div className="text-muted-foreground text-xs">
              {subscription?.cancelAtPeriodEnd ? "Expires" : "Renews"} on{" "}
              {subscription?.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : "Continuous"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isOwner && (
            <p className="text-muted-foreground bg-muted/40 rounded p-2 text-xs">
              Note: You are signed in as <span className="font-medium">{organizationRole}</span>.
              Plan upgrades and payment modifications require workspace Owner privileges.
            </p>
          )}
        </CardContent>
        {isOwner && (
          <CardFooter className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageCards}
                disabled={isManagingCards || portalMutation.isPending}
              >
                {isManagingCards ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-1.5 h-4 w-4" />
                )}
                Manage Cards
                <ArrowUpRight className="text-muted-foreground ml-1 h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageInvoices}
              >
                <Receipt className="mr-1.5 h-4 w-4" />
                Manage Invoices
              </Button>
            </div>
            {!subscription?.cancelAtPeriodEnd && activePlan?.price !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-600"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* 3. Real-Time Resource Quotas & Usage Meters */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Plan Quotas & Live Usage</h2>
          <p className="text-muted-foreground text-sm">
            Current operational consumption against your plan limits.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Members Metric */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Team Members
                </span>
                <Users className="text-muted-foreground h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{usage?.members.current || 0}</span>
                <span className="text-muted-foreground text-xs">
                  of {usage?.members.limit || 3} allowed
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (usage?.members.percentage || 0) >= 100
                      ? "bg-red-500"
                      : (usage?.members.percentage || 0) >= 80
                        ? "bg-amber-500"
                        : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, usage?.members.percentage || 0)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customers Metric */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Active Clients
                </span>
                <Briefcase className="text-muted-foreground h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{usage?.customers.current || 0}</span>
                <span className="text-muted-foreground text-xs">
                  of {usage?.customers.limit || 50} allowed
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (usage?.customers.percentage || 0) >= 100
                      ? "bg-red-500"
                      : (usage?.customers.percentage || 0) >= 80
                        ? "bg-amber-500"
                        : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, usage?.customers.percentage || 0)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Projects Metric */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Projects
                </span>
                <Layers className="text-muted-foreground h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{usage?.projects.current || 0}</span>
                <span className="text-muted-foreground text-xs">
                  of {usage?.projects.limit || 5} allowed
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (usage?.projects.percentage || 0) >= 100
                      ? "bg-red-500"
                      : (usage?.projects.percentage || 0) >= 80
                        ? "bg-amber-500"
                        : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, usage?.projects.percentage || 0)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Services Metric */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Catalog Services
                </span>
                <Sparkles className="text-muted-foreground h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{usage?.services.current || 0}</span>
                <span className="text-muted-foreground text-xs">
                  of {usage?.services.limit || 10} allowed
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (usage?.services.percentage || 0) >= 100
                      ? "bg-red-500"
                      : (usage?.services.percentage || 0) >= 80
                        ? "bg-amber-500"
                        : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(100, usage?.services.percentage || 0)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Plan Upgrade & Tier Comparison */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Select SaaS Plan</h2>
            <p className="text-muted-foreground text-sm">
              Scale capacity and unlock advanced automations for your organization.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="bg-muted/60 border-border/80 flex items-center rounded-lg border p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                billingInterval === "MONTHLY"
                  ? "text-foreground bg-white shadow-sm dark:bg-zinc-800"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedInterval("MONTHLY")}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                billingInterval === "ANNUALLY"
                  ? "text-foreground bg-white shadow-sm dark:bg-zinc-800"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedInterval("ANNUALLY")}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {displayedPlans.map((plan) => {
            const isCurrent = activePlan?.tier === plan.tier;
            const isPro = plan.tier === "PRO";

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all duration-200 ${
                  isPro ? "border-primary/50 ring-primary/20 shadow-md ring-2" : "border-border/80"
                } ${isCurrent ? "bg-primary/5" : ""}`}
              >
                {isPro && (
                  <div className="from-primary absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r to-indigo-600 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-white uppercase shadow-sm">
                    Most Popular
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="min-h-[40px] text-xs">
                    {plan.description}
                  </CardDescription>

                  <div className="pt-2">
                    <div className="text-3xl font-extrabold">
                      ${billingInterval === "ANNUALLY" ? Math.round(plan.price / 12) : plan.price}
                      <span className="text-muted-foreground text-sm font-normal">/mo</span>
                    </div>
                    {billingInterval === "ANNUALLY" && plan.price > 0 && (
                      <div className="text-muted-foreground text-xs">
                        ${plan.price} billed annually
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="border-border/40 space-y-3 border-t pt-4 text-sm">
                  <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Included Quotas:
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Up to {plan.limits.maxMembers} Team Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Up to {plan.limits.maxCustomers} Clients CRM</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Up to {plan.limits.maxProjects} Active Projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Up to {plan.limits.maxServices} Catalog Services</span>
                  </div>

                  <div className="text-muted-foreground pt-2 text-xs font-semibold tracking-wider uppercase">
                    Features:
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Client Self-Service Portal 2.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Online Appointments & Invoicing</span>
                  </div>
                  {plan.features.hasFlowRules ? (
                    <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>FlowRules Automated Workflows</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground/60 flex items-center gap-2 text-xs line-through">
                      <Zap className="h-4 w-4 opacity-40" />
                      <span>FlowRules Automations</span>
                    </div>
                  )}
                  {plan.features.hasCustomDomain ? (
                    <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span>Custom Domain & White-labeling</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground/60 flex items-center gap-2 text-xs line-through">
                      <Globe className="h-4 w-4 opacity-40" />
                      <span>Custom Domain</span>
                    </div>
                  )}
                  {plan.features.hasRecurring ? (
                    <div className="text-foreground flex items-center gap-2 text-xs font-medium">
                      <Repeat className="h-4 w-4 text-indigo-500" />
                      <span>Recurring Invoicing & Retainers</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground/60 flex items-center gap-2 text-xs line-through">
                      <Repeat className="h-4 w-4 opacity-40" />
                      <span>Recurring Retainers</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={isPro ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleCheckoutOrSwitch(plan)}
                      disabled={
                        !isOwner ||
                        checkoutMutation.isPending ||
                        changePlanMutation.isPending ||
                        upgradingSlug === plan.slug
                      }
                    >
                      {upgradingSlug === plan.slug ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          Connecting to Stripe...
                        </>
                      ) : isOwner ? (
                        plan.price > (activePlan?.price || 0) ? (
                          "Upgrade Plan"
                        ) : (
                          "Switch Plan"
                        )
                      ) : (
                        "Owner Required"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Invoices & Billing History */}
      <div id="billing-history-section" className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-bold">Billing History & Receipts</h2>
          <p className="text-muted-foreground text-sm">
            Past payments and tax receipts for your FlowPilot subscription.
          </p>
        </div>

        <Card className="border-border/80">
          <CardContent className="p-0">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CreditCard className="text-muted-foreground/50 mb-2 h-10 w-10" />
                <p className="text-sm font-medium">No billing records found</p>
                <p className="text-muted-foreground text-xs">
                  Invoices and payment receipts will appear here after your first billing cycle.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground border-border/80 border-b text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Invoice ID</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/60 divide-y">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          ${record.amount.toFixed(2)} {record.currency}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={record.status === "PAID" ? "success" : "destructive"}
                            className="text-[10px]"
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                          {record.stripeInvoiceId || record.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {record.invoicePdfUrl ? (
                            <a
                              href={record.invoicePdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
                            >
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. Cancel Subscription Confirmation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to cancel your {activePlan?.name} subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="text-foreground/80 space-y-3 py-2 text-sm">
            <p>
              Your subscription will remain active until the end of your billing cycle on{" "}
              <span className="font-semibold">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "period end"}
              </span>
              .
            </p>
            <p className="text-muted-foreground text-xs">
              Zero Data Loss Guarantee: Your existing records, invoices, clients, and services will
              not be deleted upon cancellation.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Canceling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
