import * as React from "react";
import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-md motion-reduce:animate-none", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
