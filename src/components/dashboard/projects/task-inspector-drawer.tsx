"use client";

import { useState, useEffect } from "react";
import { X, CheckSquare, Trash2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/features/team/use-team";
import {
  useUpdateTask,
  useDeleteTask,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from "@/features/projects/use-projects";
import type { ProjectTaskDto, TaskPriority, TaskStatus } from "@/features/projects/types";

interface TaskInspectorDrawerProps {
  task: ProjectTaskDto | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TaskInspectorContentProps {
  task: ProjectTaskDto;
  projectId: string;
  onClose: () => void;
}

function TaskInspectorContent({ task, projectId, onClose }: TaskInspectorContentProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split("T")[0] : "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: teamMembers } = useTeamMembers();
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);
  const createChecklistMutation = useCreateChecklistItem(projectId, task.id);
  const updateChecklistMutation = useUpdateChecklistItem(projectId, task.id);
  const deleteChecklistMutation = useDeleteChecklistItem(projectId, task.id);

  const totalChecklists = task.checklists?.length || 0;
  const completedChecklists = task.checklists?.filter((c) => c.isCompleted).length || 0;
  const checklistProgress =
    totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSaveDetails = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        payload: {
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          assigneeId: assigneeId || null,
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    await createChecklistMutation.mutateAsync({
      title: newChecklistTitle.trim(),
    });
    setNewChecklistTitle("");
  };

  const handleToggleChecklist = async (checklistId: string, currentCompleted: boolean) => {
    await updateChecklistMutation.mutateAsync({
      checklistId,
      payload: {
        isCompleted: !currentCompleted,
      },
    });
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    await deleteChecklistMutation.mutateAsync(checklistId);
  };

  const handleDeleteTask = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteTaskMutation.mutateAsync(task.id);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-background/95 backdrop-blur-md border-border flex h-full w-screen max-w-md flex-col border-l shadow-2xl sm:max-w-lg transition-transform duration-300"
    >
      {/* Header */}
      <div className="border-border/70 bg-muted/20 flex items-center justify-between border-b p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase"
          >
            Task Inspector
          </Badge>
          <span className="text-muted-foreground font-mono text-xs">{task.id.slice(0, 8)}</span>
          {isSaving || updateTaskMutation.isPending ? (
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Spinner className="text-primary h-3 w-3" />
              Saving...
            </span>
          ) : (
            <span className="text-muted-foreground/70 text-[11px]">All changes saved</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <kbd className="border-border/60 bg-muted/60 text-muted-foreground hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
            Esc
          </kbd>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 rounded-full p-0 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Drawer Body - Scrollable */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        {/* Task Title */}
        <div className="space-y-1.5">
          <Label htmlFor="task-title" className="text-xs font-semibold">
            Task Title
          </Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveDetails}
            className="text-sm font-medium"
          />
        </div>

        {/* Status & Priority Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="task-status" className="text-xs font-semibold">
              Status
            </Label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value as TaskStatus;
                setStatus(newStatus);
                updateTaskMutation.mutate({
                  taskId: task.id,
                  payload: { status: newStatus },
                });
              }}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-priority" className="text-xs font-semibold">
              Priority
            </Label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => {
                const newPriority = e.target.value as TaskPriority;
                setPriority(newPriority);
                updateTaskMutation.mutate({
                  taskId: task.id,
                  payload: { priority: newPriority },
                });
              }}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="task-assignee" className="text-xs font-semibold">
              Assignee
            </Label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => {
                const newAssignee = e.target.value;
                setAssigneeId(newAssignee);
                updateTaskMutation.mutate({
                  taskId: task.id,
                  payload: { assigneeId: newAssignee || null },
                });
              }}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {teamMembers?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due-date" className="text-xs font-semibold">
              Due Date
            </Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                const newDue = e.target.value;
                setDueDate(newDue);
                updateTaskMutation.mutate({
                  taskId: task.id,
                  payload: {
                    dueDate: newDue ? new Date(newDue).toISOString() : null,
                  },
                });
              }}
              className="text-xs"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="task-desc" className="text-xs font-semibold">
              Description & Context
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDetails}
              disabled={isSaving}
              className="text-muted-foreground hover:text-foreground h-6 text-[11px]"
            >
              {isSaving ? <Spinner className="h-3 w-3" /> : <Save className="mr-1 h-3 w-3" />}
              Save
            </Button>
          </div>
          <Textarea
            id="task-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSaveDetails}
            placeholder="Add acceptance criteria, technical notes, or reference links..."
            className="text-xs leading-relaxed"
          />
        </div>

        {/* Checklists Section */}
        <div className="border-border/70 bg-card/60 space-y-3 rounded-xl border p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="text-primary h-4 w-4" />
              <h4 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Subtask Checklist
              </h4>
            </div>
            <span className="border-border/60 bg-muted/50 text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-semibold">
              {completedChecklists}/{totalChecklists} ({checklistProgress}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-secondary/70 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>

          {/* Items List */}
          <div className="space-y-1.5 pt-1">
            {task.checklists?.map((item) => (
              <div
                key={item.id}
                className="group hover:bg-muted/60 border-border/40 hover:border-border/70 flex items-center justify-between gap-2 rounded-lg border border-transparent p-2 transition-colors"
              >
                <label className="text-foreground flex flex-1 cursor-pointer items-center gap-2.5 text-xs select-none">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => handleToggleChecklist(item.id, item.isCompleted)}
                    className="border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded accent-primary transition-transform active:scale-90"
                  />
                  <span
                    className={`transition-all duration-200 ${
                      item.isCompleted
                        ? "text-muted-foreground line-through opacity-60"
                        : "font-medium"
                    }`}
                  >
                    {item.title}
                  </span>
                </label>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteChecklist(item.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-6 w-6 rounded p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Delete checklist item"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Add new checklist input */}
            <form onSubmit={handleAddChecklist} className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Add subtask to checklist..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="h-8 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newChecklistTitle.trim()}
                className="h-8 px-2.5 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="border-border flex items-center justify-between border-t p-4 sm:p-5">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteTask}
          disabled={deleteTaskMutation.isPending}
          className="text-xs"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {confirmDelete ? "Confirm Delete Task?" : "Delete Task"}
        </Button>

        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Close
        </Button>
      </div>
    </div>
  );
}

export function TaskInspectorDrawer({
  task,
  projectId,
  isOpen,
  onClose,
}: TaskInspectorDrawerProps) {
  if (!isOpen || !task) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300"
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <TaskInspectorContent key={task.id} task={task} projectId={projectId} onClose={onClose} />
      </div>
    </div>
  );
}
