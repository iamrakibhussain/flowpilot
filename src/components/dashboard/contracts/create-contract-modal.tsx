"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/features/customers/use-customers";
import { useCreateContract } from "@/features/contracts/use-contracts";
import { Sparkles, ShieldCheck, Loader2, FileSignature, Wand2, Eye, PenLine, Check } from "lucide-react";
import { interpolateContractVariables } from "@/features/contracts/utils";
import { ContractDocumentPaper } from "./contract-document-paper";

const createContractFormSchema = z.object({
  customerId: z.string().min(1, "Please select a client"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Contract content must be at least 10 characters"),
  expiresAt: z.string().optional(),
});

type FormValues = z.infer<typeof createContractFormSchema>;

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
}

const TEMPLATES = [
  {
    name: "Master Services Agreement (MSA)",
    description:
      "Comprehensive legal framework covering intellectual property, payment terms, and confidentiality.",
    title: "Master Services Agreement",
    content: `# Master Services Agreement

This Master Services Agreement ("Agreement") is entered into as of {{effective_date}} between {{business_name}} ("Service Provider") and {{client_name}} of {{company_name}} ("Client").

## 1. Scope of Services
Service Provider agrees to perform the operational and consulting services outlined in mutually agreed proposals and statements of work.

## 2. Payment Terms & Invoicing
All invoices rendered under this Agreement shall be payable in accordance with the specified payment terms. Late balances beyond 30 days shall accrue interest at 1.5% per month or the statutory maximum.

## 3. Intellectual Property
Upon complete and final settlement of all fees due, all deliverables created specifically for Client shall become the sole property of Client, excluding pre-existing frameworks and foundational code.

## 4. Confidentiality & Non-Disclosure
Both parties agree to treat all business information, financial records, and proprietary data exchanged as strictly confidential for a period of two (2) years following termination.

## 5. Governing Law
This Agreement shall be governed and interpreted under the commercial laws of the primary jurisdiction of the Service Provider.`,
  },
  {
    name: "Fixed-Fee Project Contract",
    description: "Standard project agreement with deliverable milestones and acceptance terms.",
    title: "Fixed-Price Project Agreement",
    content: `# Fixed-Price Project Agreement

This Project Agreement is established on {{effective_date}} between {{business_name}} and {{client_name}} ({{company_name}}).

## 1. Project Objective & Deliverables
The project entails executing the defined milestone deliverables agreed upon in the linked proposal. Any scope modifications outside these deliverables shall be billed under a separate change order.

## 2. Revisions & Acceptance
Client shall have five (5) business days following deliverable milestone submission to submit written revision requests. In the absence of written feedback, deliverables shall be deemed accepted.

## 3. Mutual Warranties
Service Provider warrants that work will be executed in a professional, industry-standard workmanlike manner.`,
  },
  {
    name: "Mutual Non-Disclosure Agreement (NDA)",
    description: "Bilateral confidentiality protection for preliminary strategic evaluations.",
    title: "Mutual Non-Disclosure Agreement",
    content: `# Mutual Non-Disclosure Agreement

This Agreement is entered into on {{effective_date}} between {{business_name}} and {{client_name}} ({{company_name}}).

## 1. Purpose of Disclosure
The parties wish to explore a potential business collaboration and will exchange proprietary information.

## 2. Confidential Information
Refers to all technical, business, financial, or strategic information marked or treated as confidential.

## 3. Exclusions from Confidentiality
Information publicly known or independently developed without reference to confidential information.

## 4. Term & Duration
This Agreement remains binding for three (3) years from the date of disclosure.`,
  },
];

