"use client";

import * as React from "react";
import {
  UserCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
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
import { useUpdateCustomer } from "@/features/customers/use-customers";
import type {
  CustomerStatusType,
  CustomerListItem,
  CustomerDetailResponse,
} from "@/features/customers/types";

export interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerListItem | CustomerDetailResponse | null;
  onSuccess?: () => void;
}

const AVAILABLE_TAGS = [
  { name: "VIP", color: "border-purple-200 bg-purple-50 text-purple-700 active:bg-purple-600" },
  { name: "Enterprise", color: "border-blue-200 bg-blue-50 text-blue-700 active:bg-blue-600" },
  {
    name: "Retainer",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700 active:bg-emerald-600",
  },
  {
    name: "Commercial",
    color: "border-indigo-200 bg-indigo-50 text-indigo-700 active:bg-indigo-600",
  },
  { name: "Residential", color: "border-cyan-200 bg-cyan-50 text-cyan-700 active:bg-cyan-600" },
  { name: "New Lead", color: "border-amber-200 bg-amber-50 text-amber-700 active:bg-amber-600" },
];

interface EditCustomerFormProps {
  customer: CustomerListItem | CustomerDetailResponse;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditCustomerForm({ customer, onClose, onSuccess }: EditCustomerFormProps) {
  const updateMutation = useUpdateCustomer();

  const [name, setName] = React.useState(customer.name ?? "");
  const [email, setEmail] = React.useState(customer.email ?? "");
  const [phone, setPhone] = React.useState(customer.phone ?? "");
  const [company, setCompany] = React.useState(customer.company ?? "");
  const [address, setAddress] = React.useState(customer.address ?? "");
  const [status, setStatus] = React.useState<CustomerStatusType>(customer.status ?? "ACTIVE");
  const [selectedTags, setSelectedTags] = React.useState<string[]>(customer.tags ?? []);
  const [newTagInput, setNewTagInput] = React.useState("");

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const trimmed = newTagInput.trim();
      if (!selectedTags.includes(trimmed)) {
        setSelectedTags((prev) => [...prev, trimmed]);
      }
      setNewTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name or primary contact is required.";
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || updateMutation.isPending) return;

    setServerError(null);
    try {
      await updateMutation.mutateAsync({
        id: customer.id,
        payload: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          company: company.trim() || null,
          address: address.trim() || null,
          status,
          tags: selectedTags,
        },
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update customer.";
      setServerError(msg);
    }
  };

  return (
    <>
      <DialogHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-extrabold tracking-tight text-slate-900">
              Edit Client Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update verified contact information, account status, and multi-segment tags.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {serverError && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h4 className="mt-3.5 text-base font-extrabold text-slate-900">
            Client Record Updated Successfully
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            All modifications have been committed to PostgreSQL.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-bold text-slate-700">
                Full Name / Primary Contact <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className={`h-9.5 rounded-xl border-slate-200 bg-slate-50/70 text-xs transition-colors focus:bg-white ${
                  errors.name ? "border-rose-400 focus-visible:ring-rose-400" : ""
                }`}
              />
              {errors.name && (
                <p className="text-[11px] font-semibold text-rose-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-bold text-slate-700">
                Corporate Email <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@acme.com"
                  className={`h-9.5 rounded-xl border-slate-200 bg-slate-50/70 pl-9 text-xs transition-colors focus:bg-white ${
                    errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-semibold text-rose-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-company" className="text-xs font-bold text-slate-700">
                Company / Organization Account
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Global Inc"
                  className="h-9.5 rounded-xl border-slate-200 bg-slate-50/70 pl-9 text-xs transition-colors focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700">
                Direct Phone
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="h-9.5 rounded-xl border-slate-200 bg-slate-50/70 pl-9 text-xs transition-colors focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-address" className="text-xs font-bold text-slate-700">
                Billing / Street Address
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Corporate Blvd, Suite 400"
                  className="h-9.5 rounded-xl border-slate-200 bg-slate-50/70 pl-9 text-xs transition-colors focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-status" className="text-xs font-bold text-slate-700">
                Lifecycle Status
              </Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatusType)}
                className="flex h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs transition-colors outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="ACTIVE">ACTIVE (Operational Client)</option>
                <option value="LEAD">LEAD (Sales Prospect)</option>
                <option value="INACTIVE">INACTIVE (Archived)</option>
              </select>
            </div>
          </div>

          {/* Segment Tags */}
          <div className="space-y-2 pt-1">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span>Customer Segment Tags</span>
            </Label>

            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className={`inline-flex cursor-pointer items-center rounded-xl border px-3 py-1 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                        : "border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{isSelected ? "✓ " : "+ "}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Currently Selected Custom Tags */}
            {selectedTags.filter((tag) => !AVAILABLE_TAGS.some((at) => at.name === tag)).length >
              0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTags
                  .filter((tag) => !AVAILABLE_TAGS.some((at) => at.name === tag))
                  .map((customTag) => (
                    <span
                      key={customTag}
                      className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700"
                    >
                      <span>{customTag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(customTag)}
                        className="cursor-pointer text-indigo-400 hover:text-indigo-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <div className="pt-1">
              <Input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Type custom tag and press Enter to add..."
                className="h-8.5 rounded-xl border-slate-200 bg-slate-50/70 text-xs focus:bg-white"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="bg-primary hover:bg-primary/90 cursor-pointer rounded-xl px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  );
}

export function EditCustomerModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: EditCustomerModalProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl sm:max-w-xl">
        <EditCustomerForm
          key={customer.id}
          customer={customer}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
