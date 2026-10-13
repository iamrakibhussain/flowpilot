"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Critical root error caught by GlobalError:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-gray-900">
        <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Critical Application Failure</h2>
          <p className="mt-2 text-sm text-gray-600">
            A critical error interrupted application startup. Please reload the page.
          </p>
          <div className="mt-5">
            <button
              onClick={() => reset()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
