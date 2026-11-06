"use client";

import * as React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Lock,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PortalContract, SignPortalContractInput } from "@/features/portal/types";
import { PortalSignContractModal } from "./portal-sign-contract-modal";
import { PortalContractDocumentViewer } from "./portal-contract-document-viewer";

interface PortalContractsHubProps {
  contracts: PortalContract[];
  customerName: string;
  customerEmail: string;
  brandColor?: string;
  onSignContract: (contractId: string, input: SignPortalContractInput) => Promise<void>;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function PortalContractsHub({
  contracts,
  customerName,
  customerEmail,
  brandColor = "#2563eb",
  onSignContract,
  onSuccess,
  onError,
}: PortalContractsHubProps) {
  const [selectedContractForSigning, setSelectedContractForSigning] =
    React.useState<PortalContract | null>(null);
  const [selectedContractForViewing, setSelectedContractForViewing] =
    React.useState<PortalContract | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "PENDING" | "SIGNED">("ALL");

  const pendingContracts = contracts.filter(
    (c) => c.status === "PENDING_SIGNATURE" || c.status === "VIEWED" || c.status === "DRAFT"
  );
  const signedContracts = contracts.filter(
    (c) => c.status === "SIGNED" || c.status === "COUNTERSIGNED"
  );

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "PENDING") {
      return (
        matchesSearch &&
        (c.status === "PENDING_SIGNATURE" || c.status === "VIEWED" || c.status === "DRAFT")
      );
    }
    if (statusFilter === "SIGNED") {
      return matchesSearch && (c.status === "SIGNED" || c.status === "COUNTERSIGNED");
    }
    return matchesSearch;
  });

  const handleExecuteSign = async (input: SignPortalContractInput) => {
    if (!selectedContractForSigning) return;
    try {
      await onSignContract(selectedContractForSigning.id, input);
      onSuccess(`Document ${selectedContractForSigning.contractNumber} digitally signed successfully.`);
      setSelectedContractForSigning(null);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to sign contract.");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:p-5 dark:border-slate-800/90 dark:bg-slate-900">
          <CardContent className="space-y-1 p-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Total Documents</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100">
              {contracts.length}
            </p>
            <p className="text-[11px] text-slate-400">Contracts &amp; Master Agreements</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4 shadow-2xs sm:p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
          <CardContent className="space-y-1 p-0">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span>Action Required</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-900 sm:text-2xl dark:text-amber-300">
              {pendingContracts.length}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              Awaiting your electronic signature
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-4 shadow-2xs sm:p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <CardContent className="space-y-1 p-0">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Executed &amp; Active</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-900 sm:text-2xl dark:text-emerald-300">
              {signedContracts.length}
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              Cryptographically verified &amp; sealed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contracts by title or ID..."
            className="h-10 rounded-xl bg-slate-50 pl-9 text-xs dark:bg-slate-900"
          />
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            All ({contracts.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "PENDING"
                ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Pending ({pendingContracts.length})
          </button>
          <button
            onClick={() => setStatusFilter("SIGNED")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "SIGNED"
                ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            Signed ({signedContracts.length})
          </button>
        </div>
      </div>

      {/* Contracts List / Grid */}
      {filteredContracts.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center shadow-2xs dark:border-slate-800/90 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-slate-100">
            No Contracts Found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? "No contracts match your search filter."
              : "No legal agreements have been assigned to your portal profile yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredContracts.map((contract) => {
            const isPending =
              contract.status === "PENDING_SIGNATURE" ||
              contract.status === "VIEWED" ||
              contract.status === "DRAFT";
            const isSigned =
              contract.status === "SIGNED" || contract.status === "COUNTERSIGNED";

            return (
              <Card
                key={contract.id}
                className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900"
              >
                <div className="p-5 sm:p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-500">
                          {contract.contractNumber}
                        </span>
                        {isPending && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            Action Required
                          </span>
                        )}
                        {isSigned && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <ShieldCheck className="h-3 w-3" />
                            Signed &amp; Valid
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {contract.title}
                      </h3>
                    </div>

                    <div
                      style={{
                        backgroundColor: isPending ? "#fef3c7" : "#dcfce7",
                        color: isPending ? "#b45309" : "#15803d",
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                    >
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50/80 p-3.5 text-xs dark:bg-slate-950/50">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Date Issued</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(contract.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400">Status</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {contract.status.replace("_", " ")}
                      </p>
                    </div>
                    {contract.signedAt && (
                      <div className="col-span-2 border-t border-slate-200/60 pt-2 dark:border-slate-800">
                        <span className="text-[11px] font-medium text-slate-400">
                          Signed by {contract.signerName || customerName} on
                        </span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(contract.signedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cryptographic Checksum Pill if signed */}
                  {contract.contentChecksum && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      <Lock className="h-3 w-3 shrink-0 text-emerald-600" />
                      <span className="truncate font-mono">
                        SHA-256: {contract.contentChecksum}
                      </span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="mt-5 flex items-center gap-3">
                    {isPending ? (
                      <Button
                        onClick={() => setSelectedContractForSigning(contract)}
                        style={{ backgroundColor: brandColor }}
                        className="h-10 flex-1 cursor-pointer gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/20"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Review &amp; Sign Document
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedContractForViewing(contract)}
                        className="h-10 flex-1 cursor-pointer gap-2 rounded-xl border-slate-200 text-xs font-bold shadow-2xs hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Executed Contract
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Signing Ceremony Modal */}
      {selectedContractForSigning && (
        <PortalSignContractModal
          contract={selectedContractForSigning}
          customerName={customerName}
          customerEmail={customerEmail}
          brandColor={brandColor}
          isOpen={Boolean(selectedContractForSigning)}
          onClose={() => setSelectedContractForSigning(null)}
          onSign={handleExecuteSign}
        />
      )}

      {/* View Executed Contract Modal */}
      {selectedContractForViewing && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedContractForViewing(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2.5 backdrop-blur-md sm:p-4"
        >
          <div className="relative my-auto flex max-h-[96vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl transition-all sm:rounded-3xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">
              <div className="min-w-0 space-y-0.5 pr-2">
                <span className="font-mono text-[11px] font-bold text-slate-500 sm:text-xs">
                  {selectedContractForViewing.contractNumber}
                </span>
                <h3 className="truncate text-sm font-extrabold text-slate-900 sm:text-base dark:text-slate-100">
                  {selectedContractForViewing.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContractForViewing(null)}
                className="h-8 w-8 shrink-0 cursor-pointer rounded-xl p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </Button>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto pr-0.5 sm:mt-4 sm:pr-1">
              <PortalContractDocumentViewer
                contract={selectedContractForViewing}
                customerName={customerName}
                customerEmail={customerEmail}
                brandColor={brandColor}
                showPrintAction={true}
              />
            </div>

            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3 sm:mt-4 dark:border-slate-800">
              <Button
                onClick={() => setSelectedContractForViewing(null)}
                className="h-10 w-full cursor-pointer rounded-xl px-5 font-bold sm:w-auto"
              >
                Close Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
