"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useTeamMembers } from "@/features/team/use-team";
import { useCreateTask } from "@/features/projects/use-projects";
import type { TaskPriority, TaskStatus } from "@/features/projects/types";

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus?: TaskStatus;
}

function QuickTaskForm({
  onClose,
  projectId,
  defaultStatus = "TODO",
}: Omit<QuickTaskModalProps, "isOpen">) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: teamMembers } = useTeamMembers();
  const createTaskMutation = useCreateTask(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setError(null);
      await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assigneeId: assigneeId || null,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-base font-bold">Create Kanban Task</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-2.5 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="quick-task-title" className="text-xs font-semibold">
            Task Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quick-task-title"
            placeholder="e.g. Conduct UX Research Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="quick-task-status" className="text-xs font-semibold">
              Status
            </Label>
            <select
              id="quick-task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
            <Label htmlFor="quick-task-priority" className="text-xs font-semibold">
              Priority
            </Label>
            <select
              id="quick-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="quick-task-assignee" className="text-xs font-semibold">
              Assignee
            </Label>
            <select
              id="quick-task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {teamMembers?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-task-due" className="text-xs font-semibold">
              Due Date
            </Label>
            <Input
              id="quick-task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quick-task-desc" className="text-xs font-semibold">
            Description (Optional)
          </Label>
          <Textarea
            id="quick-task-desc"
            rows={2}
            placeholder="Brief details or deliverable criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={createTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={createTaskMutation.isPending}>
            {createTaskMutation.isPending ? (
              <>
                <Spinner className="mr-2 h-3.5 w-3.5" />
                Creating...
              </>
            ) : (
              "Add Task"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function QuickTaskModal(props: QuickTaskModalProps) {
  if (!props.isOpen) return null;

  return (
    <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
      <QuickTaskForm
        onClose={props.onClose}
        projectId={props.projectId}
        defaultStatus={props.defaultStatus}
      />
    </Dialog>
  );
}
