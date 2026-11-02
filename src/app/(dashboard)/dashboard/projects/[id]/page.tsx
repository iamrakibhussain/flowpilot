"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  Plus,
  Kanban,
  ListFilter,
  AlertCircle,
  MoreVertical,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject, useDeleteProject, useUpdateTask } from "@/features/projects/use-projects";
import { KanbanColumn } from "@/components/dashboard/projects/kanban-column";
import { QuickTaskModal } from "@/components/dashboard/projects/quick-task-modal";
import { TaskInspectorDrawer } from "@/components/dashboard/projects/task-inspector-drawer";
import { ProjectListView } from "@/components/dashboard/projects/project-list-view";
import type { ProjectTaskDto, ProjectStatus, TaskStatus, TaskPriority } from "@/features/projects/types";

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const KANBAN_COLUMNS: {
  status: TaskStatus;
  title: string;
  accentColor: string;
}[] = [
  { status: "BACKLOG", title: "Backlog", accentColor: "bg-slate-400" },
  { status: "TODO", title: "To Do", accentColor: "bg-indigo-500" },
  { status: "IN_PROGRESS", title: "In Progress", accentColor: "bg-amber-500" },
  { status: "IN_REVIEW", title: "In Review", accentColor: "bg-purple-500" },
  { status: "DONE", title: "Done", accentColor: "bg-emerald-500" },
];

