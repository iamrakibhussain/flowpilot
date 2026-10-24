"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  Video,
  MapPin,
  Phone,
  UserCheck,
  CheckCircle2,
  Layers,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  Keyboard,
  ExternalLink,
  Eye,
  CalendarDays,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { useAppointments, useStaffMembers } from "@/features/appointments/use-appointments";
import { AppointmentQuickPeekDrawer } from "@/components/dashboard/appointments/appointment-quick-peek-drawer";
import { BookingWizardModal } from "@/components/dashboard/appointments/booking-wizard-modal";
import { RescheduleModal } from "@/components/dashboard/appointments/reschedule-modal";
import { InvoiceBuilderModal } from "@/components/dashboard/invoices/invoice-builder-modal";
import type {
  AppointmentListItem,
  AppointmentStatusType,
  AppointmentMeetingType,
} from "@/features/appointments/types";

type CalendarViewMode = "week" | "day" | "month" | "agenda";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 AM to 7:00 PM (8..19)

function formatTimeSlot(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${ampm}`;
}

const VIEW_TABS: Array<{
  id: CalendarViewMode;
  label: string;
  icon: React.ElementType;
  shortcut: string;
}> = [
  { id: "week", label: "Week", icon: CalendarIcon, shortcut: "W" },
  { id: "day", label: "Day", icon: Clock, shortcut: "D" },
  { id: "month", label: "Month", icon: Layers, shortcut: "M" },
  { id: "agenda", label: "Agenda", icon: SlidersHorizontal, shortcut: "A" },
];

export default function CalendarPage() {
  const { organizationId: currentOrganizationId } = useWorkspaceSession();
  const { data: staffMembers = [] } = useStaffMembers(currentOrganizationId);

  // View & Date State
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>("week");
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());

  // Filter States
  const [search, setSearch] = React.useState("");
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedType, setSelectedType] = React.useState<string>("ALL");

  // Modals & Drawers
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
  const [bookingInitialDate, setBookingInitialDate] = React.useState<string | undefined>();
  const [bookingInitialTime, setBookingInitialTime] = React.useState<string | undefined>();
  const [selectedAppointment, setSelectedAppointment] = React.useState<AppointmentListItem | null>(
    null
  );
  const [rescheduleAppointment, setRescheduleAppointment] =
    React.useState<AppointmentListItem | null>(null);
  const [invoiceAppointment, setInvoiceAppointment] = React.useState<AppointmentListItem | null>(
    null
  );
  const [isMobileRailOpen, setIsMobileRailOpen] = React.useState(false);

  // Current time position for live laser indicator
  const [nowDate, setNowDate] = React.useState<Date>(() => new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNowDate(new Date()), 30000); // 30s precision
    return () => clearInterval(timer);
  }, []);

  const currentHour = nowDate.getHours();
  const currentMinute = nowDate.getMinutes();
  const isNowInWorkHours = currentHour >= 8 && currentHour < 20;

  // Compute Start & End of currently viewed week or month
  const { startDateStr, endDateStr, weekDays } = React.useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay(); // 0 is Sunday
    // Week starts on Monday (1)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    const sunday = days[6] ?? new Date();
    const sundayEnd = new Date(sunday);
    sundayEnd.setHours(23, 59, 59, 999);

    return {
      startDateStr: monday.toISOString(),
      endDateStr: sundayEnd.toISOString(),
      weekDays: days,
    };
  }, [currentDate]);

  // Query appointments
  const {
    data: appointments = [],
    refetch,
    isRefetching,
  } = useAppointments(
    {
      startDate: viewMode === "month" ? undefined : startDateStr,
      endDate: viewMode === "month" ? undefined : endDateStr,
      staffMemberId: selectedStaffId !== "ALL" ? selectedStaffId : undefined,
      status: selectedStatus !== "ALL" ? (selectedStatus as AppointmentStatusType) : undefined,
      type: selectedType !== "ALL" ? (selectedType as AppointmentMeetingType) : undefined,
      search: search.trim().length > 0 ? search.trim() : undefined,
    },
    currentOrganizationId
  );

  // Navigate dates
  const handlePrev = React.useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "day") {
        d.setDate(d.getDate() - 1);
      } else if (viewMode === "week") {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [viewMode]);

  const handleNext = React.useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "day") {
        d.setDate(d.getDate() + 1);
      } else if (viewMode === "week") {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [viewMode]);

  const handleToday = React.useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Power-User Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focused in form fields
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        handleToday();
      } else if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        setViewMode("week");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setViewMode("day");
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setViewMode("month");
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setViewMode("agenda");
      } else if (e.key === "c" || e.key === "C" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        setBookingInitialDate(undefined);
        setBookingInitialTime(undefined);
        setIsBookingModalOpen(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, handleToday]);

  // Open booking wizard prefilled with clicked time slot
  const handleSlotClick = (date: Date, hour: number) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(hour).padStart(2, "0");

    setBookingInitialDate(`${yyyy}-${mm}-${dd}`);
    setBookingInitialTime(`${hh}:00`);
    setIsBookingModalOpen(true);
  };

  // Telemetry Metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaySessions = appointments.filter((a) => {
    const dt = new Date(a.scheduledAt);
    return dt >= todayStart && dt <= todayEnd;
  });

  const confirmedSessions = appointments.filter((a) => a.status === "CONFIRMED");
  const completedSessions = appointments.filter((a) => a.status === "COMPLETED");

  // Determine "Up Next" Spotlight Appointment
  const upcomingAppointment = React.useMemo(() => {
    const nowTs = nowDate.getTime();
    const candidates = appointments
      .filter((a) => a.status === "CONFIRMED" || a.status === "PENDING")
      .map((a) => ({ ...a, time: new Date(a.scheduledAt).getTime() }))
      .filter((a) => a.time >= nowTs - 15 * 60 * 1000) // Within 15m ago or in future
      .sort((a, b) => a.time - b.time);
    return candidates[0] ?? null;
  }, [appointments, nowDate]);

  const isFiltersActive =
    search.trim().length > 0 ||
    selectedStaffId !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedType !== "ALL";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] space-y-6 overflow-hidden pb-16">
      {/* Studio Ambient Aurora Lighting Backgrounds */}
      <div
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/12 via-indigo-500/8 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-48 right-1/6 h-80 w-80 rounded-full bg-gradient-to-bl from-purple-500/10 via-pink-500/5 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-50"
        aria-hidden="true"
      />

      {/* 1. Executive Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-gradient-to-r from-blue-50 to-indigo-50/70 px-3 py-1 text-[11px] font-bold text-blue-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              <span>Scheduling Engine</span>
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Real-time Collision Guard</span>
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="hidden items-center gap-1 text-[11px] font-medium text-slate-400 sm:inline-flex">
              <Keyboard className="h-3 w-3 text-slate-400" />
              <span>Shortcuts Enabled</span>
            </span>
          </div>

          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Calendar & Operations Hub
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            Coordinate client sessions, assign specialists, and execute collision-free appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="cursor-pointer rounded-xl border-slate-200/90 bg-white/95 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRefetching ? "animate-spin text-blue-600" : "text-slate-500"}`}
            />
            <span>Sync</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setBookingInitialDate(undefined);
              setBookingInitialTime(undefined);
              setIsBookingModalOpen(true);
            }}
            className="group via-blue-650 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            <Plus className="mr-1.5 h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Book Appointment</span>
            <kbd className="ml-2 hidden rounded bg-blue-500/40 px-1 py-0.5 font-mono text-[10px] font-bold text-white/90 sm:inline">
              C
            </kbd>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Telemetry Ribbon (Luxury Glassmorphic Surfaces with Top Accent Light Beams) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50/70 via-white to-white p-4 shadow-sm backdrop-blur-md transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-blue-500 before:to-transparent hover:border-blue-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                Today&apos;s Sessions
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700 shadow-2xs">
                <CalendarIcon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {todaySessions.length}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Active Today
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/70 via-white to-white p-4 shadow-sm backdrop-blur-md transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-indigo-500 before:to-transparent hover:border-indigo-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                Confirmed Queue
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100/80 text-indigo-700 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-600 tabular-nums">
                {confirmedSessions.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Slots Locked
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/70 via-white to-white p-4 shadow-sm backdrop-blur-md transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-emerald-500 before:to-transparent hover:border-emerald-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                Delivered Sessions
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-600 tabular-nums">
                {completedSessions.length}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Executed
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-purple-100/90 bg-gradient-to-br from-purple-50/70 via-white to-white p-4 shadow-sm backdrop-blur-md transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-purple-500 before:to-transparent hover:border-purple-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                Specialists On Duty
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100/80 text-purple-700 shadow-2xs">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {staffMembers.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Qualified Staff
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* 3. Executive Two-Column Command Center Layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Mobile Control Rail Toggle Bar (Only visible on mobile/tablet) */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xs lg:hidden">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs font-black text-slate-900">Operations Control Panel</p>
              <p className="text-[10px] text-slate-500">Mini Calendar & Specialists</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMobileRailOpen(!isMobileRailOpen)}
            className="h-8 cursor-pointer rounded-xl border-blue-200 bg-blue-50/50 text-xs font-bold text-blue-700 hover:bg-blue-100/60"
          >
            {isMobileRailOpen ? "Hide Panel" : "View Panel"}
          </Button>
        </div>

        {/* ================= LEFT COMMAND RAIL ================= */}
        <div
          className={`${
            isMobileRailOpen ? "block" : "hidden"
          } w-full shrink-0 space-y-4 lg:block lg:w-72 xl:w-80`}
        >
          {/* A. Interactive Mini Month Picker */}
          <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-black tracking-tight text-slate-900">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() - 1);
                    setCurrentDate(d);
                  }}
                  title="Previous Month"
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  title="Go to Today"
                  className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() + 1);
                    setCurrentDate(d);
                  }}
                  title="Next Month"
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Mini Month Grid */}
            <div className="mt-3">
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>

              <div className="mt-2 grid grid-cols-7 gap-1">
                {(() => {
                  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                  const startOffset = (firstDay.getDay() + 6) % 7; // Mon = 0
                  const daysInMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                  ).getDate();

                  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

                  return Array.from({ length: totalCells }).map((_, idx) => {
                    const dayNum = idx - startOffset + 1;
                    const isValidDay = dayNum > 0 && dayNum <= daysInMonth;

                    if (!isValidDay) {
                      return <div key={idx} className="h-7 w-7" />;
                    }

                    const thisDay = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      dayNum
                    );
                    const isSelected = thisDay.toDateString() === currentDate.toDateString();
                    const isToday = thisDay.toDateString() === new Date().toDateString();

                    // Check if appointments exist on this day
                    const hasAppointments = appointments.some((a) => {
                      const dt = new Date(a.scheduledAt);
                      return dt.toDateString() === thisDay.toDateString();
                    });

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentDate(thisDay);
                        }}
                        className={`relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[11px] font-bold transition-all ${
                          isSelected
                            ? "bg-blue-600 font-black text-white shadow-xs"
                            : isToday
                              ? "bg-blue-50 font-black text-blue-700 ring-1 ring-blue-300"
                              : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{dayNum}</span>
                        {hasAppointments && (
                          <span
                            className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                              isSelected ? "bg-white" : "bg-blue-600"
                            }`}
                          />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </Card>

          {/* B. "Up Next" High-Priority Spotlight Card */}
          <Card className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-indigo-700 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                </span>
                <span>Up Next Spotlight</span>
              </span>
              <span className="rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                Live Radar
              </span>
            </div>

            {upcomingAppointment ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="line-clamp-1 text-xs font-black tracking-tight text-slate-900">
                      {upcomingAppointment.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                      Client:{" "}
                      <span className="font-bold text-slate-900">
                        {upcomingAppointment.customerName}
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-indigo-200 bg-white text-[10px] font-bold"
                  >
                    {upcomingAppointment.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    {new Date(upcomingAppointment.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>•</span>
                  <span>{upcomingAppointment.durationMinutes} mins</span>
                </div>

                <div className="mt-2 flex items-center gap-2 border-t border-indigo-100 pt-1">
                  <Button
                    size="sm"
                    onClick={() => setSelectedAppointment(upcomingAppointment)}
                    className="h-8 flex-1 cursor-pointer rounded-xl bg-indigo-600 text-[11px] font-bold text-white shadow-xs hover:bg-indigo-700"
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    <span>View Briefing</span>
                  </Button>
                  {upcomingAppointment.location && (
                    <a
                      href={
                        upcomingAppointment.location.startsWith("http")
                          ? upcomingAppointment.location
                          : `https://${upcomingAppointment.location}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-600 shadow-2xs hover:bg-indigo-50"
                      title="Open Meeting Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 py-3 text-center">
                <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Check className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Clear Radar Ahead</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  No upcoming appointments pending in immediate queue.
                </p>
              </div>
            )}
          </Card>

          {/* C. Specialist Roster Filter */}
          <Card className="rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase">
                Specialists Roster
              </span>
              <span className="text-[10px] font-bold text-blue-600">
                {staffMembers.length} Active
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              <button
                type="button"
                onClick={() => setSelectedStaffId("ALL")}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl p-2 text-xs font-bold transition-colors ${
                  selectedStaffId === "ALL"
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                  <span>All Specialists</span>
                </div>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-500 shadow-2xs">
                  {appointments.length}
                </span>
              </button>

              {staffMembers.map((sm) => {
                const count = appointments.filter((a) => a.staffMemberId === sm.id).length;
                const isSelected = selectedStaffId === sm.id;
                return (
                  <button
                    key={sm.id}
                    type="button"
                    onClick={() => setSelectedStaffId(isSelected ? "ALL" : sm.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl p-2 text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <span className="truncate">{sm.name}</span>
                    </div>
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-500 shadow-2xs">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* D. Keyboard Shortcuts HUD (Desktop Only) */}
          <div className="hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 text-[11px] text-slate-500 lg:block">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Keyboard className="h-3.5 w-3.5 text-blue-600" />
              <span>Keyboard Controls</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span>Today</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-2xs">T</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Book Slot</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-2xs">C</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Week View</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-2xs">W</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Day View</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-2xs">D</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Month View</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-2xs">M</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Agenda View</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-2xs">A</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT MAIN CALENDAR CANVAS ================= */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Controls & Filter Bar (Sliding Pill Segmented Switcher) */}
          <Card className="rounded-3xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xs backdrop-blur-xl">
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
              {/* Date Navigator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={handlePrev}
                    title="Previous Period (←)"
                    className="cursor-pointer rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 hover:shadow-2xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="cursor-pointer px-3 py-1 text-xs font-extrabold text-slate-700 transition-colors hover:text-blue-600"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    title="Next Period (→)"
                    className="cursor-pointer rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 hover:shadow-2xs"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-black tracking-tight text-slate-900 sm:text-base">
                    {viewMode === "day"
                      ? currentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : viewMode === "month"
                        ? currentDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : `${weekDays[0]?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })} – ${weekDays[6]?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                  </h2>
                </div>
              </div>

              {/* Sliding Pill Segmented View Switcher (Linear / macOS Native Style) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 shadow-inner">
                  {VIEW_TABS.map((tab) => {
                    const isActive = viewMode === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setViewMode(tab.id)}
                        className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeCalendarViewPill"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            className="absolute inset-0 rounded-lg border border-slate-200/60 bg-white shadow-xs"
                          />
                        )}
                        <Icon className="relative z-10 h-3.5 w-3.5" />
                        <span className="relative z-10">{tab.label}</span>
                        <kbd
                          className={`relative z-10 hidden rounded px-1 font-mono text-[9px] sm:inline ${
                            isActive ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {tab.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Filters Strip */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-3">
              {/* Search Box */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search client, title, specialist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl border-slate-200/90 bg-slate-50/60 pl-9 text-xs font-medium shadow-2xs transition-all focus:border-blue-500 focus:bg-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Select */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pr-8 pl-8 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute top-3 left-3 h-2 w-2 rounded-full bg-blue-500" />
                <ChevronRight className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 rotate-90 text-slate-400" />
              </div>

              {/* Meeting Format Select */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pr-8 pl-8 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Formats</option>
                  <option value="VIDEO">Video Call</option>
                  <option value="IN_PERSON">In-Person</option>
                  <option value="PHONE">Phone Call</option>
                </select>
                <Video className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
                <ChevronRight className="pointer-events-none absolute top-2.5 right-2.5 h-3.5 w-3.5 rotate-90 text-slate-400" />
              </div>

              {isFiltersActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setSelectedStaffId("ALL");
                    setSelectedStatus("ALL");
                    setSelectedType("ALL");
                  }}
                  className="cursor-pointer text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Main Calendar Views Canvas (With Fluid Morphing AnimatePresence) */}
          <AnimatePresence mode="wait">
            {/* A. WEEK VIEW */}
            {viewMode === "week" && (
              <motion.div
                key="week-view"
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-xl">
                  <div className="min-w-[850px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b border-slate-200/80 bg-slate-50/70 text-center">
                      <div className="flex items-center justify-center p-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        <Clock className="mr-1 h-3.5 w-3.5 text-slate-400" />
                        <span>GMT</span>
                      </div>
                      {weekDays.map((day, idx) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                          <div
                            key={idx}
                            className={`border-l border-slate-200/80 p-3 transition-colors ${
                              isToday ? "bg-gradient-to-b from-blue-50 to-blue-50/20" : ""
                            }`}
                          >
                            <p
                              className={`text-[11px] font-bold tracking-wider uppercase ${
                                isToday ? "font-black text-blue-600" : "text-slate-500"
                              }`}
                            >
                              {day.toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                            <div className="mt-1 flex items-center justify-center">
                              <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-black tabular-nums transition-transform ${
                                  isToday
                                    ? "scale-105 bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                                    : "text-slate-900"
                                }`}
                              >
                                {day.getDate()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Time Slots Grid with 30-Minute Architecture Dashed Guides */}
                    <div className="relative divide-y divide-slate-100">
                      {HOURS.map((hour) => (
                        <div key={hour} className="grid min-h-[76px] grid-cols-8">
                          {/* Hour Ruler */}
                          <div className="relative p-2.5 text-right text-[11px] font-bold text-slate-400 select-none">
                            <span>{formatTimeSlot(hour)}</span>
                            <div className="absolute top-1/2 right-0 w-2 border-t border-slate-200/60" />
                          </div>

                          {/* 7 Days Slots */}
                          {weekDays.map((day, dayIdx) => {
                            const slotAppointments = appointments.filter((apt) => {
                              const dt = new Date(apt.scheduledAt);
                              return (
                                dt.toDateString() === day.toDateString() && dt.getHours() === hour
                              );
                            });

                            const isToday = day.toDateString() === new Date().toDateString();

                            return (
                              <div
                                key={dayIdx}
                                onClick={() => handleSlotClick(day, hour)}
                                className={`group relative cursor-pointer border-l border-slate-100 p-1.5 transition-colors hover:bg-slate-50/90 ${
                                  isToday ? "bg-blue-50/15" : ""
                                }`}
                              >
                                {/* 30-Minute Subtle Architectural Dashed Guide Line */}
                                <div className="pointer-events-none absolute top-1/2 right-0 left-0 border-b border-dashed border-slate-200/40" />

                                {/* Living Laser Beam across today's slot with live minute chip */}
                                {isToday && isNowInWorkHours && hour === currentHour && (
                                  <div
                                    style={{ top: `${(currentMinute / 60) * 76}px` }}
                                    className="pointer-events-none absolute right-0 left-0 z-30 flex items-center"
                                  >
                                    <div className="relative -ml-1.5 flex items-center">
                                      <span className="relative flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-600 shadow-sm ring-2 ring-white" />
                                      </span>
                                      <span className="ml-1.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase shadow-xs ring-1 ring-white">
                                        {nowDate.toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <div className="h-0.5 flex-1 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-300 shadow-sm shadow-rose-500/60" />
                                  </div>
                                )}

                                {slotAppointments.map((apt) => {
                                  const startTime = new Date(apt.scheduledAt);
                                  const endTime = new Date(
                                    startTime.getTime() + apt.durationMinutes * 60 * 1000
                                  );
                                  const timeSpanStr = `${startTime.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })} – ${endTime.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}`;

                                  return (
                                    <motion.div
                                      key={apt.id}
                                      whileHover={{ y: -3, scale: 1.015 }}
                                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAppointment(apt);
                                      }}
                                      className={`group/card relative mb-1.5 cursor-pointer overflow-hidden rounded-xl border p-2 text-xs shadow-xs transition-shadow duration-200 hover:shadow-lg hover:ring-1 hover:shadow-blue-500/10 hover:ring-black/5 ${
                                        apt.status === "COMPLETED"
                                          ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-emerald-50/40 text-emerald-950"
                                          : apt.status === "CONFIRMED"
                                            ? "border-blue-200/90 bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/40 text-blue-950"
                                            : apt.status === "PENDING"
                                              ? "border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-white to-amber-50/40 text-amber-950"
                                              : "border-slate-200 bg-slate-100/90 text-slate-500 line-through"
                                      }`}
                                    >
                                      {/* Left Vibrancy Accent Indicator Bar */}
                                      <div
                                        className={`absolute top-0 bottom-0 left-0 w-1 ${
                                          apt.status === "COMPLETED"
                                            ? "bg-gradient-to-b from-emerald-500 to-teal-600"
                                            : apt.status === "CONFIRMED"
                                              ? apt.type === "VIDEO"
                                                ? "bg-gradient-to-b from-violet-500 to-indigo-600"
                                                : apt.type === "IN_PERSON"
                                                  ? "bg-gradient-to-b from-emerald-500 to-green-600"
                                                  : "bg-gradient-to-b from-blue-500 to-cyan-600"
                                              : apt.status === "PENDING"
                                                ? "bg-gradient-to-b from-amber-400 to-orange-500"
                                                : "bg-slate-400"
                                        }`}
                                      />

                                      <div className="pl-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <div className="flex min-w-0 items-center gap-1">
                                            {apt.type === "VIDEO" ? (
                                              <Video className="h-3 w-3 shrink-0 text-violet-600" />
                                            ) : apt.type === "IN_PERSON" ? (
                                              <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
                                            ) : (
                                              <Phone className="h-3 w-3 shrink-0 text-blue-600" />
                                            )}
                                            <span className="truncate text-[11px] font-black tracking-tight text-slate-900 transition-colors group-hover/card:text-blue-600">
                                              {apt.customerName}
                                            </span>
                                          </div>
                                          <span className="shrink-0 rounded-md border border-slate-200/60 bg-white/90 px-1.5 py-0.5 text-[8.5px] font-extrabold text-slate-600 tabular-nums shadow-2xs">
                                            {startTime.toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>

                                        <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">
                                          {apt.title}
                                        </p>

                                        <div className="mt-1.5 flex items-center justify-between border-t border-slate-200/50 pt-1 text-[9px]">
                                          <span className="font-semibold text-slate-500">
                                            {apt.durationMinutes}m • {timeSpanStr}
                                          </span>
                                          {apt.staffMemberName && (
                                            <span className="inline-flex items-center gap-1 rounded bg-indigo-50/90 px-1.5 py-0.5 font-bold text-indigo-700">
                                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                              {apt.staffMemberName.split(" ")[0]}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}

                                {/* Ghost Slot Interactive Booking Preview */}
                                {slotAppointments.length === 0 && (
                                  <div className="flex h-full w-full items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100">
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200/90 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-blue-600 shadow-sm backdrop-blur-xs transition-transform duration-150 group-hover:scale-105">
                                      <Plus className="h-3 w-3" />
                                      <span>Book {formatTimeSlot(hour)}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* B. DAY VIEW */}
            {viewMode === "day" && (
              <motion.div
                key="day-view"
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur-xl">
                  <div className="divide-y divide-slate-100">
                    {HOURS.map((hour) => {
                      const slotAppointments = appointments.filter((apt) => {
                        const dt = new Date(apt.scheduledAt);
                        return (
                          dt.toDateString() === currentDate.toDateString() && dt.getHours() === hour
                        );
                      });

                      return (
                        <div key={hour} className="flex min-h-[88px] gap-5 py-4">
                          <div className="w-24 shrink-0 text-right">
                            <p className="text-xs font-black text-slate-900">
                              {formatTimeSlot(hour)}
                            </p>
                            <span className="text-[10px] font-medium text-slate-400">
                              Standard Time
                            </span>
                          </div>

                          <div className="flex-1 space-y-2.5">
                            {slotAppointments.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSlotClick(currentDate, hour)}
                                className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/50 p-3.5 text-xs text-slate-400 transition-all hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600"
                              >
                                <span className="font-semibold">
                                  + Available time slot for booking
                                </span>
                                <span className="text-[10px] font-bold tracking-wider uppercase opacity-0 transition-opacity group-hover:opacity-100">
                                  Click to Reserve
                                </span>
                              </button>
                            ) : (
                              slotAppointments.map((apt) => (
                                <motion.div
                                  key={apt.id}
                                  whileHover={{ y: -2 }}
                                  onClick={() => setSelectedAppointment(apt)}
                                  className="group/daycard flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex items-center gap-3.5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-xs font-black text-blue-700 shadow-inner">
                                      {apt.customerName.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-extrabold text-slate-900 transition-colors group-hover/daycard:text-blue-600">
                                          {apt.title}
                                        </h4>
                                        {apt.type === "VIDEO" && (
                                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                            <Video className="h-3 w-3" />
                                            Virtual
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-0.5 text-xs text-slate-500">
                                        Client:{" "}
                                        <span className="font-semibold text-slate-800">
                                          {apt.customerName}
                                        </span>{" "}
                                        • Specialist:{" "}
                                        <span className="font-semibold text-slate-800">
                                          {apt.staffMemberName ?? "General Pool"}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] font-bold ${
                                        apt.status === "COMPLETED"
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : apt.status === "CONFIRMED"
                                            ? "border-blue-200 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-slate-50 text-slate-600"
                                      }`}
                                    >
                                      {apt.status}
                                    </Badge>
                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 tabular-nums">
                                      {apt.durationMinutes} mins
                                    </span>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* C. MONTH VIEW */}
            {viewMode === "month" && (
              <motion.div
                key="month-view"
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm backdrop-blur-xl">
                  <div className="grid grid-cols-7 border-b border-slate-200/80 pb-3 text-center text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  <div className="grid min-h-[520px] grid-cols-7 divide-x divide-y divide-slate-100 border-r border-b border-slate-100">
                    {Array.from({ length: 35 }).map((_, idx) => {
                      const firstDayOfMonth = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        1
                      );
                      const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Monday index
                      const dayNum = idx - startOffset + 1;
                      const cellDate = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        dayNum
                      );
                      const isCurrentMonth = cellDate.getMonth() === currentDate.getMonth();
                      const isToday = cellDate.toDateString() === new Date().toDateString();

                      const dayApts = appointments.filter((a) => {
                        const dt = new Date(a.scheduledAt);
                        return dt.toDateString() === cellDate.toDateString();
                      });

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setCurrentDate(cellDate);
                            setViewMode("day");
                          }}
                          className={`min-h-[100px] cursor-pointer p-2.5 transition-colors hover:bg-slate-50 ${
                            isCurrentMonth ? "bg-white" : "bg-slate-50/40 opacity-40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                                isToday ? "bg-blue-600 text-white shadow-2xs" : "text-slate-800"
                              }`}
                            >
                              {cellDate.getDate()}
                            </span>
                            {dayApts.length > 0 && (
                              <span className="text-[10px] font-extrabold text-blue-600">
                                {dayApts.length} booked
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 space-y-1">
                            {dayApts.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className={`truncate rounded-lg border px-1.5 py-0.5 text-[10px] font-bold shadow-2xs ${
                                  apt.status === "COMPLETED"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-blue-200 bg-blue-50 text-blue-800"
                                }`}
                              >
                                {apt.customerName}
                              </div>
                            ))}
                            {dayApts.length > 2 && (
                              <p className="pl-1 text-[9px] font-extrabold text-slate-400">
                                +{dayApts.length - 2} more sessions
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* D. AGENDA / CHRONOLOGICAL TIMELINE VIEW */}
            {viewMode === "agenda" && (
              <motion.div
                key="agenda-view"
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur-xl sm:p-7">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base font-black tracking-tight text-slate-900">
                        Chronological Sessions Agenda
                      </h3>
                      <p className="text-xs text-slate-500">
                        Detailed timeline of confirmed, completed, and pending appointments.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold">
                      {appointments.length} Total Sessions
                    </Badge>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                        <CalendarIcon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-slate-900">
                        No Scheduled Appointments
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        There are no client appointments matching the selected filter criteria.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsBookingModalOpen(true)}
                        className="mt-5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        <span>Book First Appointment</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="relative mt-6 space-y-4 pl-4 before:absolute before:top-3 before:bottom-3 before:left-1.5 before:w-0.5 before:bg-slate-200">
                      {appointments.map((apt) => (
                        <motion.div
                          key={apt.id}
                          whileHover={{ y: -2 }}
                          onClick={() => setSelectedAppointment(apt)}
                          className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-xs font-black text-blue-700 shadow-inner">
                              {apt.customerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-blue-600">
                                  {apt.title}
                                </h4>
                                <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                  {apt.type}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                Client:{" "}
                                <span className="font-semibold text-slate-800">
                                  {apt.customerName}
                                </span>{" "}
                                • Specialist:{" "}
                                <span className="font-semibold text-slate-800">
                                  {apt.staffMemberName ?? "General Pool"}
                                </span>
                                {apt.serviceName && (
                                  <>
                                    {" "}
                                    • Service:{" "}
                                    <span className="font-semibold text-indigo-700">
                                      {apt.serviceName}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-xs">
                              <p className="font-black text-slate-900">
                                {new Date(apt.scheduledAt).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {new Date(apt.scheduledAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}{" "}
                                • {apt.durationMinutes}m
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                apt.status === "COMPLETED"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : apt.status === "CONFIRMED"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {apt.status}
                            </Badge>

                            <div className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors group-hover:border-blue-200 group-hover:text-blue-600 sm:flex">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Modals & Drawers */}
      <AppointmentQuickPeekDrawer
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        onOpenReschedule={(apt) => {
          setSelectedAppointment(null);
          setRescheduleAppointment(apt);
        }}
        onOpenInvoiceModal={(apt) => {
          setSelectedAppointment(null);
          setInvoiceAppointment(apt);
        }}
        organizationId={currentOrganizationId}
      />

      <RescheduleModal
        appointment={rescheduleAppointment}
        isOpen={Boolean(rescheduleAppointment)}
        onClose={() => setRescheduleAppointment(null)}
        organizationId={currentOrganizationId}
      />

      <BookingWizardModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialDate={bookingInitialDate}
        initialTime={bookingInitialTime}
        organizationId={currentOrganizationId}
      />

      <InvoiceBuilderModal
        isOpen={Boolean(invoiceAppointment)}
        onClose={() => setInvoiceAppointment(null)}
        initialCustomerId={invoiceAppointment?.customerId}
        initialCustomerName={invoiceAppointment?.customerName}
        initialItems={
          invoiceAppointment
            ? [
                {
                  description: `${invoiceAppointment.title}${invoiceAppointment.serviceName ? ` (${invoiceAppointment.serviceName})` : ""}`,
                  quantity: 1,
                  unitPrice: invoiceAppointment.servicePrice || 150,
                },
              ]
            : undefined
        }
        initialNotes={
          invoiceAppointment
            ? `Billing for session on ${new Date(invoiceAppointment.scheduledAt).toLocaleDateString()} with ${invoiceAppointment.staffMemberName || "Specialist Staff"}`
            : undefined
        }
        organizationId={currentOrganizationId}
      />
    </div>
  );
}
