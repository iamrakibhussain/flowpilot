"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CreditCard,
  User,
  LogOut,
  Printer,
  AlertTriangle,
  MapPin,
  Video,
  Phone,
  X,
  CheckCircle2,
  Receipt,
  PlusCircle,
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

function getRelativeCountdown(dateStr: string): string {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diffHours = Math.round((target - now) / (1000 * 60 * 60));
  if (diffHours >= 0 && diffHours < 24) return "Today";
  if (diffHours >= 24 && diffHours < 48) return "Tomorrow";
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return "Yesterday";
  return diffDays < -1 ? `${Math.abs(diffDays)}d ago` : "Today";
}

interface ProfileSectionProps {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  brandColor: string;
  onSuccess: (text: string) => void;
  onError: (text: string) => void;
}

function CustomerProfileSection({ customer, brandColor, onSuccess, onError }: ProfileSectionProps) {
  const [name, setName] = React.useState(customer.name || "");
  const [phone, setPhone] = React.useState(customer.phone || "");
  const [company, setCompany] = React.useState(customer.company || "");
  const updateProfileMutation = useUpdatePortalProfile();

  const handleExecuteProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim() || undefined,
        phone: phone.trim() || null,
        company: company.trim() || null,
      });
      onSuccess("Contact coordinates updated successfully.");
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to update profile.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-bold sm:text-lg">Contact Coordinates &amp; Preferences</h2>
        <p className="text-xs text-slate-500">
          Update your contact details so specialists can reach you regarding scheduled sessions.
        </p>
      </div>

      <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900">
        <form onSubmit={handleExecuteProfileUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium dark:border-slate-800 dark:bg-slate-950"
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Company / Organization
            </label>
            <Input
              placeholder="Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 font-medium dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            style={{ backgroundColor: brandColor }}
            className="h-10 cursor-pointer rounded-xl px-6 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:opacity-90"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

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

  // Queries & Mutations
  const { data, isLoading, isError } = usePortalDashboard();
  const rescheduleMutation = useReschedulePortalAppointment();
  const cancelMutation = useCancelPortalAppointment();
  const logoutMutation = useLogoutPortal();

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
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to reschedule appointment.",
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
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to cancel appointment.",
      });
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
    <div className="relative min-h-screen bg-slate-50/70 pb-20 text-slate-900 selection:bg-blue-600 selection:text-white dark:bg-slate-950 dark:text-slate-100">
      {/* Linear Atmospheric Mesh Lighting */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.08),transparent_70%),radial-gradient(ellipse_60%_50%_at_100%_35%,rgba(99,102,241,0.05),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Top Client Brand Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-900/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 object-contain p-1 shadow-2xs dark:border-slate-700 dark:bg-slate-800"
              />
            ) : (
              <div
                style={{ backgroundColor: brandColor }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-md shadow-blue-500/20"
              >
                {organization.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight sm:text-base">
                  {organization.name}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Verified Hub
                </span>
              </div>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                Client Self-Service Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-xs sm:border-l sm:border-slate-200 sm:pl-3 dark:sm:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-2xs">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden flex-col text-left leading-tight sm:flex">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {customer.name}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {customer.email}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8.5 cursor-pointer gap-1.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
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
            className={`flex items-center justify-between rounded-2xl p-4 text-xs font-medium shadow-sm transition-all sm:text-sm ${
              actionMessage.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="cursor-pointer p-1 hover:opacity-75"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:p-7 dark:border-slate-800/80 dark:bg-slate-900/90">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/15" />
          <div className="relative z-10 space-y-1.5">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Welcome back, {customer.name.split(" ")[0]}!
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              You have{" "}
              <strong className="font-bold text-slate-800 dark:text-slate-200">
                {appointments.upcoming.length} upcoming
              </strong>{" "}
              appointment{appointments.upcoming.length === 1 ? "" : "s"} and{" "}
              <strong className="font-bold text-slate-800 dark:text-slate-200">
                ${invoices.metrics.totalOutstanding}
              </strong>{" "}
              in outstanding balance.
            </p>
          </div>

          <div className="relative z-10 mt-4 sm:mt-0">
            <Button
              onClick={() =>
                router.push(
                  `/book/${slug}?clientEmail=${encodeURIComponent(customer.email)}&clientName=${encodeURIComponent(customer.name)}`
                )
              }
              style={{ backgroundColor: brandColor }}
              className="h-11 w-full shrink-0 cursor-pointer gap-2 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:opacity-90 sm:h-10 sm:w-auto sm:text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Book New Session
            </Button>
          </div>
        </div>

        {/* Segmented Tab Navigation with Native Mobile 3-Grid Adaptation */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/60 p-1.5 backdrop-blur-md sm:flex sm:items-center sm:gap-2 dark:bg-slate-800/60">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all sm:gap-2 sm:px-4 ${
              activeTab === "appointments"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="truncate">Appointments</span>
            <span className="py-0.2 rounded-full bg-blue-100 px-1.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              {appointments.upcoming.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all sm:gap-2 sm:px-4 ${
              activeTab === "invoices"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <CreditCard className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Invoices</span>
            {Number(invoices.metrics.totalOutstanding) > 0 && (
              <span className="py-0.2 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                ${invoices.metrics.totalOutstanding}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all sm:gap-2 sm:px-4 ${
              activeTab === "profile"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <User className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="truncate">Profile</span>
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
                    You don&apos;t have any sessions booked right now. Ready to book your next
                    session?
                  </p>
                  <Button
                    onClick={() =>
                      router.push(
                        `/book/${slug}?clientEmail=${encodeURIComponent(customer.email)}&clientName=${encodeURIComponent(customer.name)}`
                      )
                    }
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
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-md sm:p-6 dark:border-slate-800/90 dark:bg-slate-900"
                    >
                      <CardContent className="space-y-4 p-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
                                {appt.service?.name || appt.title}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {getRelativeCountdown(appt.scheduledAt)}
                              </span>
                            </div>
                            <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                              {appt.title}
                            </h3>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Confirmed
                          </span>
                        </div>

                        {/* Date & Time pill */}
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3.5 text-xs sm:text-sm dark:border-slate-800/60 dark:bg-slate-950/60">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-blue-600" />
                            <span className="font-semibold">{formattedDate}</span>
                          </div>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {formattedTime} ({appt.durationMinutes}m)
                          </span>
                        </div>

                        {/* Specialist & Meeting type */}
                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            {appt.staffMember ? (
                              <>
                                <div
                                  className={`h-6 w-6 rounded-full ${appt.staffMember.avatarBg} flex items-center justify-center text-[10px] font-bold text-white shadow-2xs`}
                                >
                                  {appt.staffMember.initials}
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {appt.staffMember.name}
                                </span>
                              </>
                            ) : (
                              <span>Assigned Specialist</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                            className="h-10 flex-1 cursor-pointer rounded-xl border-slate-200 text-xs font-bold shadow-2xs transition hover:bg-slate-100 sm:h-9 dark:border-slate-700 dark:hover:bg-slate-800"
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
                            className="h-10 cursor-pointer rounded-xl border-rose-200 px-3.5 text-xs font-bold text-rose-600 shadow-2xs transition hover:bg-rose-50 sm:h-9 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
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
                      You don&apos;t have any billing statements yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                  {invoices.list.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col justify-between gap-4 p-5 transition-all hover:bg-slate-50/60 sm:flex-row sm:items-center dark:hover:bg-slate-800/40"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2.5 sm:justify-start">
                          <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              inv.status === "PAID"
                                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : inv.status === "OVERDUE"
                                  ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {inv.status}
                          </span>
                          {/* Visible on mobile only */}
                          <div className="text-right text-sm font-black text-slate-900 sm:hidden dark:text-slate-100">
                            ${Number(inv.total).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <span>Issued: {new Date(inv.issueDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                        {/* Visible on desktop only */}
                        <div className="hidden pr-2 text-right sm:block">
                          <div className="text-base font-black text-slate-900 dark:text-slate-100">
                            ${Number(inv.total).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-medium text-slate-400">Total Amount</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
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
                              className="h-10 cursor-pointer gap-1.5 rounded-xl px-4 text-xs font-bold text-white shadow-sm transition hover:opacity-90 sm:h-9"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Pay Now
                            </Button>
                          ) : null}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveReceiptInvoice(inv)}
                            className="h-10 cursor-pointer gap-1.5 rounded-xl border-slate-200 px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 sm:h-9 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-500" />
                            Receipt
                          </Button>
                        </div>
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
          <CustomerProfileSection
            customer={customer}
            brandColor={brandColor}
            onSuccess={(msg) => setActionMessage({ type: "success", text: msg })}
            onError={(msg) => setActionMessage({ type: "error", text: msg })}
          />
        )}
      </main>

      {/* RESCHEDULE MODAL */}
      {rescheduleAppt && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md duration-200">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setRescheduleAppt(null)}
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 rounded-2xl border border-blue-200/80 bg-blue-50/80 p-3.5 text-xs text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-200">
              <p className="font-bold">{rescheduleAppt.title}</p>
              <p className="text-blue-600 dark:text-blue-300">
                Current: {new Date(rescheduleAppt.scheduledAt).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleExecuteReschedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Select New Date &amp; Time
                </label>
                <Input
                  type="datetime-local"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 font-medium dark:bg-slate-950"
                />
                <p className="text-[11px] text-slate-500">
                  Minimum notice required: {organization.minNoticeHours || 2} hours prior.
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleAppt(null)}
                  className="h-11 flex-1 cursor-pointer rounded-xl font-bold sm:h-10"
                >
                  Keep Existing
                </Button>
                <Button
                  type="submit"
                  disabled={rescheduleMutation.isPending || !rescheduleDate}
                  style={{ backgroundColor: brandColor }}
                  className="h-11 flex-1 cursor-pointer rounded-xl font-bold text-white shadow-md shadow-blue-500/20 sm:h-10"
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
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md duration-200">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
                Cancel Appointment
              </h3>
              <button
                onClick={() => setCancelAppt(null)}
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel your appointment for{" "}
              <strong className="text-slate-900 dark:text-slate-100">{cancelAppt.title}</strong> on{" "}
              {new Date(cancelAppt.scheduledAt).toLocaleDateString()}?
            </p>

            <form onSubmit={handleExecuteCancel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Reason for Cancellation
                </label>
                <Input
                  required
                  placeholder="e.g. Schedule conflict, feeling unwell..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelAppt(null)}
                  className="h-11 flex-1 cursor-pointer rounded-xl font-bold sm:h-10"
                >
                  Keep Appointment
                </Button>
                <Button
                  type="submit"
                  disabled={cancelMutation.isPending || cancelReason.trim().length < 3}
                  className="h-11 flex-1 cursor-pointer rounded-xl bg-rose-600 font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 sm:h-10"
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
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md duration-200">
          <div className="animate-in fade-in max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl duration-200 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {organization.name}
                </span>
                <p className="text-[11px] text-slate-400">
                  Official Billing Statement &amp; Receipt
                </p>
              </div>
              <button
                onClick={() => setActiveReceiptInvoice(null)}
                className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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

            <div className="flex items-center gap-2.5 pt-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-11 flex-1 cursor-pointer gap-2 rounded-xl text-xs font-bold shadow-2xs sm:h-10 sm:text-sm"
              >
                <Printer className="h-4 w-4" />
                Print Statement
              </Button>
              <Button
                onClick={() => setActiveReceiptInvoice(null)}
                style={{ backgroundColor: brandColor }}
                className="h-11 flex-1 cursor-pointer rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/20 sm:h-10 sm:text-sm"
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
