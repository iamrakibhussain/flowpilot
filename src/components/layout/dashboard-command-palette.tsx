"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  ShieldCheck,
  CreditCard,
  UserPlus,
  CalendarPlus,
  Download,
  Building2,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";

export interface DashboardCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandEntry {
  id: string;
  title: string;
  description: string;
  category:
    "Quick Actions" | "Navigation" | "Clients & CRM" | "Invoices & Billing" | "Appointments";
  href?: string;
  actionType?: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning";
}

const staticCommandEntries: CommandEntry[] = [
  // Quick Actions
  {
    id: "act-invoice",
    title: "Create New Invoice",
    description: "Generate and dispatch an itemized invoice via Stripe.",
    category: "Quick Actions",
    icon: CreditCard,
    actionType: "new_invoice",
    badge: "Action",
  },
  {
    id: "act-appointment",
    title: "Schedule Appointment",
    description: "Book an operational or consultation session with a client.",
    category: "Quick Actions",
    icon: CalendarPlus,
    actionType: "schedule_appointment",
    badge: "Action",
  },
  {
    id: "act-client",
    title: "Add Customer Record",
    description: "Onboard a new client or business account to the workspace.",
    category: "Quick Actions",
    icon: UserPlus,
    actionType: "add_client",
    badge: "Action",
  },
  {
    id: "act-export",
    title: "Export Operations CSV Report",
    description: "Download encrypted telemetry and transaction records.",
    category: "Quick Actions",
    icon: Download,
    actionType: "export_csv",
    badge: "Export",
  },

  // Navigation
  {
    id: "nav-overview",
    title: "Operations Overview",
    description: "Return to the main operations hub and KPI dashboards.",
    category: "Navigation",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "nav-customers",
    title: "Customers (CRM)",
    description: "View client records, interaction history, and active tiers.",
    category: "Navigation",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    id: "nav-appointments",
    title: "Appointments & Calendar",
    description: "Inspect upcoming agenda and room availability.",
    category: "Navigation",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    id: "nav-invoices",
    title: "Invoices & Billing",
    description: "Audit pending invoices, payment receipts, and revenue ledger.",
    category: "Navigation",
    href: "/dashboard/invoices",
    icon: FileText,
    badge: "Live",
    badgeVariant: "success",
  },
  {
    id: "nav-payments",
    title: "Online Payments & Treasury",
    description: "Manage Stripe gateway, client payment links, and transaction ledger.",
    category: "Navigation",
    href: "/dashboard/payments",
    icon: CreditCard,
    badge: "Live",
    badgeVariant: "success",
  },
  {
    id: "nav-team",
    title: "Team & Staff Directory",
    description: "Manage workforce capacity, specialist qualifications, and attributed revenue.",
    category: "Navigation",
    href: "/dashboard/staff",
    icon: ShieldCheck,
    badge: "Live",
    badgeVariant: "success",
  },
  {
    id: "nav-settings",
    title: "Organization Settings",
    description: "Configure workspace branding, domain, and security policies.",
    category: "Navigation",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

import { useDashboardModals } from "@/components/dashboard/modals/dashboard-modal-context";
import {
  useDashboardActivities,
  useDashboardCustomersData,
} from "@/features/dashboard/use-dashboard";

export function DashboardCommandPalette({ isOpen, onClose }: DashboardCommandPaletteProps) {
  const router = useRouter();
  const { openModal, exportCsv } = useDashboardModals();
  const activitiesQuery = useDashboardActivities();
  const customersQuery = useDashboardCustomersData();
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const dynamicEntries = React.useMemo(() => {
    const records: CommandEntry[] = [...staticCommandEntries];

    // Real dynamic clients from database
    if (customersQuery.data && customersQuery.data.length > 0) {
      customersQuery.data.forEach((cust) => {
        records.push({
          id: `crm-cust-${cust.id}`,
          title: cust.name,
          description: `Client • ${cust.tier ?? "Standard"} • ${cust.email ?? "Active"}`,
          category: "Clients & CRM",
          icon: Building2,
          badge: cust.tier ?? "Active",
          badgeVariant: "success",
          actionType: "view_customer",
          href: `/dashboard/customers/${cust.id}`,
        });
      });
    }

    // Real dynamic activities (invoices & appointments) from database
    if (activitiesQuery.data && activitiesQuery.data.length > 0) {
      activitiesQuery.data.forEach((act) => {
        if (act.type === "invoices") {
          records.push({
            id: `cmd-act-${act.id}`,
            title: `Invoice #${act.refCode}`,
            description: `${act.amount} • ${act.client} • ${act.service}`,
            category: "Invoices & Billing",
            icon: CreditCard,
            badge: act.status,
            badgeVariant: act.statusVariant === "success" ? "success" : "warning",
            actionType: "view_invoice",
          });
        } else if (act.type === "appointments") {
          records.push({
            id: `cmd-act-${act.id}`,
            title: act.service,
            description: `${act.client} • ${act.date} • ${act.amount}`,
            category: "Appointments",
            icon: Calendar,
            badge: act.status,
            badgeVariant: act.statusVariant === "success" ? "success" : "warning",
            actionType: "view_appointment",
          });
        }
      });
    }

    return records;
  }, [customersQuery.data, activitiesQuery.data]);

  const filteredEntries = React.useMemo(() => {
    if (!searchQuery.trim()) return dynamicEntries;
    const query = searchQuery.toLowerCase().trim();
    return dynamicEntries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query)
    );
  }, [searchQuery, dynamicEntries]);

  const handleSelect = (entry: CommandEntry) => {
    handleClose();
    if (entry.actionType) {
      if (entry.actionType === "new_invoice") {
        openModal("invoice");
      } else if (entry.actionType === "schedule_appointment") {
        openModal("appointment");
      } else if (entry.actionType === "add_client") {
        openModal("customer");
      } else if (entry.actionType === "export_csv") {
        exportCsv();
      } else if (entry.actionType === "view_appointment") {
        router.push("/dashboard/calendar");
      } else if (entry.href) {
        router.push(entry.href);
      }
    } else if (entry.href) {
      router.push(entry.href);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Operations Command Palette"
        >
          {/* Top Search Input Box */}
          <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5">
            <Search className="text-primary mr-3 h-5 w-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, invoices, appointments, or quick actions..."
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-500 shadow-2xs sm:inline-flex">
                ESC
              </kbd>
            )}
          </div>

          {/* Quick Suggestions Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-xs">
            <span className="mr-1 shrink-0 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Suggestions:
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("invoice")}
              className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Invoices
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("client")}
              className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Clients (CRM)
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("appointment")}
              className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Appointments
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("settings")}
              className="shrink-0 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              Settings
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] space-y-1 divide-y divide-slate-100 overflow-y-auto p-2">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <Search className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                <p className="font-semibold text-slate-700">No operational records found</p>
                <p className="mt-0.5">
                  Try searching for &ldquo;Apex&rdquo;, &ldquo;Invoice&rdquo;, or
                  &ldquo;Appointment&rdquo;.
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const Icon = entry.icon;
                return (
                  <div
                    key={entry.id}
                    onClick={() => handleSelect(entry)}
                    className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-100/80"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="group-hover:bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-100 text-slate-600 shadow-xs transition-colors group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-slate-900">{entry.title}</p>
                          <span className="text-[10px] font-medium text-slate-400">
                            • {entry.category}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {entry.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {entry.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            entry.badgeVariant === "success"
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : entry.badgeVariant === "warning"
                                ? "border border-amber-200 bg-amber-50 text-amber-700"
                                : "border border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {entry.badge}
                        </span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="text-primary h-3 w-3" />
              <span>FlowPilot Operations Command System</span>
            </span>
            <div className="flex items-center gap-3">
              <span>
                Press <kbd className="font-mono font-bold text-slate-700">↵</kbd> to select
              </span>
              <span>
                <kbd className="font-mono font-bold text-slate-700">ESC</kbd> to close
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
