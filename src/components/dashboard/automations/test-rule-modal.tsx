"use client";

import * as React from "react";
import { X, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTestFlowRule } from "@/features/automations/use-automations";
import type { FlowRuleListItem, TestFlowRuleResult } from "@/features/automations/types";

interface TestRuleModalProps {
  rule: FlowRuleListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TestRuleModal({ rule, isOpen, onClose }: TestRuleModalProps) {
  const [entityTitle, setEntityTitle] = React.useState("Enterprise Web Platform");
  const [simulatedAmount, setSimulatedAmount] = React.useState("2500");
  const [testResult, setTestResult] = React.useState<TestFlowRuleResult | null>(null);

  const testMutation = useTestFlowRule();

  const handleClose = React.useCallback(() => {
    setTestResult(null);
    setEntityTitle("Enterprise Web Platform");
    setSimulatedAmount("2500");
    onClose();
  }, [onClose]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !rule) return null;

  const handleRunTest = async () => {
    try {
      const res = await testMutation.mutateAsync({
        id: rule.id,
        payload: {
          title: entityTitle.trim(),
          amount: simulatedAmount ? Number(simulatedAmount) : undefined,
          entityId: "sim-test-99",
          customerId: "cst-sim-1",
        },
      });
      setTestResult(res);
    } catch {
      // Handled by react-query
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4"
    >
      <div className="border-border/80 bg-background relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[90vh]">
        {/* Header */}
        <div className="border-border/80 bg-card flex items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Play className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate text-sm font-bold tracking-tight sm:text-base">
                Simulate Automation Rule
              </h3>
              <p className="text-muted-foreground truncate text-[11px] sm:text-xs">{rule.title}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close test modal"
            className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0 rounded-xl"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="border-border/80 bg-card space-y-3 rounded-xl border p-3.5 sm:p-4">
            <div className="space-y-1.5">
              <Label htmlFor="simTitle" className="text-xs font-semibold">
                Simulated Record Title
              </Label>
              <Input
                id="simTitle"
                value={entityTitle}
                onChange={(e) => setEntityTitle(e.target.value)}
                placeholder="e.g. Acme Website Redesign"
                className="h-10 text-sm sm:h-9 sm:text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="simAmt" className="text-xs font-semibold">
                Simulated Value / Amount ($ USD)
              </Label>
              <Input
                id="simAmt"
                type="number"
                value={simulatedAmount}
                onChange={(e) => setSimulatedAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="h-10 text-sm sm:h-9 sm:text-xs"
              />
            </div>

            <Button
              onClick={handleRunTest}
              disabled={testMutation.isPending}
              className="mt-1 h-10 w-full bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 sm:h-9"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              {testMutation.isPending ? "Simulating Engine..." : "Execute Dry-Run Simulation"}
            </Button>
          </div>

          {/* Test Results Output */}
          {testResult && (
            <div className="border-border/80 bg-card space-y-2 rounded-xl border p-3.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-foreground font-bold">Simulation Result:</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    testResult.matched
                      ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {testResult.matched ? (
                    <>
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Criteria Matched & Action Simulated
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Filtered Out (Criteria Not Met)
                    </>
                  )}
                </span>
              </div>

              <div className="bg-background/80 border-border/60 text-muted-foreground max-h-48 overflow-x-auto rounded-lg border p-2.5 font-mono text-[11px]">
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Close Button */}
        <div className="border-border/80 bg-card flex items-center justify-end border-t px-4 py-2.5 sm:px-5 sm:py-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-9 w-full text-xs font-semibold sm:w-auto"
          >
            Close Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}
