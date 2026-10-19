import Link from "next/link";
import {
  Layers,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers (CRM)", href: "/dashboard", icon: Users },
  { name: "Appointments", href: "/dashboard", icon: Calendar },
  { name: "Invoices & Billing", href: "/dashboard", icon: FileText },
  { name: "Organization Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen">
      {/* Sidebar */}
      <aside className="border-border bg-surface hidden w-64 flex-col border-r lg:flex">
        {/* Brand & Organization Switcher Slot */}
        <div className="border-border border-b p-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-foreground block text-sm leading-tight font-bold">
                FlowPilot
              </span>
              <span className="text-muted-foreground block text-[11px]">Operations Platform</span>
            </div>
          </Link>

          {/* Multi-tenant Organization Context Trigger Slot */}
          <div className="border-border bg-background mt-4 flex items-center justify-between rounded-md border p-2 text-xs">
            <div className="truncate">
              <p className="text-foreground truncate font-semibold">Acme Services Ltd.</p>
              <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Owner Workspace
              </p>
            </div>
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 p-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors"
              >
                <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Account Actions */}
        <div className="border-border border-t p-3">
          <UserNav showDetails />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="border-border bg-background/95 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur-xs">
          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            <span className="text-foreground font-medium">Workspace Shell</span>
            <span>/</span>
            <span>Architecture Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="text-muted-foreground h-4 w-4" />
            </Button>
            <UserNav />
          </div>
        </header>

        {/* Main page content landmark */}
        <main id="main-content" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
