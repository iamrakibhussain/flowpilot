"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, ShieldAlert, User, Settings, Building2, Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/use-logout";
import { getCurrentUser } from "@/features/auth/api";
import type { AuthSession } from "@/features/auth/types";
import { cn } from "@/lib/utils/cn";

export interface UserNavProps {
  className?: string;
  showDetails?: boolean;
}

export function UserNav({ className, showDetails = false }: UserNavProps) {
  const { logout, isLoggingOut } = useLogout();
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      try {
        const data = await getCurrentUser();
        if (isMounted) {
          setSession(data);
        }
      } catch {
        // Fallback session when running in decoupled or preview mode
        if (isMounted) {
          setSession({
            user: {
              id: "usr-current",
              email: "operator@flowpilot.io",
              name: "Operations Lead",
            },
            activeOrganizationId: "org-preview",
            memberships: [
              {
                organizationId: "org-preview",
                organizationName: "Acme Services Ltd.",
                role: "OWNER",
              },
            ],
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const userName = session?.user?.name || "Operator";
  const userEmail = session?.user?.email || "operator@flowpilot.io";
  const orgName = session?.memberships?.[0]?.organizationName || "Acme Services Ltd.";
  const userRole = session?.memberships?.[0]?.role || "OWNER";

  // Derive initials for avatar display
  const initials =
    userName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "FP";

  return (
    <div className={cn("relative flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={isLoggingOut}
            aria-label="User navigation and account menu"
            className={cn(
              "group focus-visible:ring-primary flex items-center gap-2.5 rounded-full p-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              showDetails &&
                "hover:bg-muted/60 border-border/60 w-full justify-between rounded-xl border p-2"
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              {/* Refractive gradient avatar capsule */}
              <div className="from-primary relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr via-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{initials}</span>
                )}
                {/* Active status pulse */}
                <span className="border-background absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 bg-emerald-500" />
              </div>

              {showDetails && (
                <div className="truncate text-left text-xs">
                  <p className="text-foreground truncate leading-tight font-semibold">{userName}</p>
                  <p className="text-muted-foreground truncate text-[11px]">{userEmail}</p>
                </div>
              )}
            </div>

            {showDetails && (
              <ChevronDown className="text-muted-foreground group-hover:text-foreground h-3.5 w-3.5 shrink-0 transition-colors" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={showDetails ? "start" : "end"}
          sideOffset={8}
          className="border-border/80 bg-surface/95 text-foreground w-64 rounded-xl p-1.5 shadow-xl backdrop-blur-xl"
        >
          {/* Identity & Workspace Card */}
          <div className="from-muted/50 to-muted/20 border-border/50 rounded-lg border bg-gradient-to-b p-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
                {initials}
              </div>
              <div className="truncate text-xs">
                <p className="text-foreground truncate leading-tight font-semibold">{userName}</p>
                <p className="text-muted-foreground truncate text-[11px]">{userEmail}</p>
              </div>
            </div>

            <div className="border-border/50 text-muted-foreground mt-2.5 flex items-center justify-between border-t pt-2 text-[10px]">
              <div className="flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{orgName}</span>
              </div>
              <span className="bg-primary/10 text-primary border-primary/20 py-0.2 rounded-full border px-1.5 font-semibold uppercase">
                {userRole}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Navigation Links */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="hover:bg-muted/80 text-foreground flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium"
              >
                <User className="text-muted-foreground h-3.5 w-3.5" />
                <span>Dashboard Overview</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="hover:bg-muted/80 text-foreground flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium"
              >
                <Settings className="text-muted-foreground h-3.5 w-3.5" />
                <span>Security & Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Secure Logout Options */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={() => logout()}
              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>{isLoggingOut ? "Signing out..." : "Log Out"}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={() => logout({ allDevices: true })}
              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Log Out All Devices</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
