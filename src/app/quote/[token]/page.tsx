"use client";

import React, { use, useState, useRef } from "react";
import { AlertCircle, Building2, Printer, ShieldCheck, X, PenTool, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  usePublicQuote,
  useAcceptPublicQuote,
  useDeclinePublicQuote,
} from "@/features/quotes/use-quotes";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PublicQuotePage({ params }: PageProps) {
  const { token } = use(params);
  const { data: quote, isLoading, error } = usePublicQuote(token);
  const acceptMutation = useAcceptPublicQuote(token);
  const declineMutation = useDeclinePublicQuote(token);

  // Digital Signature State
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declinedSuccess, setDeclinedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to accurately map screen coordinates to internal canvas resolution
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Canvas drawing handlers
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signerName.trim()) {
      setErrorMessage("Please enter your legal name as authorized signer.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("You must agree to the terms and payment schedule to proceed.");
      return;
    }

    let signatureData = "";
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        setErrorMessage(
          "Please draw your signature in the box provided, or switch to typed signature."
        );
        return;
      }
      signatureData = canvas.toDataURL("image/png");
    } else {
      if (!typedSignature.trim()) {
        setErrorMessage("Please type your signature.");
        return;
      }
      signatureData = typedSignature.trim();
    }

    try {
      await acceptMutation.mutateAsync({
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim() || undefined,
        signatureData,
        clientNotes: clientNotes.trim() || undefined,
      });
      setAcceptedSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit digital signature");
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await declineMutation.mutateAsync({
        reason: declineReason.trim() || undefined,
      });
      setIsDeclineModalOpen(false);
      setDeclinedSuccess(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to record response");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-muted-foreground text-xs font-medium">Securing proposal data...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="border-border w-full max-w-md space-y-4 rounded-3xl p-6 text-center">
          <div className="bg-destructive/10 text-destructive mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-foreground text-base font-semibold">Proposal Not Available</h2>
            <p className="text-muted-foreground text-xs">
              This proposal link may have expired, been revoked, or is invalid. Please contact{" "}
              {quote?.organization?.name || "the sender"} for an updated statement.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const isAlreadyAccepted = quote.status === "ACCEPTED" || acceptedSuccess;
  const isDeclined = quote.status === "DECLINED" || declinedSuccess;
  const isExpired = quote.status === "EXPIRED" && !isAlreadyAccepted;

  return (
    <div className="text-foreground min-h-screen bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950/80 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Floating Print Action (Hidden during print) */}
        <div className="flex items-center justify-between print:hidden">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            256-Bit Encrypted Client Portal
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-border h-8 gap-1.5 rounded-xl text-xs shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
          </Button>
        </div>

        {/* Accepted Banner */}
        {isAlreadyAccepted && (
          <div className="animate-in fade-in flex items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 sm:p-5 dark:text-emerald-300 print:hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Proposal Digitally Signed & Accepted</h3>
              <p className="mt-0.5 text-xs text-emerald-700/90 dark:text-emerald-400">
                Thank you! Your acceptance has been logged with audit verification. Our team has
                been notified and kickoff milestones are underway.
              </p>
            </div>
          </div>
        )}

        {/* Expired Banner */}
        {isExpired && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 print:hidden">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">
              This estimate expired on{" "}
              {quote.expiresAt
                ? new Date(quote.expiresAt).toLocaleDateString()
                : "the scheduled date"}
              . Please contact us if you would like an updated or extended statement.
            </p>
          </div>
        )}

        {/* Main Document Paper */}
        <div className="border-border/80 bg-card space-y-8 rounded-3xl border p-6 shadow-xl backdrop-blur-xs sm:p-10 print:border-none print:p-0 print:shadow-none">
          {/* Document Header */}
          <div className="border-border flex flex-col items-start justify-between gap-6 border-b pb-8 sm:flex-row">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white shadow-xs"
                  style={{ backgroundColor: quote.organization.brandColor || "#2563eb" }}
                >
                  {quote.organization.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-foreground text-lg font-bold tracking-tight">
                    {quote.organization.name}
                  </h2>
                  <p className="text-muted-foreground text-xs">{quote.organization.contactEmail}</p>
                </div>
              </div>
              {quote.organization.address && (
                <p className="text-muted-foreground text-xs whitespace-pre-line">
                  {quote.organization.address}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="bg-muted text-muted-foreground border-border inline-block rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold">
                {quote.quoteNumber}
              </span>
              <div className="text-muted-foreground text-xs">
                Issued: <strong>{new Date(quote.issuedAt).toLocaleDateString()}</strong>
              </div>
              {quote.expiresAt && (
                <div className="text-muted-foreground text-xs">
                  Valid Until: <strong>{new Date(quote.expiresAt).toLocaleDateString()}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Client & Title Header */}
          <div className="bg-muted/30 border-border/60 grid grid-cols-1 gap-6 rounded-2xl border p-5 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Prepared Specifically For
              </span>
              <h3 className="text-foreground text-base font-bold">{quote.customerName}</h3>
              {quote.customerCompany && (
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{quote.customerCompany}</span>
                </div>
              )}
              <p className="text-muted-foreground text-xs">{quote.customerEmail}</p>
            </div>

            <div className="space-y-1 md:text-right">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Investment Proposal
              </span>
              <h4 className="text-foreground text-sm font-semibold">{quote.title}</h4>
              <div className="mt-1 font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
                {quote.organization.currency} ${quote.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Introduction note if provided */}
          {quote.introduction && (
            <div className="space-y-1.5">
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Executive Overview
              </h4>
              <p className="text-foreground/90 text-xs leading-relaxed whitespace-pre-line sm:text-sm">
                {quote.introduction}
              </p>
            </div>
          )}

          {/* Deliverables Table */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Scope of Work & Deliverables
            </h4>
            <div className="border-border/80 divide-border bg-background divide-y overflow-hidden rounded-2xl border">
              <div className="bg-muted/40 text-muted-foreground grid grid-cols-12 p-3 text-[11px] font-semibold tracking-wider uppercase">
                <div className="col-span-7 sm:col-span-8">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 text-right sm:col-span-2">Amount</div>
              </div>

              {quote.items.map((it, idx) => (
                <div
                  key={it.id || idx}
                  className="grid grid-cols-12 items-center gap-2 p-3.5 text-xs"
                >
                  <div className="text-foreground col-span-7 font-medium sm:col-span-8">
                    {it.description}
                  </div>
                  <div className="text-muted-foreground col-span-2 text-center">{it.quantity}</div>
                  <div className="text-foreground col-span-3 text-right font-mono font-semibold sm:col-span-2">
                    ${it.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="bg-muted/30 border-border/80 w-full space-y-2 rounded-2xl border p-4 text-xs sm:w-72">
              <div className="text-muted-foreground flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">${quote.subtotal.toFixed(2)}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono">-${quote.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {quote.taxAmount > 0 && (
                <div className="text-muted-foreground flex justify-between">
                  <span>Tax ({quote.taxRate}%):</span>
                  <span className="font-mono">+${quote.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-border flex items-baseline justify-between border-t pt-2 text-sm font-bold">
                <span>Total Investment:</span>
                <span className="font-mono text-base text-blue-600 dark:text-blue-400">
                  {quote.organization.currency} ${quote.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {quote.terms && (
            <div className="border-border space-y-2 border-t pt-4">
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Terms & Payment Schedule
              </h4>
              <div className="bg-muted/20 border-border/60 text-muted-foreground rounded-2xl border p-4 text-xs leading-relaxed whitespace-pre-line">
                {quote.terms}
              </div>
            </div>
          )}

          {/* Digital Signature Audit (Visible if already accepted) */}
          {isAlreadyAccepted && (
            <div className="border-border space-y-3 border-t pt-6">
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Executed Electronic Signature
              </h4>
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs sm:flex-row sm:items-center">
                <div>
                  <div className="text-foreground text-sm font-semibold">
                    {quote.signerName || signerName || "Authorized Signer"}
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[11px]">
                    Accepted on{" "}
                    {quote.acceptedAt
                      ? new Date(quote.acceptedAt).toLocaleString()
                      : "Recently Accepted"}
                  </div>
                  {quote.signerIp && (
                    <div className="text-muted-foreground/80 mt-0.5 font-mono text-[10px]">
                      Audit Hash / IP: {quote.signerIp}
                    </div>
                  )}
                </div>
                {quote.signatureData?.startsWith("data:image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={quote.signatureData}
                    alt="Digital Signature"
                    className="max-h-14 max-w-[200px] border-b-2 border-slate-700 object-contain pb-1 dark:border-slate-300"
                  />
                ) : (
                  <div className="border-b-2 border-slate-700 px-4 py-2 font-serif text-lg italic dark:border-slate-300">
                    {quote.signerName || signerName}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Digital Signing Form (Interactive when open) */}
          {!isAlreadyAccepted && !isDeclined && !isExpired && (
            <div className="border-border space-y-4 border-t pt-6 print:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
                    <PenTool className="h-4 w-4 text-blue-600" /> Electronic Signature & Formal
                    Acceptance
                  </h4>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Please provide your legal name and signature below to execute this agreement.
                  </p>
                </div>
                <div className="bg-muted/60 border-border flex gap-1.5 rounded-xl border p-1">
                  <button
                    type="button"
                    onClick={() => setSignatureMode("draw")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      signatureMode === "draw"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("type")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      signatureMode === "type"
                        ? "bg-background text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Type Name
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleAccept} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Authorized Signer Name *</label>
                    <Input
                      value={signerName}
                      onChange={(e) => {
                        setSignerName(e.target.value);
                        if (signatureMode === "type") setTypedSignature(e.target.value);
                      }}
                      placeholder="e.g. Jane Doe"
                      className="h-9 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Signer Email</label>
                    <Input
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      placeholder={quote.customerEmail || "name@company.com"}
                      type="email"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">
                    Client Notes / Purchase Order # (Optional)
                  </label>
                  <Input
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="e.g. PO-84920 or special instructions"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>

                {/* Signature box */}
                {signatureMode === "draw" ? (
                  <div className="space-y-1.5">
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>Sign inside the canvas below:</span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Clear Signature
                      </button>
                    </div>
                    <div className="border-border touch-none rounded-2xl border-2 border-dashed bg-slate-50 p-2 dark:bg-slate-900/40">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="h-28 w-full cursor-crosshair rounded-xl bg-white dark:bg-slate-950"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs">Signature Preview:</label>
                    <div className="border-border bg-muted/20 flex h-20 items-center justify-center rounded-2xl border px-4">
                      <span className="text-foreground font-serif text-2xl italic">
                        {typedSignature || "Your Signature Preview"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Agreement consent checkbox */}
                <label className="flex cursor-pointer items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="border-border mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-muted-foreground text-xs leading-normal">
                    I confirm that I am authorized to execute agreements on behalf of{" "}
                    <strong>{quote.customerName}</strong> and agree to the deliverables, pricing,
                    and payment terms specified in this document.
                  </span>
                </label>

                {/* Submit buttons */}
                <div className="flex flex-col items-center justify-between gap-3 pt-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsDeclineModalOpen(true)}
                    className="text-muted-foreground hover:text-destructive text-xs transition-colors"
                  >
                    Request Revisions / Decline Proposal
                  </button>

                  <Button
                    type="submit"
                    disabled={acceptMutation.isPending}
                    className="h-10 w-full rounded-xl bg-emerald-600 px-6 py-2 font-medium text-white shadow-xs hover:bg-emerald-700 sm:w-auto"
                  >
                    {acceptMutation.isPending
                      ? "Executing Agreement..."
                      : "Accept & Digitally Sign Proposal"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Decline Feedback Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="border-border w-full max-w-md space-y-4 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-bold">Decline / Request Revisions</h3>
              <button
                onClick={() => setIsDeclineModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-muted-foreground text-xs">
              Please share any feedback or changes needed so the team can adjust the deliverables or
              pricing for you.
            </p>
            <form onSubmit={handleDecline} className="space-y-4">
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Reason for declining or requested modifications..."
                rows={4}
                className="border-input bg-background w-full rounded-xl border p-3 text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={declineMutation.isPending}
                  className="rounded-xl"
                >
                  {declineMutation.isPending ? "Submitting..." : "Confirm Decline"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
