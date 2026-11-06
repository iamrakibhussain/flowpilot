"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  FileSignature,
  FileCheck2,
  CreditCard,
  Calendar,
  FolderKanban,
  FileText,
  Mail,
  Bell,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateFlowRuleInput } from "@/features/automations/types";

interface PrebuiltTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CreateFlowRuleInput) => void;
}

export function PrebuiltTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: PrebuiltTemplatesModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const recipes: Array<{
    id: string;
    title: string;
    description: string;
    trigger: CreateFlowRuleInput["trigger"];
    triggerLabel: string;
    action: CreateFlowRuleInput["action"];
    actionLabel: string;
    triggerIcon: React.ElementType;
    actionIcon: React.ElementType;
    badge: string;
    config: Partial<CreateFlowRuleInput>;
  }> = [
    {
      id: "contract-to-project",
      title: "Contract Signed ➔ Launch Delivery Project",
      description:
        "When a client completes digital signature ceremony, automatically create a new project in Planning status with kickoff checklist.",
      trigger: "CONTRACT_SIGNED",
      triggerLabel: "Contract Signed",
      action: "CREATE_PROJECT",
      actionLabel: "Launch Delivery Project",
      triggerIcon: FileSignature,
      actionIcon: FolderKanban,
      badge: "Most Popular",
      config: {
        title: "Contract Signed ➔ Launch Delivery Project",
        description: "Auto-create project and kickoff tasks upon signature completion.",
        trigger: "CONTRACT_SIGNED",
        action: "CREATE_PROJECT",
        conditions: { minAmount: 1000 },
        actionConfig: {
          projectTitleTemplate: "Delivery: {{entityTitle}}",
        },
      },
    },
    {
      id: "quote-to-invoice",
      title: "Quote Accepted ➔ Generate 50% Deposit Invoice",
      description:
        "When a client approves an estimate, instantly generate an invoice for a 50% deposit with a 14-day payment link token.",
      trigger: "QUOTE_ACCEPTED",
      triggerLabel: "Quote Accepted",
      action: "CREATE_INVOICE",
      actionLabel: "Generate 50% Deposit",
      triggerIcon: FileCheck2,
      actionIcon: FileText,
      badge: "High Value",
      config: {
        title: "Quote Accepted ➔ 50% Deposit Invoice",
        description: "Auto-generate deposit invoice with online payment token.",
        trigger: "QUOTE_ACCEPTED",
        action: "CREATE_INVOICE",
        actionConfig: {
          depositPercent: 50,
          paymentDueDays: 14,
        },
      },
    },
    {
      id: "invoice-to-email",
      title: "Invoice Paid ➔ Dispatch Welcome & Onboarding",
      description:
        "When payment settles via Stripe or bank transfer, send a personalized onboarding welcome email to the client.",
      trigger: "INVOICE_PAID",
      triggerLabel: "Invoice Paid",
      action: "SEND_EMAIL",
      actionLabel: "Send Welcome Email",
      triggerIcon: CreditCard,
      actionIcon: Mail,
      badge: "Client Delight",
      config: {
        title: "Invoice Paid ➔ Welcome & Onboarding Email",
        description: "Dispatch instant client onboarding welcome message.",
        trigger: "INVOICE_PAID",
        action: "SEND_EMAIL",
        actionConfig: {
          emailSubjectTemplate: "Welcome! Your payment was received for {{entityTitle}}",
          emailBodyTemplate:
            "Hello {{customerName}},\n\nThank you for settling your invoice! Our team has been assigned and kickoff starts today.\n\nBest,\nFlowPilot Team",
        },
      },
    },
    {
      id: "appointment-to-notify",
      title: "Appointment Booked ➔ Team Notification Alert",
      description:
        "When a customer reserves a calendar slot, broadcast an immediate in-app alert to all workspace staff members.",
      trigger: "APPOINTMENT_BOOKED",
      triggerLabel: "Appointment Booked",
      action: "CREATE_NOTIFICATION",
      actionLabel: "Broadcast Team Alert",
      triggerIcon: Calendar,
      actionIcon: Bell,
      badge: "Operations",
      config: {
        title: "Appointment Booked ➔ Team Alert",
        description: "Notify staff members of incoming scheduled booking.",
        trigger: "APPOINTMENT_BOOKED",
        action: "CREATE_NOTIFICATION",
        actionConfig: {
          notificationMessage: "New client consultation booked via calendar.",
        },
      },
    },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4"
    >
      <div className="border-border/80 bg-background relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[90vh]">
        {/* Header */}
        <div className="border-border/80 bg-card flex items-center justify-between border-b px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="to-primary shadow-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 text-xs font-black text-white shadow-md sm:h-10 sm:w-10">
              <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate text-sm font-bold tracking-tight sm:text-base">
                Prebuilt Workflow Recipes
              </h3>
              <p className="text-muted-foreground truncate text-[11px] sm:text-xs">
                Deploy battle-tested automation templates with a single click.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0 rounded-xl"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Recipe Cards List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-3.5 sm:p-5">
          {recipes.map((recipe) => {
            const TriggerIcon = recipe.triggerIcon;
            const ActionIcon = recipe.actionIcon;

            return (
              <div
                key={recipe.id}
                className="border-border/80 bg-card/70 hover:border-primary/50 hover:shadow-primary/5 group relative rounded-xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold">
                        {recipe.badge}
                      </span>
                    </div>

                    <h4 className="text-foreground group-hover:text-primary text-sm font-bold tracking-tight transition-colors">
                      {recipe.title}
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {recipe.description}
                    </p>

                    {/* Flow Pills */}
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 pt-1.5 text-xs">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/25 bg-purple-500/10 px-2 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                        <TriggerIcon className="h-3 w-3" />
                        <span>{recipe.triggerLabel}</span>
                      </div>
                      <ArrowRight className="text-muted-foreground/60 h-3 w-3 shrink-0" />
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-indigo-500/10 px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <ActionIcon className="h-3 w-3" />
                        <span>{recipe.actionLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 sm:flex sm:justify-end sm:pt-0">
                    <Button
                      onClick={() => {
                        onSelectTemplate(recipe.config as CreateFlowRuleInput);
                        onClose();
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full text-xs font-semibold shadow-xs sm:h-9 sm:w-auto"
                    >
                      Use Recipe
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-border/80 bg-card flex items-center justify-end border-t px-4 py-2.5 sm:px-5 sm:py-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 w-full text-xs font-semibold sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
