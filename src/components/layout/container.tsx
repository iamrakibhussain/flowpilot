import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg" | "fluid";
}

const sizeClasses = {
  sm: "max-w-4xl",
  default: "max-w-7xl",
  lg: "max-w-(--breakpoint-2xl)",
  fluid: "max-w-full",
};

export const Container: React.FC<ContainerProps> = ({
  size = "default",
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
};
