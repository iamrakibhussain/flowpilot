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
  const [filter, setFilter] = React.useState<"all" | "unread" | "bookings" | "invoices">("all");

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
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
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
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "BOOKING_CANCELLED":
        return <CalendarX className="h-4 w-4 text-rose-600" />;
      case "INVOICE_ISSUED":
      case "PAYMENT_RECEIVED":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "TEAM_INVITE":
        return <Users className="h-4 w-4 text-indigo-600" />;
      case "SECURITY_ALERT":
        return <ShieldAlert className="h-4 w-4 text-amber-600" />;
      case "SYSTEM":
      default:
        return <Layers className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="focus-visible:ring-primary relative h-8 w-8 rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-9 sm:w-9 sm:rounded-xl"
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
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
        className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200/90 bg-white/95 p-0 shadow-2xl backdrop-blur-xl sm:w-96"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-5 bg-blue-50 px-1.5 text-[10px] font-semibold text-blue-600"
              >
                {unreadCount} new
              </Badge>
            ) : (
              <span className="text-[11px] font-normal text-slate-400">All caught up</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-primary hover:text-primary-hover text-xs font-medium hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
            {items.some((i) => i.isRead) && (
              <button
                type="button"
                onClick={handleClearRead}
                disabled={clearReadMutation.isPending}
                title="Clear read notifications"
                className="rounded-md p-1 text-slate-400 transition-colors hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close notifications"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notifications"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/50 px-3 py-1.5 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("all");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
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
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === "unread"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
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
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === "bookings"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("invoices");
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === "invoices"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Invoices
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] divide-y divide-slate-100/80 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCheck className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="mt-0.5 text-slate-400">
                No {filter !== "all" ? `${filter} ` : ""}notifications to display.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-slate-50/80 ${
                  !item.isRead ? "bg-blue-50/35" : ""
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-100 shadow-xs">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`truncate text-xs ${
                        !item.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                    {item.message}
                  </p>
                </div>
                {!item.isRead && (
                  <span className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
