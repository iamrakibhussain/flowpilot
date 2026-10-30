"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Plus, Calendar, Users, FileText, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { DashboardNotifications } from "@/components/layout/dashboard-notifications";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { useOrganizationSettings } from "@/features/organizations/use-organization-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDashboardModals } from "@/components/dashboard/modals/dashboard-modal-context";

export interface DashboardHeaderProps {
  onOpenMobile: () => void;
  onOpenCommand: () => void;
}

export function DashboardHeader({ onOpenMobile, onOpenCommand }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { organizationName } = useWorkspaceSession();
  const { data: orgSettings } = useOrganizationSettings();
  const { openModal } = useDashboardModals();

  const finalOrgName = orgSettings?.name || organizationName;

  // Dynamic breadcrumb resolution
  const breadcrumbName = React.useMemo(() => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.includes("/analytics")) return "Business Intelligence";
    if (pathname.includes("/services")) return "Services & Catalog";
    if (pathname.includes("/settings")) return "Organization Settings";
    if (pathname.includes("/customers")) return "Customers (CRM)";
    if (pathname.includes("/calendar") || pathname.includes("/appointments"))
      return "Appointments & Calendar";
    if (pathname.includes("/invoices")) return "Invoices & Billing";
    if (pathname.includes("/payments")) return "Online Payments & Gateway";
    if (pathname.includes("/staff")) return "Team & Staff";
    return "Operations";
  }, [pathname]);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b px-3 shadow-2xs backdrop-blur-xl sm:px-6">
      {/* Left: Mobile Toggle, Brand & Dynamic Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="text-muted-foreground hover:bg-muted/70 hover:text-foreground -ml-1 rounded-xl p-1.5 transition-colors sm:-ml-2 sm:p-2 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Compact Mobile Brand Mark & Section Title */}
        <div className="flex min-w-0 items-center gap-1.5 sm:hidden">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center"
            aria-label="FlowPilot Home"
          >
            <div className="from-primary flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br via-blue-600 to-indigo-600 text-white shadow-xs">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </Link>
          <div className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-xs leading-tight font-bold">
              {breadcrumbName}
            </span>
          </div>
        </div>

        {/* Dynamic Breadcrumbs with Real Company Name (Desktop/Tablet) */}
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-xs sm:flex">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            FlowPilot
          </Link>
          <ChevronRight className="text-muted-foreground/40 h-3.5 w-3.5" />
          <span
            className="text-foreground max-w-[180px] truncate font-semibold"
            title={finalOrgName}
          >
            {finalOrgName}
          </span>
          <ChevronRight className="text-muted-foreground/40 h-3.5 w-3.5" />
          <span className="border-border/80 bg-muted/60 text-foreground rounded-lg border px-2.5 py-0.5 font-bold shadow-2xs">
            {breadcrumbName}
          </span>
        </nav>
      </div>

      {/* Center: Global Command Search Trigger (⌘K) */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="group focus-visible:ring-primary border-border/80 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-muted/70 hover:text-foreground flex w-full items-center justify-between rounded-xl border px-3.5 py-2 text-xs shadow-2xs transition-all outline-none focus-visible:ring-2"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="group-hover:text-primary text-muted-foreground h-3.5 w-3.5 transition-colors" />
            <span className="truncate">Search clients, bookings, invoices...</span>
          </div>
          <kbd className="border-border/80 bg-card text-muted-foreground group-hover:border-primary/40 hidden items-center gap-0.5 rounded-md border px-1.5 py-0.5 font-mono text-[10px] shadow-2xs sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action, Cloud Status, Notifications & User */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile Search Icon Trigger */}
        <button
          type="button"
          onClick={onOpenCommand}
          className="text-muted-foreground hover:bg-muted/70 hover:text-foreground flex h-8 w-8 items-center justify-center rounded-xl transition-colors sm:h-9 sm:w-9 md:hidden"
          aria-label="Open search palette"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Live Multi-Tenant Cloud Status Indicator */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 shadow-2xs xl:flex dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Tenant Verified</span>
        </div>

        {/* Quick Action "+ New" Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="from-primary shadow-primary/20 hover:shadow-primary/30 relative h-8 cursor-pointer gap-1 rounded-lg bg-gradient-to-r via-blue-600 to-indigo-600 px-2 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] sm:h-9 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="border-border/80 bg-popover/95 text-popover-foreground w-56 max-w-[calc(100vw-2rem)] rounded-xl border p-1.5 shadow-xl backdrop-blur-md"
          >
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
              Quick Operations
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => openModal("appointment")}
              className="hover:bg-muted/60 focus:bg-muted/60 text-foreground flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>Schedule Appointment</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openModal("customer")}
              className="hover:bg-muted/60 focus:bg-muted/60 text-foreground flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span>Add Customer Record</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openModal("invoice")}
              className="hover:bg-muted/60 focus:bg-muted/60 text-foreground flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span>Create Invoice</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <DashboardNotifications />

        {/* User Profile Header Dropdown */}
        <div className="border-border/80 border-l pl-1">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
