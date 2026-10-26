"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  MessageSquare,
  Mail,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useGeneratePaymentToken } from "@/features/payments/use-payments";

interface SharePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    paymentToken?: string | null;
    organizationId?: string;
  } | null;
  organizationId?: string;
}

function ShareModalContent({
  invoice,
  onClose,
  organizationId,
}: {
  invoice: NonNullable<SharePaymentLinkModalProps["invoice"]>;
  onClose: () => void;
  organizationId?: string;
}) {
  const effectiveOrgId = organizationId || invoice.organizationId;
  const generateTokenMutation = useGeneratePaymentToken(effectiveOrgId);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>(() => {
    return invoice.paymentToken ? `${origin}/pay/${invoice.paymentToken}` : "";
  });

  const handleRetry = React.useCallback(() => {
    setGenerationError(null);
    generateTokenMutation
      .mutateAsync(invoice.id)
      .then((res) => {
        if (res?.token) {
          setPaymentUrl(`${origin}/pay/${res.token}`);
        } else if (res?.paymentUrl) {
          setPaymentUrl(res.paymentUrl);
        }
      })
      .catch((err) => {
        console.error("Failed to generate token:", err);
        setGenerationError("Unable to generate link. Click to retry.");
      });
  }, [generateTokenMutation, invoice.id, origin]);

  useEffect(() => {
    let isSubscribed = true;
    if (!invoice.paymentToken) {
      generateTokenMutation
        .mutateAsync(invoice.id)
        .then((res) => {
          if (!isSubscribed) return;
          if (res?.token) {
            setPaymentUrl(`${origin}/pay/${res.token}`);
          } else if (res?.paymentUrl) {
            setPaymentUrl(res.paymentUrl);
          }
        })
        .catch((err) => {
          if (!isSubscribed) return;
          console.error("Failed to generate token:", err);
          setGenerationError("Unable to generate link. Click to retry.");
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [generateTokenMutation, invoice.id, invoice.paymentToken, origin]);

  const handleCopy = () => {
    if (!paymentUrl) return;
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello ${invoice.customerName}, your invoice #${invoice.invoiceNumber} for $${invoice.total.toFixed(
      2
    )} is ready. You can review and settle it securely online here: ${paymentUrl}`
  );

  const emailSubject = encodeURIComponent(`Invoice #${invoice.invoiceNumber} from FlowPilot`);
  const emailBody = encodeURIComponent(
    `Hi ${invoice.customerName},\n\nPlease find your secure online invoice statement below:\n${paymentUrl}\n\nTotal Due: $${invoice.total.toFixed(
      2
    )}\n\nThank you for your business!`
  );

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Share Secure Payment Portal</h3>
              <p className="text-xs text-slate-400">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Link Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Direct Client Checkout Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-ellipsis whitespace-nowrap text-slate-300">
                {generationError ? (
                  <span className="flex items-center justify-between text-rose-400">
                    <span>{generationError}</span>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex cursor-pointer items-center gap-1 font-semibold text-indigo-400 hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </button>
                  </span>
                ) : paymentUrl ? (
                  paymentUrl
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating link...
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                disabled={!paymentUrl}
                className="flex flex-shrink-0 items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Quick Sharing Channels */}
          <div className="grid grid-cols-3 gap-3">
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <MessageSquare className="h-5 w-5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`mailto:${invoice.customerEmail}?subject=${emailSubject}&body=${emailBody}`}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400"
            >
              <Mail className="h-5 w-5 text-indigo-400" />
              <span>Send Email</span>
            </a>

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition ${
                showQr
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                  : "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <QrCode className="h-5 w-5 text-indigo-400" />
              <span>{showQr ? "Hide QR" : "Show QR"}</span>
            </button>
          </div>

          {/* QR Code Display */}
          {showQr && paymentUrl && (
            <div className="animate-in fade-in flex flex-col items-center justify-center space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4 duration-200">
              <div className="rounded-xl bg-white p-3 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    paymentUrl
                  )}`}
                  alt="Payment QR Code"
                  width={144}
                  height={144}
                  className="h-36 w-36"
                  loading="lazy"
                />
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Scan with any smartphone camera to open secure checkout directly.
              </p>
            </div>
          )}

          {/* Customer Preview Action */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Zero-login hosted portal
            </span>
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                <span>Preview Checkout</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SharePaymentLinkModal({
  isOpen,
  onClose,
  invoice,
  organizationId,
}: SharePaymentLinkModalProps) {
  if (!isOpen || !invoice) return null;

  return (
    <ShareModalContent
      key={invoice.id}
      invoice={invoice}
      onClose={onClose}
      organizationId={organizationId || invoice.organizationId}
    />
  );
}
