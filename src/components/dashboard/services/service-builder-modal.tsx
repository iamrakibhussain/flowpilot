"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  DollarSign,
  Clock,
  Shield,
  Users,
  Check,
  AlertCircle,
  Layers,
  Info,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStaff } from "@/features/staff/use-staff";
import { useCreateService, useUpdateService } from "@/features/services/use-services";
import type { ServiceItem } from "@/features/services/types";

interface ServiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: ServiceItem | null;
  onSuccess?: (service: ServiceItem) => void;
}

const CATEGORY_PRESETS = [
  "General",
  "Consultation",
  "Advisory",
  "Therapy",
  "Treatment",
  "Development",
  "Design",
  "Support",
];

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];
const BUFFER_PRESETS = [0, 5, 10, 15, 20, 30];

interface InnerFormProps {
  serviceToEdit?: ServiceItem | null;
  onClose: () => void;
  onSuccess?: (service: ServiceItem) => void;
}

function ServiceBuilderForm({ serviceToEdit, onClose, onSuccess }: InnerFormProps) {
  const isEditing = Boolean(serviceToEdit);
  const [activeTab, setActiveTab] = React.useState<"basics" | "pricing" | "timing" | "specialists">(
    "basics"
  );

  // Form states initialized directly from props
  const [name, setName] = React.useState(serviceToEdit?.name || "");
  const [category, setCategory] = React.useState(() => {
    if (!serviceToEdit?.category) return "General";
    return CATEGORY_PRESETS.includes(serviceToEdit.category) ? serviceToEdit.category : "CUSTOM";
  });
  const [customCategory, setCustomCategory] = React.useState(() => {
    if (!serviceToEdit?.category) return "";
    return CATEGORY_PRESETS.includes(serviceToEdit.category) ? "" : serviceToEdit.category;
  });
  const [description, setDescription] = React.useState(serviceToEdit?.description || "");
  const [isActive, setIsActive] = React.useState(serviceToEdit?.isActive ?? true);

  // Pricing & Deposits
  const [price, setPrice] = React.useState<number>(serviceToEdit?.price ?? 150);
  const [requireDeposit, setRequireDeposit] = React.useState(
    serviceToEdit?.requireDeposit ?? false
  );
  const [depositType, setDepositType] = React.useState<"FIXED" | "PERCENTAGE">(
    (serviceToEdit?.depositType as "FIXED" | "PERCENTAGE") || "FIXED"
  );
  const [depositAmount, setDepositAmount] = React.useState<number>(
    serviceToEdit?.depositAmount ? Number(serviceToEdit.depositAmount) : 50
  );

  // Timing & Buffers
  const [durationMinutes, setDurationMinutes] = React.useState<number>(
    serviceToEdit?.durationMinutes ?? 60
  );
  const [bufferBefore, setBufferBefore] = React.useState<number>(serviceToEdit?.bufferBefore ?? 10);
  const [bufferAfter, setBufferAfter] = React.useState<number>(serviceToEdit?.bufferAfter ?? 10);

  // Assigned Staff Members
  const [selectedStaffIds, setSelectedStaffIds] = React.useState<string[]>(() => {
    if (serviceToEdit?.staffMembers && serviceToEdit.staffMembers.length > 0) {
      return serviceToEdit.staffMembers.map((s) => s.id);
    }
    return serviceToEdit?.staffMemberIds || [];
  });

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Fetch organization staff list
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff();

  // Mutations
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId]
    );
  };

  const handleSelectAllStaff = () => {
    if (selectedStaffIds.length === staffList.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(staffList.map((s) => s.id));
    }
  };

  const resolvedCategory = category === "CUSTOM" ? customCategory.trim() || "General" : category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setActiveTab("basics");
      setErrorMsg("Please enter a service name.");
      return;
    }

    if (price < 0 || isNaN(price)) {
      setActiveTab("pricing");
      setErrorMsg("Please enter a valid price.");
      return;
    }

    if (requireDeposit && (!depositAmount || depositAmount <= 0)) {
      setActiveTab("pricing");
      setErrorMsg("Please enter a valid deposit amount.");
      return;
    }

    if (durationMinutes <= 0) {
      setActiveTab("timing");
      setErrorMsg("Duration must be at least 1 minute.");
      return;
    }

    try {
      if (isEditing && serviceToEdit) {
        const updated = await updateMutation.mutateAsync({
          id: serviceToEdit.id,
          data: {
            name: name.trim(),
            description: description.trim() || null,
            category: resolvedCategory,
            price: Number(price),
            durationMinutes: Number(durationMinutes),
            bufferBefore: Number(bufferBefore),
            bufferAfter: Number(bufferAfter),
            isActive,
            requireDeposit,
            depositType,
            depositAmount: requireDeposit ? Number(depositAmount) : null,
            staffMemberIds: selectedStaffIds,
          },
        });
        onSuccess?.(updated);
      } else {
        const created = await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
          category: resolvedCategory,
          price: Number(price),
          durationMinutes: Number(durationMinutes),
          bufferBefore: Number(bufferBefore),
          bufferAfter: Number(bufferAfter),
          isActive,
          requireDeposit,
          depositType,
          depositAmount: requireDeposit ? Number(depositAmount) : null,
          staffMemberIds: selectedStaffIds,
        });
        onSuccess?.(created);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save service.";
      setErrorMsg(msg);
    }
  };

  return (
    <div
      className="border-border/80 bg-background text-foreground flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border-t shadow-2xl transition-all sm:rounded-2xl sm:border lg:max-w-4xl xl:max-w-5xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Mobile Sheet Drag Indicator */}
      <div className="flex shrink-0 items-center justify-center pt-2.5 pb-1 sm:hidden">
        <div className="bg-muted-foreground/30 h-1 w-12 rounded-full" />
      </div>

      {/* Header */}
      <div className="border-border/80 bg-card/60 relative flex items-center justify-between border-b px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 sm:h-10 sm:w-10 dark:text-blue-400">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-foreground truncate text-base font-bold sm:text-xl"
            >
              {isEditing ? "Edit Service Offering" : "Create New Service"}
            </h2>
            <p className="text-muted-foreground hidden text-xs sm:block">
              Define pricing, smart buffer windows, and assign qualified specialists
            </p>
            <p className="text-muted-foreground text-[11px] font-medium sm:hidden">
              Step{" "}
              {activeTab === "basics"
                ? "1"
                : activeTab === "pricing"
                  ? "2"
                  : activeTab === "timing"
                    ? "3"
                    : "4"}{" "}
              of 4:{" "}
              <span className="text-primary font-bold">
                {activeTab === "basics"
                  ? "Basics"
                  : activeTab === "pricing"
                    ? "Pricing"
                    : activeTab === "timing"
                      ? "Duration"
                      : "Specialists"}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer rounded-xl p-1.5 transition-colors sm:p-2"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tab Bar Navigation */}
      <div className="border-border/80 bg-muted/30 border-b px-2.5 py-2 sm:px-6 sm:py-2.5">
        <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold sm:flex sm:min-w-max sm:gap-2 sm:text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("basics")}
            className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 transition-all sm:px-3 sm:py-1.5 ${
              activeTab === "basics"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Basics</span>
            <span className="hidden sm:inline">1. Basics &amp; Category</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 transition-all sm:px-3 sm:py-1.5 ${
              activeTab === "pricing"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Price</span>
            <span className="hidden sm:inline">2. Pricing &amp; Deposits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timing")}
            className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 transition-all sm:px-3 sm:py-1.5 ${
              activeTab === "timing"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Time</span>
            <span className="hidden sm:inline">3. Duration &amp; Buffers</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specialists")}
            className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 transition-all sm:px-3 sm:py-1.5 ${
              activeTab === "specialists"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Staff ({selectedStaffIds.length})</span>
            <span className="hidden sm:inline">
              4. Qualified Specialists ({selectedStaffIds.length})
            </span>
          </button>
        </div>
      </div>

      {/* Form Body with Split Live Preview */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Form Inputs */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
            {errorMsg && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 sm:text-sm dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: BASICS */}
            {activeTab === "basics" && (
              <div className="space-y-4">
                <div>
                  <label className="text-foreground mb-1.5 block text-xs font-semibold">
                    Service Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Executive Strategy Session, 60-min Deep Advisory"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-foreground mb-1.5 block text-xs font-semibold">
                    Category
                  </label>
                  <div className="mb-2.5 flex flex-wrap gap-1.5">
                    {CATEGORY_PRESETS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setCustomCategory("");
                        }}
                        className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                          category === cat
                            ? "border-blue-600 bg-blue-50 font-semibold text-blue-700 shadow-2xs dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCategory("CUSTOM")}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                        category === "CUSTOM"
                          ? "border-blue-600 bg-blue-50 font-semibold text-blue-700 shadow-2xs dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      + Custom Category
                    </button>
                  </div>
                  {category === "CUSTOM" && (
                    <Input
                      type="text"
                      placeholder="Enter custom category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  )}
                </div>

                <div>
                  <label className="text-foreground mb-1.5 block text-xs font-semibold">
                    Client-Facing Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what the client receives during this service, preparation guidelines, or agenda..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  />
                </div>

                <div className="border-border/80 bg-card flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs sm:p-4">
                  <div className="min-w-0">
                    <p className="text-foreground text-xs font-bold">Catalog Visibility</p>
                    <p className="text-muted-foreground text-[11px]">
                      When enabled, this service appears in booking flows and catalog listings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                      isActive ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                        isActive ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-end pt-1 sm:hidden">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab("pricing")}
                    className="bg-primary text-primary-foreground h-9 w-full cursor-pointer text-xs font-bold shadow-xs"
                  >
                    Next: Pricing &amp; Deposits →
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & DEPOSITS */}
            {activeTab === "pricing" && (
              <div className="space-y-4">
                <div className="border-border/80 bg-card rounded-xl border p-4 shadow-2xs">
                  <label className="text-foreground mb-1.5 block text-xs font-semibold">
                    Full Service Fee ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold">
                      $
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={price || ""}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      required
                      className="border-border/80 bg-background text-foreground pl-8 font-mono text-base font-bold"
                    />
                  </div>
                  <p className="text-muted-foreground mt-1.5 text-[11px]">
                    Total base invoice amount charged to client upon completion or booking.
                  </p>
                </div>

                {/* Deposit Protection */}
                <div className="border-border/80 bg-card space-y-3.5 rounded-xl border p-4 shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-foreground text-xs font-bold">
                          Require Upfront Booking Deposit
                        </p>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        Guarantees client commitment and protects specialist schedules from
                        no-shows.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequireDeposit(!requireDeposit)}
                      className={`flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        requireDeposit ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                          requireDeposit ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {requireDeposit && (
                    <div className="border-border/70 grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-2">
                      <div>
                        <label className="text-foreground mb-1 block text-[11px] font-semibold">
                          Deposit Type
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDepositType("FIXED")}
                            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                              depositType === "FIXED"
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Fixed ($)
                          </button>
                          <button
                            type="button"
                            onClick={() => setDepositType("PERCENTAGE")}
                            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                              depositType === "PERCENTAGE"
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Percentage (%)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-foreground mb-1 block text-[11px] font-semibold">
                          {depositType === "FIXED"
                            ? "Deposit Amount ($)"
                            : "Deposit Percentage (%)"}
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            min={1}
                            max={depositType === "PERCENTAGE" ? 100 : undefined}
                            step={depositType === "PERCENTAGE" ? "1" : "0.01"}
                            value={depositAmount || ""}
                            onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                            className="border-border/80 bg-background text-foreground font-mono font-bold"
                          />
                          <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold">
                            {depositType === "FIXED" ? "USD" : "%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 sm:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("basics")}
                    className="h-9 flex-1 cursor-pointer text-xs font-semibold"
                  >
                    ← Basics
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab("timing")}
                    className="bg-primary text-primary-foreground h-9 flex-1 cursor-pointer text-xs font-bold shadow-xs"
                  >
                    Next: Duration →
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: DURATION & BUFFERS */}
            {activeTab === "timing" && (
              <div className="space-y-4">
                <div className="border-border/80 bg-card space-y-3 rounded-xl border p-4 shadow-2xs">
                  <label className="text-foreground block text-xs font-bold">
                    Appointment Session Duration (Minutes)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDurationMinutes(dur)}
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          durationMinutes === dur
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        {dur >= 60
                          ? `${dur / 60} hr${dur > 60 ? ` ${dur % 60}m` : ""}`
                          : `${dur} min`}
                      </button>
                    ))}
                  </div>
                  <div className="w-36 pt-1">
                    <Input
                      type="number"
                      min={15}
                      max={480}
                      step={5}
                      value={durationMinutes || ""}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 15)}
                      className="border-border/80 bg-background text-foreground font-mono text-xs"
                      placeholder="Custom mins"
                    />
                  </div>
                </div>

                {/* Smart Buffer Time Windows */}
                <div className="border-border/80 bg-card space-y-3 rounded-xl border p-4 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-foreground text-xs font-bold">
                      Buffer Protection Windows (Setup &amp; Cleanup)
                    </p>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Automated calendar breathing room. Blocks other appointments from overlapping
                    with preparation or cleanup periods.
                  </p>

                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                    <div className="border-border/80 bg-muted/30 space-y-2 rounded-xl border p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-semibold">Before Session</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {bufferBefore} mins
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {BUFFER_PRESETS.map((buf) => (
                          <button
                            key={buf}
                            type="button"
                            onClick={() => setBufferBefore(buf)}
                            className={`cursor-pointer rounded border px-2 py-1 text-[11px] font-medium transition-all ${
                              bufferBefore === buf
                                ? "border-blue-600 bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {buf}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-border/80 bg-muted/30 space-y-2 rounded-xl border p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-semibold">After Session</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {bufferAfter} mins
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {BUFFER_PRESETS.map((buf) => (
                          <button
                            key={buf}
                            type="button"
                            onClick={() => setBufferAfter(buf)}
                            className={`cursor-pointer rounded border px-2 py-1 text-[11px] font-medium transition-all ${
                              bufferAfter === buf
                                ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {buf}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual Buffer Diagram Preview */}
                  <div className="border-border/70 bg-muted/40 mt-3 rounded-xl border p-3">
                    <p className="text-muted-foreground mb-2 text-[10px] font-bold tracking-wide uppercase">
                      Timeline Block Allocation Preview
                    </p>
                    <div className="flex h-7 items-center gap-1.5 overflow-hidden rounded-lg text-center text-[10px] font-bold">
                      {bufferBefore > 0 && (
                        <div
                          style={{ flex: bufferBefore }}
                          className="flex h-full items-center justify-center rounded-l-md border border-blue-500/30 bg-blue-500/20 px-1 text-blue-700 dark:text-blue-300"
                          title={`Buffer Before: ${bufferBefore}m`}
                        >
                          +{bufferBefore}m
                        </div>
                      )}
                      <div
                        style={{ flex: durationMinutes }}
                        className="bg-primary text-primary-foreground flex h-full items-center justify-center rounded-md px-2 shadow-xs"
                        title={`Client Service: ${durationMinutes}m`}
                      >
                        Session ({durationMinutes}m)
                      </div>
                      {bufferAfter > 0 && (
                        <div
                          style={{ flex: bufferAfter }}
                          className="flex h-full items-center justify-center rounded-r-md border border-emerald-500/30 bg-emerald-500/20 px-1 text-emerald-700 dark:text-emerald-300"
                          title={`Buffer After: ${bufferAfter}m`}
                        >
                          +{bufferAfter}m
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 sm:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("pricing")}
                    className="h-9 flex-1 cursor-pointer text-xs font-semibold"
                  >
                    ← Pricing
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab("specialists")}
                    className="bg-primary text-primary-foreground h-9 flex-1 cursor-pointer text-xs font-bold shadow-xs"
                  >
                    Next: Specialists →
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: SPECIALIST QUALIFICATION */}
            {activeTab === "specialists" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-foreground text-xs font-bold">
                      Assigned Specialists &amp; Staff
                    </h3>
                    <p className="text-muted-foreground text-[11px]">
                      Select which team members are qualified to provide this service in
                      self-scheduling portals.
                    </p>
                  </div>
                  {staffList.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllStaff}
                      className="border-border/80 text-foreground hover:bg-muted cursor-pointer self-start text-xs sm:self-auto"
                    >
                      {selectedStaffIds.length === staffList.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>

                {isLoadingStaff ? (
                  <div className="text-muted-foreground py-8 text-center text-xs">
                    Loading team members...
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="border-border/80 bg-card space-y-2 rounded-xl border p-6 text-center shadow-2xs">
                    <Users className="text-muted-foreground mx-auto h-8 w-8" />
                    <p className="text-foreground text-xs font-semibold">No team members found</p>
                    <p className="text-muted-foreground text-[11px]">
                      Add staff in the Team &amp; Staff tab to assign them to services.
                    </p>
                  </div>
                ) : (
                  <div className="grid max-h-64 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                    {staffList.map((staff) => {
                      const isSelected = selectedStaffIds.includes(staff.id);
                      return (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() => handleStaffToggle(staff.id)}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 text-foreground shadow-2xs"
                              : "border-border/80 bg-card text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-2xs ${
                                staff.avatarBg || "bg-blue-600"
                              }`}
                            >
                              {staff.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-foreground truncate text-xs font-bold">
                                {staff.name}
                              </p>
                              <p className="text-muted-foreground truncate text-[11px]">
                                {staff.roleTitle}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border/80 bg-background"
                            }`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-start pt-1 sm:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("timing")}
                    className="h-9 cursor-pointer text-xs font-semibold"
                  >
                    ← Duration &amp; Buffers
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Client Portal Preview (Stripe/Shopify Grade) */}
          <div className="border-border/80 bg-muted/15 hidden w-80 shrink-0 flex-col justify-between overflow-y-auto border-l p-5 lg:flex xl:w-92">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                  <Eye className="text-primary h-3.5 w-3.5" />
                  Client Live Preview
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live Mirror
                </span>
              </div>

              {/* Exact Mock Client Portal Card */}
              <div className="border-border/80 from-card to-card/95 space-y-3.5 rounded-2xl border bg-gradient-to-b p-4.5 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                    {resolvedCategory}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-400"
                      }`}
                    />
                    <span className="text-foreground font-mono text-lg font-black tracking-tight">
                      ${Number(price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-foreground text-sm font-bold">
                    {name.trim() || "Untitled Service Offering"}
                  </h4>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                    {description.trim() ||
                      "Full specialized appointment session with tailored consultation."}
                  </p>
                </div>

                {/* Audiophile / Flight-Track Buffer Bar */}
                <div className="border-border/60 bg-muted/40 space-y-1.5 rounded-xl border p-2.5">
                  <div className="text-muted-foreground flex items-center justify-between text-[9px] font-semibold">
                    <span>Timeline Allocation</span>
                    <span>Total: {durationMinutes + bufferBefore + bufferAfter}m</span>
                  </div>
                  <div className="flex h-5 w-full items-center gap-1 overflow-hidden rounded-md text-center text-[9px] font-bold">
                    {bufferBefore > 0 && (
                      <div
                        style={{ flex: bufferBefore }}
                        className="flex h-full items-center justify-center rounded border border-blue-500/20 bg-blue-500/15 px-1 text-blue-700 dark:text-blue-300"
                      >
                        +{bufferBefore}m
                      </div>
                    )}
                    <div
                      style={{ flex: durationMinutes }}
                      className="bg-primary text-primary-foreground flex h-full items-center justify-center rounded px-1.5 shadow-2xs"
                    >
                      {durationMinutes}m
                    </div>
                    {bufferAfter > 0 && (
                      <div
                        style={{ flex: bufferAfter }}
                        className="flex h-full items-center justify-center rounded border border-emerald-500/20 bg-emerald-500/15 px-1 text-emerald-700 dark:text-emerald-300"
                      >
                        +{bufferAfter}m
                      </div>
                    )}
                  </div>
                </div>

                {/* Deposit Badge */}
                {requireDeposit && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Shield className="h-3 w-3 shrink-0" />
                    <span>
                      Deposit:{" "}
                      {depositType === "PERCENTAGE"
                        ? `${depositAmount}% ($${(((price || 0) * (depositAmount || 0)) / 100).toFixed(2)})`
                        : `$${Number(depositAmount).toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* Specialist Stack Preview */}
                <div className="border-border/70 text-muted-foreground flex items-center justify-between border-t pt-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-foreground text-[11px] font-semibold">
                      {selectedStaffIds.length} Specialist{selectedStaffIds.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="bg-primary/10 text-primary rounded-lg px-2 py-0.5 text-[10px] font-bold">
                    Book Now →
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mt-4 text-center text-[10px] leading-relaxed">
              ✦ Live preview mirrors the exact booking card clients see in your self-scheduling
              portal.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-border/80 bg-card/60 flex items-center justify-between gap-3 border-t px-3.5 py-3 backdrop-blur-md sm:px-6 sm:py-3.5">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Info className="text-primary h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Multi-tenant encrypted &amp; active</span>
            <span className="text-[11px] font-medium sm:hidden">TLS Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground h-9 cursor-pointer text-xs font-semibold sm:h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-9 cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 sm:h-8.5"
            >
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Service"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ServiceBuilderModal({
  isOpen,
  onClose,
  serviceToEdit,
  onSuccess,
}: ServiceBuilderModalProps) {
  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm duration-200 sm:items-center sm:p-4">
      <ServiceBuilderForm
        key={serviceToEdit?.id ?? "new"}
        serviceToEdit={serviceToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
