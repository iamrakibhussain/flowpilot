import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this content. Please try again.",
  onRetry,
  className,
  isRetrying = false,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/20 bg-destructive/5 flex min-h-[280px] flex-col items-center justify-center rounded-lg border p-8 text-center",
        className
      )}
    >
      <div
        className="bg-destructive/10 text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-foreground text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onRetry} isLoading={isRetrying}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
