"use client";

import * as React from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { Container } from "@/components/layout/container";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected errors safely
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-[60vh] items-center justify-center py-12">
      <Container size="sm">
        <ErrorState
          title="Something went wrong"
          message={
            error.message ||
            "An unexpected error occurred while rendering this view. Our team has been notified."
          }
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
