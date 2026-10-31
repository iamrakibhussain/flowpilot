"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Info,
  CalendarPlus,
  ArrowLeft,
  ShieldCheck,
  Sun,
  Sunset,
  Moon,
  MapPin,
  Lock,
  Globe,
  Check,
  ExternalLink,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePublicBookingProfile,
  usePublicBookingSlots,
  useBookPublicAppointment,
} from "@/features/services/use-services";
import { usePortalMe } from "@/features/portal/use-portal";
import type {
  PublicServiceItem,
  PublicStaffItem,
  TimeSlot,
  PublicBookingResult,
} from "@/features/services/types";

// Generate downloadable .ics calendar invite file
function downloadIcsCalendar(result: PublicBookingResult, orgName: string) {
  const start = new Date(result.scheduledAt);
  const end = new Date(start.getTime() + result.durationMinutes * 60 * 1000);

  const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlowPilot//Client Scheduling Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:flowpilot-${result.appointmentId}@flowpilot.io`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${result.serviceName} with ${orgName}`,
    `DESCRIPTION:Confirmed session for ${result.customerName}. Specialist: ${result.staffName || "Team Specialist"}. Reference ID: ${result.appointmentId}`,
    `LOCATION:${orgName}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${result.serviceName.replace(/\s+/g, "_")}_appointment.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

const emptySubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function PublicBookingPortalPage() {
  const isClient = useIsClient();
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  // Step state: 1: Service, 2: Specialist, 3: Date & Time, 4: Client Details, 5: Confirmation
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1);

  // Selected Booking Details
  const [selectedService, setSelectedService] = React.useState<PublicServiceItem | null>(null);
  const [selectedStaff, setSelectedStaff] = React.useState<PublicStaffItem | null>(null);
  const [isAnyStaff, setIsAnyStaff] = React.useState<boolean>(true);
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    // Default to tomorrow in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | null>(null);

  // Customer Intake Form State
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Optional: Automatically pre-fill customer intake coordinates if logged into Client Portal
  const { data: portalMe } = usePortalMe();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get("clientEmail");
    const urlName = urlParams.get("clientName");
    if (urlEmail || urlName) {
      const timer = setTimeout(() => {
        if (urlEmail) {
          setCustomerEmail(urlEmail);
        }
        if (urlName) {
          setCustomerName(urlName);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  React.useEffect(() => {
    if (portalMe?.customer) {
      const timer = setTimeout(() => {
        if (portalMe.customer.name) {
          setCustomerName((prev) => prev || portalMe.customer.name);
        }
        if (portalMe.customer.email) {
          setCustomerEmail((prev) => prev || portalMe.customer.email);
        }
        if (portalMe.customer.phone) {
          setCustomerPhone((prev) => prev || portalMe.customer.phone || "");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [portalMe]);

  // Completed Confirmation State
  const [bookingConfirmation, setBookingConfirmation] = React.useState<PublicBookingResult | null>(
    null
  );

  // Category filter on Step 1
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  // Dynamic Browser Timezone Transparency (Safe client hydration hook)
  const clientTimezone = React.useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return "Local Time";
      }
    },
    () => "Local Time"
  );

  // Fetch Public Profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: profileError,
  } = usePublicBookingProfile(slug);

  // Derive categories safely without extra useMemo hooks
  const categories = React.useMemo(() => {
    if (!profile?.services) return [];
    const set = new Set<string>();
    profile.services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [profile]);

  const filteredServices = React.useMemo(() => {
    if (!profile?.services) return [];
    if (selectedCategory === "ALL") return profile.services;
    return profile.services.filter((s) => s.category === selectedCategory);
  }, [profile, selectedCategory]);

  const qualifiedStaff = React.useMemo(() => {
    if (!profile?.staffMembers) return [];
    if (!selectedService || !selectedService.assignedStaffIds?.length) {
      return profile.staffMembers;
    }
    return profile.staffMembers.filter((sm) => selectedService.assignedStaffIds.includes(sm.id));
  }, [profile, selectedService]);

  // Fetch Dynamic Slots
  const { data: slots = [], isLoading: isLoadingSlots } = usePublicBookingSlots(
    slug,
    selectedService?.id,
    selectedDate,
    !isAnyStaff && selectedStaff ? selectedStaff.id : undefined
  );

  const bookMutation = useBookPublicAppointment(slug);

  // Direct Google Calendar Add Link for Step 5
  const googleCalendarUrl = React.useMemo(() => {
    if (!bookingConfirmation) return "#";
    const start = new Date(bookingConfirmation.scheduledAt);
    const end = new Date(start.getTime() + bookingConfirmation.durationMinutes * 60 * 1000);
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const title = encodeURIComponent(
      `${bookingConfirmation.serviceName} - ${profile?.name || "FlowPilot"}`
    );
    const details = encodeURIComponent(
      `Confirmed session with ${bookingConfirmation.staffName || "Team Specialist"}.\nReference ID: ${bookingConfirmation.appointmentId}\nBooked via FlowPilot Client Portal.`
    );
    const location = encodeURIComponent(profile?.name || "FlowPilot Business");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}&details=${details}&location=${location}`;
  }, [bookingConfirmation, profile?.name]);

  // Split slots into time-of-day groups for superior UX
  const slotGroups = React.useMemo(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((s) => {
      const hour = parseInt(s.startTime.split(":")[0] || "0", 10);
      if (hour < 12) {
        morning.push(s);
      } else if (hour < 17) {
        afternoon.push(s);
      } else {
        evening.push(s);
      }
    });

    return { morning, afternoon, evening };
  }, [slots]);

  // Dates array for next 14 days
  const upcomingDates = React.useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayName: string;
      dayNum: number;
      monthName: string;
      badge?: string;
    }> = [];
    const start = new Date();
    start.setDate(start.getDate() + 1); // Start tomorrow

    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      list.push({
        dateStr: d.toISOString().slice(0, 10),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        badge: i === 0 ? "Tomorrow" : undefined,
      });
    }
    return list;
  }, []);

  // Step Nav Handlers
  const handleSelectService = (service: PublicServiceItem) => {
    setSelectedService(service);
    setSelectedStaff(null);
    setIsAnyStaff(true);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSelectStaffOption = (staff: PublicStaffItem | null, anyOption = false) => {
    if (anyOption) {
      setIsAnyStaff(true);
      setSelectedStaff(null);
    } else {
      setIsAnyStaff(false);
      setSelectedStaff(staff);
    }
    setSelectedSlot(null);
    setStep(3);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedService || !selectedSlot) {
      setFormError("Service selection or time slot is missing.");
      return;
    }

    if (!customerName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      setFormError("Please provide a valid email address.");
      return;
    }

    try {
      const result = await bookMutation.mutateAsync({
        serviceId: selectedService.id,
        staffMemberId: !isAnyStaff && selectedStaff ? selectedStaff.id : undefined,
        date: selectedDate,
        time: selectedSlot.startTime,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || null,
        notes: notes.trim() || null,
      });

      setBookingConfirmation(result);
      setStep(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to confirm booking.";
      setFormError(msg);
    }
  };

  // Loading & Error States
  const isActuallyLoading = !isClient || isLoadingProfile;

  if (isActuallyLoading) {
    return (
      <div className="dark:bg-background flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
        <div className="space-y-3 text-center">
          <div className="border-primary mx-auto h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground text-xs font-semibold">Loading booking portal...</p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="dark:bg-background flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
        <div className="border-border/80 bg-card w-full max-w-md space-y-4 rounded-3xl border p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-bold">Booking Portal Unavailable</h2>
            <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
              This business booking link is either invalid, inactive, or online appointments are
              currently disabled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-background text-foreground relative flex min-h-screen flex-col justify-between bg-slate-50/50 selection:bg-blue-600 selection:text-white">
      {/* Luxury Atmospheric Mesh */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_75%_50%_at_50%_-10%,rgba(59,130,246,0.06),transparent)]"
        aria-hidden="true"
      />

      {/* Top Brand Bar */}
      <header className="border-border/80 bg-background/80 sticky top-0 z-30 border-b backdrop-blur-md">
        <div
          className="h-1 w-full transition-colors duration-300"
          style={{ backgroundColor: profile.brandColor || "#2563eb" }}
        />
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black text-white shadow-sm ring-1 ring-slate-200/50 transition-colors duration-300 dark:ring-slate-700/50"
              style={{ backgroundColor: profile.brandColor || "#2563eb" }}
            >
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-foreground truncate text-sm font-bold sm:text-base">
                {profile.name}
              </h1>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                {profile.tagline || "Live Client Scheduling Portal"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/portal/${slug}`}
              className="border-border/80 bg-card text-foreground hover:bg-muted/80 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs transition sm:px-3"
              title="Already a client? Sign in to manage bookings & invoices"
            >
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="hidden sm:inline">Client </span>Portal
              </span>
            </Link>
            <div className="border-border/80 bg-card text-muted-foreground hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs sm:flex">
              <Globe className="h-3 w-3 text-blue-500" />
              <span>{clientTimezone || "Local Time"}</span>
            </div>
            <div className="border-border/80 bg-card text-muted-foreground flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Verified Business</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {/* Business Notice Banner */}
        {profile.bookingNotice && step !== 5 && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-blue-200/80 bg-blue-50 p-3.5 text-xs text-blue-700 shadow-2xs dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>{profile.bookingNotice}</span>
          </div>
        )}

        {/* Interactive 4-Step Stepper (Steps 1 to 4) */}
        {step !== 5 && (
          <div className="mb-8 space-y-3">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { num: 1, label: "Service", subtitle: "Select Offering" },
                { num: 2, label: "Specialist", subtitle: "Staff Member" },
                { num: 3, label: "Schedule", subtitle: "Date & Time" },
                { num: 4, label: "Intake", subtitle: "Your Details" },
              ].map((s) => {
                const isPassed = step > s.num;
                const isCurrent = step === s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={!isPassed}
                    onClick={() => isPassed && setStep(s.num as 1 | 2 | 3 | 4)}
                    className={`group relative flex items-center gap-2 rounded-2xl border p-2 text-left transition-all sm:gap-2.5 sm:p-2.5 ${
                      isPassed
                        ? "cursor-pointer border-emerald-500/30 bg-emerald-500/5 shadow-2xs hover:border-emerald-500/60"
                        : isCurrent
                          ? "border-primary bg-primary/10 ring-primary/20 shadow-xs ring-2"
                          : "border-border/60 bg-card/60 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-transform group-hover:scale-105 sm:h-7 sm:w-7 ${
                        isPassed
                          ? "bg-emerald-500 text-white shadow-2xs"
                          : isCurrent
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : s.num}
                    </div>
                    <div className="hidden min-w-0 md:block">
                      <p
                        className={`truncate text-xs font-bold ${
                          isCurrent
                            ? "text-primary"
                            : isPassed
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </p>
                      <p className="text-muted-foreground truncate text-[10px] font-medium">
                        {s.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Micro Progress Track */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 shadow-xs transition-all duration-300 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Select a Service Offering
              </h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Choose the appointment type or service package you wish to schedule.
              </p>
            </div>

            {/* Category Pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-1.5 font-semibold transition-all ${
                    selectedCategory === "ALL"
                      ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                      : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-2xs"
                  }`}
                >
                  All Services ({profile.services.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-1.5 font-semibold transition-all ${
                      selectedCategory === cat
                        ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                        : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40 shadow-2xs"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Service Offerings Grid */}
            <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className="group border-border/80 from-card to-card/95 hover:border-primary/50 relative flex cursor-pointer flex-col justify-between overflow-hidden bg-gradient-to-b p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/[0.07]"
                >
                  {/* Luxury Top Accent Line */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-80" />

                  <CardContent className="flex h-full flex-col justify-between space-y-4 p-0">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                          {service.category || "General"}
                        </span>
                        <span className="text-foreground font-mono text-xl font-black tracking-tight">
                          ${service.price.toFixed(2)}
                        </span>
                      </div>

                      <h3 className="text-foreground group-hover:text-primary mt-2.5 text-base font-bold transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                        {service.description ||
                          "Full specialized appointment session with professional guidance."}
                      </p>
                    </div>

                    <div className="border-border/70 space-y-2 border-t pt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="text-foreground flex items-center gap-1.5 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{service.durationMinutes} mins duration</span>
                        </div>

                        {service.requireDeposit ? (
                          <span className="rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {service.depositType === "PERCENTAGE"
                              ? `${service.depositAmount}% Deposit`
                              : `$${service.depositAmount} Deposit`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px] font-medium">
                            No Deposit Required
                          </span>
                        )}
                      </div>

                      {/* Micro Guarantees & Select Action */}
                      <div className="text-muted-foreground flex items-center justify-between pt-1 text-[10px]">
                        <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                          Conflict-Safe Buffer
                        </span>
                        <span className="text-primary inline-flex items-center gap-1 font-bold transition-transform group-hover:translate-x-0.5">
                          Select Offering →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE SPECIALIST */}
        {step === 2 && selectedService && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Choose a Specialist
                </h2>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  Select a team member for{" "}
                  <span className="text-foreground font-bold">{selectedService.name}</span>, or
                  choose &quot;Any Available Specialist&quot; for the widest slot availability.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="border-border/80 text-foreground hover:bg-muted flex cursor-pointer items-center gap-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change Service
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* Option: Any Available Specialist */}
              <Card
                onClick={() => handleSelectStaffOption(null, true)}
                className={`flex cursor-pointer items-center justify-between p-4.5 transition-all ${
                  isAnyStaff
                    ? "border-primary bg-primary/5 text-foreground shadow-xs"
                    : "border-border/80 bg-card hover:border-border shadow-2xs hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-foreground text-sm font-bold">Any Available Specialist</p>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Fastest
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Automatically assigns the earliest available qualified team member.
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Card>

              {/* Specific Qualified Specialists */}
              {qualifiedStaff.map((staff) => (
                <Card
                  key={staff.id}
                  onClick={() => handleSelectStaffOption(staff, false)}
                  className={`flex cursor-pointer items-center justify-between p-4.5 transition-all ${
                    !isAnyStaff && selectedStaff?.id === staff.id
                      ? "border-primary bg-primary/5 text-foreground shadow-xs"
                      : "border-border/80 bg-card hover:border-border shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-xs ${
                        staff.avatarBg || "bg-blue-600"
                      }`}
                    >
                      {staff.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-sm font-bold">{staff.name}</p>
                      <p className="text-muted-foreground truncate text-xs">{staff.roleTitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PICK DATE & LIVE TIME SLOT */}
        {step === 3 && selectedService && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Select Date &amp; Time
                </h2>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  Times shown are live openings factoring in buffer preparation windows.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                className="border-border/80 text-foreground hover:bg-muted flex cursor-pointer items-center gap-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Specialist
              </Button>
            </div>

            {/* Date Horizontal Picker Slider */}
            <div>
              <p className="text-foreground mb-2.5 text-xs font-bold">Available Dates</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {upcomingDates.map((item) => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`relative min-w-[76px] shrink-0 cursor-pointer rounded-2xl border px-3 py-2.5 text-center transition-all ${
                        isSelected
                          ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20"
                          : "border-border/80 bg-card text-muted-foreground hover:border-border hover:text-foreground shadow-2xs"
                      }`}
                    >
                      {item.badge && (
                        <span
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-wide uppercase ${
                            isSelected
                              ? "bg-white text-blue-700 shadow-2xs"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className="block text-[10px] font-semibold tracking-wider uppercase opacity-85">
                        {item.dayName}
                      </span>
                      <span className="my-0.5 block font-mono text-lg font-black">
                        {item.dayNum}
                      </span>
                      <span className="block text-[10px] font-medium opacity-85">
                        {item.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selector with Period Grouping */}
            <div className="pt-2">
              <div className="mb-3.5 flex items-center justify-between">
                <p className="text-foreground text-xs font-bold">
                  Available openings on{" "}
                  <span className="text-primary font-bold">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
                <span className="text-muted-foreground text-[11px] font-medium">
                  Session duration: {selectedService.durationMinutes} mins
                </span>
              </div>

              {isLoadingSlots ? (
                <div className="space-y-2 py-12 text-center">
                  <div className="border-primary mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                  <p className="text-muted-foreground text-xs font-semibold">
                    Calculating live availability...
                  </p>
                </div>
              ) : slots.length === 0 ? (
                <div className="border-border/80 bg-card space-y-2 rounded-2xl border p-8 text-center shadow-2xs">
                  <Clock className="text-muted-foreground mx-auto h-8 w-8" />
                  <p className="text-foreground text-xs font-bold">
                    No openings found for this date
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Specialists may be off shift or fully booked. Try selecting a different date
                    above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  {slotGroups.morning.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                        <span>Morning</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {slotGroups.morning.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => handleSelectSlot(slot)}
                              className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-xs"
                                  : "border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40 shadow-2xs"
                              }`}
                            >
                              <span className="block font-mono text-sm font-bold">
                                {slot.startTime}
                              </span>
                              <span
                                className={`mt-0.5 block text-[10px] font-medium ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                              >
                                until {slot.endTime}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {slotGroups.afternoon.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Sunset className="h-3.5 w-3.5 text-orange-500" />
                        <span>Afternoon</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {slotGroups.afternoon.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => handleSelectSlot(slot)}
                              className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-xs"
                                  : "border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40 shadow-2xs"
                              }`}
                            >
                              <span className="block font-mono text-sm font-bold">
                                {slot.startTime}
                              </span>
                              <span
                                className={`mt-0.5 block text-[10px] font-medium ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                              >
                                until {slot.endTime}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {slotGroups.evening.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Moon className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Evening</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {slotGroups.evening.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => handleSelectSlot(slot)}
                              className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-xs"
                                  : "border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40 shadow-2xs"
                              }`}
                            >
                              <span className="block font-mono text-sm font-bold">
                                {slot.startTime}
                              </span>
                              <span
                                className={`mt-0.5 block text-[10px] font-medium ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                              >
                                until {slot.endTime}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: CLIENT INTAKE & DETAILS */}
        {step === 4 && selectedService && selectedSlot && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Client Information
                </h2>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  Provide your contact details to confirm the calendar reservation.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(3)}
                className="border-border/80 text-foreground hover:bg-muted flex cursor-pointer items-center gap-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change Time
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Form Input Column */}
              <div className="space-y-4 lg:col-span-2">
                {portalMe?.customer && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300">
                    <User className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p>
                      Signed in as <strong>{portalMe.customer.name}</strong> (
                      {portalMe.customer.email}). This booking will automatically appear in your
                      Client Portal.
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div>
                    <label className="text-foreground mb-1.5 block text-xs font-semibold">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="border-border/80 bg-background text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-foreground mb-1.5 block text-xs font-semibold">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="jane@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="border-border/80 bg-background text-foreground"
                      />
                      <span className="text-muted-foreground mt-1 block text-[10px]">
                        Booking confirmation &amp; reminders will be sent here.
                      </span>
                    </div>

                    <div>
                      <label className="text-foreground mb-1.5 block text-xs font-semibold">
                        Phone Number (Optional)
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="border-border/80 bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-foreground mb-1.5 block text-xs font-semibold">
                      Notes or Special Requests (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any specific questions, preparation notes, or health considerations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={bookMutation.isPending}
                      className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
                      style={{ backgroundColor: profile.brandColor || "#2563eb" }}
                    >
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      {bookMutation.isPending
                        ? "Confirming Booking..."
                        : "Confirm & Book Appointment"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Order Summary Sidebar Column */}
              <Card className="border-border/80 bg-card h-fit space-y-4 p-5 shadow-2xs">
                <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Booking Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Service Offering
                    </span>
                    <p className="text-foreground mt-0.5 font-bold">{selectedService.name}</p>
                    <span className="text-muted-foreground text-[11px]">
                      {selectedService.durationMinutes} mins duration
                    </span>
                  </div>

                  <div className="border-border/70 border-t pt-2">
                    <span className="text-muted-foreground block text-[11px]">
                      Assigned Specialist
                    </span>
                    <p className="text-foreground mt-0.5 font-semibold">
                      {isAnyStaff || !selectedStaff
                        ? "Any Qualified Specialist"
                        : selectedStaff.name}
                    </p>
                  </div>

                  <div className="border-border/70 border-t pt-2">
                    <span className="text-muted-foreground block text-[11px]">Date &amp; Time</span>
                    <p className="text-primary mt-0.5 font-semibold">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-foreground font-mono font-bold">
                      {selectedSlot.startTime} – {selectedSlot.endTime}
                    </p>
                  </div>

                  <div className="border-border/70 space-y-1.5 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee:</span>
                      <span className="text-foreground font-mono font-bold">
                        ${selectedService.price.toFixed(2)}
                      </span>
                    </div>

                    {selectedService.requireDeposit && (
                      <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                        <span>Required Deposit:</span>
                        <span className="font-mono">
                          {selectedService.depositType === "PERCENTAGE"
                            ? `${selectedService.depositAmount}% ($${(
                                (selectedService.price * (selectedService.depositAmount || 0)) /
                                100
                              ).toFixed(2)})`
                            : `$${Number(selectedService.depositAmount).toFixed(2)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-border/70 text-muted-foreground flex items-center gap-1.5 border-t pt-3 text-[10px]">
                    <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>256-Bit SSL Encrypted Intake</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* STEP 5: INSTANT BOOKING CONFIRMATION */}
        {step === 5 && bookingConfirmation && (
          <div className="mx-auto max-w-xl space-y-6 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Reservation Confirmed
              </span>
              <h2 className="text-foreground mt-3 text-2xl font-black sm:text-3xl">
                You&apos;re All Set, {bookingConfirmation.customerName}!
              </h2>
              <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-xs sm:text-sm">
                A calendar invitation and confirmation details have been generated for your session
                with <span className="text-foreground font-semibold">{profile.name}</span>.
              </p>
            </div>

            {/* Luxury Boarding-Pass Receipt Ticket */}
            <div className="border-border/80 bg-card relative overflow-hidden rounded-3xl border text-left shadow-xl transition-all">
              {/* Ticket Top: Brand & Ref */}
              <div
                className="flex items-center justify-between p-5 text-white transition-colors duration-300"
                style={{ backgroundColor: profile.brandColor || "#2563eb" }}
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                    Booking Reference Pass
                  </span>
                  <p className="font-mono text-lg font-black tracking-wider">
                    #APPT-{bookingConfirmation.appointmentId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Perforated ticket seam with circular cutouts */}
              <div className="border-border/80 bg-muted/20 relative flex items-center justify-between border-t border-dashed px-6 py-2.5">
                <div className="dark:bg-background border-border/80 absolute -top-3 -left-3 h-6 w-6 rounded-full border-r bg-slate-50/50" />
                <div className="dark:bg-background border-border/80 absolute -top-3 -right-3 h-6 w-6 rounded-full border-l bg-slate-50/50" />
                <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                  FLOWPILOT SECURE CALENDAR DISPATCH
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  PASS ACTIVE
                </span>
              </div>

              {/* Ticket Body */}
              <div className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Service</span>
                    <p className="text-foreground mt-0.5 text-sm font-bold">
                      {bookingConfirmation.serviceName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Specialist</span>
                    <p className="text-foreground mt-0.5 text-sm font-bold">
                      {bookingConfirmation.staffName || "Team Specialist"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Date &amp; Time</span>
                    <p className="text-primary mt-0.5 text-sm font-bold">
                      {new Date(bookingConfirmation.scheduledAt).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Duration</span>
                    <p className="text-foreground mt-0.5 text-sm font-bold">
                      {bookingConfirmation.durationMinutes} minutes
                    </p>
                  </div>
                </div>

                <div className="border-border/80 text-muted-foreground flex items-center justify-between border-t border-dashed pt-3 text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="text-primary h-3.5 w-3.5" />
                    {profile.name} Session
                  </span>
                  <span className="font-mono text-[10px]">Instant Confirmation Sync</span>
                </div>
              </div>
            </div>

            {/* Client Portal Instant Access Card */}
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 text-center dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-blue-950/20">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Need to reschedule, cancel, or download your invoice receipt later?
              </p>
              <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                Manage all your upcoming and past bookings in your personal 24/7 Client Self-Service
                Portal.
              </p>
              <div className="mt-3 flex justify-center">
                <Button
                  size="sm"
                  asChild
                  className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                >
                  <Link href={portalMe?.customer ? `/portal/${slug}/dashboard` : `/portal/${slug}`}>
                    {portalMe?.customer
                      ? "View in My Client Portal \u2192"
                      : "Access Client Portal \u2192"}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Actions: Direct Calendar Integrations */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
              >
                <CalendarPlus className="h-4 w-4" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => downloadIcsCalendar(bookingConfirmation, profile.name)}
                className="border-border/80 text-foreground hover:bg-muted flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold sm:w-auto"
              >
                <CalendarPlus className="text-primary h-4 w-4" />
                <span>Download .ics (Apple / Outlook)</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedStaff(null);
                  setSelectedSlot(null);
                  setBookingConfirmation(null);
                }}
                className="text-muted-foreground hover:text-foreground w-full cursor-pointer rounded-xl px-4 py-2.5 text-xs sm:w-auto"
              >
                Book Another
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-border/80 bg-background/50 text-muted-foreground border-t py-8 text-center text-xs">
        <div className="mx-auto max-w-4xl space-y-2 px-4">
          <p className="text-foreground text-sm font-semibold">
            {profile.name}
            {profile.tagline ? ` — ${profile.tagline}` : ""}
          </p>
          {(profile.contactEmail || profile.contactPhone || profile.address) && (
            <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px]">
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="hover:text-primary underline-offset-2 transition-colors hover:underline"
                >
                  {profile.contactEmail}
                </a>
              )}
              {profile.contactPhone && (
                <a
                  href={`tel:${profile.contactPhone}`}
                  className="hover:text-primary underline-offset-2 transition-colors hover:underline"
                >
                  {profile.contactPhone}
                </a>
              )}
              {profile.address && <span>{profile.address}</span>}
            </p>
          )}
          {Boolean(profile.cancellationHours) && (
            <p className="text-muted-foreground/80 text-[10px]">
              Notice Policy: Cancellations accepted up to {profile.cancellationHours} hours prior to
              scheduled appointment.
            </p>
          )}
          <p className="text-muted-foreground/60 pt-1 text-[10px]">
            Powered by FlowPilot • Secure Multi-Tenant Enterprise Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
