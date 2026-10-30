"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Printer,
  CalendarCheck,
  AlertTriangle,
  MapPin,
  Video,
  Phone,
  RefreshCw,
  X,
  CheckCircle2,
  DollarSign,
  Receipt,
  PlusCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePortalDashboard,
  useReschedulePortalAppointment,
  useCancelPortalAppointment,
  useUpdatePortalProfile,
  useLogoutPortal,
} from "@/features/portal/use-portal";
import type { PortalAppointment, PortalInvoice } from "@/features/portal/types";

export default function ClientPortalDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [activeTab, setActiveTab] = React.useState<
    "appointments" | "invoices" | "book" | "profile"
  >("appointments");

  // Modal states
  const [rescheduleAppt, setRescheduleAppt] = React.useState<PortalAppointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState("");
  const [cancelAppt, setCancelAppt] = React.useState<PortalAppointment | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [activeReceiptInvoice, setActiveReceiptInvoice] = React.useState<PortalInvoice | null>(
    null
  );
  const [actionMessage, setActionMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile Form state
  const [profileName, setProfileName] = React.useState("");
  const [profilePhone, setProfilePhone] = React.useState("");
  const [profileCompany, setProfileCompany] = React.useState("");
  const [hasInitializedProfile, setHasInitializedProfile] = React.useState(false);

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = usePortalDashboard();
  const rescheduleMutation = useReschedulePortalAppointment();
  const cancelMutation = useCancelPortalAppointment();
  const updateProfileMutation = useUpdatePortalProfile();
  const logoutMutation = useLogoutPortal();

  // Populate profile form once data loads
  React.useEffect(() => {
    if (data?.customer && !hasInitializedProfile) {
      setProfileName(data.customer.name || "");
      setProfilePhone(data.customer.phone || "");
      setProfileCompany(data.customer.company || "");
      setHasInitializedProfile(true);
    }
  }, [data, hasInitializedProfile]);

  // Handle logout
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push(`/portal/${slug}`);
  };

  // Handle reschedule submit
  const handleExecuteReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleAppt || !rescheduleDate) return;

    setActionMessage(null);
    try {
      await rescheduleMutation.mutateAsync({
        id: rescheduleAppt.id,
        input: { newScheduledAt: new Date(rescheduleDate).toISOString() },
      });
      setRescheduleAppt(null);
      setRescheduleDate("");
      setActionMessage({ type: "success", text: "Appointment rescheduled successfully!" });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err?.message || "Failed to reschedule appointment.",
      });
    }
  };

  // Handle cancellation submit
  const handleExecuteCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelAppt || cancelReason.trim().length < 3) return;

    setActionMessage(null);
    try {
      await cancelMutation.mutateAsync({
        id: cancelAppt.id,
        input: { reason: cancelReason.trim() },
      });
      setCancelAppt(null);
      setCancelReason("");
      setActionMessage({ type: "success", text: "Appointment cancelled." });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err?.message || "Failed to cancel appointment." });
    }
  };

  // Handle profile submit
  const handleExecuteProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      await updateProfileMutation.mutateAsync({
        name: profileName.trim() || undefined,
        phone: profilePhone.trim() || null,
        company: profileCompany.trim() || null,
      });
      setActionMessage({ type: "success", text: "Contact coordinates updated successfully." });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err?.message || "Failed to update profile." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600/30 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading your client portal...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <Card className="w-full max-w-md rounded-2xl border-slate-200 p-8 text-center shadow-xl dark:border-slate-800">
          <CardContent className="space-y-4 p-0">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Portal Session Required
            </h2>
            <p className="text-xs text-slate-500">
              Your client session has expired or is invalid. Please sign in with a single-use magic
              link.
            </p>
            <Button
              onClick={() => router.push(`/portal/${slug}`)}
              className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Sign In to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { organization, customer, appointments, invoices } = data;
  const brandColor = organization.brandColor || "#2563eb";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Client Brand Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 object-contain p-1 dark:border-slate-700 dark:bg-slate-800"
              />
            ) : (
              <div
                style={{ backgroundColor: brandColor }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
              >
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight sm:text-base">
                  {organization.name}
                </span>
                <span className="py-0.2 inline-flex items-center gap-0.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              </div>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                Client Self-Service Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 text-xs sm:flex dark:border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {customer.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1.5 rounded-lg border-slate-200 text-xs text-slate-600 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:px-6 sm:pt-8">
        {/* Action feedback toast */}
        {actionMessage && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-xs font-medium shadow-sm transition-all sm:text-sm ${
              actionMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-75">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Welcome Hero Banner */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Welcome back, {customer.name.split(" ")[0]}!
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              You have{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {appointments.upcoming.length} upcoming
              </strong>{" "}
              appointment{appointments.upcoming.length === 1 ? "" : "s"} and{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                ${invoices.metrics.totalOutstanding}
              </strong>{" "}
              in outstanding balance.
            </p>
          </div>

          <Button
            onClick={() => router.push(`/book/${slug}`)}
            style={{ backgroundColor: brandColor }}
            className="h-10 shrink-0 gap-2 self-start rounded-xl font-semibold text-white shadow-sm hover:opacity-90 sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Book New Session
          </Button>
        </div>

        {/* Segmented Pill Navigation */}
        <div className="flex max-w-full scrollbar-none items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-200/60 p-1 dark:bg-slate-800/60">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === "appointments"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Appointments</span>
            <span className="py-0.2 rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              {appointments.upcoming.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === "invoices"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Invoices & Billing</span>
            {Number(invoices.metrics.totalOutstanding) > 0 && (
              <span className="py-0.2 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                ${invoices.metrics.totalOutstanding}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Profile & Coordinates</span>
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
                <span>Upcoming Appointments</span>
                <span className="text-xs font-medium text-slate-500">
                  ({appointments.upcoming.length} scheduled)
                </span>
              </h2>
            </div>

            {appointments.upcoming.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <CardContent className="space-y-3 p-0">
                  <Calendar className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No upcoming appointments
                  </p>
                  <p className="mx-auto max-w-sm text-xs text-slate-500">
                    You don't have any sessions booked right now. Ready to book your next session?
                  </p>
                  <Button
                    onClick={() => router.push(`/book/${slug}`)}
                    style={{ backgroundColor: brandColor }}
                    className="h-9 gap-1.5 rounded-lg text-xs text-white"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Book an Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {appointments.upcoming.map((appt) => {
                  const dateObj = new Date(appt.scheduledAt);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <Card
                      key={appt.id}
                      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <CardContent className="space-y-4 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/50 bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase dark:bg-blue-950/60 dark:text-blue-300">
                              {appt.service?.name || appt.title}
                            </span>
                            <h3 className="text-base font-bold tracking-tight sm:text-lg">
                              {appt.title}
                            </h3>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Confirmed
                          </span>
                        </div>

                        {/* Date & Time pill */}
                        <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50 p-3 text-xs sm:text-sm dark:border-slate-800/60 dark:bg-slate-950/60">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{formattedDate}</span>
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formattedTime} ({appt.durationMinutes}m)
                          </span>
                        </div>

                        {/* Specialist & Meeting type */}
                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            {appt.staffMember ? (
                              <>
                                <div
                                  className={`h-6 w-6 rounded-full ${appt.staffMember.avatarBg} flex items-center justify-center text-[10px] font-bold text-white`}
                                >
                                  {appt.staffMember.initials}
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {appt.staffMember.name}
                                </span>
                              </>
                            ) : (
                              <span>Assigned Staff</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 font-medium">
                            {appt.type === "VIDEO" && (
                              <Video className="h-3.5 w-3.5 text-indigo-500" />
                            )}
                            {appt.type === "IN_PERSON" && (
                              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                            {appt.type === "PHONE" && (
                              <Phone className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className="capitalize">
                              {appt.type.toLowerCase().replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRescheduleAppt(appt);
                              setRescheduleDate(
                                new Date(appt.scheduledAt).toISOString().slice(0, 16)
                              );
                            }}
                            className="h-9 flex-1 rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCancelAppt(appt);
                              setCancelReason("");
                            }}
                            className="h-9 rounded-xl border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Past Appointments Section */}
            {appointments.past.length > 0 && (
              <div className="space-y-3 pt-6">
                <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                  Past & Completed Sessions
                </h3>
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                  {appointments.past.slice(0, 5).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between p-4 text-xs sm:text-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {appt.service?.name || appt.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {new Date(appt.scheduledAt).toLocaleDateString()} •{" "}
                          {appt.staffMember?.name || "Staff"}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          appt.status === "COMPLETED"
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVOICES & BILLING */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            {/* Financial Telemetry Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="space-y-1 p-0">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Total Invoiced
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    ${invoices.metrics.totalBilled}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {invoices.list.length} invoices issued
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="space-y-1 p-0">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Total Paid
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${invoices.metrics.totalPaid}
                  </div>
                  <p className="text-[11px] text-slate-400">Settled and confirmed</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="space-y-1 p-0">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Balance Outstanding
                  </span>
                  <div
                    className={`text-2xl font-extrabold ${Number(invoices.metrics.totalOutstanding) > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"}`}
                  >
                    ${invoices.metrics.totalOutstanding}
                  </div>
                  <p className="text-[11px] text-slate-400">Current pending dues</p>
                </CardContent>
              </Card>
            </div>

            {/* Invoices List */}
            <div className="space-y-3">
              <h2 className="text-base font-bold sm:text-lg">Billing Statements & Receipts</h2>

              {invoices.list.length === 0 ? (
                <Card className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
                  <CardContent className="space-y-2 p-0">
                    <Receipt className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No invoices on file
                    </p>
                    <p className="text-xs text-slate-500">
                      You don't have any billing statements yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                  {invoices.list.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col justify-between gap-4 p-5 transition-all hover:bg-slate-50/50 sm:flex-row sm:items-center dark:hover:bg-slate-800/30"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              inv.status === "PAID"
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : inv.status === "OVERDUE"
                                  ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                  : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Issued: {new Date(inv.issueDate).toLocaleDateString()} • Due:{" "}
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="text-right sm:pr-2">
                          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                            ${Number(inv.total).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400">Total Amount</div>
                        </div>

                        {inv.status === "PENDING" || inv.status === "OVERDUE" ? (
                          <Button
                            onClick={() => {
                              if (inv.paymentToken) {
                                router.push(`/pay/${inv.paymentToken}`);
                              } else {
                                setActionMessage({
                                  type: "error",
                                  text: "Online checkout is not enabled for this invoice. Please contact support.",
                                });
                              }
                            }}
                            style={{ backgroundColor: brandColor }}
                            size="sm"
                            className="h-9 gap-1.5 rounded-xl px-4 text-xs font-semibold text-white shadow-sm"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Pay Now
                          </Button>
                        ) : null}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveReceiptInvoice(inv)}
                          className="h-9 gap-1.5 rounded-xl border-slate-200 px-3 text-xs font-semibold dark:border-slate-700"
                        >
                          <Printer className="h-3.5 w-3.5 text-slate-500" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold sm:text-lg">Contact Coordinates & Preferences</h2>
              <p className="text-xs text-slate-500">
                Update your contact details so specialists can reach you regarding scheduled
                sessions.
              </p>
            </div>

            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <form onSubmit={handleExecuteProfileUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <Input
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address (Read-only)
                  </label>
                  <Input
                    disabled
                    value={customer.email}
                    className="h-10 cursor-not-allowed rounded-xl border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <p className="text-[11px] text-slate-400">
                    Email is linked to your verified portal account identity.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company / Organization
                  </label>
                  <Input
                    placeholder="Acme Inc."
                    value={profileCompany}
                    onChange={(e) => setProfileCompany(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  style={{ backgroundColor: brandColor }}
                  className="h-10 rounded-xl px-6 text-xs font-semibold text-white shadow-sm"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </main>

      {/* RESCHEDULE MODAL */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Reschedule Appointment</h3>
              <button
                onClick={() => setRescheduleAppt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
              <p className="font-semibold">{rescheduleAppt.title}</p>
              <p>Current: {new Date(rescheduleAppt.scheduledAt).toLocaleString()}</p>
            </div>

            <form onSubmit={handleExecuteReschedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select New Date & Time
                </label>
                <Input
                  type="datetime-local"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950"
                />
                <p className="text-[11px] text-slate-500">
                  Minimum notice required: {organization.minNoticeHours || 2} hours prior.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleAppt(null)}
                  className="flex-1 rounded-xl"
                >
                  Keep Existing
                </Button>
                <Button
                  type="submit"
                  disabled={rescheduleMutation.isPending || !rescheduleDate}
                  style={{ backgroundColor: brandColor }}
                  className="flex-1 rounded-xl font-semibold text-white"
                >
                  {rescheduleMutation.isPending ? "Updating..." : "Confirm Time"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancelAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                Cancel Appointment
              </h3>
              <button
                onClick={() => setCancelAppt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel your appointment for{" "}
              <strong>{cancelAppt.title}</strong> on{" "}
              {new Date(cancelAppt.scheduledAt).toLocaleDateString()}?
            </p>

            <form onSubmit={handleExecuteCancel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Reason for Cancellation
                </label>
                <Input
                  required
                  placeholder="e.g. Schedule conflict, feeling unwell..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelAppt(null)}
                  className="flex-1 rounded-xl"
                >
                  Keep Appointment
                </Button>
                <Button
                  type="submit"
                  disabled={cancelMutation.isPending || cancelReason.trim().length < 3}
                  className="flex-1 rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {activeReceiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-base font-extrabold">{organization.name}</span>
                <p className="text-[11px] text-slate-400">Official Billing Statement & Receipt</p>
              </div>
              <button
                onClick={() => setActiveReceiptInvoice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400">Statement Number:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {activeReceiptInvoice.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Status:</span>
                  <p className="font-bold text-emerald-600">{activeReceiptInvoice.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div>
                  <span className="text-slate-400">Billed To:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{customer.name}</p>
                  <p className="text-slate-500">{customer.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Issue Date:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(activeReceiptInvoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeReceiptInvoice.items.map((item) => (
                      <tr key={item.id} className="py-2">
                        <td className="py-2">
                          {item.description} (x{item.quantity})
                        </td>
                        <td className="py-2 text-right font-medium">
                          ${Number(item.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {activeReceiptInvoice.items.length === 0 && (
                      <tr>
                        <td className="py-2">Professional Services</td>
                        <td className="py-2 text-right font-medium">
                          ${Number(activeReceiptInvoice.total).toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold dark:border-slate-800">
                <span>Total Settled:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ${Number(activeReceiptInvoice.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="flex-1 gap-2 rounded-xl text-xs font-semibold"
              >
                <Printer className="h-4 w-4" />
                Print Statement
              </Button>
              <Button
                onClick={() => setActiveReceiptInvoice(null)}
                style={{ backgroundColor: brandColor }}
                className="flex-1 rounded-xl text-xs font-semibold text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
