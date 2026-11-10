"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileSignature,
  Plus,
  Search,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useContracts,
  useContract,
  useSendContract,
  useDeleteContract,
} from "@/features/contracts/use-contracts";
import type { ContractItem, ContractStatus } from "@/features/contracts/types";
import { CreateContractModal } from "@/components/dashboard/contracts/create-contract-modal";
import { CountersignModal } from "@/components/dashboard/contracts/countersign-modal";
import { ContractInspectorDrawer } from "@/components/dashboard/contracts/contract-inspector-drawer";
import { EmptyState } from "@/components/feedback/empty-state";

export default function ContractsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status")?.toUpperCase();
  const contractIdParam = searchParams.get("contractId");

  const validStatus =
    statusParam &&
    [
      "DRAFT",
      "PENDING_SIGNATURE",
      "VIEWED",
      "SIGNED",
      "COUNTERSIGNED",
      "DECLINED",
      "VOIDED",
    ].includes(statusParam)
      ? (statusParam as ContractStatus)
      : null;

  // Derive filter directly from searchParams (React 19 pattern)
  const activeStatusTab: "ALL" | ContractStatus = validStatus || "ALL";

  const handleSelectStatusTab = (tab: "ALL" | ContractStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "ALL") {
      params.delete("status");
    } else {
      params.set("status", tab);
    }
    const qs = params.toString();
    router.replace(`/dashboard/contracts${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const [searchQuery, setSearchQuery] = React.useState("");
  const [copiedContractId, setCopiedContractId] = React.useState<string | null>(null);

  // Modals & Inspection state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedContractForCountersign, setSelectedContractForCountersign] =
    React.useState<ContractItem | null>(null);
  const [manuallySelectedContract, setManuallySelectedContract] =
    React.useState<ContractItem | null>(null);
  const [dismissedContractId, setDismissedContractId] = React.useState<string | null>(null);

  const { data: contractsData, isLoading } = useContracts({
    status: activeStatusTab === "ALL" ? undefined : activeStatusTab,
    search: searchQuery || undefined,
  });

  const { data: directContractData } = useContract(contractIdParam || "");

  const sendMutation = useSendContract();
  const deleteMutation = useDeleteContract();

  const contracts = React.useMemo(() => contractsData?.items || [], [contractsData?.items]);
  const totalContracts = contractsData?.total || 0;

  // Derived URL-matched contract (for deep linking from notifications or direct links)
  const urlMatchedContract = React.useMemo(() => {
    if (!contractIdParam) return null;
    if (directContractData) return directContractData;
    return (
      contracts.find((c) => c.id === contractIdParam || c.contractNumber === contractIdParam) ??
      null
    );
  }, [contractIdParam, directContractData, contracts]);

  const inspectedContract =
    dismissedContractId === contractIdParam
      ? manuallySelectedContract
      : (manuallySelectedContract ?? urlMatchedContract);

  const handleOpenInspection = (contract: ContractItem) => {
    setManuallySelectedContract(contract);
    setDismissedContractId(null);
  };

  const handleCloseInspection = () => {
    setManuallySelectedContract(null);
    if (contractIdParam) {
      setDismissedContractId(contractIdParam);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("contractId");
      const qs = params.toString();
      router.replace(`/dashboard/contracts${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  };

  // Metric aggregates
  const pendingCount = contracts.filter(
    (c) => c.status === "PENDING_SIGNATURE" || c.status === "VIEWED"
  ).length;
  const readyToCountersignCount = contracts.filter((c) => c.status === "SIGNED").length;
  const finalizedCount = contracts.filter((c) => c.status === "COUNTERSIGNED").length;
  const draftCount = contracts.filter((c) => c.status === "DRAFT").length;

  const handleCopySigningLink = (contract: ContractItem) => {
    if (!contract.signToken) return;
    const url = `${window.location.origin}/sign/${contract.signToken}`;
    navigator.clipboard.writeText(url);
    setCopiedContractId(contract.id);
    setTimeout(() => setCopiedContractId(null), 2500);
  };

  const handleSendForSignature = async (contract: ContractItem) => {
    const result = await sendMutation.mutateAsync(contract.id);
    navigator.clipboard.writeText(result.signingUrl);
    setCopiedContractId(contract.id);
    setTimeout(() => setCopiedContractId(null), 2500);
  };

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="border-border bg-muted/60 text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
            Draft
          </span>
        );
      case "PENDING_SIGNATURE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            Awaiting Signature
          </span>
        );
      case "VIEWED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <Eye className="h-3 w-3" />
            Viewed by Client
          </span>
        );
      case "SIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Signed (Needs Countersign)
          </span>
        );
      case "COUNTERSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Fully Executed & Sealed
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Contracts & E-Signatures
            </h1>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              ESIGN & UETA Active
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
            Draft, dispatch, and legally execute binding commercial agreements with cryptographic
            SHA-256 digital audit trails.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full cursor-pointer justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-800 sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Draft Contract
          </Button>
        </div>
      </div>

      {/* Interactive Metrics Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Contracts */}
        <div
          onClick={() => handleSelectStatusTab("ALL")}
          className={`border-border/80 bg-card cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md ${
            activeStatusTab === "ALL" ? "border-blue-500/60 ring-2 ring-blue-500/40" : ""
          }`}
        >
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">Total Contracts</span>
            <FileSignature className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-foreground mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums">
            {totalContracts}
          </p>
          <span className="text-muted-foreground text-[10px]">All legal documents</span>
        </div>

        {/* Awaiting Signature */}
        <div
          onClick={() => handleSelectStatusTab("PENDING_SIGNATURE")}
          className={`border-border/80 bg-card cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-md ${
            activeStatusTab === "PENDING_SIGNATURE"
              ? "border-amber-500/60 ring-2 ring-amber-500/40"
              : ""
          }`}
        >
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Awaiting Signature
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-amber-600 tabular-nums dark:text-amber-400">
            {pendingCount}
          </p>
          <span className="text-muted-foreground text-[10px]">Sent to clients for review</span>
        </div>

        {/* Ready to Countersign */}
        <div
          onClick={() => handleSelectStatusTab("SIGNED")}
          className={`border-border/80 bg-card cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md ${
            activeStatusTab === "SIGNED" ? "border-emerald-500/60 ring-2 ring-emerald-500/40" : ""
          }`}
        >
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Ready to Countersign
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-emerald-600 tabular-nums dark:text-emerald-400">
            {readyToCountersignCount}
          </p>
          <span className="text-muted-foreground text-[10px]">Signed by client, pending seal</span>
        </div>

        {/* Finalized Sealed */}
        <div
          onClick={() => handleSelectStatusTab("COUNTERSIGNED")}
          className={`border-border/80 bg-card cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-indigo-500/50 hover:shadow-md ${
            activeStatusTab === "COUNTERSIGNED"
              ? "border-indigo-500/60 ring-2 ring-indigo-500/40"
              : ""
          }`}
        >
          <div className="text-muted-foreground flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase">Finalized Sealed</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-foreground mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums">
            {finalizedCount}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            SHA-256 tamper-proof active
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="border-border/80 bg-muted/40 flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto rounded-xl border p-1 [&::-webkit-scrollbar]:hidden">
          {[
            { id: "ALL", label: "All Contracts", shortLabel: "All", count: totalContracts },
            {
              id: "PENDING_SIGNATURE",
              label: "Awaiting Signature",
              shortLabel: "Awaiting",
              count: pendingCount,
            },
            {
              id: "SIGNED",
              label: "Ready to Countersign",
              shortLabel: "Ready",
              count: readyToCountersignCount,
            },
            {
              id: "COUNTERSIGNED",
              label: "Finalized",
              shortLabel: "Finalized",
              count: finalizedCount,
            },
            { id: "DRAFT", label: "Drafts", shortLabel: "Drafts", count: draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectStatusTab(tab.id as "ALL" | ContractStatus)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 ${
                activeStatusTab === tab.id
                  ? "bg-background text-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`py-0.2 rounded-full px-1.5 font-mono text-[10px] ${
                    activeStatusTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, number, client..."
            className="border-input bg-background text-foreground focus:ring-primary w-full rounded-xl border py-2 pr-3 pl-9 text-xs focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Contracts List Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border/60 bg-muted/30 h-28 animate-pulse rounded-2xl border"
            />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          title="No contracts found"
          description={
            searchQuery || activeStatusTab !== "ALL"
              ? "No contracts match your active filter criteria."
              : "Draft your first client contract to enable seamless digital signing ceremonies."
          }
          action={
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Draft Contract
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const clientInitial = (contract.customer?.name || "C").charAt(0).toUpperCase();
            const borderAccent =
              contract.status === "COUNTERSIGNED"
                ? "border-l-emerald-500 hover:border-l-emerald-600"
                : contract.status === "SIGNED"
                  ? "border-l-emerald-400 hover:border-l-emerald-500"
                  : contract.status === "PENDING_SIGNATURE"
                    ? "border-l-amber-500 hover:border-l-amber-600"
                    : contract.status === "VIEWED"
                      ? "border-l-blue-500 hover:border-l-blue-600"
                      : contract.status === "DECLINED"
                        ? "border-l-rose-500 hover:border-l-rose-600"
                        : "border-l-slate-400 hover:border-l-slate-500";

            return (
              <div
                key={contract.id}
                onClick={() => handleOpenInspection(contract)}
                className={`group border-border/80 bg-card flex flex-col justify-between gap-4 rounded-2xl border border-l-4 ${borderAccent} relative cursor-pointer overflow-hidden p-4 transition-all hover:border-blue-500/40 hover:shadow-lg sm:flex-row sm:items-center sm:p-5`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-sm font-extrabold text-blue-600 shadow-sm dark:text-blue-400">
                    {clientInitial}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground bg-muted/60 border-border/50 rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                        {contract.contractNumber}
                      </span>
                      <h3 className="text-foreground text-sm font-bold transition-colors group-hover:text-blue-600">
                        {contract.title}
                      </h3>
                      {getStatusBadge(contract.status)}
                    </div>

                    <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="font-medium">
                        Client:{" "}
                        <strong className="text-foreground">{contract.customer?.name}</strong>{" "}
                        {contract.customer?.company && (
                          <span className="text-muted-foreground/80 font-normal">
                            ({contract.customer.company})
                          </span>
                        )}
                      </span>
                      <span>•</span>
                      <span>Created {new Date(contract.createdAt).toLocaleDateString()}</span>
                      {contract.signerName && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Signed by {contract.signerName}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress Milestone Line */}
                    <div className="text-muted-foreground mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Timeline:
                      </span>
                      <div className="flex flex-wrap items-center gap-1 font-mono">
                        <span className="font-bold text-blue-600 dark:text-blue-400">Draft</span>
                        <span>→</span>
                        <span
                          className={
                            contract.status !== "DRAFT"
                              ? "font-bold text-blue-600 dark:text-blue-400"
                              : "text-muted-foreground/60"
                          }
                        >
                          Dispatched
                        </span>
                        <span>→</span>
                        <span
                          className={
                            contract.status === "VIEWED" ||
                            contract.status === "SIGNED" ||
                            contract.status === "COUNTERSIGNED"
                              ? "font-bold text-blue-600 dark:text-blue-400"
                              : "text-muted-foreground/60"
                          }
                        >
                          Viewed
                        </span>
                        <span>→</span>
                        <span
                          className={
                            contract.status === "SIGNED" || contract.status === "COUNTERSIGNED"
                              ? "font-bold text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground/60"
                          }
                        >
                          Signed
                        </span>
                        <span>→</span>
                        <span
                          className={
                            contract.status === "COUNTERSIGNED"
                              ? "font-extrabold text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground/60"
                          }
                        >
                          Sealed
                        </span>
                      </div>
                      {contract.contentChecksum && (
                        <div className="ml-2 hidden items-center gap-1 font-mono text-[9px] text-emerald-600 md:flex dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                          <span>SHA-256 Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-border/50 flex w-full flex-wrap items-center gap-2 border-t pt-3 sm:w-auto sm:shrink-0 sm:border-t-0 sm:pt-0">
                  {/* View Agreement */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInspection(contract);
                    }}
                    className="flex-1 cursor-pointer justify-center gap-1.5 text-xs font-semibold hover:border-blue-500/40 hover:bg-blue-50/50 sm:flex-none dark:hover:bg-blue-950/20"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> View Agreement
                  </Button>

                  {contract.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendForSignature(contract);
                      }}
                      disabled={sendMutation.isPending}
                      className="flex-1 cursor-pointer justify-center border-blue-500/40 font-semibold text-blue-600 hover:bg-blue-500/10 sm:flex-none dark:text-blue-400"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Send for Signature
                    </Button>
                  )}

                  {(contract.status === "PENDING_SIGNATURE" || contract.status === "VIEWED") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySigningLink(contract);
                        }}
                        className="flex-1 cursor-pointer justify-center sm:flex-none"
                      >
                        {copiedContractId === contract.id ? (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Link Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Sign Link
                          </>
                        )}
                      </Button>

                      {contract.signToken && (
                        <a
                          href={`/sign/${contract.signToken}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="border-border text-foreground hover:bg-muted inline-flex h-8 flex-1 items-center justify-center rounded-xl border px-3 text-xs font-semibold sm:flex-none"
                        >
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Preview Sign
                        </a>
                      )}
                    </>
                  )}

                  {contract.status === "SIGNED" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContractForCountersign(contract);
                      }}
                      className="w-full cursor-pointer justify-center bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 sm:w-auto"
                    >
                      <FileSignature className="mr-1.5 h-3.5 w-3.5" /> Countersign Agreement
                    </Button>
                  )}

                  {contract.status === "COUNTERSIGNED" && contract.signToken && (
                    <a
                      href={`/sign/${contract.signToken}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-8 flex-1 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-extrabold text-emerald-700 shadow-sm hover:bg-emerald-500/20 sm:flex-none dark:text-emerald-300"
                    >
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Certificate
                    </a>
                  )}

                  {contract.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(contract.id);
                      }}
                      className="shrink-0 cursor-pointer text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals & Inspection Drawer */}
      <CreateContractModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <CountersignModal
        contract={selectedContractForCountersign}
        isOpen={Boolean(selectedContractForCountersign)}
        onClose={() => setSelectedContractForCountersign(null)}
      />

      <ContractInspectorDrawer
        contract={inspectedContract}
        isOpen={Boolean(inspectedContract)}
        onClose={handleCloseInspection}
        onOpenCountersign={(contract) => setSelectedContractForCountersign(contract)}
        onSendContract={handleSendForSignature}
      />
    </div>
  );
}
