"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  usePublicContract,
  useSignPublicContract,
  useDeclinePublicContract,
} from "@/features/contracts/use-contracts";
import { Button } from "@/components/ui/button";
import {
  FileSignature,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  PenTool,
  AlertCircle,
  Lock,
  Loader2,
  XCircle,
  Printer,
} from "lucide-react";
import { ContractDocumentPaper } from "@/components/dashboard/contracts/contract-document-paper";
import { printElementById } from "@/lib/utils/print";

export default function PublicContractSigningPage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";

  const { data: contract, isLoading, isError } = usePublicContract(token);
  const signMutation = useSignPublicContract(token);
  const declineMutation = useDeclinePublicContract(token);

  // Signer inputs - derived cleanly from contract data with local state override
  const [customSignerName, setCustomSignerName] = React.useState<string | null>(null);
  const [customSignerEmail, setCustomSignerEmail] = React.useState<string | null>(null);
  const signerName = customSignerName ?? contract?.customer?.name ?? "";
  const signerEmail = customSignerEmail ?? contract?.customer?.email ?? "";

  const [signatureMode, setSignatureMode] = React.useState<"draw" | "type">("draw");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [clientNotes, setClientNotes] = React.useState("");
  const [isDeclineModalOpen, setIsDeclineModalOpen] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState("");
  const [justSigned, setJustSigned] = React.useState(false);

  // Canvas state
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

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
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

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

  const generateSignatureDataUrl = (): string => {
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL("image/png") : "";
    } else {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">
        <text x="20" y="70" font-family="'Brush Script MT', cursive, sans-serif" font-size="38" fill="#0f172a">${signerName}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    }
  };

  const handleSign = async () => {
    if (!signerName.trim() || !signerEmail.trim() || !agreedToTerms) return;
    const signatureData = generateSignatureDataUrl();
    if (!signatureData) return;

    await signMutation.mutateAsync({
      signerName: signerName.trim(),
      signerEmail: signerEmail.trim(),
      signatureData,
      signatureType: signatureMode === "draw" ? "DRAWN" : "TYPED",
      clientNotes: clientNotes.trim() || null,
      agreedToTerms: true,
    });
    setJustSigned(true);
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) return;
    await declineMutation.mutateAsync(declineReason.trim());
    setIsDeclineModalOpen(false);
  };

  const handlePrint = () => {
    if (!contract) return;
    printElementById(
      "public-signing-contract-paper",
      `${contract.contractNumber}-${contract.title.replace(/\s+/g, "_")}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground mt-3 text-sm font-semibold">
            Loading secure document statement...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="border-border/80 bg-card max-w-md rounded-2xl border p-6 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-foreground mt-4 text-lg font-bold">
            Document Link Expired or Invalid
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            This contract signing link is either invalid, revoked, or has expired. Please contact
            the business to request an updated document link.
          </p>
        </div>
      </div>
    );
  }

  const isSigned =
    contract.status === "SIGNED" || contract.status === "COUNTERSIGNED" || justSigned;
  const isDeclined = contract.status === "DECLINED";
  const canSign =
    (signatureMode === "draw" ? hasDrawn : signerName.trim().length >= 2) && agreedToTerms;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-24 dark:bg-slate-950">
      {/* Top Formal Sticky Header */}
      <header className="border-border/60 bg-background/95 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-500/20">
              FP
            </div>
            <div>
              <span className="text-foreground text-xs font-bold">
                {contract.organization.name}
              </span>
              <p className="text-muted-foreground font-mono text-[10px]">
                Ref: {contract.contractNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="cursor-pointer gap-1.5 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </Button>
            <div className="hidden items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 sm:flex dark:text-emerald-400">
              <Lock className="h-3 w-3" /> 256-bit Encrypted
            </div>
          </div>
        </div>
      </header>

      {/* Main Execution Container */}
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {/* Guiding Action Banner for Signatories */}
        {!isSigned && !isDeclined && (
          <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    Review & Complete Electronic Signature
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-blue-800/80 dark:text-blue-300/80">
                    Please carefully review the formal terms of this commercial agreement below.
                    When ready, draw or type your signature in the signature section at the bottom
                    of the page.
                  </p>
                </div>
              </div>
              <a
                href="#signature-execution-card"
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700"
              >
                <PenTool className="h-3.5 w-3.5" /> Jump to Sign ↓
              </a>
            </div>
          </div>
        )}

        {/* Status Notification Banners */}
        {isSigned && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {contract.status === "COUNTERSIGNED"
                      ? "Commercial Agreement Fully Executed & Finalized"
                      : "Client Electronic Signature Successfully Recorded"}
                  </h3>
                  <p className="mt-0.5 text-xs text-emerald-700/90 dark:text-emerald-400/90">
                    Signed by <strong>{contract.signerName || signerName}</strong> (
                    {contract.signerEmail || signerEmail})
                    {contract.signedAt && ` on ${new Date(contract.signedAt).toLocaleString()}`}.
                  </p>
                  {contract.contentChecksum && (
                    <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-emerald-800/80 dark:text-emerald-300/80">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Cryptographic Audit Checksum: {contract.contentChecksum}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handlePrint}
                className="w-full cursor-pointer gap-1.5 bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700 sm:w-auto"
              >
                <Printer className="h-4 w-4" /> Download Official PDF
              </Button>
            </div>
          </div>
        )}

        {isDeclined && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                  Document Marked as Declined
                </h3>
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">
                  This document was declined by the recipient. Contact the service provider if you
                  wish to request an updated proposal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* High-Fidelity Legal Paper Display */}
        <div className="overflow-hidden rounded-2xl shadow-2xl">
          <ContractDocumentPaper contract={contract} elementId="public-signing-contract-paper" />
        </div>

        {/* Signing Ceremony Form (Displayed Only when Not Signed and Not Declined) */}
        {!isSigned && !isDeclined && (
          <div
            id="signature-execution-card"
            className="border-border/80 bg-card mt-8 scroll-mt-20 rounded-2xl border p-4 shadow-xl sm:mt-10 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <FileSignature className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-foreground text-lg font-bold">Execute Electronic Signature</h3>
                <p className="text-muted-foreground text-xs">
                  Review the document terms above, confirm your signatory credentials, and apply
                  your legally binding electronic signature.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground text-xs font-bold">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setCustomSignerName(e.target.value)}
                    placeholder="e.g. Rakib Hussain"
                    className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border px-3 py-2.5 text-xs font-medium focus:ring-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-foreground text-xs font-bold">
                    Signatory Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setCustomSignerEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border px-3 py-2.5 text-xs font-medium focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mode Switcher */}
              <div>
                <label className="text-foreground text-xs font-bold">Signature Method</label>
                <div className="bg-muted mt-1 flex max-w-xs rounded-xl p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignatureMode("draw")}
                    className={`flex-1 cursor-pointer rounded-lg py-1.5 font-bold transition-all ${
                      signatureMode === "draw"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode("type")}
                    className={`flex-1 cursor-pointer rounded-lg py-1.5 font-bold transition-all ${
                      signatureMode === "type"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Type Signature
                  </button>
                </div>
              </div>

              {/* Signature Canvas / Preview */}
              {signatureMode === "draw" ? (
                <div>
                  <div className="border-border relative overflow-hidden rounded-2xl border-2 border-dashed bg-white shadow-inner dark:bg-slate-900">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={170}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="h-[170px] w-full cursor-crosshair touch-none"
                    />
                    {!hasDrawn && (
                      <div className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium">
                        <PenTool className="text-muted-foreground/60 mr-1.5 h-4 w-4" />
                        Draw your signature inside this box
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-[11px] font-semibold"
                    >
                      <RotateCcw className="h-3 w-3" /> Clear canvas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-border flex h-[170px] items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50 p-4 dark:bg-slate-900">
                  <span className="font-serif text-4xl tracking-wide text-slate-900 italic sm:text-5xl dark:text-slate-100">
                    {signerName || "Your Digital Signature"}
                  </span>
                </div>
              )}

              {/* Optional Notes */}
              <div>
                <label className="text-muted-foreground text-xs font-semibold">
                  Closing Notes or PO Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="e.g. Approved under PO-2026-X, deliverables assigned to Q4 sprint..."
                  className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border p-2.5 text-xs focus:ring-2 focus:outline-none"
                />
              </div>

              {/* Legal Agreement Checkbox */}
              <div className="border-border/80 bg-muted/40 rounded-xl border p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="border-border mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-muted-foreground text-xs leading-normal">
                    I confirm that I have reviewed the entirety of this commercial agreement,
                    understand its provisions, and agree that my electronic signature constitutes a
                    legally binding execution under ESIGN (15 U.S.C. § 7001) and UETA regulations.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse justify-between gap-3 pt-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setIsDeclineModalOpen(true)}
                  className="cursor-pointer text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline"
                >
                  Decline this agreement
                </button>

                <Button
                  size="lg"
                  disabled={!canSign || signMutation.isPending}
                  onClick={handleSign}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                >
                  {signMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Cryptographic
                      Audit Seal...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Sign & Legally Execute Agreement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Decline Reason Modal */}
        {isDeclineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl">
              <h3 className="text-foreground text-base font-bold">Decline Agreement</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Please provide a brief reason for declining this contract so the business can
                address your concerns.
              </p>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Terms on section 3 need revision..."
                className="border-input bg-background text-foreground mt-3 w-full rounded-xl border p-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="mt-4 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="w-full cursor-pointer sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!declineReason.trim() || declineMutation.isPending}
                  onClick={handleDecline}
                  className="w-full cursor-pointer bg-rose-600 font-bold text-white hover:bg-rose-700 sm:w-auto"
                >
                  {declineMutation.isPending ? "Submitting..." : "Confirm Decline"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
