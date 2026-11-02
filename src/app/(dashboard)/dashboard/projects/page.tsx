"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useProjects, useProjectStats } from "@/features/projects/use-projects";
import { ProjectCard } from "@/components/dashboard/projects/project-card";
import { CreateProjectModal } from "@/components/dashboard/projects/create-project-modal";
import type { ProjectStatus } from "@/features/projects/types";

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ProjectsPage() {
  const isClient = React.useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  const searchParams = useSearchParams();
  const newParam = searchParams.get("new");
  const customerIdParam = searchParams.get("customerId");
  const quoteIdParam = searchParams.get("quoteId");
  const titleParam = searchParams.get("title");
  const budgetParam = searchParams.get("budget");
  const currencyParam = searchParams.get("currency");

  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [isCreateModalOpenManual, setIsCreateModalOpenManual] = React.useState<boolean | null>(
    null
  );

  const isCreateModalOpen = isCreateModalOpenManual ?? newParam === "true";
  const setIsCreateModalOpen = (open: boolean) => setIsCreateModalOpenManual(open);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: statsData, isLoading: isLoadingStats } = useProjectStats();
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    customerId: customerIdParam || undefined,
  });

  if (!isClient) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="text-primary h-8 w-8" />
      </div>
    );
  }

  const projects = projectsData?.projects || [];

  return (
    <div className="relative space-y-6">
      {/* Luxury Atmospheric Mesh Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(49,95,232,0.06),transparent)]"
        aria-hidden="true"
      />

      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Projects & Workspaces
            </h1>
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3" />
              Live Workspace
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage deliverables, assign team tasks, and organize client execution pipelines.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-sm transition-transform active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* KPI Metric Ribbon */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {/* Total Projects */}
        <Card className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-4.5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Total Workspaces
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner transition-transform group-hover:scale-105">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-foreground tabular-nums">
            {isLoadingStats ? "..." : (statsData?.totalProjects ?? 0)}
          </div>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">Active delivery pipelines</p>
        </Card>

        {/* Active Deliveries */}
        <Card className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-4.5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/50 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              In Delivery
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner transition-transform group-hover:scale-105">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {isLoadingStats ? "..." : (statsData?.activeProjects ?? 0)}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Live sprint execution</span>
          </p>
        </Card>

        {/* Tasks In Flight */}
        <Card className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-4.5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Tasks Managed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner transition-transform group-hover:scale-105">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-foreground tabular-nums">
            {isLoadingStats ? "..." : (statsData?.totalTasks ?? 0)}
          </div>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {statsData?.completedTasksCount ?? 0}
            </span>{" "}
            deliverables signed off
          </p>
        </Card>

        {/* Overall Completion Velocity */}
        <Card className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-4.5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-400/50 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Completion Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner transition-transform group-hover:scale-105">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
            {isLoadingStats ? "..." : `${statsData?.overallCompletionRate ?? 0}%`}
          </div>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            {(statsData?.overdueTasksCount ?? 0) > 0 ? (
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {statsData?.overdueTasksCount} overdue
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                All deadlines on track ✓
              </span>
            )}
          </p>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 border-b border-border/70 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs with Live Count Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "ALL", label: "All Projects", count: statsData?.totalProjects },
              { key: "ACTIVE", label: "Active", count: statsData?.activeProjects },
              { key: "PLANNING", label: "Planning", count: statsData?.planningProjects },
              { key: "ON_HOLD", label: "On Hold", count: statsData?.onHoldProjects },
              { key: "COMPLETED", label: "Completed", count: statsData?.completedProjects },
            ] as const
          ).map((tab) => {
            const isTabActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  isTabActive
                    ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isTabActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl pr-7 pl-8 text-xs font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2 flex h-4 w-4 items-center justify-center rounded-full"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid or Shimmer Skeletons or Empty State */}
      {isLoadingProjects ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-2xs animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 rounded-md bg-muted" />
                <div className="h-4 w-28 rounded-md bg-muted" />
              </div>
              <div className="h-6 w-3/4 rounded-md bg-muted" />
              <div className="h-10 w-full rounded-md bg-muted/60" />
              <div className="h-2 w-full rounded-full bg-muted" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-4 w-24 rounded-md bg-muted" />
                <div className="h-4 w-16 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="border-border/80 bg-muted/15 flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center backdrop-blur-xs">
          <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner">
            <FolderKanban className="h-7 w-7" />
          </div>
          <h3 className="text-foreground mt-4 text-base font-bold tracking-tight">No delivery projects found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed">
            {searchTerm || statusFilter !== "ALL"
              ? "No projects match your active search filter. Adjust or clear the filter to see more."
              : "Launch your first delivery project to track tasks, deadlines, and deliverables in visual Kanban boards."}
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="mt-5 cursor-pointer rounded-xl px-4 text-xs font-semibold shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Launch First Project
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        prefillCustomerId={customerIdParam}
        prefillQuoteId={quoteIdParam}
        prefillTitle={titleParam}
        prefillBudget={budgetParam ? parseFloat(budgetParam) : null}
        prefillCurrency={currencyParam || "USD"}
      />
    </div>
  );
}
