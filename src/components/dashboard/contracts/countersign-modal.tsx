"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCountersignContract } from "@/features/contracts/use-contracts";
import type { ContractItem } from "@/features/contracts/types";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { PenTool, RotateCcw, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

interface CountersignModalProps {
  contract: ContractItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CountersignModal({ contract, isOpen, onClose }: CountersignModalProps) {
  const { userName } = useWorkspaceSession();
  const countersignMutation = useCountersignContract();

  const [signatureMode, setSignatureMode] = React.useState<"draw" | "type">("draw");
  const [inkColor, setInkColor] = React.useState<"#0f172a" | "#1d4ed8">("#1d4ed8");
  const [typedName, setTypedName] = React.useState("");
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const effectiveSignerName = typedName.trim() || userName || "Authorized Representative";

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
    ctx.strokeStyle = inkColor;
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
      // Generate SVG data URL for typed signature
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">
        <text x="20" y="70" font-family="'Brush Script MT', cursive, sans-serif" font-size="38" fill="#1e293b">${effectiveSignerName}</text>
      </svg>`;
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    }
  };

  const handleCountersign = async () => {
    if (!contract) return;
    const signatureData = generateSignatureDataUrl();
    if (!signatureData) return;

    await countersignMutation.mutateAsync({
      id: contract.id,
      payload: {
        countersignerName: effectiveSignerName,
        countersignatureData: signatureData,
      },
    });

    onClose();
  };

  const isSignReady = signatureMode === "draw" ? hasDrawn : typedName.trim().length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-lg overflow-y-auto rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 sm:h-10 sm:w-10 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold sm:text-lg">
                Countersign Agreement
              </DialogTitle>
              <DialogDescription className="text-xs">
                Finalize {contract?.contractNumber} with your authorized counter-signature.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Signer Full Name */}
          <div>
            <label className="text-foreground text-xs font-semibold">Authorized Full Name</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. John Doe"
              className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Mode Switcher */}
          <div className="bg-muted flex rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setSignatureMode("draw")}
              className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
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
              className={`flex-1 rounded-lg py-1.5 font-semibold transition-all ${
                signatureMode === "type"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Type Signature
            </button>
          </div>

          {/* Signature Area */}
          {signatureMode === "draw" ? (
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                <span className="text-muted-foreground text-[11px] font-semibold">
                  Select Ink Color
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setInkColor("#1d4ed8")}
                    className={`flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      inkColor === "#1d4ed8"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-400" /> Executive Navy
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkColor("#0f172a")}
                    className={`flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      inkColor === "#0f172a"
                        ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100" />{" "}
                    Charcoal Black
                  </button>
                </div>
              </div>

              <div className="border-border relative overflow-hidden rounded-xl border-2 border-dashed bg-white shadow-inner dark:bg-slate-900">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="h-[140px] w-full cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="text-muted-foreground pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-xs">
                    <PenTool className="text-muted-foreground/60 mb-1 h-4 w-4" />
                    <span>Draw your authorized signature here</span>
                    <span className="text-muted-foreground/50 mt-0.5 text-[10px]">
                      Mouse, stylus, or touch
                    </span>
                  </div>
                )}
                {/* Subtle Baseline */}
                <div className="pointer-events-none absolute right-8 bottom-5 left-8 flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700">
                  <span className="-mt-3.5 font-mono text-[8px] text-slate-400">
                    X Authorized Officer
                  </span>
                </div>
              </div>
              <div className="mt-1 flex justify-end">
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
            <div className="border-border bg-muted/20 flex h-[140px] items-center justify-center rounded-xl border border-dashed p-4">
              <span className="text-foreground font-serif text-3xl tracking-wide italic">
                {effectiveSignerName}
              </span>
            </div>
          )}

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cryptographic Binding</span>
            </div>
            <p className="text-muted-foreground mt-0.5">
              Countersigning completes the contract and permanently locks the document state with an
              immutable SHA-256 certificate.
            </p>
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full cursor-pointer sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!isSignReady || countersignMutation.isPending}
              onClick={handleCountersign}
              className="w-full cursor-pointer bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700 sm:w-auto"
            >
              {countersignMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Finalizing...
                </>
              ) : (
                "Confirm & Countersign"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
