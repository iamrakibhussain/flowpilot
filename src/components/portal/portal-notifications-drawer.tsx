"use client";

import * as React from "react";
import {
  Bell,
  X,
  CheckCheck,
  Calendar,
  CreditCard,
  FileCheck2,
  FileText,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortalNotification } from "@/features/portal/types";

interface PortalNotificationsDrawerProps {
  notifications: PortalNotification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "CONTRACT_SIGNED":
    case "CONTRACT_SENT":
      return <FileCheck2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case "BOOKING_CREATED":
    case "BOOKING_RESCHEDULED":
    case "BOOKING_CANCELLED":
      return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "INVOICE_ISSUED":
    case "PAYMENT_RECEIVED":
      return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "QUOTE_SENT":
    case "QUOTE_ACCEPTED":
    case "QUOTE_DECLINED":
      return <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    default:
      return <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
  }
}

function formatNotificationTime(dateStr: string): string {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function PortalNotificationsDrawer({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: PortalNotificationsDrawerProps) {
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleMarkAll = async () => {
    try {
      setIsMarkingAll(true);
      await onMarkAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-200 bg-white shadow-2xl transition-all sm:max-w-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 sm:text-base dark:text-slate-100">
                    Activity &amp; Updates
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread notices` : "All notifications caught up"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isMarkingAll}
                    onClick={handleMarkAll}
                    className="h-8 gap-1 rounded-lg px-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark Read
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Bell className="h-6 w-6 opacity-40" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                    No Notifications Yet
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    You will receive real-time updates when milestones, invoices, or contracts are issued.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (!item.isRead) onMarkAsRead(item.id);
                        }}
                        className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                          !item.isRead
                            ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
                            : "border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                          {getNotificationIcon(item.type)}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                              {item.title}
                            </h5>
                            {!item.isRead && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                            {item.message}
                          </p>
                          <span className="flex items-center gap-1 pt-1 text-[10px] text-slate-400">
                            <Clock className="h-2.5 w-2.5" />
                            {formatNotificationTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-10 w-full cursor-pointer rounded-xl font-bold"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
