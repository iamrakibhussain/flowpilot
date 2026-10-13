import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = "Loading workspace data...",
  className,
}) => {
  return (
    <div
      className={cn(
        "text-muted-foreground flex min-h-[240px] flex-col items-center justify-center p-8 text-center",
        className
      )}
      aria-live="polite"
    >
      <Spinner size="lg" className="text-primary mb-3" label={label} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};
