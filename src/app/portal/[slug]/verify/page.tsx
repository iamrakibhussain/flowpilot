"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVerifyPortalToken } from "@/features/portal/use-portal";

export default function ClientPortalVerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = typeof params?.slug === "string" ? params.slug : "";
  const token = searchParams.get("token") || "";

  // Derive initial status synchronously from token presence to avoid cascading renders in useEffect
  const [status, setStatus] = React.useState<"verifying" | "success" | "error">(() =>
    !token ? "error" : "verifying"
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(() =>
    !token ? "No security token provided in verification link." : null
  );

  const verifyMutation = useVerifyPortalToken();

  React.useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    async function executeVerification() {
      try {
        await verifyMutation.mutateAsync({
          organizationSlug: slug,
          token,
        });

        if (isMounted) {
          setStatus("success");
          setTimeout(() => {
            router.push(`/portal/${slug}/dashboard`);
          }, 800);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Invalid or expired sign-in link. Please request a fresh link."
          );
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token, slug, router, verifyMutation]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95">
          <CardContent className="space-y-6 p-0">
            {status === "verifying" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600/30 border-t-blue-600" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Authenticating Client Session
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verifying cryptographic credentials and establishing secure tunnel...
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/60">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Access Granted
                  </h2>
                  <p className="text-xs text-slate-500">
                    Redirecting you to your client command center...
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/60">
                  <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Verification Failed
                  </h2>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {errorMessage || "Link expired or invalid."}
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/portal/${slug}`)}
                  className="w-full gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Request New Access Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
