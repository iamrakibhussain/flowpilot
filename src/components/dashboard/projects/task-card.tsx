"use client";

import { useState } from "react";
import {
  Calendar,
  CheckSquare,
  AlertCircle,
  MoreVertical,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectTaskDto, TaskPriority, TaskStatus } from "@/features/projects/types";

interface TaskCardProps {
  task: ProjectTaskDto;
  onClick: (task: ProjectTaskDto) => void;
  onMoveStatus?: (taskId: string, targetStatus: TaskStatus) => void;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; dot: string; badge: string; stripe: string }
> = {
  URGENT: {
    label: "Urgent",
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    stripe: "before:bg-rose-500",
  },
  HIGH: {
    label: "High",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    stripe: "before:bg-amber-500",
  },
  MEDIUM: {
    label: "Medium",
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    stripe: "before:bg-blue-500",
  },
  LOW: {
    label: "Low",
    dot: "bg-slate-400",
    badge: "bg-muted text-muted-foreground border-border",
    stripe: "before:bg-slate-300 dark:before:bg-slate-700",
  },
};

const statuses: { key: TaskStatus; label: string; color: string }[] = [
  { key: "BACKLOG", label: "Backlog", color: "text-slate-500" },
  { key: "TODO", label: "To Do", color: "text-indigo-600" },
  { key: "IN_PROGRESS", label: "In Progress", color: "text-amber-600" },
  { key: "IN_REVIEW", label: "In Review", color: "text-purple-600" },
  { key: "DONE", label: "Done", color: "text-emerald-600" },
];

export function TaskCard({ task, onClick, onMoveStatus }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const priorityInfo = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  const totalChecklists = task.checklists?.length || 0;
  const completedChecklists = task.checklists?.filter((c) => c.isCompleted).length || 0;

  const isOverdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const assigneeInitials = task.assigneeName
    ? task.assigneeName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(task)}
      className={`group border-border/80 from-card to-card/90 dark:from-card dark:to-card/70 hover:border-primary/50 hover:shadow-primary/5 relative cursor-grab rounded-xl border bg-gradient-to-b p-3.5 pl-4.5 shadow-2xs backdrop-blur-md transition-all duration-200 before:absolute before:top-3 before:bottom-3 before:left-0 before:w-1.5 before:rounded-r-full hover:-translate-y-1 hover:shadow-lg active:cursor-grabbing ${
        priorityInfo.stripe
      } ${isDragging ? "scale-95 opacity-40" : "opacity-100"}`}
    >
      {/* Top Header: ID Pill, Priority Badge & Move Dropdown */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <GripVertical className="text-muted-foreground/30 group-hover:text-muted-foreground/70 -ml-1 h-3.5 w-3.5 transition-colors" />
          <span className="text-muted-foreground/70 bg-muted/40 rounded px-1 font-mono text-[10px] font-medium">
            #{task.id.slice(0, 5)}
          </span>
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-2xs ${priorityInfo.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`} />
            {priorityInfo.label}
          </Badge>
        </div>

        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Task options"
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg opacity-60 transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-xl">
              <div className="text-muted-foreground px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                Move Stage
              </div>
              {statuses
                .filter((s) => s.key !== task.status)
                .map((s) => (
                  <DropdownMenuItem
                    key={s.key}
                    onClick={() => onMoveStatus?.(task.id, s.key)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold"
                  >
                    <span className={s.color}>{s.label}</span>
                    <ArrowRight className="text-muted-foreground h-3 w-3" />
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-foreground group-hover:text-primary mt-2 line-clamp-2 text-xs leading-snug font-bold tracking-tight transition-colors sm:text-sm">
        {task.title}
      </h4>

      {/* Task Description snippet */}
      {task.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Card Metadata / Chips */}
      <div className="border-border/50 text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-[11px]">
        <div className="flex items-center gap-2">
          {/* Checklists Counter */}
          {totalChecklists > 0 && (
            <div
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                completedChecklists === totalChecklists
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
              title="Subtask checklists"
            >
              <CheckSquare className="h-3 w-3" />
              <span>
                {completedChecklists}/{totalChecklists}
              </span>
            </div>
          )}

          {/* Due Date */}
          {formattedDueDate && (
            <div
              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                isOverdue
                  ? "border border-rose-500/20 bg-rose-500/10 font-bold text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              }`}
              title={isOverdue ? "Overdue deadline!" : "Target deadline"}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
              ) : (
                <Calendar className="h-3 w-3 shrink-0" />
              )}
              <span>{formattedDueDate}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar / Indicator */}
        {task.assigneeName ? (
          <div
            className="border-border/80 bg-muted/50 text-foreground flex items-center gap-1.5 rounded-full border py-0.5 pr-2 pl-1 text-[10px] font-bold"
            title={`Assigned to ${task.assigneeName} (${task.assigneeEmail || ""})`}
          >
            <div className="bg-primary flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-extrabold text-white">
              {assigneeInitials}
            </div>
            <span className="max-w-[85px] truncate">{task.assigneeName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground/50 text-[10px] italic">Unassigned</span>
        )}
      </div>
    </div>
  );
}
