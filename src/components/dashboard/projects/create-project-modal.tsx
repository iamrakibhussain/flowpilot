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
import { useCreateProject } from "@/features/projects/use-projects";
import { useCustomers } from "@/features/customers/use-customers";
import type { ProjectStatus, TaskPriority } from "@/features/projects/types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCustomerId?: string | null;
  prefillQuoteId?: string | null;
  prefillTitle?: string | null;
  prefillBudget?: number | null;
  prefillCurrency?: string;
}

function CreateProjectForm({
  onClose,
  prefillCustomerId,
  prefillQuoteId,
  prefillTitle,
  prefillBudget,
  prefillCurrency = "USD",
}: Omit<CreateProjectModalProps, "isOpen">) {
  const [name, setName] = useState(prefillTitle || "");
  const [description, setDescription] = useState("");
  const [customerId, setCustomerId] = useState<string>(prefillCustomerId || "");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [targetDate, setTargetDate] = useState("");
  const [budget, setBudget] = useState<string>(prefillBudget ? String(prefillBudget) : "");
  const [currency, setCurrency] = useState(prefillCurrency || "USD");
  const [initialTaskTitle, setInitialTaskTitle] = useState(
    "Project Kickoff & Requirements Alignment"
  );
  const [error, setError] = useState<string | null>(null);

  const { data: customersData } = useCustomers({
    limit: 100,
  });
  const createProjectMutation = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setError(null);
      await createProjectMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        customerId: customerId || null,
        quoteId: prefillQuoteId || null,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        budget: budget ? parseFloat(budget) : null,
        currency,
        initialTasks: initialTaskTitle.trim()
          ? [
              {
                title: initialTaskTitle.trim(),
                status: "TODO",
                priority: "HIGH" as TaskPriority,
              },
            ]
          : undefined,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project. Please try again.");
    }
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">Create New Delivery Project</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Project Name */}
        <div className="space-y-1.5">
          <Label htmlFor="proj-name">
            Project Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="proj-name"
            placeholder="e.g. Website Redesign & Brand Assets"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Customer Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="proj-customer">Client / Customer (Optional)</Label>
          <select
            id="proj-customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">No Customer Linked (Internal Project)</option>
            {customersData?.customers?.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} {cust.company ? `(${cust.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="proj-desc">Scope & Description</Label>
          <Textarea
            id="proj-desc"
            rows={3}
            placeholder="Key project goals, deliverables, and expectations..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Dates & Status Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="proj-status">Status</Label>
            <select
              id="proj-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-start">Start Date</Label>
            <Input
              id="proj-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-target">Target Deadline</Label>
            <Input
              id="proj-target"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        {/* Budget & Currency */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="proj-budget">Budget Target</Label>
            <Input
              id="proj-budget"
              type="number"
              step="0.01"
              placeholder="5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-currency">Currency</Label>
            <select
              id="proj-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BDT">BDT (৳)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </div>
        </div>

        {/* Initial Task creation */}
        <div className="border-border/60 bg-muted/30 space-y-1.5 rounded-lg border p-3">
          <Label htmlFor="proj-first-task" className="text-xs font-semibold">
            Add Initial Kanban Task (Optional)
          </Label>
          <Input
            id="proj-first-task"
            placeholder="e.g. Schedule Discovery Call"
            value={initialTaskTitle}
            onChange={(e) => setInitialTaskTitle(e.target.value)}
            className="text-xs"
          />
          <p className="text-muted-foreground text-[11px]">
            This task will be automatically placed into the &quot;To Do&quot; column on launch.
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createProjectMutation.isPending}>
            {createProjectMutation.isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating Project...
              </>
            ) : (
              "Launch Project"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function CreateProjectModal(props: CreateProjectModalProps) {
  if (!props.isOpen) return null;

  return (
    <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
      <CreateProjectForm
        onClose={props.onClose}
        prefillCustomerId={props.prefillCustomerId}
        prefillQuoteId={props.prefillQuoteId}
        prefillTitle={props.prefillTitle}
        prefillBudget={props.prefillBudget}
        prefillCurrency={props.prefillCurrency}
      />
    </Dialog>
  );
}
