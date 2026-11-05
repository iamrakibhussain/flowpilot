"use client";

import React from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Repeat,
  Loader2,
  DollarSign,
  Info,
  ChevronDown,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomers } from "@/features/customers/use-customers";
import { useCreateRecurringSchedule } from "@/features/recurring/use-recurring";
import type { RecurringFrequency, RecurringItem } from "@/features/recurring/types";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateScheduleModal({ isOpen, onClose, onSuccess }: CreateScheduleModalProps) {
  const { data: customerData, isLoading: isLoadingCustomers } = useCustomers({ limit: 100 });
  const customers = customerData?.customers || [];

  const [customerId, setCustomerId] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [frequency, setFrequency] = React.useState<RecurringFrequency>("MONTHLY");
  const [currency, setCurrency] = React.useState<string>("USD");
  const [paymentDueDays, setPaymentDueDays] = React.useState<number>(14);

  // Line items state
  const [items, setItems] = React.useState<RecurringItem[]>([
    { description: "Monthly Professional Retainer", quantity: 1, unitPrice: 1500 },
  ]);
  const [taxRate, setTaxRate] = React.useState<number>(0);

  // Retainer hours state
  const [isRetainer, setIsRetainer] = React.useState<boolean>(false);
  const [retainerHours, setRetainerHours] = React.useState<string>("15");
  const [overageHourlyRate, setOverageHourlyRate] = React.useState<string>("125");

  // Scheduling state
  const [startDate, setStartDate] = React.useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = React.useState<string>("");
  const [maxOccurrences, setMaxOccurrences] = React.useState<string>("");
  const [autoSendEmail, setAutoSendEmail] = React.useState<boolean>(true);

  const [error, setError] = React.useState<string | null>(null);

  const createMutation = useCreateRecurringSchedule();

  const selectedCustomerId = customerId || (customers[0]?.id ?? "");

  // Financial calculations
  const subtotal = React.useMemo(() => {
    return items.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0), 0);
  }, [items]);

  const taxAmount = React.useMemo(() => {
    return Math.round(subtotal * (taxRate / 100) * 100) / 100;
  }, [subtotal, taxRate]);

  const total = React.useMemo(() => {
    return Math.round((subtotal + taxAmount) * 100) / 100;
  }, [subtotal, taxAmount]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RecurringItem, val: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: field === "description" ? val : Math.max(0, Number(val) || 0),
        };
      })
    );
  };

  const handleResetForm = () => {
    setTitle("");
    setCustomerId("");
    setFrequency("MONTHLY");
    setCurrency("USD");
    setPaymentDueDays(14);
    setItems([{ description: "Monthly Professional Retainer", quantity: 1, unitPrice: 1500 }]);
    setTaxRate(0);
    setIsRetainer(false);
    setRetainerHours("15");
    setOverageHourlyRate("125");
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate("");
    setMaxOccurrences("");
    setAutoSendEmail(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("Please select a customer for this recurring schedule.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a descriptive schedule title.");
      return;
    }
    if (items.some((it) => !it.description.trim())) {
      setError("All line items must have a valid description.");
      return;
    }
    if (subtotal <= 0) {
      setError("Total cadence amount must be greater than zero.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        customerId: selectedCustomerId,
        title: title.trim(),
        frequency,
        currency,
        taxRate,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          amount: Math.round(it.quantity * it.unitPrice * 100) / 100,
        })),
        isRetainer,
        retainerHours: isRetainer && retainerHours ? parseFloat(retainerHours) : null,
        overageHourlyRate: isRetainer && overageHourlyRate ? parseFloat(overageHourlyRate) : null,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        maxOccurrences: maxOccurrences ? parseInt(maxOccurrences, 10) : null,
        autoSendEmail,
        paymentDueDays,
      });

      handleResetForm();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create recurring schedule. Please review your input.";
      setError(message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleResetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="border-border/80 bg-card fixed top-1/2 left-1/2 flex max-h-[92vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl p-0 shadow-2xl sm:rounded-3xl">
        {/* Modal Header with padding-right reserved for close button */}
        <div className="border-border/70 from-card via-card to-muted/20 border-b bg-gradient-to-b px-4 py-3.5 pr-12 sm:px-7 sm:py-4.5 sm:pr-14">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="to-primary shadow-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 text-white shadow-md sm:h-10 sm:w-10">
                <Repeat className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-foreground text-base font-black tracking-tight sm:text-xl">
                    New Recurring Schedule
                  </DialogTitle>
                  <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 sm:inline-block dark:text-blue-400">
                    Auto-Cadence
                  </span>
                </div>
                <DialogDescription className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                  Automate recurring billing cadences, retainers, and client notifications.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="recurring-schedule-form"
          onSubmit={handleSubmit}
          className="w-full max-w-full min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-3.5 py-4 sm:space-y-5 sm:px-7 sm:py-5"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer & Schedule Identity */}
          <div className="border-border/70 bg-muted/25 space-y-3 rounded-2xl border p-3.5 sm:space-y-3.5 sm:p-5">
            <div className="flex items-center gap-1.5">
              <Info className="text-primary h-4 w-4 shrink-0" />
              <h4 className="text-foreground text-xs font-black tracking-wider uppercase">
                1. Client & Schedule Details
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customer" className="text-foreground text-xs font-bold">
                  Select Client <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="customer"
                    value={selectedCustomerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={isLoadingCustomers}
                    className="border-input bg-background text-foreground focus:border-primary focus:ring-primary/20 h-10 w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-xs font-medium focus:ring-2 focus:outline-none"
                    required
                  >
                    <option value="" disabled>
                      {isLoadingCustomers
                        ? "Loading clients..."
                        : customers.length === 0
                          ? "No active clients found. Please create a customer first"
                          : "Choose an active customer..."}
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                </div>
                {!isLoadingCustomers && customers.length === 0 && (
                  <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    No active clients found. Please add a customer first in Customers section.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-foreground text-xs font-bold">
                  Schedule Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Marketing Retainer"
                  className="border-input bg-background h-10 rounded-xl text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-0.5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="frequency" className="text-foreground text-xs font-bold">
                  Cadence Frequency <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="border-input bg-background text-foreground focus:border-primary focus:ring-primary/20 h-10 w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-xs font-medium focus:ring-2 focus:outline-none"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="BI_WEEKLY">Bi-Weekly (14 days)</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly (3 months)</option>
                    <option value="ANNUALLY">Annually (1 year)</option>
                  </select>
                  <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-foreground text-xs font-bold">
                  Currency
                </Label>
                <div className="relative">
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="border-input bg-background text-foreground focus:border-primary focus:ring-primary/20 h-10 w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-xs font-medium focus:ring-2 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                  <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentDueDays" className="text-foreground text-xs font-bold">
                  Payment Terms (Net Days)
                </Label>
                <div className="relative">
                  <Input
                    id="paymentDueDays"
                    type="number"
                    min="0"
                    max="120"
                    value={paymentDueDays}
                    onChange={(e) =>
                      setPaymentDueDays(Math.max(0, parseInt(e.target.value, 10) || 0))
                    }
                    className="border-input bg-background h-10 rounded-xl pr-12 text-xs font-medium"
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium">
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Line Items (Mobile-First Card Layout) */}
          <div className="border-border/70 bg-muted/25 space-y-3 rounded-2xl border p-3.5 sm:space-y-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-foreground text-xs font-black tracking-wider uppercase">
                  2. Line Items & Amounts
                </h4>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="border-border/80 hover:bg-background h-8 cursor-pointer rounded-xl px-2.5 text-xs font-bold shadow-2xs"
              >
                <Plus className="text-primary mr-1 h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border-border/70 bg-card space-y-2.5 rounded-xl border p-3 shadow-2xs sm:p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[10px] font-bold uppercase">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-500/10 hover:text-rose-600"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Input
                      placeholder="e.g. Monthly Retainer / Strategic Consulting"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      className="border-input bg-background h-9 rounded-lg text-xs font-medium"
                      required
                    />
                  </div>

                  {/* Quantity, Unit Price and Line Total in Mobile-Responsive Flex */}
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="w-24 shrink-0 space-y-1">
                        <span className="text-muted-foreground block text-[10px] font-semibold">
                          Quantity
                        </span>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="border-input bg-background h-8.5 rounded-lg text-center text-xs font-semibold"
                          required
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <span className="text-muted-foreground block text-[10px] font-semibold">
                          Unit Price ($)
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="border-input bg-background h-8.5 rounded-lg text-right font-mono text-xs font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-border/50 flex items-center justify-between gap-2 border-t pt-1.5 sm:w-32 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
                      <span className="text-muted-foreground text-[10px] font-semibold sm:hidden">
                        Line Total:
                      </span>
                      <span className="text-foreground font-mono text-xs font-black sm:text-sm">
                        ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary Calculation Banner */}
            <div className="border-border/70 bg-card/90 space-y-2 rounded-xl border p-3.5 shadow-xs">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>Subtotal:</span>
                <span className="text-foreground font-mono font-bold">
                  ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  Tax Rate:
                  <span className="relative inline-flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
                      className="border-input bg-background text-foreground h-6.5 w-14 rounded-md border px-1.5 pr-4 text-right font-mono text-xs focus:outline-none"
                    />
                    <span className="text-muted-foreground pointer-events-none absolute right-1.5 text-[10px]">
                      %
                    </span>
                  </span>
                </span>
                <span className="text-foreground font-mono font-bold">
                  ${taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-border/60 text-foreground flex flex-wrap items-center justify-between gap-1 border-t pt-2.5">
                <span className="shrink-0 text-xs font-black tracking-wide uppercase">
                  Total Per Cycle:
                </span>
                <span className="text-primary shrink-0 font-mono text-base font-black sm:text-lg">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Retainer Hours Tracking Toggle Card */}
          <div
            className={`space-y-3 rounded-2xl border p-3.5 transition-all sm:p-5 ${
              isRetainer
                ? "border-indigo-500/30 bg-indigo-500/[0.06]"
                : "border-border/70 bg-muted/20 hover:border-border"
            }`}
          >
            <div
              onClick={() => setIsRetainer(!isRetainer)}
              className="flex cursor-pointer items-start justify-between gap-3 select-none"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isRetainer
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-foreground text-xs font-black tracking-wide">
                    Track Hourly Retainer & Overage
                  </span>
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                    Set contracted cycle hours. Excess hours log automatically and bill on the next
                    cycle.
                  </p>
                </div>
              </div>

              {/* Styled Switch */}
              <div
                className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
                  isRetainer ? "bg-indigo-600" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    isRetainer ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
            </div>

            {isRetainer && (
              <div className="border-border/50 grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="retainerHours" className="text-foreground text-xs font-bold">
                    Allocated Hours / Cycle <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="retainerHours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={retainerHours}
                    onChange={(e) => setRetainerHours(e.target.value)}
                    placeholder="e.g. 20"
                    className="border-input bg-background h-10 rounded-xl text-xs font-medium"
                    required={isRetainer}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="overageRate" className="text-foreground text-xs font-bold">
                    Overage Hourly Rate ($/hr)
                  </Label>
                  <Input
                    id="overageRate"
                    type="number"
                    step="1"
                    min="0"
                    value={overageHourlyRate}
                    onChange={(e) => setOverageHourlyRate(e.target.value)}
                    placeholder="e.g. 125"
                    className="border-input bg-background h-10 rounded-xl font-mono text-xs font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Schedule Cadence & Automation */}
          <div className="border-border/70 bg-muted/25 space-y-3.5 rounded-2xl border p-3.5 sm:p-5">
            <div className="flex items-center gap-1.5">
              <Calendar className="text-primary h-4 w-4 shrink-0" />
              <h4 className="text-foreground text-xs font-black tracking-wider uppercase">
                3. Lifecycle Dates & Automated Email
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-foreground text-xs font-bold">
                  First Run Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-input bg-background h-10 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-foreground text-xs font-bold">
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-input bg-background h-10 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxOccurrences" className="text-foreground text-xs font-bold">
                  Max Cycles (Optional)
                </Label>
                <Input
                  id="maxOccurrences"
                  type="number"
                  min="1"
                  placeholder="Continuous"
                  value={maxOccurrences}
                  onChange={(e) => setMaxOccurrences(e.target.value)}
                  className="border-input bg-background h-10 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Email Auto-Dispatch Toggle Card */}
            <div
              onClick={() => setAutoSendEmail(!autoSendEmail)}
              className="border-border/60 bg-card hover:border-primary/40 flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-foreground block text-xs font-bold">
                    Auto-Email Client with 1-Click Pay Link
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Dispatches invoice PDF and checkout link upon each automated cycle.
                  </span>
                </div>
              </div>

              <div
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  autoSendEmail ? "bg-emerald-600" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    autoSendEmail ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Sticky Footer with mobile-first full-width stacking */}
        <div className="border-border/70 bg-card/95 border-t px-4 py-3 backdrop-blur-md sm:px-7 sm:py-3.5">
          <div className="flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleResetForm();
                onClose();
              }}
              disabled={createMutation.isPending}
              className="border-border/80 hover:bg-muted h-10 w-full cursor-pointer rounded-xl px-4 text-xs font-bold sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              form="recurring-schedule-form"
              type="submit"
              disabled={createMutation.isPending || subtotal <= 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 h-10 w-full cursor-pointer rounded-xl px-5 text-xs font-bold shadow-md sm:w-auto"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Launch Recurring Schedule"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
