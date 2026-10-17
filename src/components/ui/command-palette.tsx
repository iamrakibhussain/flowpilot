"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Laptop,
  Users,
  Calendar,
  FileText,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  LogIn,
  ArrowRight,
  X,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: "Navigation" | "Platform" | "Account";
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const commandItems: CommandItem[] = [
  {
    id: "demo",
    title: "Launch Interactive Workspace",
    description: "Experience FlowPilot's multi-tenant operations dashboard live.",
    category: "Platform",
    href: "/dashboard",
    icon: Laptop,
    badge: "Demo",
  },
  {
    id: "crm",
    title: "Client CRM & History Dossier",
    description: "Consolidated client contact logs, service tiers & historical notes.",
    category: "Platform",
    href: "/#features",
    icon: Users,
  },
  {
    id: "scheduling",
    title: "Smart Calendar & Scheduling",
    description: "Buffer intervals, double-booking prevention & staff availability.",
    category: "Platform",
    href: "/#features",
    icon: Calendar,
  },
  {
    id: "invoicing",
    title: "Invoicing & Revenue Settlement",
    description: "One-click conversion of sessions to itemized PDF invoices.",
    category: "Platform",
    href: "/#features",
    icon: FileText,
  },
  {
    id: "architecture",
    title: "Multi-Tenant Architecture & Trust",
    description: "Strict tenant isolation, RBAC permissions & data integrity.",
    category: "Platform",
    href: "/#architecture",
    icon: ShieldCheck,
  },
  {
    id: "workflow",
    title: "How FlowPilot Works",
    description: "4-step progressive timeline from setup to automated invoicing.",
    category: "Navigation",
    href: "/#how-it-works",
    icon: Sparkles,
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    description: "Architecture, migration, data ownership, and pricing answers.",
    category: "Navigation",
    href: "/#faq",
    icon: HelpCircle,
  },
  {
    id: "signin",
    title: "Sign In to Your Workspace",
    description: "Access your business operations command center.",
    category: "Account",
    href: "/login",
    icon: LogIn,
  },
  {
    id: "signup",
    title: "Get Started Free",
    description: "Initialize your business workspace in under two minutes.",
    category: "Account",
    href: "/login",
    icon: ArrowRight,
    badge: "Free",
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Filter items based on user query
  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return commandItems;
    const q = query.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  const handleClose = React.useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  // Auto focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      handleClose();
      router.push(item.href);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:p-6 sm:pt-24">
          {/* Frosted Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Command Palette Floating Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="border-border/80 bg-surface/95 relative w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette Quick Search"
          >
            {/* Specular Top Rim Light */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/25 to-transparent" />

            {/* Top Search Input Bar */}
            <div className="border-border/70 relative flex items-center gap-3 border-b px-4 py-3.5">
              <Search className="text-muted-foreground h-5 w-5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search capabilities, demo workspace, architecture, or sign in..."
                className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedIndex(0);
                  }}
                  className="text-muted-foreground hover:text-foreground rounded p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="border-border/80 bg-muted/50 text-muted-foreground hidden rounded border px-1.5 py-0.5 font-mono text-[11px] sm:inline-block">
                ESC
              </kbd>
            </div>

            {/* Command Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground text-sm">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-muted-foreground/70 mt-1 text-xs">
                    Try searching for &ldquo;demo&rdquo;, &ldquo;scheduling&rdquo;, or
                    &ldquo;crm&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, index) => {
                    const Icon = item.icon;
                    const isSelected = index === selectedIndex;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={handleClose}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted/80 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "relative flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border transition-all overflow-hidden",
                              isSelected
                                ? "bg-white/20 text-white border-white/30 shadow-xs"
                                : "bg-primary/10 text-primary border-primary/20"
                            )}
                          >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                            <Icon className="h-4 w-4 relative z-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold sm:text-sm">{item.title}</span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                    isSelected
                                      ? "bg-white/25 text-white"
                                      : "bg-primary/10 text-primary"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                "line-clamp-1 text-[11px] leading-tight",
                                isSelected ? "text-white/80" : "text-muted-foreground"
                              )}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "hidden text-[10px] font-medium tracking-wider uppercase sm:inline-block",
                              isSelected ? "text-white/70" : "text-muted-foreground/70"
                            )}
                          >
                            {item.category}
                          </span>
                          {isSelected && <CornerDownLeft className="h-3.5 w-3.5 opacity-80" />}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Keyboard Shortcuts Footer */}
            <div className="relative border-border/60 bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-[11px]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="border-border bg-background rounded border px-1 py-0.5 font-mono text-[10px]">
                    ↑
                  </kbd>
                  <kbd className="border-border bg-background rounded border px-1 py-0.5 font-mono text-[10px]">
                    ↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border-border bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
              </div>
              <span className="text-primary font-medium">FlowPilot Command Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
