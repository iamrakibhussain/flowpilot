"use client";

import * as React from "react";
import { FileCheck2, Plus, Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/features/customers/use-customers";
import { useCreateQuote } from "@/features/quotes/use-quotes";
import { useServices } from "@/features/services/use-services";
import { useOrganizationSettings } from "@/features/organizations/use-organization-settings";
import type { CreateQuotePayload } from "@/features/quotes/types";

export interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  initialCustomerName?: string;
  initialItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    serviceId?: string;
  }>;
  initialTitle?: string;
  initialNotes?: string;
  organizationId?: string;
}

interface LineItemRow {
  id: string;
  serviceId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

function QuoteBuilderForm({
  onClose,
  initialCustomerId,
  initialCustomerName,
  initialItems,
  initialTitle,
  initialNotes,
  organizationId,
}: Omit<QuoteBuilderModalProps, "isOpen">) {
  const { data: customerData } = useCustomers({ limit: 100 });
  const customers = React.useMemo(() => customerData?.customers ?? [], [customerData]);
  const { data: services = [] } = useServices({ activeOnly: true }, organizationId);
  const { data: orgSettings } = useOrganizationSettings();
  const createQuoteMutation = useCreateQuote();

  // Client Selection State
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>(
    () => initialCustomerId || ""
  );
  const activeCustomerId =
    selectedCustomerId !== "__SEARCH__"
      ? selectedCustomerId || initialCustomerId || (customers[0]?.id ?? "")
      : "";

  const [isNewClientMode, setIsNewClientMode] = React.useState<boolean | null>(null);
  const isNewClient =
    isNewClientMode !== null
      ? isNewClientMode
      : Boolean(initialCustomerName && !initialCustomerId) ||
        (!initialCustomerId && customers.length === 0);
  const [newClientName, setNewClientName] = React.useState(initialCustomerName || "");
  const [newClientEmail, setNewClientEmail] = React.useState("");
  const [newClientCompany, setNewClientCompany] = React.useState("");
  const [newClientPhone, setNewClientPhone] = React.useState("");

  // Proposal Meta
  const [title, setTitle] = React.useState(
    initialTitle || "Comprehensive Service Proposal & Estimate"
  );
  const [introduction, setIntroduction] = React.useState("");
  const [validityDays, setValidityDays] = React.useState(14);
  const [terms, setTerms] = React.useState(
    "1. This estimate is valid for the specified period.\n2. 50% deposit required upon digital signing.\n3. Balance due upon delivery of agreed milestones."
  );
  const [notes, setNotes] = React.useState(initialNotes || "");
  const [taxRate, setTaxRate] = React.useState(orgSettings?.defaultTaxRate || 0);
  const [discountType, setDiscountType] = React.useState<"FIXED" | "PERCENT">("FIXED");
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Line items state
  const [items, setItems] = React.useState<LineItemRow[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map((it, idx) => ({
        id: `row-${Date.now()}-${idx}`,
        serviceId: it.serviceId || null,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      }));
    }
    return [
      {
        id: `row-${Date.now()}-0`,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ];
  });

  // Financial calculations
  const subtotal = React.useMemo(() => {
    return items.reduce((acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0), 0);
  }, [items]);

  const computedDiscount = React.useMemo(() => {
    if (discountType === "PERCENT") {
      return Math.round(((subtotal * discountAmount) / 100) * 100) / 100;
    }
    return Math.min(subtotal, Math.max(0, discountAmount));
  }, [subtotal, discountType, discountAmount]);

