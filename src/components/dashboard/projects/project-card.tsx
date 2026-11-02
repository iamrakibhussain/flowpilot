"use client";

import Link from "next/link";
import { Calendar, DollarSign, AlertCircle, ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ProjectListItem, ProjectStatus } from "@/features/projects/types";

interface ProjectCardProps {
  project: ProjectListItem;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string; color: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    color: "#10b981",
  },
  PLANNING: {
    label: "Planning",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    color: "#6366f1",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    color: "#f59e0b",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    color: "#3b82f6",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
    color: "#94a3b8",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const statusInfo = statusConfig[project.status] || {
    label: project.status,
    className: "bg-muted text-muted-foreground",
    color: "#3b82f6",
  };

  const now = new Date();
  const targetDateObj = project.targetDate ? new Date(project.targetDate) : null;
  const isProjectOverdue = targetDateObj && targetDateObj < now && project.status !== "COMPLETED";

  const formattedTargetDate = targetDateObj
    ? targetDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const clientInitial = project.customerName
    ? project.customerName.charAt(0).toUpperCase()
    : "C";

  return (
    <Card
      style={{ borderTopColor: statusInfo.color, borderTopWidth: "3px" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="space-y-3.5">
        {/* Top Header: Customer & Status */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold tracking-wider uppercase shadow-2xs ${statusInfo.className}`}
          >
            {statusInfo.label}
          </Badge>

          {project.customerName && (
            <div className="text-muted-foreground flex max-w-[170px] items-center gap-1.5 truncate text-xs">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-extrabold text-primary">
                {clientInitial}
              </div>
              <span className="truncate font-semibold text-foreground/80">
                {project.customerCompany || project.customerName}
              </span>
            </div>
          )}
        </div>

        {/* Project Title & Description */}
        <div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="group-hover:text-primary transition-colors"
          >
            <h3 className="text-foreground line-clamp-1 text-base font-bold tracking-tight">
              {project.name}
            </h3>
          </Link>
          {project.description ? (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="text-muted-foreground/50 mt-1 text-xs italic">No description provided.</p>
          )}
        </div>

        {/* Proposal Synergy Link Pill if seeded from quote */}
        {project.quoteTitle && (
          <div className="bg-primary/5 text-muted-foreground border-primary/20 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium">
            <FileText className="text-primary h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Proposal: {project.quoteTitle}</span>
          </div>
        )}

        {/* Progress Metric Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground/90">Delivery Progress</span>
            <span className="font-mono text-[11px] font-bold text-muted-foreground">
              {project.completedTasks}/{project.totalTasks} ({project.progressPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                project.progressPercentage === 100
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : project.progressPercentage >= 50
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500"
                    : "bg-gradient-to-r from-amber-500 to-primary"
              }`}
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Overdue Alert Strip */}
        {project.overdueTasks > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {project.overdueTasks} task{project.overdueTasks > 1 ? "s" : ""} overdue
            </span>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Action */}
      <div className="border-border/60 text-muted-foreground mt-5 flex items-center justify-between border-t pt-3 text-xs">
        <div className="flex items-center gap-3">
          {formattedTargetDate && (
            <div
              className={`flex items-center gap-1 font-medium ${
                isProjectOverdue ? "text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground"
              }`}
              title="Target Deadline"
            >
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{formattedTargetDate}</span>
            </div>
          )}
          {project.budget !== null && project.budget !== undefined && (
            <div
              className="text-foreground flex items-center gap-0.5 font-bold tabular-nums"
              title="Allocated Budget"
            >
              <DollarSign className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span>
                {project.budget.toLocaleString(undefined, { minimumFractionDigits: 0 })} {project.currency}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/dashboard/projects/${project.id}`}
          className="text-primary inline-flex items-center gap-1 font-bold transition-transform group-hover:translate-x-1"
        >
          <span>Open Board</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
