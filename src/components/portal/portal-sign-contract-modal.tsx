"use client";

import * as React from "react";
import {
  X,
  FileCheck2,
  PenTool,
  Type,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PortalContract, SignPortalContractInput } from "@/features/portal/types";
import {
  parseContractClauses,
  interpolateContractVariables,
  type ContractClause,
} from "@/features/contracts/utils";

interface PortalSignContractModalProps {
  contract: PortalContract;
  customerName: string;
  customerEmail: string;
  brandColor?: string;
  isOpen: boolean;
  onClose: () => void;
  onSign: (input: SignPortalContractInput) => Promise<void>;
}

/**
 * Safely format inline markdown bolding **text** without external libraries
 */
function renderFormattedInlineText(text: string) {
  if (!text) return "";
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function PortalSignContractModal({
  contract,
  customerName,
  customerEmail,
  brandColor = "#2563eb",
  isOpen,
  onClose,
  onSign,
}: PortalSignContractModalProps) {
  const [activeMobileTab, setActiveMobileTab] = React.useState<"DOCUMENT" | "SIGN">("DOCUMENT");
  const [mode, setMode] = React.useState<"CANVAS" | "TYPED">("CANVAS");
  const [signerName, setSignerName] = React.useState(customerName || "");
  const [signerEmail, setSignerEmail] = React.useState(customerEmail || "");
  const [typedSignature, setTypedSignature] = React.useState(customerName || "");
  const [clientNotes, setClientNotes] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Interpolate dynamic tags in the contract content
  const interpolatedContent = React.useMemo(() => {
    return interpolateContractVariables(contract.content, {
      clientName: signerName || customerName,
      clientEmail: signerEmail || customerEmail,
      contractNumber: contract.contractNumber,
      effectiveDate: contract.issuedAt,
      expiresDate: contract.expiresAt,
    });
  }, [
    contract.content,
    contract.contractNumber,
    contract.issuedAt,
    contract.expiresAt,
    signerName,
    signerEmail,
    customerName,
    customerEmail,
  ]);

  // Parse markdown into clean legal clauses (eliminates raw ## and ###)
  const clauses: ContractClause[] = React.useMemo(() => {
    return parseContractClauses(interpolatedContent);
  }, [interpolatedContent]);

  // Canvas ref & drawing states
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const isDrawing = React.useRef(false);
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with DPI scaling
  const setupCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0f172a";
  }, []);

  const handleClose = React.useCallback(() => {
    setErrorMsg(null);
    setHasDrawn(false);
    setAgreedToTerms(false);
    setActiveMobileTab("DOCUMENT");
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setupCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setupCanvas]);

  // Re-initialize canvas if user switches to SIGN tab on mobile
  React.useEffect(() => {
    if (activeMobileTab === "SIGN") {
      const timer = setTimeout(() => {
        setupCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeMobileTab, setupCanvas]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, handleClose]);

  // Drawing Event Handlers
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      if (!touch) return { x: 0, y: 0 };
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleStartDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ("touches" in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawing.current = true;
    const pos = getCanvasCoordinates(e);
    lastPos.current = pos;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing.current || !canvasRef.current) return;
    if ("touches" in e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const currentPos = getCanvasCoordinates(e);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    }

    lastPos.current = currentPos;
    if (!hasDrawn) setHasDrawn(true);
  };

  const handleStopDrawing = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert typed signature to dataURL
  const generateTypedSignatureDataUrl = (): string => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 500;
    tempCanvas.height = 140;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    ctx.font = "italic 38px 'Georgia', serif";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(typedSignature.trim() || signerName, 250, 70);

    return tempCanvas.toDataURL("image/png");
  };

  // Execute Submission
  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signerName.trim()) {
      setErrorMsg("Full legal name is required.");
      return;
    }
    if (!signerEmail.trim()) {
      setErrorMsg("Signer email address is required.");
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg("You must accept the electronic signature declaration to proceed.");
      return;
    }

    let finalSignatureData = "";
    if (mode === "CANVAS") {
      if (!hasDrawn || !canvasRef.current) {
        setErrorMsg("Please provide your signature drawing before submitting.");
        return;
      }
      finalSignatureData = canvasRef.current.toDataURL("image/png");
    } else {
      if (!typedSignature.trim()) {
        setErrorMsg("Please type your name in the signature field.");
        return;
      }
      finalSignatureData = generateTypedSignatureDataUrl();
    }

    try {
      setIsSubmitting(true);
      await onSign({
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim().toLowerCase(),
        signatureData: finalSignatureData,
        signatureType: mode,
        clientNotes: clientNotes.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to execute signature.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-md sm:p-4"
    >
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-4 sm:px-6 sm:py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            >
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {contract.contractNumber}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Awaiting Signature
                </span>
              </div>
              <h2 className="text-sm font-extrabold text-slate-900 sm:text-base dark:text-slate-100">
                {contract.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Tab Segmented Switcher (Visible only < lg) */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-2 lg:hidden dark:border-slate-800 dark:bg-slate-950/60">
          <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveMobileTab("DOCUMENT")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMobileTab === "DOCUMENT"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              1. Review Clauses
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab("SIGN")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMobileTab === "SIGN"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              2. Sign &amp; Accept
            </button>
          </div>
        </div>

        {/* Scrollable Document & Form Area */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12">
          {/* Document Content Paper View (Left 6 cols) */}
          <div
            className={`border-b border-slate-100 bg-slate-50/75 p-4 sm:p-6 lg:col-span-6 lg:border-r lg:border-b-0 dark:border-slate-800 dark:bg-slate-950/40 ${
              activeMobileTab === "DOCUMENT" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <FileText className="h-3.5 w-3.5" />
                Document Clauses &amp; Terms
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3" />
                Issued {new Date(contract.issuedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="max-h-[52vh] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-4 text-xs leading-relaxed text-slate-700 shadow-2xs sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <div className="space-y-3">
                {clauses.map((clause) => {
                  if (clause.type === "title") return null;

                  if (clause.type === "section" && clause.heading) {
                    return (
                      <div
                        key={clause.id}
                        className="border-b border-slate-100 pt-3 pb-1 first:pt-0 dark:border-slate-800"
                      >
                        <h3 className="font-serif text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                          {clause.heading}
                        </h3>
                      </div>
                    );
                  }

                  if (clause.type === "subsection" && clause.heading) {
                    return (
                      <div key={clause.id} className="pt-1.5">
                        <h4 className="font-sans text-xs font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
                          {clause.heading}
                        </h4>
                      </div>
                    );
                  }

                  if (clause.type === "list-item") {
                    return (
                      <div key={clause.id} className="flex items-start gap-2 pl-2 sm:pl-3">
                        <span className="shrink-0 font-mono font-bold text-slate-500">
                          {clause.number}
                        </span>
                        <div className="flex-1">
                          <span>{renderFormattedInlineText(clause.content)}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={clause.id} className="text-slate-600 dark:text-slate-300">
                      {renderFormattedInlineText(clause.content)}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Document integrity protected by SHA-256 cryptographic checksum upon completion.
              </span>
            </div>

            {/* Mobile quick action to advance to signing tab */}
            <div className="mt-4 block lg:hidden">
              <Button
                type="button"
                onClick={() => setActiveMobileTab("SIGN")}
                style={{ backgroundColor: brandColor }}
                className="w-full cursor-pointer gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md"
              >
                Proceed to Sign Document
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Signing Pad & Form (Right 6 cols) */}
          <form
            onSubmit={handleSubmitSignature}
            className={`flex flex-col justify-between p-4 sm:p-6 lg:col-span-6 ${
              activeMobileTab === "SIGN" ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Signer Identity Coordinates */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Full Legal Name *
                  </label>
                  <Input
                    required
                    value={signerName}
                    onChange={(e) => {
                      setSignerName(e.target.value);
                      if (mode === "TYPED") setTypedSignature(e.target.value);
                    }}
                    placeholder="e.g. Jane Doe"
                    className="h-10 rounded-xl bg-slate-50 text-xs font-semibold dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Signer Email Address *
                  </label>
                  <Input
                    required
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="h-10 rounded-xl bg-slate-50 text-xs font-semibold dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Mode Toggle (Canvas Draw vs Type) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Signature Method
                  </label>
                  <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setMode("CANVAS")}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                        mode === "CANVAS"
                          ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <PenTool className="h-3 w-3" />
                      Draw
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("TYPED");
                        if (!typedSignature) setTypedSignature(signerName);
                      }}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                        mode === "TYPED"
                          ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <Type className="h-3 w-3" />
                      Type
                    </button>
                  </div>
                </div>

                {/* Draw Canvas */}
                {mode === "CANVAS" && (
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white p-1 transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleStartDrawing}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDrawing}
                      onMouseLeave={handleStopDrawing}
                      onTouchStart={handleStartDrawing}
                      onTouchMove={handleDraw}
                      onTouchEnd={handleStopDrawing}
                      className="h-36 w-full cursor-crosshair touch-none rounded-xl"
                    />
                    {!hasDrawn && (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400">
                        <PenTool className="h-5 w-5 opacity-40" />
                        <span className="text-xs font-medium">Draw signature here with pen/finger</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleClearCanvas}
                      className="absolute right-2 bottom-2 flex cursor-pointer items-center gap-1 rounded-lg bg-slate-100/90 px-2 py-1 text-[10px] font-bold text-slate-600 backdrop-blur-sm transition hover:bg-slate-200 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                )}

                {/* Type Signature */}
                {mode === "TYPED" && (
                  <div className="space-y-2">
                    <Input
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Type your signature here..."
                      className="h-10 rounded-xl bg-slate-50 text-xs font-semibold dark:bg-slate-950"
                    />
                    <div className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <span className="font-serif text-2xl italic tracking-wide text-slate-900 sm:text-3xl dark:text-slate-100">
                        {typedSignature.trim() || signerName || "Signature Preview"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Client Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Notes or Inquiries (Optional)
                </label>
                <Input
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Any addendum notes or questions..."
                  className="h-9 rounded-xl bg-slate-50 text-xs dark:bg-slate-950"
                />
              </div>

              {/* Legal Electronic Signature Declaration */}
              <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 text-[11px] leading-relaxed text-slate-600 transition hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I confirm that I am <strong>{signerName || "the authorized signer"}</strong>, and I agree to be
                  legally bound by electronic record and signature under ESIGN Act &amp; applicable commercial laws.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleClose}
                className="h-11 flex-1 cursor-pointer rounded-xl font-bold sm:h-10"
              >
                Review Later
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !agreedToTerms || (mode === "CANVAS" && !hasDrawn)}
                style={{ backgroundColor: brandColor }}
                className="h-11 flex-1 cursor-pointer gap-2 rounded-xl font-bold text-white shadow-md shadow-blue-500/20 sm:h-10"
              >
                {isSubmitting ? (
                  "Cryptographically Signing..."
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Sign &amp; Accept Document
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
