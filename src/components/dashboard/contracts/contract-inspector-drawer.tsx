"use client";

import * as React from "react";
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileSignature,
  Eye,
  CheckCircle2,
  FileCheck2,
  Send,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContractItem, ContractStatus } from "@/features/contracts/types";
import { ContractDocumentPaper } from "./contract-document-paper";
import { printElementById } from "@/lib/utils/print";

interface ContractInspectorDrawerProps {
  contract: ContractItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCountersign?: (contract: ContractItem) => void;
  onSendContract?: (contract: ContractItem) => void;
}

export function ContractInspectorDrawer({
  contract,
  isOpen,
  onClose,
  onOpenCountersign,
  onSendContract,
}: ContractInspectorDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"document" | "audit">("document");
  const [isCopied, setIsCopied] = React.useState(false);

  // Close on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contract) return null;

  const handleCopyLink = () => {
    if (!contract.signToken) return;
    const url = `${window.location.origin}/sign/${contract.signToken}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    printElementById(
      "contract-inspector-print-paper",
      `${contract.contractNumber}-${contract.title.replace(/\s+/g, "_")}`
    );
  };

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Draft Document
          </span>
        );
      case "PENDING_SIGNATURE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Awaiting Signature
          </span>
        );
      case "VIEWED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Eye className="h-3 w-3" />
            Viewed by Client
          </span>
        );
      case "SIGNED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Signed (Needs Countersign)
          </span>
        );
      case "COUNTERSIGNED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/50 bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fully Finalized & Sealed
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            Declined by Client
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Drawer Container */}
      <div className="flex h-full w-full max-w-4xl flex-col bg-slate-50 shadow-2xl transition-transform dark:bg-slate-950">
        {/* Drawer Header */}
        <div className="border-border bg-card border-b px-4 py-3 shadow-sm sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 sm:h-10 sm:w-10">
                <FileSignature className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {contract.contractNumber}
                  </span>
                  {getStatusBadge(contract.status)}
                </div>
                <h2 className="text-foreground line-clamp-1 text-sm font-bold tracking-tight sm:line-clamp-none sm:text-lg">
                  {contract.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex min-h-[36px] min-w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-xl p-2 transition-colors"
              aria-label="Close Contract Inspector"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Toolbar (Smart Non-Scrolling Responsive Layout) */}
          <div className="mt-3 space-y-2">
            {/* Primary Action Button (If action required) */}
            {contract.status === "SIGNED" && onOpenCountersign && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenCountersign(contract);
                }}
                className="h-9 w-full cursor-pointer justify-center gap-2 bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 sm:w-auto"
              >
                <FileSignature className="h-4 w-4" />
                <span>Countersign & Finalize Agreement</span>
              </Button>
            )}

            {contract.status === "DRAFT" && onSendContract && (
              <Button
                size="sm"
                onClick={() => onSendContract(contract)}
                className="h-9 w-full cursor-pointer justify-center gap-2 bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                <span>Send to Client for Signature</span>
              </Button>
            )}

            {/* Utility Quick Actions Grid (Never overflows, perfectly fills mobile width) */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8.5 flex-1 cursor-pointer justify-center gap-1.5 text-xs font-semibold hover:border-blue-500/40 sm:flex-none"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </Button>

              {contract.signToken && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-8.5 flex-1 cursor-pointer justify-center gap-1.5 text-xs font-semibold sm:flex-none"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>

                  <a
                    href={`/sign/${contract.signToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8.5 w-full cursor-pointer justify-center gap-1.5 border-blue-500/30 text-xs font-semibold text-blue-600 hover:bg-blue-50/50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Sign Page</span>
                    </Button>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation (Full-Width 2-Segment Control - Never Overflows / No Scroll) */}
        <div className="border-border bg-card border-b px-4 py-2 sm:px-6">
          <div className="bg-muted/60 grid grid-cols-2 gap-1 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab("document")}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                activeTab === "document"
                  ? "bg-background text-blue-600 shadow-sm dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSignature className="h-3.5 w-3.5" />
              <span>Agreement</span>
              <span className="hidden sm:inline">Document</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                activeTab === "audit"
                  ? "bg-background text-emerald-600 shadow-sm dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Audit Trail</span>
              <span className="hidden sm:inline">& Security</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-6">
          {activeTab === "document" ? (
            <div className="mx-auto max-w-3xl">
              <ContractDocumentPaper
                contract={contract}
                elementId="contract-inspector-print-paper"
              />
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-6">
              {/* Checksum Badge */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Cryptographic SHA-256 Audit Seal
                    </h3>
                    <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                      This document contains a tamper-evident cryptographic hash recorded at
                      execution. Any mutation to the underlying agreement clauses invalidates the
                      seal.
                    </p>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-500/15 p-2 font-mono text-xs text-emerald-950 dark:text-emerald-200">
                      <span className="truncate">
                        {contract.contentChecksum || "Generated upon signature"}
                      </span>
                      {contract.contentChecksum && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(contract.contentChecksum!);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="ml-2 shrink-0 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Events Timeline */}
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">
                  Lifecycle Audit History
                </h3>

                <div className="before:bg-border relative mt-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5">
                  {/* Event 1: Created */}
                  <div className="relative flex items-start gap-4">
                    <div className="ring-card flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-4 dark:bg-blue-950 dark:text-blue-400">
                      <FileCheck2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-bold">
                        Contract Draft Created ({contract.contractNumber})
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Drafted on {new Date(contract.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Event 2: Sent */}
                  {contract.status !== "DRAFT" && (
                    <div className="relative flex items-start gap-4">
                      <div className="ring-card flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-4 dark:bg-blue-950 dark:text-blue-400">
                        <Send className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-foreground text-xs font-bold">
                          Dispatched to {contract.customer?.name} ({contract.customer?.email})
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          Issued on {new Date(contract.issuedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Event 3: Viewed */}
                  {contract.viewedAt && (
                    <div className="relative flex items-start gap-4">
                      <div className="ring-card flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-4 dark:bg-indigo-950 dark:text-indigo-400">
                        <Eye className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-foreground text-xs font-bold">
                          Document Opened & Reviewed by Recipient
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          Timestamp: {new Date(contract.viewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Event 4: Signed */}
                  {contract.signedAt && (
                    <div className="relative flex items-start gap-4">
                      <div className="ring-card flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-foreground text-xs font-bold">
                          Legally Signed by {contract.signerName}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          Email: {contract.signerEmail} • Timestamp:{" "}
                          {new Date(contract.signedAt).toLocaleString()}
                          {contract.signerIp && ` • IP: ${contract.signerIp}`}
                        </p>
                        {contract.clientNotes && (
                          <div className="bg-muted/60 mt-2 rounded-lg p-2 text-xs italic">
                            &quot;{contract.clientNotes}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Event 5: Countersigned */}
                  {contract.countersignedAt && (
                    <div className="relative flex items-start gap-4">
                      <div className="ring-card flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-4 dark:bg-emerald-950 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-foreground text-xs font-bold">
                          Countersigned & Executed by {contract.countersignerName}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          Timestamp: {new Date(contract.countersignedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Public Portal Link */}
              {contract.signToken && (
                <div className="border-border bg-card flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <h4 className="text-foreground text-xs font-bold">Public Verification Link</h4>
                    <p className="text-muted-foreground text-[11px]">
                      Shareable URL for client signature and live execution status.
                    </p>
                  </div>
                  <a
                    href={`/sign/${contract.signToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Portal
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
