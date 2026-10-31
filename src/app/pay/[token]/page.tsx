"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  Printer,
  Calendar,
  Building2,
  AlertCircle,
  Sparkles,
  Smartphone,
  RefreshCw,
  Receipt,
  Zap,
  ChevronDown,
} from "lucide-react";
import {
  usePublicInvoice,
  useCreateCheckoutSession,
  useVerifyCheckoutSession,
  useSettleSandboxPayment,
} from "@/features/payments/use-payments";

interface PageProps {
  params: Promise<{ token: string }>;
}

interface VirtualCardProps {
  cardNumber: string;
  cardExpiry: string;
  cardHolder: string;
  brand: "visa" | "mastercard" | "amex" | "discover" | "generic";
}

function VirtualCreditCard({ cardNumber, cardExpiry, cardHolder, brand }: VirtualCardProps) {
  const cleanNumber = cardNumber.replace(/\s+/g, "");
  const padded = cleanNumber.padEnd(16, "•");
  const displayParts = [
    padded.slice(0, 4),
    padded.slice(4, 8),
    padded.slice(8, 12),
    padded.slice(12, 16),
  ];

  return (
    <div className="relative aspect-[1.586/1] w-full transform overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 p-4 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 select-none hover:scale-[1.01] sm:p-6">
      {/* Dynamic ambient lighting */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      {/* Top Row: Chip, Contactless Icon, and Card Brand Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Gold EMV Chip */}
          <div className="flex h-7 w-9 items-center justify-center rounded-md border border-amber-300/50 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-inner sm:h-8 sm:w-11">
            <div className="grid h-full w-full grid-cols-2 gap-0.5 rounded-[3px] border border-amber-800/30 opacity-80">
              <div className="border-r border-b border-amber-800/30" />
              <div className="border-b border-amber-800/30" />
              <div className="border-r border-amber-800/30" />
              <div />
            </div>
          </div>
          {/* Contactless waves */}
          <svg
            className="h-3.5 w-3.5 text-slate-300/80 sm:h-4 sm:w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.393 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        </div>

        {/* Dynamic Card Brand Badge */}
        <div className="flex h-8 items-center">
          {brand === "visa" && (
            <span className="text-base font-black tracking-wider text-blue-400 italic drop-shadow-md sm:text-xl">
              VISA
            </span>
          )}
          {brand === "mastercard" && (
            <div className="flex items-center -space-x-2">
              <div className="h-5 w-5 rounded-full bg-rose-500 shadow-sm sm:h-6 sm:w-6" />
              <div className="h-5 w-5 rounded-full bg-amber-400/90 shadow-sm sm:h-6 sm:w-6" />
            </div>
          )}
          {brand === "amex" && (
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-white shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
              AMEX
            </span>
          )}
          {brand === "discover" && (
            <span className="text-xs font-black tracking-wider text-amber-400 drop-shadow sm:text-sm">
              DISCOVER
            </span>
          )}
          {brand === "generic" && (
            <div className="flex items-center space-x-1.5 text-xs font-semibold tracking-wider text-slate-300">
              <CreditCard className="h-3.5 w-3.5 text-slate-400 sm:h-4 sm:w-4" />
              <span className="text-[9px] tracking-widest uppercase sm:text-[10px]">CARD</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Card Number with glowing embossing */}
      <div className="relative z-10 mt-4 mb-2 sm:mt-7 sm:mb-4">
        <div className="flex items-center justify-between font-mono text-xs font-bold tracking-wider text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-base sm:tracking-widest md:text-xl">
          {displayParts.map((part, idx) => (
            <span key={idx}>{part}</span>
          ))}
        </div>
      </div>

      {/* Bottom: Cardholder Name & Expiry */}
      <div className="relative z-10 flex items-end justify-between pt-1 text-xs">
        <div className="min-w-0 pr-4">
          <span className="mb-0.5 block text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
            Cardholder
          </span>
          <p className="max-w-[170px] truncate font-semibold tracking-wide text-slate-100 uppercase drop-shadow-sm">
            {cardHolder.trim() || "VALUED CLIENT"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="mb-0.5 block text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
            Expires
          </span>
          <p className="font-mono font-bold tracking-wider text-slate-100 drop-shadow-sm">
            {cardExpiry || "MM/YY"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PublicInvoiceCheckoutPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const { data: invoice, isLoading, error, refetch } = usePublicInvoice(token);
  const createCheckoutMutation = useCreateCheckoutSession(token);
  const verifyCheckoutMutation = useVerifyCheckoutSession(token);
  const settleSandboxMutation = useSettleSandboxPayment(token);

  const [verifyingSession, setVerifyingSession] = useState(false);
  const [isTestSettling, setIsTestSettling] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"card" | "apple_pay" | "bank">("card");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileBreakdown, setShowMobileBreakdown] = useState(false);

  // Auto-reconcile Stripe checkout redirect if ?status=success is present in URL
  const verifiedRef = React.useRef(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || verifiedRef.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get("status");
    const sessionIdParam = urlParams.get("session_id");

    if (statusParam === "success" && invoice && invoice.status !== "PAID") {
      verifiedRef.current = true;
      const timer = setTimeout(() => {
        setVerifyingSession(true);
        verifyCheckoutMutation
          .mutateAsync(sessionIdParam || undefined)
          .then(() => {
            refetch();
          })
          .catch((err) => {
            console.error("Session verification error:", err);
          })
          .finally(() => {
            setVerifyingSession(false);
          });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [invoice, verifyCheckoutMutation, refetch]);

  // Card brand detection
  const cardBrand = React.useMemo<"visa" | "mastercard" | "amex" | "discover" | "generic">(() => {
    const clean = cardNumber.replace(/\D/g, "");
    if (/^4/.test(clean)) return "visa";
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return "mastercard";
    if (/^3[47]/.test(clean)) return "amex";
    if (/^(6011|65|64[4-9])/.test(clean)) return "discover";
    return "generic";
  }, [cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(" ") : raw);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvc(raw);
  };

  const handleAutofillTestCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardExpiry("12/28");
    setCardCvc("888");
    if (!cardHolder && invoice?.customer?.name) {
      setCardHolder(invoice.customer.name);
    }
  };

  // Format currency helper
  const formatCurrency = (val: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(val);
  };

  // Format date helper safe for SSR
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Handle payment execution
  const handlePay = async () => {
    if (!invoice) return;

    if (selectedMethod === "bank") {
      alert(
        "Please use the bank wire transfer details displayed below. Include reference INV-" +
          invoice.invoiceNumber +
          " when initiating the wire from your banking portal."
      );
      return;
    }

    if (!invoice.paymentSettings.isStripeConnected) return;
    setIsProcessing(true);

    try {
      const session = await createCheckoutMutation.mutateAsync({});
      if (session.checkoutUrl && session.mode === "STRIPE") {
        window.location.href = session.checkoutUrl;
        return;
      }
      throw new Error("Payment session URL could not be resolved.");
    } catch (err: unknown) {
      console.error("Payment checkout error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      alert(
        axiosErr.response?.data?.message ||
          axiosErr.message ||
          "Payment checkout could not be initiated. Please verify Stripe credentials."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant sandbox test pay simulation
  const handleInstantSandboxPay = async () => {
    if (!invoice || isTestSettling) return;
    setIsTestSettling(true);
    try {
      await settleSandboxMutation.mutateAsync("card_test_4242");
      await refetch();
    } catch (err: unknown) {
      console.error("Test settlement error:", err);
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      alert(axiosErr.response?.data?.message || "Test settlement failed. Please try again.");
    } finally {
      setIsTestSettling(false);
    }
  };

  // Print invoice receipt
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading || verifyingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
              {verifyingSession ? (
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              ) : (
                <Receipt className="h-8 w-8 text-indigo-400" />
              )}
            </div>
            <RefreshCw
              className={`absolute -top-1 -right-1 h-5 w-5 animate-spin ${
                verifyingSession ? "text-emerald-400" : "text-indigo-400"
              }`}
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">
              {verifyingSession
                ? "Verifying Payment with Stripe"
                : "Loading Invoice Statement"}
            </h2>
            <p className="text-sm text-slate-400">
              {verifyingSession
                ? "Reconciling transaction ledger and confirming payment status..."
                : "Verifying secure payment session..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Invoice Not Found</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-400">
            This payment link is invalid, expired, or has been revoked by the issuing agency.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => refetch()}
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Try Again
            </button>
            <Link href="/" className="text-xs text-slate-500 transition hover:text-slate-400">
              Return to FlowPilot Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const currency = invoice.organization.currency || "USD";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Trust Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
                  {invoice.organization.name}
                </span>
                <span className="inline-flex items-center rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                  Verified Merchant
                </span>
              </div>
              <p className="text-[11px] text-slate-400">FlowPilot Secure Payment Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 sm:py-12 lg:pb-12">
        {/* Mobile-Only Collapsible Order Summary Banner (Stripe / Shopify style) */}
        <div className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 shadow-lg backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowMobileBreakdown(!showMobileBreakdown)}
              className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Receipt className="h-4 w-4" />
              <span>{showMobileBreakdown ? "Hide invoice details" : "View invoice details"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  showMobileBreakdown ? "rotate-180" : ""
                }`}
              />
            </button>
            <span className="font-mono text-base font-extrabold text-white">
              {formatCurrency(invoice.total, currency)}
            </span>
          </div>

          {showMobileBreakdown && (
            <div className="mt-4 space-y-3 border-t border-slate-800/80 pt-4 text-xs">
              <div className="space-y-2">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-300">
                    <span className="truncate pr-2">
                      {item.description} (x{item.quantity})
                    </span>
                    <span className="shrink-0 font-mono text-white">
                      {formatCurrency(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-semibold text-slate-200">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(invoice.subtotal, currency)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span>
                  <span className="font-mono">{formatCurrency(invoice.tax, currency)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Invoice Statement Breakdown (7 Cols) */}
          <section className="order-2 space-y-6 lg:order-1 lg:col-span-7">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-xl backdrop-blur sm:p-8">
              <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

              <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                    Invoice Statement
                  </span>
                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    #{invoice.invoiceNumber}
                  </h1>
                </div>

                <div>
                  {isPaid ? (
                    <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-inner">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>PAID & SETTLED</span>
                    </div>
                  ) : isOverdue ? (
                    <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/15 px-3.5 py-1.5 text-xs font-semibold text-rose-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>PAST DUE</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3.5 py-1.5 text-xs font-semibold text-amber-400">
                      <Calendar className="h-4 w-4" />
                      <span>DUE {formatDate(invoice.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Billed To / Dates Meta */}
              <div className="grid grid-cols-1 gap-6 border-b border-slate-800 py-6 text-xs sm:grid-cols-3">
                <div>
                  <span className="mb-1 block font-semibold tracking-wider text-slate-500 uppercase">
                    Billed To
                  </span>
                  <p className="text-sm font-semibold text-white">{invoice.customer.name}</p>
                  <p className="text-slate-400">{invoice.customer.email}</p>
                  {invoice.customer.company && (
                    <p className="mt-0.5 text-slate-500">{invoice.customer.company}</p>
                  )}
                </div>

                <div>
                  <span className="mb-1 block font-semibold tracking-wider text-slate-500 uppercase">
                    Issue Date
                  </span>
                  <p className="text-sm font-medium text-slate-300">
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>

                <div>
                  <span className="mb-1 block font-semibold tracking-wider text-slate-500 uppercase">
                    Due Date
                  </span>
                  <p
                    className={`text-sm font-semibold ${
                      isOverdue && !isPaid ? "text-rose-400" : "text-slate-300"
                    }`}
                  >
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="py-6">
                <h3 className="mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Rendered Services & Line Items
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase">
                        <th className="pb-3 font-semibold">Item Description</th>
                        <th className="pb-3 text-center font-semibold">Qty</th>
                        <th className="pb-3 text-right font-semibold">Rate</th>
                        <th className="pb-3 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="group">
                          <td className="py-3 pr-4 font-medium text-white">{item.description}</td>
                          <td className="px-2 py-3 text-center text-slate-400">{item.quantity}</td>
                          <td className="px-2 py-3 text-right text-slate-400">
                            {formatCurrency(item.unitPrice, currency)}
                          </td>
                          <td className="py-3 pl-4 text-right font-semibold text-white">
                            {formatCurrency(item.amount, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & Total Summary */}
                <div className="mt-6 ml-auto max-w-xs space-y-2 border-t border-slate-800 pt-6 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-white">
                      {formatCurrency(invoice.subtotal, currency)}
                    </span>
                  </div>
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Tax / VAT</span>
                      <span className="font-medium text-white">
                        {formatCurrency(invoice.tax, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-indigo-400">
                      {formatCurrency(invoice.total, currency)}
                    </span>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs text-slate-400">
                    <span className="mb-1 block font-semibold text-slate-300">Notes:</span>
                    <p className="leading-relaxed">{invoice.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Print & Action Bar */}
            <div className="flex items-center justify-between px-2 text-xs text-slate-400">
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 rounded-lg px-3 py-2 transition hover:bg-slate-900 hover:text-white"
              >
                <Printer className="h-4 w-4" />
                <span>Print Statement</span>
              </button>
              <div className="flex items-center space-x-1">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Secured by FlowPilot Financial Ledger</span>
              </div>
            </div>
          </section>

          {/* Right Column: Checkout & Payment Action (5 Cols) */}
          <aside className="order-1 space-y-6 lg:order-2 lg:col-span-5">
            {isPaid ? (
              /* Success / Receipt Card */
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
                <div className="absolute top-0 right-0 -z-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="space-y-3 border-b border-slate-800 pb-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Payment Completed!</h2>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Thank you. Your invoice #{invoice.invoiceNumber} has been settled in full. A
                    digital receipt has been logged.
                  </p>
                </div>

                <div className="space-y-3 py-6 text-xs">
                  <div className="flex justify-between border-b border-slate-800/60 py-1 text-slate-400">
                    <span>Amount Paid</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {formatCurrency(invoice.total, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 py-1 text-slate-400">
                    <span>Payment Method</span>
                    <span className="font-medium text-white">Digital Card Checkout</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 py-1 text-slate-400">
                    <span>Settled On</span>
                    <span className="font-medium text-white">
                      {formatDate(invoice.paidAt || new Date().toISOString())}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Verification Status</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Reconciled
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Official Receipt</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-500">
                    Need support? Contact {invoice.organization.name} directly.
                  </p>
                </div>
              </div>
            ) : !invoice.paymentSettings.isStripeConnected ? (
              /* Gateway Not Configured State */
              <div className="relative space-y-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-center shadow-2xl backdrop-blur sm:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10">
                  <CreditCard className="h-8 w-8 opacity-75" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Online Payment Not Active</h2>
                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400">
                    {invoice.organization.name} has not activated online credit card processing yet.
                  </p>
                </div>

                <div className="space-y-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-left text-xs">
                  <div className="flex justify-between border-b border-slate-800/60 py-1 text-slate-400">
                    <span>Total Amount Due:</span>
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(invoice.total, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 py-1 text-slate-400">
                    <span>Payment Method:</span>
                    <span className="font-medium text-slate-300">Direct Bank Transfer / Check</span>
                  </div>
                  <div className="pt-1 text-[11px] leading-relaxed text-slate-400">
                    Please contact the business directly or refer to the invoice notes to arrange
                    payment via bank wire or direct deposit.
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    <Printer className="h-4 w-4 text-slate-400" />
                    <span>Print Invoice Statement</span>
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Secured by FlowPilot Financial Ledger
                  </p>
                </div>
              </div>
            ) : (
              /* Active Checkout Form Card (When Stripe Test or Live Keys Are Configured) */
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur sm:p-8">
                {/* Balance Banner */}
                <div className="mb-6 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-4">
                  <span className="mb-1 block text-xs font-medium text-indigo-300">
                    Total Balance Due
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight text-white">
                    {formatCurrency(invoice.total, currency)}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3 text-amber-400" />
                    <span>Payment Due by {formatDate(invoice.dueDate)}</span>
                  </div>
                </div>

                {/* Method Tabs */}
                <div className="mb-6 space-y-3">
                  <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("card")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                        selectedMethod === "card"
                          ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm"
                          : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-indigo-400" />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod("apple_pay")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                        selectedMethod === "apple_pay"
                          ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm"
                          : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Smartphone className="h-5 w-5 text-indigo-400" />
                      <span>Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod("bank")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition ${
                        selectedMethod === "bank"
                          ? "border-indigo-500 bg-indigo-500/10 text-white shadow-sm"
                          : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-indigo-400" />
                      <span>Bank Wire</span>
                    </button>
                  </div>
                </div>

                {/* Method Input Details */}
                {selectedMethod === "card" && (
                  <div className="mb-6 space-y-5">
                    {/* Live Interactive Virtual Card Preview */}
                    <div className="mb-2">
                      <VirtualCreditCard
                        cardNumber={cardNumber}
                        cardExpiry={cardExpiry}
                        cardHolder={cardHolder}
                        brand={cardBrand}
                      />
                    </div>

                    <div className="space-y-3.5">
                      {/* Cardholder Name */}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-400">
                          Cardholder Full Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          autoComplete="cc-name"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white transition focus:border-indigo-500 focus:outline-none"
                          placeholder="e.g. Alex Morgan"
                        />
                      </div>

                      {/* Card Number */}
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label className="text-[11px] font-medium text-slate-400">
                            Card Number
                          </label>
                          <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                            {cardBrand.toUpperCase()}
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9\s]*"
                            autoComplete="cc-number"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pr-10 pl-3.5 font-mono text-sm tracking-wider text-white transition focus:border-indigo-500 focus:outline-none"
                            placeholder="4242 4242 4242 4242"
                          />
                          <div className="absolute top-2.5 right-3 flex items-center space-x-1.5 text-slate-400">
                            <CreditCard className="h-4 w-4 text-indigo-400" />
                          </div>
                        </div>
                      </div>

                      {/* Expiry & CVC */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-slate-400">
                            Expires (MM/YY)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 font-mono text-sm text-white transition focus:border-indigo-500 focus:outline-none"
                            placeholder="12/28"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-slate-400">
                            CVC / Security Code
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="cc-csc"
                            value={cardCvc}
                            onChange={handleCvcChange}
                            maxLength={4}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 font-mono text-sm text-white transition focus:border-indigo-500 focus:outline-none"
                            placeholder="888"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "apple_pay" && (
                  <div className="mb-6 space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 text-center shadow-inner">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Instant Biometric One-Touch Checkout
                      </p>
                      <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-slate-400">
                        Pay securely using your saved Apple Wallet or Google Pay card via Touch ID /
                        Face ID.
                      </p>
                    </div>
                  </div>
                )}

                {selectedMethod === "bank" && (
                  <div className="mb-6 space-y-2.5 rounded-xl border border-slate-800/80 bg-slate-950/80 p-4 text-xs">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <Building2 className="h-4 w-4 text-indigo-400" />
                      Direct Bank Wire Instructions:
                    </p>
                    <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900 p-2.5 font-mono text-[11px]">
                      <p className="text-slate-400">
                        Account: <span className="font-semibold text-white">0982-1200-9844-01</span>
                      </p>
                      <p className="text-slate-400">
                        Routing / Swift: <span className="font-semibold text-white">FLOWUS33</span>
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Please include reference{" "}
                      <strong className="text-indigo-400">INV-{invoice.invoiceNumber}</strong> on
                      transfer.
                    </p>
                  </div>
                )}

                {/* Stripe Test Mode Notice with 1-Click Autofill & 1-Click Instant Settle */}
                {invoice.paymentSettings.isTestMode && (
                  <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-200 shadow-inner sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start space-x-2.5">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <span className="block font-semibold text-amber-300">
                          Stripe Test Mode Active
                        </span>
                        <span className="text-[11px] text-amber-400/80">
                          Zero-risk simulation with official Stripe test credentials.
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                      <button
                        type="button"
                        onClick={handleAutofillTestCard}
                        className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/30 active:scale-95"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-300" />
                        <span>Auto-fill 4242</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleInstantSandboxPay}
                        disabled={isTestSettling}
                        className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30 active:scale-95 disabled:opacity-60"
                      >
                        {isTestSettling ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-300" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        <span>1-Click Test Settle</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Checkout Trigger Button */}
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing || isTestSettling}
                  className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-4 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition hover:from-blue-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Redirecting to Stripe Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-indigo-200" />
                      <span>
                        {selectedMethod === "bank"
                          ? "View Bank Wire Details"
                          : invoice.paymentSettings.isTestMode
                          ? "Pay in Test Mode "
                          : "Proceed to Payment "}
                        {selectedMethod !== "bank" && formatCurrency(invoice.total, currency)}
                      </span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Security Guarantee */}
                <div className="mt-4 flex items-center justify-center space-x-4 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    PCI-DSS Level 1
                  </span>
                  <span>•</span>
                  <span>End-to-End Encryption</span>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Mobile Sticky Floating Pay Bar */}
        {!isPaid && invoice.paymentSettings.isStripeConnected && (
          <div className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-3 border-t border-slate-800/90 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Total Due
              </span>
              <span className="font-mono text-base font-black text-white">
                {formatCurrency(invoice.total, currency)}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing || isTestSettling}
              className="flex shrink-0 cursor-pointer items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-indigo-200" />
                  <span>Pay Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
