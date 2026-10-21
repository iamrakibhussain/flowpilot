"use client";

import * as React from "react";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Calendar,
  Users,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDashboardActivities } from "@/features/dashboard/use-dashboard";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "billing" | "appointment" | "crm" | "security";
}

export function DashboardNotifications() {
  const activitiesQuery = useDashboardActivities();
  const [readIds, setReadIds] = React.useState<Set<string>>(() => new Set());
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const notifications: NotificationItem[] = React.useMemo(() => {
    if (activitiesQuery.data && activitiesQuery.data.length > 0) {
      return activitiesQuery.data.slice(0, 6).map((act, idx) => ({
        id: `notif-${act.id}`,
        title: act.service,
        description: `${act.client} • ${act.refCode} (${act.amount})`,
        time: act.date,
        read: readIds.has(`notif-${act.id}`) || idx > 2,
        type: (act.type === "invoices"
          ? "billing"
          : act.type === "appointments"
            ? "appointment"
            : "crm") as NotificationItem["type"],
      }));
    }
    return [];
  }, [activitiesQuery.data, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const markItemAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReadIds((prev) => new Set([...prev, id]));
  };

  const displayedNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "billing":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "crm":
        return <Users className="h-4 w-4 text-indigo-600" />;
      case "security":
        return <ShieldCheck className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="focus-visible:ring-primary relative h-9 w-9 rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={`Notifications: ${unreadCount} unread`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200/90 bg-white/95 p-0 shadow-2xl backdrop-blur-xl sm:w-96"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-primary hover:text-primary-hover text-xs font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/50 px-4 py-2 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("all");
            }}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFilter("unread");
            }}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filter === "unread"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[360px] divide-y divide-slate-100/80 overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCheck className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="mt-0.5">No unread notifications in this workspace.</p>
            </div>
          ) : (
            displayedNotifications.map((item) => (
              <div
                key={item.id}
                onClick={(e) => markItemAsRead(item.id, e)}
                className={`group flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-slate-50/80 ${
                  !item.read ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 bg-slate-100 shadow-xs">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`truncate text-xs ${
                        !item.read ? "font-bold text-slate-900" : "font-medium text-slate-700"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
                {!item.read && (
                  <span className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-2 text-center">
          <a
            href="#activity"
            onClick={(e) => {
              const el = document.getElementById("activity");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-primary hover:text-primary-hover inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold"
          >
            <span>View all workspace activity</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
