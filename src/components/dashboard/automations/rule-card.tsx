"use client";

import React from "react";
import {
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
  MoreVertical,
  Play,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  FlowRuleListItem,
  FlowRuleTrigger,
  FlowRuleAction,
} from "@/features/automations/types";

interface RuleCardProps {
  rule: FlowRuleListItem;
  onInspect: (rule: FlowRuleListItem) => void;
  onToggle: (id: string, currentStatus: boolean) => void;
  onTest: (rule: FlowRuleListItem) => void;
  onEdit: (rule: FlowRuleListItem) => void;
  onDelete: (id: string) => void;
}

export function RuleCard({ rule, onInspect, onToggle, onTest, onEdit, onDelete }: RuleCardProps) {
  // Trigger Configuration
  const triggerConfig: Record<
    FlowRuleTrigger,
    { label: string; icon: React.ElementType; color: string; bg: string; border: string }
  > = {
    CONTRACT_SIGNED: {
      label: "Contract Signed",
      icon: FileSignature,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/25",
    },
    QUOTE_ACCEPTED: {
      label: "Quote Accepted",
      icon: FileCheck2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
    },
    INVOICE_PAID: {
      label: "Invoice Paid",
      icon: CreditCard,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
    },
    APPOINTMENT_BOOKED: {
      label: "Appointment Booked",
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
    },
    CUSTOMER_CREATED: {
      label: "Customer Created",
      icon: Users,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/25",
    },
  };

  // Action Configuration
  const actionConfig: Record<
    FlowRuleAction,
    { label: string; icon: React.ElementType; color: string; bg: string; border: string }
  > = {
    CREATE_PROJECT: {
      label: "Launch Project",
      icon: FolderKanban,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/25",
    },
    CREATE_INVOICE: {
      label: "Generate Deposit Invoice",
      icon: FileText,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
    },
    SEND_EMAIL: {
      label: "Send Email Notification",
      icon: Mail,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/25",
    },
    CREATE_NOTIFICATION: {
      label: "Broadcast Alert",
      icon: Bell,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
    },
  };

  const triggerInfo = triggerConfig[rule.trigger] || {
    label: rule.trigger,
    icon: Sparkles,
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    border: "border-border",
  };

  const actionInfo = actionConfig[rule.action] || {
    label: rule.action,
    icon: Sparkles,
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    border: "border-border",
  };

  const TriggerIcon = triggerInfo.icon;
  const ActionIcon = actionInfo.icon;

  const minAmount = rule.conditions?.minAmount;
  const hasConditions = minAmount !== undefined || rule.conditions?.serviceId !== undefined;

  const lastTriggeredFormatted = React.useMemo(() => {
    if (!rule.lastTriggeredAt) return "Never triggered";
    try {
      const date = new Date(rule.lastTriggeredAt);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return rule.lastTriggeredAt;
    }
  }, [rule.lastTriggeredAt]);

  return (
    <div
      onClick={() => onInspect(rule)}
      className="border-border/80 from-card via-card/95 to-card/85 hover:border-primary/50 hover:shadow-primary/5 group relative box-border flex w-full max-w-full min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-4.5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5"
    >
      {/* Background Accent Glow */}
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full blur-2xl transition-opacity duration-300 ${
          rule.isActive
            ? "bg-gradient-to-br from-emerald-500/10 to-transparent group-hover:opacity-100"
            : "from-muted/20 bg-gradient-to-br to-transparent group-hover:opacity-60"
        }`}
      />

      <div className="w-full min-w-0">
        {/* Top Header: Flow Pill + Status Toggle + Actions */}
        <div className="mb-3.5 flex items-start justify-between gap-2">
          {/* Status Badge & Condition Pill */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {/* Active Beacon */}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-2xs ${
                rule.isActive
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-muted/60 text-muted-foreground"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                {rule.isActive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    rule.isActive ? "bg-emerald-500" : "bg-muted-foreground"
                  }`}
                />
              </span>
              {rule.isActive ? "Active Engine" : "Paused"}
            </span>

            {/* Condition Badge if applicable */}
            {minAmount !== undefined && (
              <span className="border-border/60 bg-muted/50 text-muted-foreground inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                Amount ≥ ${minAmount}
              </span>
            )}
          </div>

          {/* Quick Menu & Toggle */}
          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Quick Toggle Button with Accessible Hit Area */}
            <button
              type="button"
              role="switch"
              aria-checked={rule.isActive}
              aria-label={`Toggle ${rule.title}`}
              onClick={() => onToggle(rule.id, rule.isActive)}
              className={`focus:ring-primary/40 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-hidden ${
                rule.isActive ? "bg-emerald-500" : "bg-muted-foreground/30 dark:bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  rule.isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            {/* Overflow Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg"
                  aria-label="Rule options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onInspect(rule)}>
                  <History className="text-primary mr-2 h-4 w-4" />
                  Inspect & Logs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTest(rule)}>
                  <Play className="mr-2 h-4 w-4 text-emerald-500" />
                  Simulate Trigger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(rule)}>
                  <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(rule.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Rule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Rule Title & Description */}
        <div className="mb-4">
          <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-base font-bold tracking-tight transition-colors">
            {rule.title}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
            {rule.description || "Autonomous event-triggered business pipeline automation."}
          </p>
        </div>

        {/* Visual Pipeline Sequence (Trigger -> Condition -> Action) */}
        <div className="border-border/60 bg-background/50 mb-4 flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Trigger Node */}
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${triggerInfo.border} ${triggerInfo.bg} ${triggerInfo.color}`}
            >
              <TriggerIcon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[10px] font-medium tracking-wider uppercase">
                When Event
              </span>
              <span className="text-foreground truncate text-xs font-semibold">
                {triggerInfo.label}
              </span>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="text-muted-foreground/60 flex items-center justify-center px-1 sm:rotate-0">
            <ArrowRight className="h-3.5 w-3.5 rotate-90 sm:rotate-0" />
          </div>

          {/* Action Node */}
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${actionInfo.border} ${actionInfo.bg} ${actionInfo.color}`}
            >
              <ActionIcon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[10px] font-medium tracking-wider uppercase">
                Autonomous Action
              </span>
              <span className="text-foreground truncate text-xs font-semibold">
                {actionInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Telemetry & Run History */}
      <div className="border-border/60 text-muted-foreground mt-auto flex items-center justify-between border-t pt-3 text-[11px]">
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">{lastTriggeredFormatted}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-foreground font-semibold">{rule.executionCount} runs</span>
          {rule.latestExecution && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                rule.latestExecution.status === "SUCCESS"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {rule.latestExecution.status === "SUCCESS" ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <AlertCircle className="h-2.5 w-2.5" />
              )}
              {rule.latestExecution.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
