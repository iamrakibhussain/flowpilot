"use client";

import * as React from "react";
import {
  X,
  Clock,
  Calendar,
  FileSignature,
  FileCheck2,
  CreditCard,
  Users,
  FolderKanban,
  FileText,
  Mail,
  Bell,
  ArrowRight,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Check,
  Copy,
  Trash2,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useFlowRule,
  useFlowRuleExecutions,
  useToggleFlowRule,
  useDeleteFlowRule,
} from "@/features/automations/use-automations";
import type {
  FlowRuleListItem,
  FlowRuleTrigger,
  FlowRuleAction,
} from "@/features/automations/types";

interface RuleInspectorDrawerProps {
  ruleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTestModal?: (rule: FlowRuleListItem) => void;
  onOpenEditModal?: (rule: FlowRuleListItem) => void;
}

export function RuleInspectorDrawer({
  ruleId,
  isOpen,
  onClose,
  onOpenTestModal,
  onOpenEditModal,
}: RuleInspectorDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "executions">("overview");
  const [isCopied, setIsCopied] = React.useState(false);
  const [showRawJson, setShowRawJson] = React.useState(false);

  const { data: rule, isLoading: isRuleLoading } = useFlowRule(ruleId || "");
  const { data: executionsData, isLoading: isExecutionsLoading } = useFlowRuleExecutions(
    ruleId || "",
    { limit: 25 }
  );

  const toggleMutation = useToggleFlowRule();
  const deleteMutation = useDeleteFlowRule();

  // Close on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !ruleId) return null;

  const handleCopyId = () => {
    if (!rule) return;
    try {
      navigator.clipboard.writeText(rule.id);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggle = async () => {
    if (!rule) return;
    await toggleMutation.mutateAsync({ id: rule.id, isActive: !rule.isActive });
  };

  const handleDelete = async () => {
    if (!rule) return;
    if (
      confirm(`Are you sure you want to permanently delete the automation rule "${rule.title}"?`)
    ) {
      await deleteMutation.mutateAsync(rule.id);
      onClose();
    }
  };

  const executions = Array.isArray(executionsData?.executions) ? executionsData.executions : [];

  const triggerLabels: Record<FlowRuleTrigger, { label: string; icon: React.ElementType }> = {
    CONTRACT_SIGNED: { label: "Contract Signed", icon: FileSignature },
    QUOTE_ACCEPTED: { label: "Quote Accepted", icon: FileCheck2 },
    INVOICE_PAID: { label: "Invoice Paid", icon: CreditCard },
    APPOINTMENT_BOOKED: { label: "Appointment Booked", icon: Calendar },
    CUSTOMER_CREATED: { label: "Customer Created", icon: Users },
  };

  const actionLabels: Record<FlowRuleAction, { label: string; icon: React.ElementType }> = {
    CREATE_PROJECT: { label: "Launch Project", icon: FolderKanban },
    CREATE_INVOICE: { label: "Generate Deposit Invoice", icon: FileText },
    SEND_EMAIL: { label: "Send Email Notification", icon: Mail },
    CREATE_NOTIFICATION: { label: "Broadcast Alert", icon: Bell },
  };

  const triggerMeta = rule ? triggerLabels[rule.trigger] : null;
  const actionMeta = rule ? actionLabels[rule.action] : null;
  const TriggerIcon = triggerMeta?.icon || Sparkles;
  const ActionIcon = actionMeta?.icon || Sparkles;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
    >
      {/* Drawer Panel Container */}
      <div className="border-border/80 bg-background flex h-full w-full max-w-2xl min-w-0 flex-col overflow-x-hidden border-l shadow-2xl transition-all">
        {/* Drawer Header */}
        <div className="border-border/80 bg-card border-b px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <div className="to-primary shadow-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 text-xs font-black text-white shadow-md sm:h-11 sm:w-11">
                <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-primary font-mono text-[10px] font-bold sm:text-[11px]">
                    {triggerMeta?.label || rule?.trigger || "RULE"}
                  </span>

                  {rule?.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Active Engine
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                      Paused
                    </span>
                  )}
                </div>

                <h2 className="text-foreground mt-0.5 line-clamp-1 text-sm font-bold tracking-tight sm:text-base lg:text-lg">
                  {rule?.title || "Automation Rule Inspector"}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyId}
                title="Copy Rule ID"
                aria-label="Copy rule ID"
                className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close drawer"
                className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-border/50 mt-3.5 flex gap-2 border-b text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`border-b-2 px-2.5 pb-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              Overview & Logic
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("executions")}
              className={`border-b-2 px-2.5 pb-2 transition-colors ${
                activeTab === "executions"
                  ? "border-primary text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              Audit Logs ({rule?.executionCount ?? executions.length})
            </button>
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
          {activeTab === "overview" && rule && (
            <>
              {/* Pipeline Flow Visualizer Banner */}
              <div className="border-border/80 from-card via-card/95 to-card/85 rounded-2xl border bg-gradient-to-b p-3.5 shadow-xs sm:p-4">
                <span className="text-muted-foreground mb-2.5 block text-[10px] font-bold tracking-wider uppercase">
                  Autonomous Pipeline Flow
                </span>

                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="border-border/60 bg-background/60 flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border p-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <TriggerIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-muted-foreground block text-[10px] font-medium uppercase">
                        Incoming Event
                      </span>
                      <span className="text-foreground block truncate text-xs font-bold">
                        {triggerMeta?.label || rule.trigger}
                      </span>
                    </div>
                  </div>

                  <div className="text-muted-foreground/60 flex justify-center py-0.5 sm:py-0">
                    <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
                  </div>

                  <div className="border-border/60 bg-background/60 flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border p-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-muted-foreground block text-[10px] font-medium uppercase">
                        Autonomous Action
                      </span>
                      <span className="text-foreground block truncate text-xs font-bold">
                        {actionMeta?.label || rule.action}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions Card */}
              <div className="border-border/80 bg-card space-y-2 rounded-2xl border p-3.5 shadow-xs sm:p-4">
                <h4 className="text-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                  <Layers className="text-primary h-3.5 w-3.5" />
                  Execution Criteria & Conditions
                </h4>
                {rule.conditions && Object.keys(rule.conditions).length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 pt-1 text-xs sm:grid-cols-2">
                    {rule.conditions.minAmount !== undefined && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3">
                        <span className="text-muted-foreground block text-[10px]">
                          Minimum Entity Value
                        </span>
                        <span className="text-foreground text-sm font-bold">
                          ${rule.conditions.minAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {rule.conditions.serviceId && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3">
                        <span className="text-muted-foreground block text-[10px]">
                          Target Service Restriction
                        </span>
                        <span className="text-foreground block truncate font-mono text-[11px]">
                          {rule.conditions.serviceId}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/30 border-border/40 rounded-xl border p-3">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      No restrictive conditions set. This rule will autonomously fire on all
                      matching{" "}
                      <span className="text-foreground font-semibold">
                        {triggerMeta?.label || rule.trigger}
                      </span>{" "}
                      events.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Parameters Deep-Dive Card */}
              <div className="border-border/80 bg-card space-y-3 rounded-2xl border p-3.5 shadow-xs sm:p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                    <Terminal className="text-primary h-3.5 w-3.5" />
                    Action Parameters & Configuration
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-primary flex items-center gap-1 text-[11px] font-semibold hover:underline"
                  >
                    {showRawJson ? "Formatted View" : "Raw JSON"}
                    {showRawJson ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {showRawJson ? (
                  <div className="bg-background/80 border-border/60 text-foreground/90 max-h-56 overflow-x-auto rounded-xl border p-3 font-mono text-xs">
                    <pre className="text-[11px] leading-relaxed">
                      {JSON.stringify(rule.actionConfig, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    {rule.actionConfig?.projectTitleTemplate && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3 sm:col-span-2">
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Project Name Template
                        </span>
                        <span className="text-foreground mt-0.5 block text-xs font-semibold">
                          {rule.actionConfig.projectTitleTemplate}
                        </span>
                      </div>
                    )}

                    {rule.actionConfig?.depositPercent !== undefined && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3">
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Deposit Invoice Percent
                        </span>
                        <span className="text-foreground mt-0.5 block text-sm font-bold">
                          {rule.actionConfig.depositPercent}%
                        </span>
                      </div>
                    )}

                    {rule.actionConfig?.paymentDueDays !== undefined && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3">
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Payment Due Window
                        </span>
                        <span className="text-foreground mt-0.5 block text-sm font-bold">
                          {rule.actionConfig.paymentDueDays} Days
                        </span>
                      </div>
                    )}

                    {rule.actionConfig?.emailSubjectTemplate && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3 sm:col-span-2">
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Email Subject Template
                        </span>
                        <span className="text-foreground mt-0.5 block text-xs font-semibold">
                          {rule.actionConfig.emailSubjectTemplate}
                        </span>
                      </div>
                    )}

                    {rule.actionConfig?.notificationMessage && (
                      <div className="bg-muted/40 border-border/50 rounded-xl border p-3 sm:col-span-2">
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Alert Notification Message
                        </span>
                        <span className="text-foreground mt-0.5 block text-xs font-semibold">
                          {rule.actionConfig.notificationMessage}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="border-border/80 bg-card flex flex-col gap-2.5 rounded-2xl border p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                  <Button
                    onClick={() => onOpenTestModal?.(rule)}
                    className="h-10 w-full bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 sm:h-9 sm:w-auto"
                  >
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Simulate Trigger Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToggle}
                    className="border-border/80 h-10 w-full text-xs font-semibold sm:h-9 sm:w-auto"
                  >
                    {rule.isActive ? (
                      <>
                        <Pause className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                        Pause Rule
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        Resume Rule
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10 h-10 w-full justify-center text-xs font-semibold sm:h-9 sm:w-auto"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Rule
                </Button>
              </div>
            </>
          )}

          {activeTab === "executions" && (
            <div className="space-y-3">
              {isExecutionsLoading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="border-border/60 bg-card/60 h-20 animate-pulse rounded-xl border"
                    />
                  ))}
                </div>
              ) : executions.length === 0 ? (
                <div className="border-border/80 bg-card rounded-2xl border p-8 text-center">
                  <Activity className="text-muted-foreground/50 mx-auto mb-2.5 h-10 w-10" />
                  <h4 className="text-foreground text-sm font-bold">No Executions Recorded Yet</h4>
                  <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs leading-relaxed">
                    This automation is active and waiting for a matching{" "}
                    {triggerMeta?.label || rule?.trigger} event to occur. You can trigger a dry-run
                    simulation at any time.
                  </p>
                  {rule && (
                    <Button
                      onClick={() => onOpenTestModal?.(rule)}
                      className="bg-primary text-primary-foreground mt-4 h-9 text-xs font-semibold"
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Run Test Simulation
                    </Button>
                  )}
                </div>
              ) : (
                executions.map((exec) => (
                  <div
                    key={exec.id}
                    className="border-border/80 bg-card hover:border-primary/40 space-y-2 rounded-xl border p-3.5 text-xs shadow-2xs transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            exec.status === "SUCCESS"
                              ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : exec.status === "SKIPPED"
                                ? "border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {exec.status === "SUCCESS" && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {exec.status === "FAILED" && <AlertTriangle className="h-2.5 w-2.5" />}
                          {exec.status}
                        </span>
                        <span className="text-muted-foreground max-w-[140px] truncate font-mono text-[10px]">
                          Ref: {exec.entityId}
                        </span>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        <span>{exec.executionDurationMs}ms</span>
                        <span>•</span>
                        <span>
                          {new Date(exec.executedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {exec.errorMessage && (
                      <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-2.5 text-[11px] leading-relaxed">
                        {exec.errorMessage}
                      </div>
                    )}

                    {exec.logs && (
                      <div className="bg-background/60 border-border/50 text-muted-foreground max-h-36 overflow-x-auto rounded-lg border p-2.5 font-mono text-[10px]">
                        <pre>{JSON.stringify(exec.logs, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
