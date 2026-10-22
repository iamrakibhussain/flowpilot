"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Plus, Calendar, Users, FileText, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { DashboardNotifications } from "@/components/layout/dashboard-notifications";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
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
  const { openModal } = useDashboardModals();

  // Dynamic breadcrumb resolution
  const breadcrumbName = React.useMemo(() => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.includes("/settings")) return "Organization Settings";
    if (pathname.includes("/customers")) return "Customers (CRM)";
    if (pathname.includes("/appointments")) return "Appointments & Calendar";
    if (pathname.includes("/invoices")) return "Invoices & Billing";
    return "Operations";
  }, [pathname]);

  return (
    <header className="border-border/80 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white/90 px-3 sm:px-6 shadow-2xs backdrop-blur-xl">
      {/* Left: Mobile Toggle, Brand & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          className="-ml-1 sm:-ml-2 rounded-xl p-1.5 sm:p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Compact Mobile Brand Mark & Section Title */}
        <div className="flex items-center gap-1.5 sm:hidden min-w-0">
          <Link href="/dashboard" className="flex items-center shrink-0" aria-label="FlowPilot Home">
            <div className="from-primary flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br via-blue-600 to-indigo-600 text-white shadow-xs">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-slate-900 leading-tight">
              {breadcrumbName}
            </span>
          </div>
        </div>

        {/* Dynamic Breadcrumbs with Real Company Name (Desktop/Tablet) */}
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-xs sm:flex">
          <Link
            href="/dashboard"
            className="font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            FlowPilot
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span
            className="max-w-[180px] truncate font-semibold text-slate-700"
            title={organizationName}
          >
            {organizationName}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="rounded-lg border border-slate-200/60 bg-slate-100/90 px-2.5 py-0.5 font-bold text-slate-900 shadow-2xs">
            {breadcrumbName}
          </span>
        </nav>
      </div>

      {/* Center: Global Command Search Trigger (⌘K) */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="group focus-visible:ring-primary flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-500 shadow-2xs transition-all outline-none hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:ring-2"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="group-hover:text-primary h-3.5 w-3.5 text-slate-400 transition-colors" />
            <span className="truncate">Search clients, bookings, invoices...</span>
          </div>
          <kbd className="hidden items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs group-hover:border-slate-300 sm:inline-flex">
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
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Open search palette"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Live Multi-Tenant Cloud Status Indicator */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs xl:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Tenant Online</span>
        </div>

        {/* Quick Action "+ New" Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="from-primary shadow-primary/20 hover:shadow-primary/30 relative h-8 sm:h-9 cursor-pointer gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 px-2 sm:px-3 text-xs font-bold text-white shadow-xs sm:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md"
          >
            <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Quick Operations
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => openModal("appointment")}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 hover:text-slate-900 focus:bg-slate-100"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span>Schedule Appointment</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openModal("customer")}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 hover:text-slate-900 focus:bg-slate-100"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span>Add Customer Record</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openModal("invoice")}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 hover:text-slate-900 focus:bg-slate-100"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span>Create Invoice</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <DashboardNotifications />

        {/* User Profile Header Dropdown */}
        <div className="border-l border-slate-200 pl-1">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
