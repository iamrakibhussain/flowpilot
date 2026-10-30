"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  ShieldCheck,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Sparkles,
  X,
  Zap,
  Globe,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserNav } from "@/components/layout/user-nav";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { useOrganizationSettings } from "@/features/organizations/use-organization-settings";

export interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Core Operations",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      {
        name: "Services & Catalog",
        href: "/dashboard/services",
        icon: Sparkles,
        badge: "Live",
        badgeVariant: "success",
      },
      {
        name: "Invoices & Billing",
        href: "/dashboard/invoices",
        icon: FileText,
        badge: "Live",
        badgeVariant: "success",
      },
      {
        name: "Online Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
        badge: "Live",
        badgeVariant: "success",
      },
      {
        name: "Appointments & Calendar",
        href: "/dashboard/calendar",
        icon: Calendar,
        badge: "Live",
        badgeVariant: "success",
      },
      {
        name: "Customers (CRM)",
        href: "/dashboard/customers",
        icon: Users,
        badge: "Live",
        badgeVariant: "success",
      },
    ],
  },
  {
    title: "Management & Growth",
    items: [
      {
        name: "Team & Staff",
        href: "/dashboard/staff",
        icon: ShieldCheck,
        badge: "Live",
        badgeVariant: "success",
      },
      {
        name: "Analytics & Reports",
        href: "/dashboard/analytics",
        icon: BarChart3,
        badge: "Live",
        badgeVariant: "success",
      },
    ],
  },
  {
    title: "Configuration",
    items: [{ name: "Organization Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export function DashboardSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { organizationName, organizationRole, memberships } = useWorkspaceSession();
  const { data: orgSettings } = useOrganizationSettings();
  const [selectedOrgName, setSelectedOrgName] = React.useState<string | null>(null);

  const displayOrgName = selectedOrgName || orgSettings?.name || organizationName;
  const logoUrl = orgSettings?.logoUrl;

  const renderSidebarContent = (collapsed: boolean, isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="border-border/80 flex h-16 shrink-0 items-center justify-between border-b px-4">
        <Link
          href="/dashboard"
          onClick={() => isMobile && onCloseMobile()}
          className={cn(
            "group focus-visible:ring-primary flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            collapsed && "w-full justify-center"
          )}
          aria-label="FlowPilot Dashboard"
        >
          <div className="from-primary relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br via-blue-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(49,95,232,0.35)] transition-all duration-300 group-hover:scale-105">
            <Layers className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-300 blur-[1px]" />
          </div>

          {!collapsed && (
            <div className="flex items-center overflow-hidden">
              <span className="text-foreground text-base font-bold tracking-tight">
                Flow
                <span className="from-primary bg-gradient-to-r via-blue-600 to-indigo-600 bg-clip-text font-extrabold text-transparent">
                  Pilot
                </span>
              </span>
              <span className="border-primary/20 bg-primary/10 text-primary ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                <Sparkles className="h-2 w-2" />
                SaaS
              </span>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Organization Switcher Dropdown with Dynamic Company Name */}
      <div className="border-border/60 shrink-0 border-b p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group focus-visible:ring-primary border-border/80 bg-muted/40 text-foreground hover:bg-muted/70 flex w-full items-center rounded-xl border p-2 text-left shadow-2xs transition-all outline-none focus-visible:ring-2",
                collapsed ? "justify-center px-0 py-2" : "justify-between"
              )}
              title={displayOrgName}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="from-primary flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-tr to-indigo-600 text-xs font-bold text-white shadow-xs">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={displayOrgName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayOrgName.charAt(0).toUpperCase()
                  )}
                </div>
                {!collapsed && (
                  <div className="truncate">
                    <p className="text-foreground truncate text-xs leading-tight font-bold">
                      {displayOrgName}
                    </p>
                    <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                      {organizationRole} WORKSPACE
                    </p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="border-border/80 bg-popover/95 text-popover-foreground w-64 rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-[11px] font-semibold tracking-wider uppercase">
              Active Company Workspace
            </DropdownMenuLabel>

            {memberships.length > 0 ? (
              memberships.map((org) => (
                <DropdownMenuItem
                  key={org.organizationId}
                  onClick={() => setSelectedOrgName(org.organizationName)}
                  className="hover:bg-muted/60 focus:bg-muted/60 text-foreground flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold">
                      {org.organizationName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{org.organizationName}</span>
                  </div>
                  {org.organizationName === displayOrgName && (
                    <Check className="text-primary h-4 w-4 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem
                onClick={() => setSelectedOrgName(displayOrgName)}
                className="hover:bg-muted/60 focus:bg-muted/60 text-foreground flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold">
                    {displayOrgName.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{displayOrgName}</span>
                </div>
                <Check className="text-primary h-4 w-4 shrink-0" />
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-border/60 my-1" />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                onClick={() => isMobile && onCloseMobile()}
                className="hover:bg-muted/60 focus:bg-muted/60 text-foreground flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs"
              >
                <Settings className="text-muted-foreground h-3.5 w-3.5" />
                <span>Workspace Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                onClick={() => isMobile && onCloseMobile()}
                className="text-primary hover:bg-primary/10 flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Manage Workspaces</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Sections (Scrolls internally if long) */}
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="text-muted-foreground/70 px-2 pb-1 text-[10px] font-bold tracking-wider uppercase">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : item.href.includes("#")
                      ? false
                      : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => isMobile && onCloseMobile()}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "group focus-visible:ring-primary relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2",
                      collapsed
                        ? "mx-auto h-10 w-10 justify-center"
                        : "h-10 justify-between gap-3 px-3",
                      isActive
                        ? "from-primary/15 via-primary/5 text-primary border-primary glow-primary border-l-[3px] bg-gradient-to-r to-transparent font-bold shadow-2xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                          item.badgeVariant === "warning" &&
                            "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                          item.badgeVariant === "success" &&
                            "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Workspace Resource & Capacity Meter (Visible when expanded) */}
        {!collapsed && (
          <div className="border-border/80 from-card to-card/90 mt-4 rounded-2xl border bg-gradient-to-b p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground flex items-center gap-1.5 font-bold">
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Growth Tier
              </span>
              <span className="text-primary text-[11px] font-semibold">64% Capacity</span>
            </div>

            <div className="bg-muted/70 mt-2.5 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: "64%" }}
              />
            </div>

            <div className="text-muted-foreground mt-2 flex items-center justify-between text-[11px]">
              <span>1,280 / 2,000 Clients</span>
              <Link
                href="/dashboard/settings"
                onClick={() => isMobile && onCloseMobile()}
                className="text-primary hover:text-primary-hover font-semibold hover:underline"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}

        {/* Back to Public Website Link */}
        <div className="border-border/60 mt-auto border-t pt-3">
          <Link
            href="/"
            onClick={() => isMobile && onCloseMobile()}
            className={cn(
              "group text-muted-foreground hover:bg-muted/60 hover:text-foreground flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
              collapsed && "justify-center px-0"
            )}
            title="Return to Public Website"
          >
            <div className="group-hover:bg-primary/10 group-hover:text-primary bg-muted/60 text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors">
              <Globe className="h-3.5 w-3.5" />
            </div>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span>Back to Main Site</span>
                <ArrowUpRight className="text-muted-foreground/60 group-hover:text-foreground h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Footer: User Profile & Collapse Toggle */}
      <div className="border-border/60 bg-muted/20 shrink-0 border-t p-2.5">
        <div className="flex items-center justify-between">
          <div className={cn("truncate", collapsed ? "mx-auto" : "flex-1")}>
            <UserNav showDetails={!collapsed} />
          </div>

          {!collapsed && !isMobile && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="text-muted-foreground hover:bg-muted/60 hover:text-foreground hidden h-8 w-8 items-center justify-center rounded-lg transition-colors lg:flex"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && !isMobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-muted-foreground hover:bg-muted/60 hover:text-foreground mx-auto mt-2 hidden h-7 w-7 items-center justify-center rounded-lg transition-colors lg:flex"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Fixed Sidebar (Never scrolls with window) */}
      <aside
        className={cn(
          "border-border/60 bg-card/85 sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:flex",
          isCollapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        {renderSidebarContent(isCollapsed, false)}
      </aside>

      {/* Mobile Drawer Slide-over */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-in Sheet Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="border-border/80 bg-card text-foreground relative flex h-full w-72 max-w-[85vw] flex-col border-r shadow-2xl"
            >
              {renderSidebarContent(false, true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
