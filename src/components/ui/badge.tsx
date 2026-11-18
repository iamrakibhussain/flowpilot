import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-2xs hover:bg-primary-hover",
        secondary: "border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-border/80 bg-background text-foreground/80",
        success:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500/30",
        warning:
          "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:border-amber-500/30",
        destructive:
          "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400 dark:border-rose-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  hasDot?: boolean;
}

function Badge({ className, variant, hasDot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {hasDot && (
        <span className="mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
