"use client";

import * as React from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardCommandPalette } from "@/components/layout/dashboard-command-palette";
import { DashboardModalProvider } from "@/components/dashboard/modals/dashboard-modal-context";
import { DashboardSmoothScroll } from "@/components/dashboard/dashboard-smooth-scroll";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  // Auto-adapt sidebar collapse for small laptop displays (< 1280px, e.g. 1366x768 screens)
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1280 && window.innerWidth >= 1024) {
        setIsCollapsed(true);
      }
    };

    const timer = setTimeout(handleResize, 0);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <DashboardModalProvider>
      <div className="bg-background text-foreground relative flex h-screen w-full overflow-hidden">
        {/* Subtle Ambient Background Flare */}
        <div
          className="pointer-events-none fixed top-1/4 left-1/3 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500/[0.04] via-indigo-500/[0.03] to-cyan-400/[0.04] blur-[140px]"
          aria-hidden="true"
        />

        {/* Fixed Sticky Responsive Sidebar (Never moves on scroll) */}
        <DashboardSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Operations Canvas Area */}
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          {/* Executive Sticky Top Navigation Header (Pinned to the top) */}
          <DashboardHeader
            onOpenMobile={() => setIsMobileOpen(true)}
            onOpenCommand={() => setIsCommandOpen(true)}
          />

          {/* Controlled Pro Inertia Smooth Scrolling Viewport (Snappy 0.85s, zero drift, modal safe) */}
          <DashboardSmoothScroll>{children}</DashboardSmoothScroll>
        </div>

        {/* Dedicated Operational Command Palette */}
        <DashboardCommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      </div>
    </DashboardModalProvider>
  );
}
