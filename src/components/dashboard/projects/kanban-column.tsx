"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import type { ProjectTaskDto, TaskStatus } from "@/features/projects/types";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: ProjectTaskDto[];
  accentColor: string;
  totalTasksCount?: number;
  onTaskClick: (task: ProjectTaskDto) => void;
  onTaskDrop: (taskId: string, targetStatus: TaskStatus) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

const columnAccentBorder: Record<TaskStatus, string> = {
  BACKLOG: "border-t-slate-400 dark:border-t-slate-500",
  TODO: "border-t-indigo-500",
  IN_PROGRESS: "border-t-amber-500",
  IN_REVIEW: "border-t-purple-500",
  DONE: "border-t-emerald-500",
};

export function KanbanColumn({
  status,
  title,
  tasks,
  accentColor,
  totalTasksCount,
  onTaskClick,
  onTaskDrop,
  onQuickAddTask,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data?.taskId) {
        onTaskDrop(data.taskId, status);
      }
    } catch {
      // ignore parse error
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-muted/30 dark:bg-muted/20 flex w-full md:max-w-[340px] md:min-w-[280px] flex-col rounded-xl border border-t-2 p-3.5 transition-all duration-200 ${
        columnAccentBorder[status] || "border-t-primary"
      } ${
        isOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-lg shadow-primary/5"
          : "border-border/60 hover:border-border/90"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${accentColor}`} />
          <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">{title}</h3>
          <span className="bg-background text-muted-foreground border-border/70 flex h-5 min-w-[20px] items-center justify-center rounded-full border px-1.5 text-[11px] font-semibold shadow-2xs">
            {tasks.length}
          </span>
          {totalTasksCount !== undefined && totalTasksCount > 0 && (
            <span className="text-muted-foreground/60 font-mono text-[10px] hidden sm:inline">
              {Math.round((tasks.length / totalTasksCount) * 100)}%
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickAddTask(status)}
          className="text-muted-foreground hover:bg-background hover:text-foreground h-7 w-7 rounded-lg p-0 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List container */}
      <div className="max-h-[calc(100vh-320px)] min-h-[160px] flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
            onMoveStatus={(taskId, targetStatus) => onTaskDrop(taskId, targetStatus)}
          />
        ))}

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={() => onQuickAddTask(status)}
            className="group border-border/80 hover:border-primary/50 hover:bg-background/80 text-muted-foreground/70 flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed p-3 text-center transition-all"
          >
            <Plus className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" />
            <span className="text-xs group-hover:text-foreground">
              Add task to {title.toLowerCase()}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
