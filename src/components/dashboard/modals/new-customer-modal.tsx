"use client";

import * as React from "react";
import {
  UserPlus,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
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
import { useDashboardMutations, useOnDutyStaffData } from "@/features/dashboard/use-dashboard";

export interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customer: CustomerFormData) => void;
}

export interface CustomerFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  tier: "Enterprise" | "Growth" | "Startup" | "Consulting";
  currency: "USD" | "EUR" | "GBP" | "BDT";
  assignedStaff: string;
  notes: string;
}

export function NewCustomerModal({ isOpen, onClose, onSuccess }: NewCustomerModalProps) {
  const { createCustomer } = useDashboardMutations();
  const staffQuery = useOnDutyStaffData();
  const staffMembers = staffQuery.data ?? [];
  const defaultStaff = staffMembers[0]?.name ?? "Primary Account Manager";

  const [formData, setFormData] = React.useState<CustomerFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    tier: "Growth",
    currency: "USD",
    assignedStaff: defaultStaff,
    notes: "",
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      tier: "Growth",
      currency: "USD",
      assignedStaff: defaultStaff,
      notes: "",
    });
    setErrors({});
    setServerError(null);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const errs: Partial<Record<keyof CustomerFormData, string>> = {};
    if (!formData.companyName.trim()) {
      errs.companyName = "Company or business name is required.";
    }
    if (!formData.contactName.trim()) {
      errs.contactName = "Primary contact person name is required.";
    }
    if (!formData.email.trim()) {
      errs.email = "Corporate email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await createCustomer({
        name: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        tier: formData.tier,
        currency: formData.currency,
        assignedStaff: formData.assignedStaff,
        notes: formData.notes,
      });
      setIsSuccess(true);
      if (onSuccess) onSuccess(formData);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to onboard customer. Please try again.";
      console.error("Customer creation failed:", err);
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-2xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Onboard New Customer Record
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Register a business account, configure billing tier, and assign an account manager.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Customer Successfully Onboarded!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{formData.companyName}</span> has been
              provisioned in the workspace CRM database.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              CRM Sync Verified
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Primary Details Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold text-slate-700">
                  Company / Account Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="companyName"
                    placeholder="e.g. Apex Global Holdings"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, companyName: e.target.value }));
                      if (errors.companyName) setErrors((p) => ({ ...p, companyName: undefined }));
                    }}
                    className={`pl-9 text-xs ${errors.companyName ? "border-rose-400 ring-rose-200" : ""}`}
                  />
                </div>
                {errors.companyName && (
                  <p className="text-[11px] font-medium text-rose-500">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="text-xs font-semibold text-slate-700">
                  Primary Contact Person <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="contactName"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, contactName: e.target.value }));
                      if (errors.contactName) setErrors((p) => ({ ...p, contactName: undefined }));
                    }}
                    className={`pl-9 text-xs ${errors.contactName ? "border-rose-400 ring-rose-200" : ""}`}
                  />
                </div>
                {errors.contactName && (
                  <p className="text-[11px] font-medium text-rose-500">{errors.contactName}</p>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Corporate Email <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="billing@apexholdings.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, email: e.target.value }));
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    className={`pl-9 text-xs ${errors.email ? "border-rose-400 ring-rose-200" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-medium text-rose-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 392-8812"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Tier & Currency */}
            <div className="grid gap-3.5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="tier" className="text-xs font-semibold text-slate-700">
                  Client Tier
                </Label>
                <select
                  id="tier"
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      tier: e.target.value as CustomerFormData["tier"],
                    }))
                  }
                  className="focus:ring-primary w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                >
                  <option value="Enterprise">Enterprise (High Touch)</option>
                  <option value="Growth">Mid-Market Growth</option>
                  <option value="Startup">Early Stage Startup</option>
                  <option value="Consulting">Consulting Retainer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs font-semibold text-slate-700">
                  Billing Currency
                </Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      currency: e.target.value as CustomerFormData["currency"],
                    }))
                  }
                  className="focus:ring-primary w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staff" className="text-xs font-semibold text-slate-700">
                  Account Manager
                </Label>
                <select
                  id="staff"
                  value={formData.assignedStaff}
                  onChange={(e) => setFormData((p) => ({ ...p, assignedStaff: e.target.value }))}
                  className="focus:ring-primary w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                >
                  {staffMembers.length > 0 ? (
                    staffMembers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Primary Account Manager">Primary Account Manager</option>
                      <option value="Workspace Admin">Workspace Admin</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                Onboarding Notes & Special Instructions
              </Label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Key stakeholders, SLA preferences, or procurement codes..."
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                className="focus:ring-primary w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs outline-none focus:ring-2"
              />
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="from-primary shadow-primary/25 bg-gradient-to-r via-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registering Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Create Client Account
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