  const taxableAmount = Math.max(0, subtotal - computedDiscount);
  const computedTax = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + computedTax) * 100) / 100;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${prev.length}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMessage("A proposal must have at least one line item.");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItemRow, value: string | number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const handleServiceSelect = (id: string, serviceId: string) => {
    const s = services.find((serv) => serv.id === serviceId);
    if (!s) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              serviceId: s.id,
              description: s.description ? `${s.name} - ${s.description}` : s.name,
              unitPrice: Number(s.price),
            }
          : it
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (items.some((it) => !it.description.trim())) {
      setErrorMessage("All line items must have a clear description.");
      return;
    }

    if (isNewClient && !newClientName.trim()) {
      setErrorMessage("Please enter a client name.");
      return;
    }

    const resolvedCustomerId = !isNewClient
      ? selectedCustomerId || activeCustomerId || (customers[0]?.id ?? "")
      : "";

    if (!isNewClient && !resolvedCustomerId) {
      setErrorMessage("Please select an existing client or click '+ New Client'.");
      return;
    }

    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    const payload: CreateQuotePayload = {
      title: title.trim() || "Service Proposal & Estimate",
      introduction: introduction.trim() ? introduction.trim() : null,
      terms: terms.trim() ? terms.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
      taxRate: Math.max(0, Math.min(100, Number(taxRate) || 0)),
      discountType,
      discountAmount: Math.max(0, Number(discountAmount) || 0),
      expiresAt,
      items: items.map((it, idx) => ({
        serviceId: it.serviceId && it.serviceId.trim().length > 0 ? it.serviceId.trim() : null,
        description: it.description.trim() || `Item #${idx + 1}`,
        quantity: Math.max(1, Number(it.quantity) || 1),
        unitPrice: Math.max(0, Number(it.unitPrice) || 0),
        sortOrder: idx,
      })),
      ...(isNewClient
        ? {
            customerName: newClientName.trim(),
            ...(newClientEmail.trim() ? { customerEmail: newClientEmail.trim() } : {}),
            ...(newClientPhone.trim() ? { customerPhone: newClientPhone.trim() } : {}),
            ...(newClientCompany.trim() ? { customerCompany: newClientCompany.trim() } : {}),
          }
        : {
            customerId: resolvedCustomerId,
          }),
    };

    try {
      await createQuoteMutation.mutateAsync(payload);
      onClose();
    } catch (err: unknown) {
      let msg = "Failed to create proposal";
      if (err instanceof Error) {
        msg = err.message;
      }
      const maybeDetails = (err as { response?: { data?: { details?: Record<string, string[]> } } })
        ?.response?.data?.details;
      if (maybeDetails && typeof maybeDetails === "object") {
        const fieldErrors = Object.entries(maybeDetails)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join(" | ");
        if (fieldErrors) msg = `${msg} (${fieldErrors})`;
      }
      setErrorMessage(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <DialogHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Create Estimate & Client Proposal
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Prepare a formal estimate with deliverables, pricing, and digital signing terms.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Proposal Title & Client Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Proposal Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Website Redesign & SEO Strategy"
            className="h-9 rounded-xl text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Client / Account</Label>
            <button
              type="button"
              onClick={() => setIsNewClientMode(!isNewClient)}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {isNewClient ? "Select Existing Client" : "+ New Client"}
            </button>
          </div>

          {!isNewClient ? (
            <div className="space-y-2">
              <select
                value={selectedCustomerId || (customers[0]?.id ?? "")}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="border-input bg-background focus:ring-ring h-9 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:outline-none"
              >
                {customers.length === 0 ? (
                  <option value="">No clients found — switch to &apos;+ New Client&apos;</option>
                ) : (
                  customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""} - {c.email}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Client Name *"
                className="h-9 rounded-xl text-xs"
                required
              />
              <Input
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="Email Address"
                type="email"
                className="h-9 rounded-xl text-xs"
              />
              <Input
                value={newClientCompany}
                onChange={(e) => setNewClientCompany(e.target.value)}
                placeholder="Company (Optional)"
                className="h-9 rounded-xl text-xs"
              />
              <Input
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                placeholder="Phone (Optional)"
                className="h-9 rounded-xl text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Deliverables / Line items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs font-semibold">
            Deliverables & Line Items ({items.length})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="h-7 gap-1 rounded-lg border-dashed text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </Button>
        </div>

        <div className="max-h-[35vh] space-y-2.5 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="border-border/60 bg-muted/20 flex flex-col gap-2.5 rounded-2xl border p-3 sm:grid sm:grid-cols-12 sm:items-center sm:gap-2 sm:p-2.5"
            >
              <div className="space-y-1 sm:col-span-6">
                {services.length > 0 && (
                  <select
                    value={item.serviceId || ""}
                    onChange={(e) => handleServiceSelect(item.id, e.target.value)}
                    className="border-border bg-background text-muted-foreground mb-1 h-7.5 w-full rounded-lg border px-2 text-[11px] sm:h-7"
                  >
                    <option value="">⚡ Autofill from Catalog...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${Number(s.price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}
                <Input
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  placeholder={`Item #${idx + 1} description & scope`}
                  className="h-8.5 rounded-lg text-xs sm:h-8"
                  required
                />
              </div>

              <div className="flex items-center gap-2 sm:contents">
                <div className="flex-1 sm:col-span-2">
                  <span className="text-muted-foreground mb-0.5 block text-[10px] font-semibold sm:hidden">
                    Qty
                  </span>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(item.id, "quantity", parseInt(e.target.value, 10) || 1)
                    }
                    placeholder="Qty"
                    className="h-8.5 rounded-lg text-center text-xs sm:h-8"
                  />
                </div>

                <div className="flex-[1.5] sm:col-span-3">
                  <span className="text-muted-foreground mb-0.5 block text-[10px] font-semibold sm:hidden">
                    Unit Price ($)
                  </span>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 text-xs">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="h-8.5 rounded-lg pl-6 font-mono text-xs sm:h-8"
                    />
                  </div>
                </div>

                <div className="flex items-end justify-end pt-3 sm:col-span-1 sm:items-center sm:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-rose-500/10 h-8.5 w-8.5 rounded-lg p-0 sm:h-7 sm:w-7"
                    title="Remove line item"
                  >
                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financials & Validity Terms */}
      <div className="bg-muted/40 border-border/80 grid grid-cols-1 gap-4 rounded-2xl border p-3.5 md:grid-cols-2">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-muted-foreground text-[11px]">Validity Horizon</Label>
              <select
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="border-input bg-background h-8 w-full rounded-lg border px-2 text-xs"
              >
                <option value={7}>Valid 7 Days</option>
                <option value={14}>Valid 14 Days (Recommended)</option>
                <option value={30}>Valid 30 Days</option>
                <option value={60}>Valid 60 Days</option>
              </select>
            </div>

            <div className="w-24 space-y-1">
              <Label className="text-muted-foreground text-[11px]">Tax Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="h-8 rounded-lg text-center font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-muted-foreground text-[11px]">Discount</Label>
              <div className="flex gap-1.5">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "FIXED" | "PERCENT")}
                  className="border-input bg-background h-8 rounded-lg border px-2 text-xs"
                >
                  <option value="FIXED">$ Fixed</option>
                  <option value="PERCENT">% Percent</option>
                </select>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="h-8 rounded-lg font-mono text-xs"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculations card */}
        <div className="bg-background border-border/80 flex flex-col justify-between rounded-xl border p-3 shadow-xs">
          <div className="space-y-1 text-xs">
            <div className="text-muted-foreground flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            {computedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>
                  Discount ({discountType === "PERCENT" ? `${discountAmount}%` : "Flat"}):
                </span>
                <span className="font-mono">-${computedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="text-muted-foreground flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span className="font-mono">+${computedTax.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-border mt-2 flex items-baseline justify-between border-t pt-2">
            <span className="text-xs font-semibold">Total Estimated:</span>
            <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Terms & Payment Schedule</Label>
          <Textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            className="rounded-xl text-xs"
            placeholder="Specify deposit requirements, turnaround milestones, and deliverables..."
          />
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Executive Overview / Intro (Optional)</Label>
            <Input
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="h-8 rounded-xl text-xs"
              placeholder="Brief summary or scope overview..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Internal Notes (Optional - Team Only)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 rounded-xl text-xs"
              placeholder="Private team notes..."
            />
          </div>
        </div>
      </div>

      <DialogFooter className="flex-col-reverse gap-2 pt-2 sm:flex-row sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-10 w-full rounded-xl sm:h-9 sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createQuoteMutation.isPending}
          className="h-10 w-full rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700 sm:h-9 sm:w-auto"
        >
          {createQuoteMutation.isPending ? "Generating..." : "Save & Generate Estimate"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function QuoteBuilderModal({
  isOpen,
  onClose,
  initialCustomerId,
  initialCustomerName,
  initialItems,
  initialTitle,
  initialNotes,
  organizationId,
}: QuoteBuilderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <DialogContent className="max-h-[94vh] w-[95vw] overflow-y-auto rounded-3xl p-3.5 sm:max-w-3xl sm:p-7">
          <QuoteBuilderForm
            key={`${isOpen}-${initialCustomerId || ""}-${initialCustomerName || ""}`}
            onClose={onClose}
            initialCustomerId={initialCustomerId}
            initialCustomerName={initialCustomerName}
            initialItems={initialItems}
            initialTitle={initialTitle}
            initialNotes={initialNotes}
            organizationId={organizationId}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
