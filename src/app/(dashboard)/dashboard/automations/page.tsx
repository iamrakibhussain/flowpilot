"use client";

import * as React from "react";
import {
  Zap,
  Plus,
  Sparkles,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Activity,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useFlowRules,
  useFlowRuleStats,
  useToggleFlowRule,
  useDeleteFlowRule,
} from "@/features/automations/use-automations";
import type {
  FlowRuleListItem,
  FlowRuleTrigger,
  FlowRuleAction,
  CreateFlowRuleInput,
} from "@/features/automations/types";
import { AutomationStatsBar } from "@/components/dashboard/automations/automation-stats-bar";
import { RuleCard } from "@/components/dashboard/automations/rule-card";
import { RuleInspectorDrawer } from "@/components/dashboard/automations/rule-inspector-drawer";
import { RuleBuilderModal } from "@/components/dashboard/automations/rule-builder-modal";
import { PrebuiltTemplatesModal } from "@/components/dashboard/automations/prebuilt-templates-modal";
import { TestRuleModal } from "@/components/dashboard/automations/test-rule-modal";

export default function AutomationsPage() {
  const [search, setSearch] = React.useState<string>("");
  const [triggerFilter, setTriggerFilter] = React.useState<string>("ALL");
  const [actionFilter, setActionFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modals & Drawers state
  const [isBuilderOpen, setIsBuilderOpen] = React.useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = React.useState<boolean>(false);
  const [editingRule, setEditingRule] = React.useState<FlowRuleListItem | null>(null);
  const [initialTemplate, setInitialTemplate] = React.useState<Partial<CreateFlowRuleInput> | null>(
    null
  );
  const [inspectRuleId, setInspectRuleId] = React.useState<string | null>(null);
  const [testingRule, setTestingRule] = React.useState<FlowRuleListItem | null>(null);

  const queryParams = React.useMemo(() => {
    return {
      trigger: triggerFilter !== "ALL" ? (triggerFilter as FlowRuleTrigger) : undefined,
      action: actionFilter !== "ALL" ? (actionFilter as FlowRuleAction) : undefined,
      isActive: statusFilter === "ACTIVE" ? true : statusFilter === "PAUSED" ? false : undefined,
      search: search.trim() || undefined,
    };
  }, [triggerFilter, actionFilter, statusFilter, search]);

  const { data: rulesData, isLoading, refetch } = useFlowRules(queryParams);
  const { data: stats, isLoading: isStatsLoading } = useFlowRuleStats();

  const toggleMutation = useToggleFlowRule();
  const deleteMutation = useDeleteFlowRule();

  const rules = Array.isArray(rulesData?.rules) ? rulesData.rules : [];

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleMutation.mutateAsync({ id, isActive: !currentStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this automation rule?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleOpenBuilderWithTemplate = (template: CreateFlowRuleInput) => {
    setEditingRule(null);
    setInitialTemplate(template);
    setIsBuilderOpen(true);
  };

  const handleEditRule = (rule: FlowRuleListItem) => {
    setInitialTemplate(null);
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Executive Page Header */}
      <div className="border-border/40 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="to-primary shadow-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white shadow-md sm:h-11 sm:w-11">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-foreground text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
                FlowRules & Event Automations
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Event-driven workflow engines, conditional autonomous project launches, and instant
            client notifications.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplatesOpen(true)}
            className="border-border/80 hover:bg-card/90 text-foreground h-9 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            Explore Recipes
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingRule(null);
              setInitialTemplate(null);
              setIsBuilderOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-xs font-semibold shadow-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Automation Rule
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <AutomationStatsBar stats={stats} isLoading={isStatsLoading} />

      {/* Search & Filter Toolbar */}
      <div className="border-border/80 bg-card/60 space-y-3 rounded-2xl border p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search automations by title, keyword, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background/80 h-10 pl-9 text-sm sm:h-9 sm:text-xs"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center">
            {/* Trigger Filter */}
            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              aria-label="Filter by Event Trigger"
              className="border-border/80 bg-background text-foreground h-10 w-full rounded-lg border px-3 text-xs font-medium focus:outline-hidden sm:h-9 lg:w-auto"
            >
              <option value="ALL">All Event Triggers</option>
              <option value="CONTRACT_SIGNED">Contract Signed</option>
              <option value="QUOTE_ACCEPTED">Quote Accepted</option>
              <option value="INVOICE_PAID">Invoice Paid</option>
              <option value="APPOINTMENT_BOOKED">Appointment Booked</option>
              <option value="CUSTOMER_CREATED">Customer Created</option>
            </select>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter by Autonomous Action"
              className="border-border/80 bg-background text-foreground h-10 w-full rounded-lg border px-3 text-xs font-medium focus:outline-hidden sm:h-9 lg:w-auto"
            >
              <option value="ALL">All Autonomous Actions</option>
              <option value="CREATE_PROJECT">Launch Project</option>
              <option value="CREATE_INVOICE">Generate Deposit Invoice</option>
              <option value="SEND_EMAIL">Send Email Notification</option>
              <option value="CREATE_NOTIFICATION">Broadcast Alert</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="border-border/80 bg-background text-foreground h-10 w-full rounded-lg border px-3 text-xs font-medium focus:outline-hidden sm:h-9 lg:w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="PAUSED">Paused Only</option>
            </select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              title="Refresh"
              className="text-muted-foreground hover:text-foreground border-border/60 h-10 w-full rounded-lg border sm:h-9 sm:w-10 sm:border-transparent lg:w-9"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="ml-1.5 text-xs font-semibold sm:hidden">
                Reset / Refresh Filters
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Rules Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-border/60 bg-card/60 h-64 animate-pulse rounded-2xl border p-5 backdrop-blur-md"
            />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="border-border/80 bg-card/50 rounded-2xl border p-10 text-center shadow-xs backdrop-blur-md">
          <div className="to-primary shadow-primary/20 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white shadow-lg">
            <Zap className="h-7 w-7" />
          </div>
          <h3 className="text-foreground mt-4 text-base font-bold tracking-tight sm:text-lg">
            No Automation Rules Found
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs leading-relaxed sm:text-sm">
            {search || triggerFilter !== "ALL" || actionFilter !== "ALL" || statusFilter !== "ALL"
              ? "No rules match your selected filters. Try resetting the search or filter options."
              : "Empower your workspace by automating delivery project kickoffs, deposit invoice generation, and customer onboarding."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setIsTemplatesOpen(true)}
              variant="outline"
              className="border-border/80 h-9 text-xs font-semibold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
              Use Prebuilt Recipe
            </Button>
            <Button
              onClick={() => {
                setEditingRule(null);
                setInitialTemplate(null);
                setIsBuilderOpen(true);
              }}
              className="bg-primary text-primary-foreground h-9 text-xs font-semibold shadow-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Custom Rule
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onInspect={(r) => setInspectRuleId(r.id)}
              onToggle={handleToggle}
              onTest={(r) => setTestingRule(r)}
              onEdit={handleEditRule}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Slide-Over Inspector Drawer */}
      <RuleInspectorDrawer
        ruleId={inspectRuleId}
        isOpen={Boolean(inspectRuleId)}
        onClose={() => setInspectRuleId(null)}
        onOpenTestModal={(r) => {
          setInspectRuleId(null);
          setTestingRule(r);
        }}
        onOpenEditModal={(r) => {
          setInspectRuleId(null);
          handleEditRule(r);
        }}
      />

      {/* Visual Rule Builder Modal */}
      <RuleBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingRule(null);
          setInitialTemplate(null);
        }}
        editRule={editingRule}
        initialTemplate={initialTemplate}
      />

      {/* Prebuilt Templates Gallery Modal */}
      <PrebuiltTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleOpenBuilderWithTemplate}
      />

      {/* Dry-Run Simulation Modal */}
      <TestRuleModal
        rule={testingRule}
        isOpen={Boolean(testingRule)}
        onClose={() => setTestingRule(null)}
      />
    </div>
  );
}
