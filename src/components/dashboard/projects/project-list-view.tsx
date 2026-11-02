"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProjectTaskDto, TaskPriority, TaskStatus } from "@/features/projects/types";

interface ProjectListViewProps {
  tasks: ProjectTaskDto[];
  onTaskClick: (task: ProjectTaskDto) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; badge: string }> = {
  URGENT: {
    label: "Urgent",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  HIGH: {
    label: "High",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  LOW: {
    label: "Low",
    badge: "bg-muted text-muted-foreground border-border",
  },
};

const statusBorderColor: Record<TaskStatus, string> = {
  BACKLOG: "border-l-slate-400",
  TODO: "border-l-indigo-500",
  IN_PROGRESS: "border-l-amber-500",
  IN_REVIEW: "border-l-purple-500",
  DONE: "border-l-emerald-500",
};

export function ProjectListView({ tasks, onTaskClick, onStatusChange }: ProjectListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="border-border/80 flex h-44 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="text-foreground text-sm font-semibold">No tasks created yet</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-xs">
          Switch to Kanban view or click &quot;+ Add Task&quot; to populate your delivery pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border/70 bg-card overflow-x-auto rounded-xl border shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-border/60 bg-muted/40 text-muted-foreground border-b font-semibold tracking-wider uppercase">
          <tr>
            <th className="px-4 py-3">Task Title</th>
            <th className="px-3 py-3">Stage</th>
            <th className="px-3 py-3">Priority</th>
            <th className="px-3 py-3">Assignee</th>
            <th className="px-3 py-3">Checklist</th>
            <th className="px-3 py-3">Due Date</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-border/40 divide-y">
          {tasks.map((task) => {
            const priorityInfo = priorityConfig[task.priority];
            const totalChecklists = task.checklists?.length || 0;
            const completedChecklists = task.checklists?.filter((c) => c.isCompleted).length || 0;
            const isOverdue =
              task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();

            const initials = task.assigneeName
              ? task.assigneeName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "";

            return (
              <tr
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`group hover:bg-muted/50 cursor-pointer border-l-3 transition-colors ${
                  statusBorderColor[task.status] || "border-l-transparent"
                }`}
              >
                {/* Title */}
                <td className="px-4 py-3">
                  <div className="text-foreground group-hover:text-primary font-medium transition-colors">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-muted-foreground mt-0.5 line-clamp-1 text-[11px]">
                      {task.description}
                    </div>
                  )}
                </td>

                {/* Stage / Status */}
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className="border-border/80 bg-background text-foreground focus:ring-primary rounded-md border px-2.5 py-1 text-[11px] font-medium shadow-2xs focus:ring-1 focus:outline-none"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>

                {/* Priority */}
                <td className="px-3 py-3">
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityInfo.badge}`}
                  >
                    {priorityInfo.label}
                  </Badge>
                </td>

                {/* Assignee */}
                <td className="text-muted-foreground px-3 py-3">
                  {task.assigneeName ? (
                    <div className="text-foreground flex items-center gap-2 font-medium">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                        {initials}
                      </div>
                      <span className="max-w-[120px] truncate">{task.assigneeName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-[11px] italic">Unassigned</span>
                  )}
                </td>

                {/* Checklist */}
                <td className="text-muted-foreground px-3 py-3">
                  {totalChecklists > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-secondary h-1.5 w-14 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${(completedChecklists / totalChecklists) * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        {completedChecklists}/{totalChecklists}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40 text-xs">-</span>
                  )}
                </td>

                {/* Due Date */}
                <td className="text-muted-foreground px-3 py-3">
                  {task.dueDate ? (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs ${
                        isOverdue
                          ? "border-rose-500/20 bg-rose-500/10 font-semibold text-rose-600 dark:text-rose-400 border"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue && <AlertCircle className="h-3 w-3 text-rose-500" />}
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/40 text-xs">-</span>
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground group-hover:text-foreground h-7 px-2 text-xs"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