export function CreateContractModal({
  isOpen,
  onClose,
  preselectedCustomerId,
}: CreateContractModalProps) {
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers();
  const createMutation = useCreateContract();
  const customers = customersData?.customers || [];

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createContractFormSchema),
    defaultValues: {
      customerId: preselectedCustomerId || "",
      title: TEMPLATES[0].title,
      content: TEMPLATES[0].content,
      expiresAt: "",
    },
  });

  const selectedCustomerId = watch("customerId");

  React.useEffect(() => {
    if (preselectedCustomerId) {
      setValue("customerId", preselectedCustomerId);
    }
  }, [preselectedCustomerId, setValue]);

  const [activeTemplateName, setActiveTemplateName] = React.useState<string>(TEMPLATES[0].name);
  const [viewTab, setViewTab] = React.useState<"edit" | "preview">("edit");

  const applyTemplate = (tmpl: (typeof TEMPLATES)[number]) => {
    setActiveTemplateName(tmpl.name);
    setValue("title", tmpl.title);
    setValue("content", tmpl.content);
  };

  const insertVariable = (varName: string) => {
    const textarea = textareaRef.current;
    const current = getValues("content") || "";

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = current.substring(0, start);
      const after = current.substring(end);
      const updated = `${before}${varName}${after}`;

      setValue("content", updated);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + varName.length, start + varName.length);
      }, 0);
    } else {
      setValue("content", `${current} ${varName}`);
    }
  };

  const handleAutoFillVariables = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    const currentContent = getValues("content");
    const filled = interpolateContractVariables(currentContent, {
      clientName: customer.name,
      companyName: customer.company || customer.name,
      clientEmail: customer.email,
      businessName: "FlowPilot Enterprise",
    });

    setValue("content", filled);
  };

  const onSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync({
      customerId: values.customerId,
      title: values.title.trim(),
      content: values.content.trim(),
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
    });
    reset();
    onClose();
  };

  const { ref: formContentRef, ...contentRegisterRest } = register("content");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <FileSignature className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">Draft Legal Contract</DialogTitle>
              <DialogDescription className="text-xs">
                Draft a legally binding agreement ready for cryptographic client e-signature.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          {/* Client Selector */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-foreground text-xs font-semibold">
                Client / Signatory <span className="text-rose-500">*</span>
              </label>
              {selectedCustomerId && (
                <button
                  type="button"
                  onClick={handleAutoFillVariables}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer dark:text-blue-400"
                >
                  <Wand2 className="h-3 w-3" /> Auto-fill client into template
                </button>
              )}
            </div>
            <div className="relative mt-1">
              <select
                {...register("customerId")}
                disabled={isLoadingCustomers}
                className="border-input bg-background text-foreground focus:ring-primary w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
              >
                <option value="">-- Select Client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""} — {c.email}
                  </option>
                ))}
              </select>
            </div>
            {errors.customerId && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.customerId.message}</p>
            )}
          </div>

          {/* Template Quick Picks */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Choose Contract Template
              </label>
            </div>
            <div className="mt-1.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {TEMPLATES.map((tmpl) => {
                const isSelected = activeTemplateName === tmpl.name;
                return (
                  <button
                    type="button"
                    key={tmpl.name}
                    onClick={() => applyTemplate(tmpl)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-sm ring-1 ring-blue-500/30"
                        : "border-border/70 hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
                        {tmpl.name}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 dark:text-blue-400" />}
                    </div>
                    <span className="text-muted-foreground mt-1 line-clamp-2 text-[10px] leading-relaxed">
                      {tmpl.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Expiry */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-foreground text-xs font-semibold">
                Contract Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="e.g. Master Services Agreement"
                className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
              />
              {errors.title && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="text-foreground text-xs font-semibold">Signature Deadline</label>
              <input
                type="date"
                {...register("expiresAt")}
                className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Mode Switcher: Edit Terms vs Live Legal Paper Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-2 pt-1">
            <div className="flex w-full sm:w-auto items-center gap-1 rounded-xl bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setViewTab("edit")}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewTab === "edit"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenLine className="h-3.5 w-3.5" />
                <span>Edit Terms</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab("preview")}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewTab === "preview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Live Paper Preview</span>
              </button>
            </div>

            {viewTab === "edit" && (
              <span className="text-[10px] text-muted-foreground font-mono">
                Markdown headings & variables supported
              </span>
            )}
          </div>

          {viewTab === "edit" ? (
            <>
              {/* Dynamic Variable Chips */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground text-xs font-semibold">
                    Insert Dynamic Template Variables (Inserts at cursor)
                  </label>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    { label: "Client Name", tag: "{{client_name}}" },
                    { label: "Company", tag: "{{company_name}}" },
                    { label: "Business Name", tag: "{{business_name}}" },
                    { label: "Effective Date", tag: "{{effective_date}}" },
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="border-border/80 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      + {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="text-foreground text-xs font-semibold">
                  Contract Terms & Clauses (Markdown / Text) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={9}
                  {...contentRegisterRest}
                  ref={(el) => {
                    formContentRef(el);
                    textareaRef.current = el;
                  }}
                  className="border-input bg-background text-foreground focus:ring-primary mt-1 w-full rounded-xl border p-3 font-mono text-xs focus:ring-2 focus:outline-none"
                />
                {errors.content && (
                  <p className="mt-1 text-[11px] text-rose-500">{errors.content.message}</p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-2 sm:p-4 max-h-[50vh] overflow-y-auto dark:border-slate-800 dark:bg-slate-950/60 shadow-inner">
              <ContractDocumentPaper
                contract={{
                  id: "preview-contract",
                  contractNumber: "CNT-2026-PREVIEW",
                  title: watch("title") || "Untitled Agreement",
                  content: watch("content") || "",
                  status: "DRAFT",
                  issuedAt: new Date().toISOString(),
                  expiresAt: watch("expiresAt") || null,
                  signedAt: null,
                  signerName: null,
                  signerEmail: null,
                  signatureData: null,
                  signatureType: null,
                  contentChecksum: null,
                  countersignedAt: null,
                  countersignerName: null,
                  countersignatureData: null,
                  customer: customers.find((c) => c.id === selectedCustomerId) || {
                    id: "preview-cust-id",
                    name: "Client Signatory",
                    email: "client@example.com",
                    company: "Client Organization",
                  },
                  organization: { id: "preview-org", name: "FlowPilot Enterprise" },
                }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-border/60 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>SHA-256 cryptographic audit trail attached on signature.</span>
            </div>
            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Draft Contract"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