const statusBadgeConfig: Record<ProjectStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  PLANNING: {
    label: "Planning",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export default function ProjectWorkspacePage() {
  const isClient = React.useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);

  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || "";

  const [viewMode, setViewMode] = React.useState<"KANBAN" | "LIST">("KANBAN");
  const [mobileActiveColumn, setMobileActiveColumn] = React.useState<TaskStatus>("TODO");
  const [taskSearchQuery, setTaskSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | "ALL">("ALL");
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("ALL");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Inspector and Modal states
  const [selectedTask, setSelectedTask] = React.useState<ProjectTaskDto | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = React.useState(false);
  const [quickTaskTargetStatus, setQuickTaskTargetStatus] = React.useState<TaskStatus>("TODO");

  const { data: project, isLoading, error } = useProject(projectId);
  const deleteProjectMutation = useDeleteProject();
  const updateTaskMutation = useUpdateTask(projectId);

  // Keyboard shortcut listener: 'N' for quick task, '/' for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setQuickTaskTargetStatus("TODO");
        setIsQuickTaskOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="text-primary h-8 w-8" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2">
        <Spinner className="text-primary h-8 w-8" />
        <span className="text-muted-foreground text-xs">Loading workspace...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <AlertCircle className="text-destructive h-8 w-8" />
        <p className="text-foreground text-sm font-semibold">Project not found</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const tasksByStatus = project.tasksByStatus || {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  };

  const allTasks: ProjectTaskDto[] = [
    ...(tasksByStatus.BACKLOG || []),
    ...(tasksByStatus.TODO || []),
    ...(tasksByStatus.IN_PROGRESS || []),
    ...(tasksByStatus.IN_REVIEW || []),
    ...(tasksByStatus.DONE || []),
  ];

  const uniqueAssignees = Array.from(
    allTasks
      .reduce((map, t) => {
        if (t.assigneeId && t.assigneeName) {
          map.set(t.assigneeId, { id: t.assigneeId, name: t.assigneeName });
        }
        return map;
      }, new Map<string, { id: string; name: string }>())
      .values()
  );

  const isFilteringActive =
    taskSearchQuery.trim() !== "" || priorityFilter !== "ALL" || assigneeFilter !== "ALL";

  const filteredTasksByStatus = {
    BACKLOG: (tasksByStatus.BACKLOG || []).filter(filterTask),
    TODO: (tasksByStatus.TODO || []).filter(filterTask),
    IN_PROGRESS: (tasksByStatus.IN_PROGRESS || []).filter(filterTask),
    IN_REVIEW: (tasksByStatus.IN_REVIEW || []).filter(filterTask),
    DONE: (tasksByStatus.DONE || []).filter(filterTask),
  };

  function filterTask(task: ProjectTaskDto) {
    const q = taskSearchQuery.toLowerCase().trim();
    if (q) {
      const inTitle = task.title.toLowerCase().includes(q);
      const inDesc = task.description?.toLowerCase().includes(q);
      const inAssignee = task.assigneeName?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inAssignee) return false;
    }
    if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
      return false;
    }
    if (assigneeFilter !== "ALL" && task.assigneeId !== assigneeFilter) {
      return false;
    }
    return true;
  }

  const filteredAllTasks = [
    ...(filteredTasksByStatus.BACKLOG || []),
    ...(filteredTasksByStatus.TODO || []),
    ...(filteredTasksByStatus.IN_PROGRESS || []),
    ...(filteredTasksByStatus.IN_REVIEW || []),
    ...(filteredTasksByStatus.DONE || []),
  ];

  const handleTaskClick = (task: ProjectTaskDto) => {
    setSelectedTask(task);
    setIsInspectorOpen(true);
  };

  const handleTaskDrop = (taskId: string, targetStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      taskId,
      payload: { status: targetStatus },
    });
  };

  const handleOpenQuickTask = (status: TaskStatus) => {
    setQuickTaskTargetStatus(status);
    setIsQuickTaskOpen(true);
  };

  const handleDeleteProject = async () => {
    if (confirm("Are you sure you want to delete this project and all its tasks?")) {
      await deleteProjectMutation.mutateAsync(projectId);
      router.push("/dashboard/projects");
    }
  };

  const statusInfo = statusBadgeConfig[project.status] || {
    label: project.status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <div className="relative space-y-5">
      {/* Luxury Atmospheric Mesh Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.06),transparent)]"
        aria-hidden="true"
      />
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-border/60 flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/projects"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Projects</span>
          </Link>
          <span className="text-muted-foreground/60 text-xs">/</span>
          <span className="text-foreground max-w-[200px] truncate text-xs font-semibold sm:max-w-[320px]">
            {project.name}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="border-border/70 bg-muted/40 flex items-center rounded-lg border p-0.5">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "KANBAN"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "LIST"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => handleOpenQuickTask("TODO")}
            className="h-8 text-xs font-medium shadow-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Task
          </Button>

          {/* Project Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md border p-1.5">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={handleDeleteProject}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive text-xs"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Header Banner & Details */}
      <div className="border-border/70 bg-card rounded-xl border p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {project.status === "ACTIVE" && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="bg-emerald-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                  <span className="bg-emerald-500 relative inline-flex h-2.5 w-2.5 rounded-full" />
                </span>
              )}
              <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
                {project.name}
              </h1>
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold tracking-wide uppercase ${statusInfo.className}`}
              >
                {statusInfo.label}
              </Badge>
            </div>

            {project.description && (
              <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Client / Customer metadata */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-1 text-xs">
              {project.customerId && (
                <Link
                  href={`/dashboard/customers/${project.customerId}`}
                  className="group border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 text-primary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
                  title="View Customer CRM Profile"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{project.customerCompany || project.customerName || "Customer Profile"}</span>
                  <span className="text-[10px] opacity-70 group-hover:opacity-100">→</span>
                </Link>
              )}
              {!project.customerId && project.customerName && (
                <div className="text-foreground flex items-center gap-1.5 font-medium">
                  <Building2 className="text-primary h-3.5 w-3.5" />
                  <span>{project.customerCompany || project.customerName}</span>
                </div>
              )}
              {project.targetDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Deadline:{" "}
                    {new Date(project.targetDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {project.budget !== null && project.budget !== undefined && (
                <div className="text-foreground border-border/60 bg-muted/30 flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono font-medium">
                  <DollarSign className="text-muted-foreground h-3.5 w-3.5" />
                  <span>
                    {project.budget.toLocaleString()} {project.currency}
                  </span>
                </div>
              )}
            </div>
            {/* Unique Assignees Avatar Stack */}
            {uniqueAssignees.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Team:</span>
                <div className="flex -space-x-1.5 overflow-hidden">
                  {uniqueAssignees.slice(0, 4).map((m) => {
                    const initials = m.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <div
                        key={m.id}
                        className="bg-primary/90 text-primary-foreground ring-card shadow-2xs flex h-5.5 w-5.5 items-center justify-center rounded-full text-[9px] font-bold ring-2"
                        title={m.name}
                      >
                        {initials}
                      </div>
                    );
                  })}
                </div>
                {uniqueAssignees.length > 4 && (
                  <span className="text-muted-foreground text-[10px] font-medium">
                    +{uniqueAssignees.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progress summary ribbon with Circular SVG Donut */}
          <div className="border-border/60 bg-muted/30 shadow-2xs min-w-[240px] rounded-xl border p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-xs font-bold tracking-tight">
                    Delivery Velocity
                  </span>
                  <span className="text-primary text-xs font-black">
                    {project.progressPercentage}%
                  </span>
                </div>
                <div className="text-muted-foreground mt-0.5 text-[11px]">
                  {project.completedTasks} of {project.totalTasks} tasks done
                </div>
              </div>

              {/* Radial Donut Progress Indicator */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-secondary/80 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary stroke-current transition-all duration-500 ease-out"
                    strokeDasharray={`${project.progressPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="text-foreground absolute font-mono text-[9px] font-bold">
                  {project.progressPercentage}%
                </span>
              </div>
            </div>

            <div className="bg-secondary/70 mt-2.5 h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full transition-all duration-500 ${
                  project.progressPercentage === 100
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-amber-500 to-primary"
                }`}
                style={{ width: `${project.progressPercentage}%` }}
              />
            </div>
            {project.overdueTasks > 0 && (
              <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <span>{project.overdueTasks} overdue deadline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-Board Live Filter & Search Toolbar */}
      <div className="bg-card/70 border-border/70 shadow-2xs flex flex-col gap-2.5 rounded-xl border p-2.5 backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[180px] flex-1 max-w-xs">
            <Search className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              ref={searchInputRef}
              placeholder="Search tasks (press /)..."
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              className="bg-background/80 h-8 pr-7 pl-8 text-xs"
            />
            {taskSearchQuery && (
              <button
                type="button"
                onClick={() => setTaskSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
            className="border-border/80 bg-background/80 text-foreground focus:ring-primary h-8 rounded-lg border px-2.5 text-xs focus:ring-1 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Assignee Filter */}
          {uniqueAssignees.length > 0 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="border-border/80 bg-background/80 text-foreground focus:ring-primary hidden h-8 rounded-lg border px-2.5 text-xs focus:ring-1 focus:outline-none sm:inline-block"
            >
              <option value="ALL">All Assignees</option>
              {uniqueAssignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}

          {isFilteringActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTaskSearchQuery("");
                setPriorityFilter("ALL");
                setAssigneeFilter("ALL");
              }}
              className="text-muted-foreground hover:text-foreground h-8 px-2 text-[11px]"
            >
              <X className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        <div className="text-muted-foreground flex items-center gap-2 self-end text-xs sm:self-auto">
          <span>
            Showing <strong className="text-foreground">{filteredAllTasks.length}</strong> of{" "}
            {allTasks.length} tasks
          </span>
          <kbd className="border-border/80 bg-muted/60 text-muted-foreground hidden items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] lg:inline-flex">
            <span>Press</span>
            <span className="text-foreground font-bold">N</span>
            <span>for task</span>
          </kbd>
        </div>
      </div>

      {/* Main View Area: Kanban vs List */}
      {viewMode === "KANBAN" ? (
        <div className="space-y-4">
          {filteredAllTasks.length === 0 && isFilteringActive ? (
            <div className="border-border/80 bg-card/40 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center shadow-2xs backdrop-blur-xs">
              <Search className="text-muted-foreground/40 mb-2.5 h-8 w-8" />
              <p className="text-foreground text-sm font-bold">
                No tasks match your filter criteria
              </p>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                We couldn&apos;t find any tasks matching &quot;{taskSearchQuery}&quot; or the
                selected priority/assignee filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTaskSearchQuery("");
                  setPriorityFilter("ALL");
                  setAssigneeFilter("ALL");
                }}
                className="mt-4 text-xs font-semibold"
              >
                Reset Search Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Segmented Column Switcher (Visible on small screens < 768px) */}
              <div className="sticky top-0 z-20 -mx-1 flex gap-1.5 overflow-x-auto border-b border-border/60 bg-background/95 px-1 py-2 backdrop-blur-xs md:hidden">
                {KANBAN_COLUMNS.map((col) => {
                  const count = filteredTasksByStatus[col.status]?.length || 0;
                  const isSelected = mobileActiveColumn === col.status;
                  return (
                    <button
                      key={col.status}
                      onClick={() => setMobileActiveColumn(col.status)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${col.accentColor}`} />
                      <span>{col.title}</span>
                      <span
                        className={`ml-1 rounded-full px-1.5 text-[10px] ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "border-border/60 bg-background/80 text-muted-foreground border"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop Multi-column Kanban View (Visible on >= md screens) */}
              <div className="hidden gap-4 overflow-x-auto pb-6 md:flex">
                {KANBAN_COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.status}
                    status={col.status}
                    title={col.title}
                    accentColor={col.accentColor}
                    totalTasksCount={allTasks.length}
                    tasks={filteredTasksByStatus[col.status] || []}
                    onTaskClick={handleTaskClick}
                    onTaskDrop={handleTaskDrop}
                    onQuickAddTask={handleOpenQuickTask}
                  />
                ))}
              </div>

              {/* Mobile Single-column Kanban View */}
              <div className="block pb-14 md:hidden">
                {KANBAN_COLUMNS.filter((col) => col.status === mobileActiveColumn).map((col) => (
                  <KanbanColumn
                    key={col.status}
                    status={col.status}
                    title={col.title}
                    accentColor={col.accentColor}
                    totalTasksCount={allTasks.length}
                    tasks={filteredTasksByStatus[col.status] || []}
                    onTaskClick={handleTaskClick}
                    onTaskDrop={handleTaskDrop}
                    onQuickAddTask={handleOpenQuickTask}
                  />
                ))}
              </div>
            </>
          )}

          {/* Mobile Floating Action Button (FAB) */}
          <div className="fixed right-5 bottom-6 z-40 md:hidden">
            <Button
              onClick={() => handleOpenQuickTask(mobileActiveColumn)}
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 w-13 rounded-full shadow-xl transition-transform active:scale-95"
              title="Add task"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      ) : (
        /* List / Tabular View */
        <ProjectListView
          tasks={filteredAllTasks}
          onTaskClick={handleTaskClick}
          onStatusChange={handleTaskDrop}
        />
      )}

      {/* Task Inspector Drawer */}
      <TaskInspectorDrawer
        task={selectedTask}
        projectId={projectId}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Quick Add Task Modal */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        projectId={projectId}
        defaultStatus={quickTaskTargetStatus}
      />
    </div>
  );
}
