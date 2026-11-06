"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  FileSignature,
  FileCheck2,
  CreditCard,
  Calendar,
  Users,
  FolderKanban,
  FileText,
  Mail,
  Bell,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFlowRule, useUpdateFlowRule } from "@/features/automations/use-automations";
import type {
  FlowRuleTrigger,
  FlowRuleAction,
  FlowRuleListItem,
  CreateFlowRuleInput,
} from "@/features/automations/types";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRule?: FlowRuleListItem | null;
  initialTemplate?: Partial<CreateFlowRuleInput> | null;
}

export function RuleBuilderModal(props: RuleBuilderModalProps) {
  if (!props.isOpen) return null;

  return (
    <RuleBuilderModalContent
      key={`${props.editRule?.id || "new"}-${props.initialTemplate?.title || "default"}`}
      {...props}
    />
  );
}

function RuleBuilderModalContent({ onClose, editRule, initialTemplate }: RuleBuilderModalProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [title, setTitle] = React.useState(
    () => editRule?.title || initialTemplate?.title || "Contract Signed ➔ Launch Delivery Project"
  );
  const [description, setDescription] = React.useState(
    () =>
      editRule?.description ||
      initialTemplate?.description ||
      "Automatically create a delivery project with kickoff checklist upon contract signing."
  );
  const [trigger, setTrigger] = React.useState<FlowRuleTrigger>(
    () => editRule?.trigger || initialTemplate?.trigger || "CONTRACT_SIGNED"
  );
  const [action, setAction] = React.useState<FlowRuleAction>(
    () => editRule?.action || initialTemplate?.action || "CREATE_PROJECT"
  );

  // Conditions
  const [minAmount, setMinAmount] = React.useState<string>(() =>
    editRule?.conditions?.minAmount
      ? String(editRule.conditions.minAmount)
      : initialTemplate?.conditions?.minAmount
        ? String(initialTemplate.conditions.minAmount)
        : ""
  );

  // Action config
  const [projectTitleTemplate, setProjectTitleTemplate] = React.useState(
    () =>
      editRule?.actionConfig?.projectTitleTemplate ||
      initialTemplate?.actionConfig?.projectTitleTemplate ||
      "Delivery: {{entityTitle}}"
  );
  const [depositPercent, setDepositPercent] = React.useState(() =>
    editRule?.actionConfig?.depositPercent
      ? String(editRule.actionConfig.depositPercent)
      : initialTemplate?.actionConfig?.depositPercent
        ? String(initialTemplate.actionConfig.depositPercent)
        : "50"
  );
  const [paymentDueDays, setPaymentDueDays] = React.useState(() =>
    editRule?.actionConfig?.paymentDueDays ? String(editRule.actionConfig.paymentDueDays) : "14"
  );
  const [emailSubjectTemplate, setEmailSubjectTemplate] = React.useState(
    () => editRule?.actionConfig?.emailSubjectTemplate || "Welcome to your project: {{entityTitle}}"
  );
  const [emailBodyTemplate, setEmailBodyTemplate] = React.useState(
    () =>
      editRule?.actionConfig?.emailBodyTemplate ||
      (editRule
        ? ""
        : "Hello {{customerName}},\n\nThank you for choosing FlowPilot. Your delivery workflow has begun!")
  );
  const [notificationMessage, setNotificationMessage] = React.useState(
    () =>
      editRule?.actionConfig?.notificationMessage ||
      (editRule ? "" : "New automated workflow event triggered.")
  );

  const createMutation = useCreateFlowRule();
  const updateMutation = useUpdateFlowRule();

  const triggerOptions: Array<{
    id: FlowRuleTrigger;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }> = [
    {
      id: "CONTRACT_SIGNED",
      title: "Contract Signed",
      description: "Client completes digital signature ceremony on proposal or contract agreement.",
      icon: FileSignature,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/25",
    },
    {
      id: "QUOTE_ACCEPTED",
      title: "Quote Accepted",
      description:
        "Client accepts and approves a digital estimate through the self-service portal.",
      icon: FileCheck2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/25",
    },
    {
      id: "INVOICE_PAID",
      title: "Invoice Paid",
      description: "Stripe online payment settles or a manual invoice payment is recorded.",
      icon: CreditCard,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/25",
    },
    {
      id: "APPOINTMENT_BOOKED",
      title: "Appointment Booked",
      description:
        "Customer schedules a consultation or meeting via booking page or staff calendar.",
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/25",
    },
    {
      id: "CUSTOMER_CREATED",
      title: "Customer Created",
      description: "A new client profile is added to the multi-tenant CRM database.",
      icon: Users,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/25",
    },
  ];

  const actionOptions: Array<{
    id: FlowRuleAction;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }> = [
    {
      id: "CREATE_PROJECT",
      title: "Launch Delivery Project",
      description: "Auto-create a project with customizable naming and kickoff task checklist.",
      icon: FolderKanban,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/25",
    },
    {
      id: "CREATE_INVOICE",
      title: "Generate Deposit Invoice",
      description: "Auto-generate a deposit invoice (e.g. 50%) with a secure online payment token.",
      icon: FileText,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/25",
    },
    {
      id: "SEND_EMAIL",
      title: "Dispatch Email Notification",
      description: "Send custom client welcome or onboarding notification with dynamic tags.",
      icon: Mail,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/25",
    },
    {
      id: "CREATE_NOTIFICATION",
      title: "Broadcast In-App Alert",
      description: "Notify all workspace team members instantly on their dashboard bell menu.",
      icon: Bell,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/25",
    },
  ];

  const handleSave = async () => {
    if (!title.trim()) return;

    const conditions: Record<string, unknown> = {};
    if (minAmount.trim() && !isNaN(Number(minAmount))) {
      conditions.minAmount = Number(minAmount);
    }

    const actionConfig: Record<string, unknown> = {};
    if (action === "CREATE_PROJECT") {
      actionConfig.projectTitleTemplate = projectTitleTemplate.trim();
    } else if (action === "CREATE_INVOICE") {
      actionConfig.depositPercent = Number(depositPercent) || 50;
      actionConfig.paymentDueDays = Number(paymentDueDays) || 14;
    } else if (action === "SEND_EMAIL") {
      actionConfig.emailSubjectTemplate = emailSubjectTemplate.trim();
      actionConfig.emailBodyTemplate = emailBodyTemplate.trim();
    } else if (action === "CREATE_NOTIFICATION") {
      actionConfig.notificationMessage = notificationMessage.trim();
    }

    if (editRule) {
      await updateMutation.mutateAsync({
        id: editRule.id,
        input: {
          title: title.trim(),
          description: description.trim() || null,
          trigger,
          action,
          conditions,
          actionConfig,
        },
      });
    } else {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        trigger,
        action,
        conditions,
        actionConfig,
        isActive: true,
      });
    }

    onClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4">
      <div className="border-border/80 bg-background relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border/80 bg-card flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="to-primary shadow-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 text-xs font-black text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight">
                {editRule ? "Edit Automation Rule" : "Visual Workflow Composer"}
              </h3>
              <p className="text-muted-foreground text-xs">
                Step {currentStep} of 4:{" "}
                {currentStep === 1
                  ? "Choose Trigger Event"
                  : currentStep === 2
                    ? "Matching Conditions"
                    : currentStep === 3
                      ? "Autonomous Action"
                      : "Review & Publish"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-muted/30 border-border/50 flex items-center justify-between border-b px-5 py-2.5 text-xs font-semibold">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex items-center gap-1.5 ${
                currentStep === stepNum
                  ? "text-primary font-bold"
                  : currentStep > stepNum
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground/60"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  currentStep === stepNum
                    ? "bg-primary text-primary-foreground"
                    : currentStep > stepNum
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > stepNum ? <Check className="h-3 w-3" /> : stepNum}
              </span>
              <span className="hidden sm:inline">
                {stepNum === 1
                  ? "Trigger"
                  : stepNum === 2
                    ? "Conditions"
                    : stepNum === 3
                      ? "Action"
                      : "Publish"}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* STEP 1: TRIGGER SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="mb-2">
                <h4 className="text-foreground text-sm font-bold">
                  When this business event occurs:
                </h4>
                <p className="text-muted-foreground text-xs">
                  Select the platform event that will autonomously initiate this pipeline.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {triggerOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = trigger === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setTrigger(opt.id)}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/70 hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${opt.bg} ${opt.color}`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground text-xs font-bold">{opt.title}</span>
                          {isSelected && <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />}
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CONDITIONS & CRITERIA */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h4 className="text-foreground text-sm font-bold">
                  Execute only if matching these criteria:
                </h4>
                <p className="text-muted-foreground text-xs">
                  Optional constraints. Leave blank to run on all {trigger} events.
                </p>
              </div>

              <div className="border-border/80 bg-card space-y-3 rounded-xl border p-4">
                <Label htmlFor="minAmount" className="text-xs font-semibold">
                  Minimum Entity / Transaction Amount ($ USD)
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="e.g. 500 (Leave blank for no minimum)"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-muted-foreground text-[11px]">
                  Example: If set to $500, contracts or quotes under $500 will not trigger this
                  action.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: ACTION SELECTION & CONFIGURATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h4 className="text-foreground text-sm font-bold">
                  Then perform this autonomous action:
                </h4>
                <p className="text-muted-foreground text-xs">
                  Select and configure the automated workflow task.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {actionOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = action === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setAction(opt.id)}
                      className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/70 hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${opt.bg} ${opt.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {isSelected && <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />}
                      </div>
                      <div className="mt-2.5">
                        <span className="text-foreground block text-xs font-bold">{opt.title}</span>
                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Parameter Inputs */}
              <div className="border-border/80 bg-card space-y-3 rounded-xl border p-4 pt-3">
                <h5 className="text-primary text-xs font-bold tracking-wider uppercase">
                  Action Parameters
                </h5>

                {action === "CREATE_PROJECT" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="prjTemplate" className="text-xs font-semibold">
                      Project Name Template
                    </Label>
                    <Input
                      id="prjTemplate"
                      value={projectTitleTemplate}
                      onChange={(e) => setProjectTitleTemplate(e.target.value)}
                      placeholder="e.g. Delivery: {{entityTitle}}"
                      className="h-9 text-xs"
                    />
                    <p className="text-muted-foreground text-[11px]">
                      Supported placeholder tokens: <code>{"{{entityTitle}}"}</code>,{" "}
                      <code>{"{{customerName}}"}</code>
                    </p>
                  </div>
                )}

                {action === "CREATE_INVOICE" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="depositPercent" className="text-xs font-semibold">
                        Deposit Percentage (%)
                      </Label>
                      <Input
                        id="depositPercent"
                        type="number"
                        min="1"
                        max="100"
                        value={depositPercent}
                        onChange={(e) => setDepositPercent(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="paymentDueDays" className="text-xs font-semibold">
                        Payment Due Window (Days)
                      </Label>
                      <Input
                        id="paymentDueDays"
                        type="number"
                        min="1"
                        max="90"
                        value={paymentDueDays}
                        onChange={(e) => setPaymentDueDays(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                )}

                {action === "SEND_EMAIL" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="emailSub" className="text-xs font-semibold">
                        Email Subject
                      </Label>
                      <Input
                        id="emailSub"
                        value={emailSubjectTemplate}
                        onChange={(e) => setEmailSubjectTemplate(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="emailBody" className="text-xs font-semibold">
                        Email Body
                      </Label>
                      <textarea
                        id="emailBody"
                        rows={3}
                        value={emailBodyTemplate}
                        onChange={(e) => setEmailBodyTemplate(e.target.value)}
                        className="border-border bg-background flex w-full rounded-md border p-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {action === "CREATE_NOTIFICATION" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="alertMsg" className="text-xs font-semibold">
                      Team Alert Message
                    </Label>
                    <Input
                      id="alertMsg"
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="e.g. Contract signed! Delivery pipeline initialized."
                      className="h-9 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PUBLISH */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h4 className="text-foreground text-sm font-bold">Review & Deploy Automation:</h4>
                <p className="text-muted-foreground text-xs">
                  Give your workflow rule a descriptive name and deploy it live.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ruleTitle" className="text-xs font-semibold">
                    Automation Rule Title *
                  </Label>
                  <Input
                    id="ruleTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Contract Signed ➔ Launch Delivery Project"
                    className="h-9 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ruleDesc" className="text-xs font-semibold">
                    Description (Optional)
                  </Label>
                  <Input
                    id="ruleDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Creates a project and notifies team immediately."
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Visual Pipeline Preview */}
              <div className="border-border/80 from-card via-card/95 to-card/85 space-y-2 rounded-xl border bg-gradient-to-b p-4 shadow-xs">
                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Live Flow Architecture
                </span>

                <div className="flex flex-col items-center justify-between gap-2 pt-2 sm:flex-row">
                  <div className="border-border/60 bg-background/60 flex w-full items-center gap-2 rounded-lg border p-2 text-xs sm:w-auto">
                    <Zap className="h-4 w-4 shrink-0 text-purple-500" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Trigger</span>
                      <span className="text-foreground font-bold">{trigger}</span>
                    </div>
                  </div>

                  <ArrowRight className="text-muted-foreground h-4 w-4 rotate-90 sm:rotate-0" />

                  <div className="border-border/60 bg-background/60 flex w-full items-center gap-2 rounded-lg border p-2 text-xs sm:w-auto">
                    <Layers className="h-4 w-4 shrink-0 text-blue-500" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Condition</span>
                      <span className="text-foreground font-bold">
                        {minAmount ? `≥ $${minAmount}` : "All Events"}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="text-muted-foreground h-4 w-4 rotate-90 sm:rotate-0" />

                  <div className="border-border/60 bg-background/60 flex w-full items-center gap-2 rounded-lg border p-2 text-xs sm:w-auto">
                    <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Action</span>
                      <span className="text-foreground font-bold">{action}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="border-border/80 bg-card flex items-center justify-between border-t px-5 py-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)}
              className="h-8.5 text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as 1 | 2 | 3 | 4)}
              className="bg-primary text-primary-foreground h-10 px-4 text-xs font-semibold sm:h-9"
            >
              Continue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={!title.trim() || isSubmitting}
              onClick={handleSave}
              className="h-10 bg-emerald-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 sm:h-9"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {isSubmitting
                ? "Deploying..."
                : editRule
                  ? "Update Automation Rule"
                  : "Deploy Automation Rule"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
