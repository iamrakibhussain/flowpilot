"use client";

import React from "react";
import { Zap, CheckCircle2, Clock, Sparkles, Activity } from "lucide-react";
import type { FlowRuleStatsResponse } from "@/features/automations/types";

interface AutomationStatsBarProps {
  stats?: FlowRuleStatsResponse | null;
  isLoading?: boolean;
}

export function AutomationStatsBar({ stats, isLoading }: AutomationStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border/60 bg-card/60 relative h-24 animate-pulse rounded-2xl border p-4 backdrop-blur-md"
          >
            <div className="bg-muted/60 mb-2 h-4 w-20 rounded" />
            <div className="bg-muted h-6 w-14 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const activeRules = stats?.activeRules ?? 0;
  const totalRules = stats?.totalRules ?? 0;
  const totalExecutions = stats?.totalExecutions ?? 0;
  const successRate = stats?.successRate ?? (totalExecutions > 0 ? 100 : 100);
  const hoursSaved = stats?.estimatedHoursSaved ?? Math.round(totalExecutions * 0.45 * 10) / 10;

  const statItems = [
    {
      title: "Active Workflows",
      value: `${activeRules}`,
      subtitle: `of ${totalRules} configured`,
      icon: Zap,
      color: "text-amber-500",
      bgGlow: "from-amber-500/10 to-transparent",
      borderColor: "hover:border-amber-500/40",
      indicator: activeRules > 0,
    },
    {
      title: "Autonomous Runs",
      value: `${totalExecutions}`,
      subtitle: "lifetime executions",
      icon: Activity,
      color: "text-indigo-500",
      bgGlow: "from-indigo-500/10 to-transparent",
      borderColor: "hover:border-indigo-500/40",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      subtitle: `${stats?.successfulExecutions ?? 0} flawless runs`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgGlow: "from-emerald-500/10 to-transparent",
      borderColor: "hover:border-emerald-500/40",
    },
    {
      title: "Est. Hours Saved",
      value: `${hoursSaved} hrs`,
      subtitle: "manual effort bypassed",
      icon: Clock,
      color: "text-cyan-500",
      bgGlow: "from-cyan-500/10 to-transparent",
      borderColor: "hover:border-cyan-500/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`border-border/80 from-card via-card/95 to-card/85 group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-3.5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4.5 ${item.borderColor}`}
          >
            {/* Corner Glow */}
            <div
              className={`pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gradient-to-br ${item.bgGlow} blur-xl transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="flex items-center justify-between gap-1.5">
              <span className="text-muted-foreground line-clamp-1 text-xs font-semibold">
                {item.title}
              </span>
              <div
                className={`border-border/50 bg-background/50 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs ${item.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-2">
                <span className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
                  {item.value}
                </span>
                {item.indicator && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 truncate text-[11px] font-medium">
                {item.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
