"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Calendar,
  Users,
  ShieldAlert,
  Trash2,
  CalendarX,
  Layers,
  X,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearReadNotifications,
} from "@/features/notifications/use-notifications";
import type { NotificationItem, NotificationType } from "@/features/notifications/types";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return "Recently";
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DashboardNotifications() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<
    "all" | "unread" | "bookings" | "invoices" | "quotes" | "projects"
  >("all");

  // Automatically close notification dropdown on navigation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const { data: notificationData, isLoading } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearReadMutation = useClearReadNotifications();

  const items: NotificationItem[] = React.useMemo(
    () => notificationData?.items || [],
    [notificationData?.items]
  );
  const unreadCount = notificationData?.unreadCount ?? 0;

  const categoryCounts = React.useMemo(() => {
    let bookings = 0;
    let invoices = 0;
    let quotes = 0;
    let projects = 0;

    for (const item of items) {
      if (
        item.type === "BOOKING_CREATED" ||
        item.type === "BOOKING_RESCHEDULED" ||
        item.type === "BOOKING_CANCELLED"
      ) {
        bookings++;
      } else if (item.type === "INVOICE_ISSUED" || item.type === "PAYMENT_RECEIVED") {
        invoices++;
      } else if (item.type.startsWith("QUOTE_")) {
        quotes++;
      } else if (item.type === "PROJECT_CREATED" || item.type === "TASK_ASSIGNED") {
        projects++;
      }
    }

    return { bookings, invoices, quotes, projects };
  }, [items]);

  const filteredItems = React.useMemo(() => {
    switch (filter) {
      case "unread":
        return items.filter((n) => !n.isRead);
      case "bookings":
        return items.filter(
          (n) =>
            n.type === "BOOKING_CREATED" ||
            n.type === "BOOKING_RESCHEDULED" ||
            n.type === "BOOKING_CANCELLED"
        );
      case "invoices":
        return items.filter((n) => n.type === "INVOICE_ISSUED" || n.type === "PAYMENT_RECEIVED");
      case "quotes":
        return items.filter((n) => n.type.startsWith("QUOTE_"));
      case "projects":
        return items.filter((n) => n.type === "PROJECT_CREATED" || n.type === "TASK_ASSIGNED");
      case "all":
      default:
        return items;
    }
  }, [items, filter]);

  const handleItemClick = (item: NotificationItem) => {
    setIsOpen(false);
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }

    const meta = (item.metadata || {}) as Record<string, string>;

    // 1. Invoices & Payments: open the specific invoice quick-peek drawer
    if (item.type === "INVOICE_ISSUED" || item.type === "PAYMENT_RECEIVED" || meta.invoiceId) {
      const invoiceId = meta.invoiceId;
      if (invoiceId) {
        router.push(`/dashboard/invoices?invoiceId=${encodeURIComponent(invoiceId)}`);
        return;
      }
    }

    // 2. Quotes & Proposals: open the specific quote quick-peek drawer
    if (item.type.startsWith("QUOTE_") || meta.quoteId) {
      const quoteId = meta.quoteId;
      if (quoteId) {
        router.push(`/dashboard/quotes?quoteId=${encodeURIComponent(quoteId)}`);
        return;
      }
    }

    // 3. Appointments & Bookings: open the specific appointment on the calendar
    if (item.type.startsWith("BOOKING_") || meta.appointmentId) {
      const apptId = meta.appointmentId;
      if (apptId) {
        router.push(`/dashboard/calendar?appointmentId=${encodeURIComponent(apptId)}`);
        return;
      }
    }

    // 4. Projects & Tasks: open the specific project detail & Kanban board
    if (item.type === "PROJECT_CREATED" || item.type === "TASK_ASSIGNED" || meta.projectId) {
      const projectId = meta.projectId;
      if (projectId) {
        const taskQuery = meta.taskId ? `?taskId=${encodeURIComponent(meta.taskId)}` : "";
        router.push(`/dashboard/projects/${encodeURIComponent(projectId)}${taskQuery}`);
        return;
      }
    }

    // 5. Team Invites
    if (item.type === "TEAM_INVITE") {
      router.push("/dashboard/settings");
      return;
    }

    // 6. Custom actionUrl if present with query or subpath
    if (
      item.actionUrl &&
      item.actionUrl !== "/dashboard/invoices" &&
      item.actionUrl !== "/dashboard/quotes" &&
      item.actionUrl !== "/dashboard/projects"
    ) {
      router.push(item.actionUrl);
      return;
    }

    // 7. General fallback
    if (item.actionUrl) {
      router.push(item.actionUrl);
      return;
    }

    router.push("/dashboard");
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsReadMutation.mutate();
  };

  const handleClearRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearReadMutation.mutate();
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "BOOKING_CREATED":
      case "BOOKING_RESCHEDULED":
        return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "BOOKING_CANCELLED":
        return <CalendarX className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "INVOICE_ISSUED":
      case "PAYMENT_RECEIVED":
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "QUOTE_SENT":
        return <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "QUOTE_ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "QUOTE_DECLINED":
        return <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "TEAM_INVITE":
        return <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case "SECURITY_ALERT":
        return <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "PROJECT_CREATED":
        return <FolderKanban className="text-primary h-4 w-4" />;
      case "TASK_ASSIGNED":
        return <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case "SYSTEM":
      default:
        return <Layers className="text-muted-foreground h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="focus-visible:ring-primary text-muted-foreground hover:bg-muted/70 hover:text-foreground relative h-8 w-8 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-9 sm:w-9 sm:rounded-xl"
          aria-label={`Notifications: ${unreadCount} unread`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 sm:top-1.5 sm:right-1.5">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
        className="border-border/80 bg-card/95 text-card-foreground w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] rounded-2xl border p-0 shadow-2xl backdrop-blur-2xl sm:w-[480px] sm:max-w-xl"
      >
        {/* Header */}
        <div className="border-border/60 bg-muted/20 flex items-center justify-between border-b px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="text-foreground truncate text-xs font-bold sm:text-sm">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 h-4.5 shrink-0 border px-1.5 text-[10px] font-bold"
                >
                  {unreadCount} new
                </Badge>
              ) : (
                <span className="text-muted-foreground shrink-0 text-[10px] font-medium sm:text-[11px]">
                  All read
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-primary hover:text-primary/80 px-1.5 py-1 text-[11px] font-semibold whitespace-nowrap hover:underline disabled:opacity-50 sm:text-xs"
              >
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Read all</span>
              </button>
            )}
            {items.some((i) => i.isRead) && (
              <button
                type="button"
                onClick={handleClearRead}
                disabled={clearReadMutation.isPending}
                title="Clear read notifications"
                className="text-muted-foreground rounded-lg p-1.5 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close notifications"
              className="text-muted-foreground hover:bg-muted/70 hover:text-foreground rounded-lg p-1.5 transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="border-border/60 bg-muted/30 flex flex-wrap items-center gap-1.5 border-b px-3 py-2 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("all");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              filter === "all"
                ? "bg-card text-foreground border-border/80 border font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("unread");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              filter === "unread"
                ? "bg-card text-foreground border-border/80 border font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("bookings");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              filter === "bookings"
                ? "bg-card text-foreground border-border/80 border font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Bookings {categoryCounts.bookings > 0 && `(${categoryCounts.bookings})`}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("invoices");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              filter === "invoices"
                ? "bg-card text-foreground border-border/80 border font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Invoices {categoryCounts.invoices > 0 && `(${categoryCounts.invoices})`}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("quotes");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              filter === "quotes"
                ? "bg-card text-foreground border-border/80 border font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Proposals {categoryCounts.quotes > 0 && `(${categoryCounts.quotes})`}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("projects");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              filter === "projects"
                ? "bg-card text-foreground border-border/80 border font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            Projects {categoryCounts.projects > 0 && `(${categoryCounts.projects})`}
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-border/40 max-h-[min(380px,60vh)] divide-y overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="text-muted-foreground p-8 text-center text-xs">
              <div className="border-primary mb-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <p>Loading real-time notifications...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-xs">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCheck className="h-5 w-5" />
              </div>
              <p className="text-foreground font-semibold">All caught up!</p>
              <p className="text-muted-foreground mt-1 text-xs">
                No {filter !== "all" ? `${filter} ` : ""}notifications to display.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group hover:bg-muted/50 active:bg-muted/70 flex cursor-pointer items-start gap-3 p-3.5 transition-all ${
                  !item.isRead
                    ? "bg-primary/5 dark:bg-primary/10 border-primary border-l-2"
                    : "border-l-2 border-transparent"
                }`}
              >
                <div className="border-border/60 bg-muted/60 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`truncate text-xs ${
                        !item.isRead
                          ? "text-foreground font-bold"
                          : "text-foreground/80 font-medium"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-muted-foreground/80 shrink-0 text-[10px] font-medium">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.isRead && (
                  <span className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full shadow-xs" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Executive Footer */}
        <div className="border-border/60 bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-3.5 py-2 text-[11px] sm:px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-muted-foreground/80 text-[10px] font-semibold tracking-wider uppercase">
              Real-Time Sync
            </span>
          </div>
          <span className="text-muted-foreground/80 text-[10px] font-medium">
            {items.length} {items.length === 1 ? "update" : "updates"}
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
