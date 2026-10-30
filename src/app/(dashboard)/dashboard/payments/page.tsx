"use client";

import * as React from "react";
import {
  CreditCard,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Key,
  Copy,
  Check,
  Receipt,
  RefreshCw,
  Eye,
  EyeOff,
  Share2,
  SlidersHorizontal,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  usePaymentSettings,
  useUpdatePaymentSettings,
  usePaymentTransactions,
} from "@/features/payments/use-payments";
import { useInvoices } from "@/features/invoices/use-invoices";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { SharePaymentLinkModal } from "@/components/dashboard/invoices/share-payment-link-modal";
import type { PaymentSettings } from "@/features/payments/types";
import type { InvoiceListItem } from "@/features/invoices/types";

// Tab Types
type PaymentTab = "ledger" | "gateways" | "links" | "rules";

interface GatewayFormProps {
  settings: PaymentSettings;
  onRefetch: () => void;
}

function GatewaySettingsForm({ settings, onRefetch }: GatewayFormProps) {
  const updateSettingsMutation = useUpdatePaymentSettings();

  const [publishableKey, setPublishableKey] = React.useState(settings.stripePublishableKey || "");
  const [secretKey, setSecretKey] = React.useState("");
  const [webhookSecret, setWebhookSecret] = React.useState("");
  const [isTestMode, setIsTestMode] = React.useState(settings.isTestMode ?? true);
  const [defaultCurrency, setDefaultCurrency] = React.useState(settings.defaultCurrency || "USD");
  const [allowPartial, setAllowPartial] = React.useState(settings.allowPartialPayments ?? false);

  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);
  const [copiedTestCard, setCopiedTestCard] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync({
        stripePublishableKey: publishableKey.trim() || undefined,
        stripeSecretKey: secretKey.trim() || undefined,
        stripeWebhookSecret: webhookSecret.trim() || undefined,
        isTestMode,
        defaultCurrency,
        allowPartialPayments: allowPartial,
      });
      setSaveSuccess(true);
      setSecretKey("");
      setWebhookSecret("");
      onRefetch();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save gateway settings:", err);
    }
  };

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== "undefined"
      ? `${window.location.origin.replace(":3000", ":4000")}/api/v1`
      : "http://localhost:4000/api/v1");

  const webhookUrl = `${apiBase.replace(/\/+$/, "")}/payments/webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const isConfigured = Boolean(settings.stripePublishableKey && settings.hasSecretKey);

  return (
    <div className="space-y-6">
      {/* Gateway Status Banner */}
      <Card className="border-border/80 bg-surface/90">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold sm:text-base">
              Stripe Gateway & Checkout Engine
            </CardTitle>
            <CardDescription className="text-xs">
              Configure Stripe Connect live processing, customer credit cards, Apple Pay, and
              webhook listeners.
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center">
            {isTestMode ? (
              <Badge className="gap-1.5 border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-amber-500">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
                Sandbox Test Mode
              </Badge>
            ) : isConfigured ? (
              <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-emerald-500">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Live Gateway Active
              </Badge>
            ) : (
              <Badge className="gap-1.5 border-slate-500/30 bg-slate-500/10 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-400">
                <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-slate-400"></span>
                Setup Required
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3.5 text-xs sm:space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Every invoice in FlowPilot is equipped with a cryptographically verified public portal
            at{" "}
            <code className="text-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]">
              /pay/[token]
            </code>
            . Clients can settle statements instantly via Apple Pay, Google Pay, or Card without
            logging in.
          </p>

          {/* Interactive Sandbox Switch Box */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 sm:p-4">
            <div className="min-w-0 space-y-0.5">
              <span className="text-foreground text-xs font-semibold">
                Interactive Sandbox Test Mode
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Simulate instant client checkouts and payment reconciliations with zero real
                charges.
              </p>
            </div>
            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer bg-muted peer-checked:bg-primary after:border-border after:bg-card peer-checked:after:border-card h-6 w-11 shrink-0 rounded-full peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {/* Test Mode Sandbox Quick-Start Assistant */}
          {isTestMode && (
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3.5 transition-all sm:p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" />
                    <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                      Stripe Test Mode Quick-Start Helper
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Test payments work out of the box. Use standard card{" "}
                    <code className="text-foreground bg-muted/80 border-border/50 rounded border px-1.5 py-0.5 font-mono font-bold whitespace-nowrap">
                      4242 •••• •••• 4242
                    </code>
                    , any future MM/YY (e.g.{" "}
                    <span className="text-foreground font-mono font-semibold whitespace-nowrap">
                      12/28
                    </span>
                    ), and any 3 digits (e.g.{" "}
                    <span className="text-foreground font-mono font-semibold whitespace-nowrap">
                      888
                    </span>
                    ).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("4242424242424242");
                    setCopiedTestCard(true);
                    setTimeout(() => setCopiedTestCard(false), 2000);
                  }}
                  className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-400 shadow-2xs transition hover:bg-amber-500/25 active:scale-95 sm:w-auto sm:py-1.5"
                >
                  {copiedTestCard ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedTestCard ? "Card Copied!" : "Copy 4242 Card"}</span>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys Configuration Card */}
      <form onSubmit={handleSave}>
        <Card className="border-border/80 bg-surface/90">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stripe API Credentials & Keys</CardTitle>
            <CardDescription className="text-xs">
              Live keys are securely encrypted and isolated to your tenant organization.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Publishable Key */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Stripe Publishable Key</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="pk_test_... or pk_live_..."
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  className="pr-10 font-mono text-xs"
                />
                <Key className="text-muted-foreground absolute top-2.5 right-3 h-4 w-4" />
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Stripe Secret Key</Label>
                {settings.hasSecretKey && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <ShieldCheck className="h-3 w-3" /> Secret Key Configured
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showSecretKey ? "text" : "password"}
                  placeholder={
                    settings.hasSecretKey
                      ? "••••••••••••••••••••••••••••••••"
                      : "sk_test_... or sk_live_..."
                  }
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Leave blank to keep existing configured secret key.
              </p>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Stripe Webhook Signing Secret</Label>
                {settings.hasWebhookSecret && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <ShieldCheck className="h-3 w-3" /> HMAC Signature Guard Active
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showWebhookSecret ? "text" : "password"}
                  placeholder={
                    settings.hasWebhookSecret ? "••••••••••••••••••••••••••••••••" : "whsec_..."
                  }
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 cursor-pointer"
                >
                  {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Currency & Preferences */}
            <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Default Billing Currency</Label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="bg-background border-border text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="CAD">CAD ($) — Canadian Dollar</option>
                  <option value="AUD">AUD ($) — Australian Dollar</option>
                  <option value="BDT">BDT (৳) — Bangladeshi Taka</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Partial Invoice Payments</Label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="paymentsAllowPartial"
                    checked={allowPartial}
                    onChange={(e) => setAllowPartial(e.target.checked)}
                    className="border-border h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="paymentsAllowPartial"
                    className="text-muted-foreground cursor-pointer text-xs"
                  >
                    Permit clients to make incremental split payments
                  </label>
                </div>
              </div>
            </div>

            {/* Webhook Endpoint Copy */}
            <div className="pt-2">
              <Label className="mb-1.5 block text-xs font-medium">
                Stripe Dashboard Webhook Endpoint URL
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="bg-muted/40 border-border/80 text-muted-foreground flex-1 rounded-xl border px-3.5 py-2 font-mono text-xs break-all sm:truncate">
                  {webhookUrl}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyWebhook}
                  className="w-full shrink-0 cursor-pointer justify-center gap-1.5 rounded-xl text-xs font-semibold sm:w-auto"
                >
                  {copiedWebhook ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedWebhook ? "Copied" : "Copy"}</span>
                </Button>
              </div>
              <p className="text-muted-foreground mt-1 text-[11px]">
                Add this endpoint in your Stripe Dashboard under Developers → Webhooks with event{" "}
                <code className="bg-muted rounded px-1 text-[10px]">
                  checkout.session.completed
                </code>
                .
              </p>
            </div>
          </CardContent>

          <CardFooter className="border-border/80 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Payment settings saved successfully!
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="w-full cursor-pointer rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

const emptySubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function PaymentsDashboardPage() {
  const { organizationId } = useWorkspaceSession();
  const [activeTab, setActiveTab] = React.useState<PaymentTab>("ledger");
  const [shareInvoice, setShareInvoice] = React.useState<InvoiceListItem | null>(null);
  const mounted = useIsClient();

  // Queries
  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = usePaymentSettings(organizationId);
  const {
    data: transactionsData,
    isLoading: isLoadingTx,
    refetch: refetchTx,
  } = usePaymentTransactions(undefined, organizationId);
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices(
    { limit: 50 },
    organizationId
  );

  const isTxLoading = mounted && isLoadingTx;
  const isSettingsLoading = mounted && (isLoadingSettings || !settings);
  const isInvoicesLoading = mounted && isLoadingInvoices;

  // Financial Metrics calculations
  const transactions = transactionsData?.transactions || [];
  const settledTransactions = transactions.filter((tx) => tx.status === "SUCCESS");
  const grossVolume = settledTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  const currency = settings?.defaultCurrency || "USD";

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(val);
  };

  const handleRefreshAll = () => {
    refetchSettings();
    refetchTx();
  };

  return (
    <div className="max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Online Payments & Treasury Hub"
          description="Manage online customer checkout portals, Stripe Connect gateways, and multi-tenant settlement ledgers."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="border-border cursor-pointer gap-1.5 rounded-xl text-xs font-semibold shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh Ledger</span>
          </Button>
        </div>
      </div>

      {/* Financial Pulse KPI Bar */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Metric 1: Gross Volume */}
        <Card className="border-border/80 bg-surface/90 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <CardContent className="space-y-1.5 p-3.5 sm:space-y-2 sm:p-4.5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium sm:text-xs">
              <span className="truncate pr-1">Gross Settled</span>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 sm:h-8 sm:w-8 sm:rounded-xl">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="text-foreground font-mono text-lg font-black tracking-tight sm:text-2xl">
              {formatCurrency(grossVolume)}
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <span className="font-semibold text-emerald-500">{settledTransactions.length}</span>{" "}
                cleared
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500 sm:px-2 sm:text-[10px]">
                <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> Audited
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Net Payout Cleared */}
        <Card className="border-border/80 bg-surface/90 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <CardContent className="space-y-1.5 p-3.5 sm:space-y-2 sm:p-4.5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium sm:text-xs">
              <span className="truncate pr-1">Net Cleared</span>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 sm:h-8 sm:w-8 sm:rounded-xl">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="text-foreground font-mono text-lg font-black tracking-tight sm:text-2xl">
              {formatCurrency(grossVolume * 0.971)}
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground truncate">Est. net</span>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-500 sm:px-2 sm:text-[10px]">
                ~97.1% Yield
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Gateways */}
        <Card className="border-border/80 bg-surface/90 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <CardContent className="space-y-1.5 p-3.5 sm:space-y-2 sm:p-4.5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium sm:text-xs">
              <span className="truncate pr-1">Gateway</span>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 sm:h-8 sm:w-8 sm:rounded-xl">
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="text-foreground text-xs font-bold sm:text-sm">
              {settings?.isTestMode ? (
                <div className="flex items-center gap-1.5 text-amber-500">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  </span>
                  <span className="truncate">Sandbox</span>
                </div>
              ) : settings?.stripeConnected ? (
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="truncate">Live Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-slate-400"></span>
                  <span className="truncate">Setup Needed</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground truncate text-[10px] sm:text-[11px]">
              Cards & Apple Pay
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Conversion Rate */}
        <Card className="border-border/80 bg-surface/90 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <CardContent className="space-y-1.5 p-3.5 sm:space-y-2 sm:p-4.5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium sm:text-xs">
              <span className="truncate pr-1">Settlement</span>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 sm:h-8 sm:w-8 sm:rounded-xl">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="text-foreground font-mono text-lg font-black tracking-tight sm:text-2xl">
              {transactions.length > 0
                ? `${Math.round((settledTransactions.length / transactions.length) * 100)}%`
                : "100%"}
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="text-muted-foreground truncate">Automated</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500 sm:px-2 sm:text-[10px]">
                <ShieldCheck className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> HMAC
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-border/80 flex items-center gap-2 overflow-x-auto border-b pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "ledger"
              ? "bg-foreground text-background shadow-2xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Transactions Ledger</span>
          {transactions.length > 0 && (
            <span className="py-0.2 bg-primary/20 text-primary rounded-full px-1.5 font-mono text-[10px]">
              {transactions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gateways")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "gateways"
              ? "bg-foreground text-background shadow-2xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4 text-indigo-400" />
          <span>Gateway Integrations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "links"
              ? "bg-foreground text-background shadow-2xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <Share2 className="h-4 w-4 text-emerald-400" />
          <span>Active Pay Portals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "rules"
              ? "bg-foreground text-background shadow-2xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          <span>Settlement Rules</span>
        </button>
      </div>

      {/* Tab 1: Transaction Ledger */}
      {activeTab === "ledger" && (
        <Card className="border-border/80 bg-surface/90 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Payment Transaction Ledger</CardTitle>
            <CardDescription className="text-xs">
              Live audit trail of all online checkouts, gateway payment references, and
              reconciliation timestamps.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isTxLoading ? (
              <div className="flex h-36 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="space-y-3 py-12 text-center">
                <div className="bg-muted/40 border-border text-muted-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border">
                  <Receipt className="h-6 w-6" />
                </div>
                <h4 className="text-foreground text-sm font-semibold">
                  No Transactions Recorded Yet
                </h4>
                <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
                  When clients pay via their hosted statement portal at{" "}
                  <code className="text-foreground bg-muted rounded px-1 text-[11px]">
                    /pay/[token]
                  </code>
                  , instant settlements and audit trails will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-border/60 text-muted-foreground border-b text-[10px] uppercase">
                      <th className="pb-3 font-semibold">Invoice #</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Gateway Provider</th>
                      <th className="pb-3 font-semibold">Gateway Reference</th>
                      <th className="pb-3 text-right font-semibold">Settled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/40 divide-y">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/20">
                        <td className="text-foreground py-3.5 font-mono font-semibold">
                          #{tx.invoiceNumber}
                        </td>
                        <td className="text-foreground py-3.5 font-medium">{tx.customerName}</td>
                        <td className="text-foreground py-3.5 font-mono font-bold">
                          ${tx.amount.toFixed(2)} {tx.currency}
                        </td>
                        <td className="py-3.5">
                          {tx.status === "SUCCESS" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                              <CheckCircle2 className="h-3 w-3" />
                              Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                              {tx.status}
                            </span>
                          )}
                        </td>
                        <td className="text-muted-foreground py-3.5 font-mono text-[11px]">
                          {tx.provider}
                        </td>
                        <td className="text-muted-foreground max-w-[140px] truncate py-3.5 font-mono text-[11px]">
                          {tx.gatewayReference || "—"}
                        </td>
                        <td className="text-muted-foreground py-3.5 text-right">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Gateway Integrations */}
      {activeTab === "gateways" && (
        <>
          {isSettingsLoading || !settings ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <GatewaySettingsForm
              key={settings.id + (settings.updatedAt || "")}
              settings={settings}
              onRefetch={refetchSettings}
            />
          )}
        </>
      )}

      {/* Tab 3: Active Pay Portals Directory */}
      {activeTab === "links" && (
        <Card className="border-border/80 bg-surface/90 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Hosted Client Checkout Links</CardTitle>
            <CardDescription className="text-xs">
              Direct checkout portals generated for clients. Share via WhatsApp, Email, or dynamic
              QR code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isInvoicesLoading ? (
              <div className="flex h-36 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : !invoicesData || invoicesData.invoices.length === 0 ? (
              <div className="space-y-2 py-12 text-center">
                <Receipt className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-foreground text-xs font-semibold">No Invoices Found</p>
                <p className="text-muted-foreground text-[11px]">
                  Create an invoice first to generate hosted checkout portals.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-border/60 text-muted-foreground border-b text-[10px] uppercase">
                      <th className="pb-3 font-semibold">Invoice #</th>
                      <th className="pb-3 font-semibold">Client</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Due Schedule</th>
                      <th className="pb-3 text-right font-semibold">Quick Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border/40 divide-y">
                    {invoicesData.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/20">
                        <td className="text-foreground py-3 font-mono font-semibold">
                          #{inv.invoiceNumber}
                        </td>
                        <td className="py-3">
                          <p className="text-foreground font-medium">{inv.customerName}</p>
                          <p className="text-muted-foreground text-[11px]">{inv.customerEmail}</p>
                        </td>
                        <td className="text-foreground py-3 font-mono font-bold">
                          ${inv.total.toFixed(2)}
                        </td>
                        <td className="py-3">
                          {inv.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                              <CheckCircle2 className="h-3 w-3" />
                              Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="text-muted-foreground py-3">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShareInvoice(inv)}
                            className="border-border cursor-pointer gap-1.5 rounded-xl text-xs font-semibold hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Share2 className="h-3.5 w-3.5 text-blue-600" />
                            <span>Share Portal</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Settlement & Deposit Rules */}
      {activeTab === "rules" && (
        <Card className="border-border/80 bg-surface/90 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Treasury & Settlement Policies
            </CardTitle>
            <CardDescription className="text-xs">
              Configure multi-currency rules, partial split payments, and service deposit
              thresholds.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-xs">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border-border/80 bg-muted/20 space-y-2 rounded-2xl border p-4">
                <span className="text-foreground block text-sm font-semibold">
                  Advance Service Booking Deposits
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Require customers to pay a deposit (fixed or percentage) upon scheduling
                  appointments to guarantee attendance and protect against no-shows.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-500">
                    Enabled on High-Value Services
                  </Badge>
                </div>
              </div>

              <div className="border-border/80 bg-muted/20 space-y-2 rounded-2xl border p-4">
                <span className="text-foreground block text-sm font-semibold">
                  Automated Reconciliation Engine
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  When a payment succeeds, FlowPilot automatically reconciles the invoice, sets the
                  status to PAID, generates a ledger transaction, and updates dashboard cash
                  metrics.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="border-blue-500/20 bg-blue-500/10 text-[10px] text-blue-500">
                    Zero-Touch Instant Clearing
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Payment Link Modal */}
      <SharePaymentLinkModal
        invoice={shareInvoice}
        isOpen={Boolean(shareInvoice)}
        onClose={() => setShareInvoice(null)}
      />
    </div>
  );
}
