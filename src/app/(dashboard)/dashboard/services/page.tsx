"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Search,
  Layers,
  Clock,
  DollarSign,
  Shield,
  Users,
  Share2,
  ExternalLink,
  Check,
  Calendar,
  Grid,
  List,
  Copy,
  ShieldCheck,
  Zap,
  QrCode,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useServices } from "@/features/services/use-services";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { ServiceBuilderModal } from "@/components/dashboard/services/service-builder-modal";
import { ServiceQuickPeekDrawer } from "@/components/dashboard/services/service-quick-peek-drawer";
import type { ServiceItem } from "@/features/services/types";

const emptySubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function ServicesPage() {
  const isClient = useIsClient();
  const { organizationName } = useWorkspaceSession();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [durationFilter, setDurationFilter] = React.useState<"ALL" | "SHORT" | "MEDIUM" | "LONG">(
    "ALL"
  );
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Modals & Drawers state
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [serviceToEdit, setServiceToEdit] = React.useState<ServiceItem | null>(null);
  const [selectedServiceForPeek, setSelectedServiceForPeek] = React.useState<ServiceItem | null>(
    null
  );
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);

  // Queries
  const { data: services = [], isLoading } = useServices({
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    search: searchQuery.trim() || undefined,
  });

  const isActuallyLoading = !isClient || isLoading;

  // Extract distinct categories from full service list
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Client-side duration filtering
  const filteredServices = React.useMemo(() => {
    return services.filter((service) => {
      if (durationFilter === "SHORT") return service.durationMinutes < 30;
      if (durationFilter === "MEDIUM")
        return service.durationMinutes >= 30 && service.durationMinutes <= 60;
      if (durationFilter === "LONG") return service.durationMinutes > 60;
      return true;
    });
  }, [services, durationFilter]);

  // Executive KPI metrics
  const kpis = React.useMemo(() => {
    const activeList = services.filter((s) => s.isActive);
    const activeCount = activeList.length;
    const avgPrice =
      activeCount > 0 ? activeList.reduce((acc, s) => acc + s.price, 0) / activeCount : 0;
    const totalAppointments = services.reduce((acc, s) => acc + (s.appointmentCount || 0), 0);
    const avgBuffer =
      activeCount > 0
        ? activeList.reduce((acc, s) => acc + (s.bufferBefore || 0) + (s.bufferAfter || 0), 0) /
          activeCount
        : 0;

    return {
      activeCount,
      avgPrice,
      totalAppointments,
      avgBuffer: Math.round(avgBuffer),
    };
  }, [services]);

  const handleOpenCreate = () => {
    setServiceToEdit(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsBuilderOpen(true);
    setSelectedServiceForPeek(null);
  };

  const publicBookingSlug = React.useMemo(() => {
    return (
      organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") || "my-business"
    );
  }, [organizationName]);

  const browserOrigin = React.useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => ""
  );

  const publicBookingUrl = browserOrigin
    ? `${browserOrigin}/book/${publicBookingSlug}`
    : `/book/${publicBookingSlug}`;

  const handleCopyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(publicBookingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Luxury Ambient Atmospheric Glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.06),transparent)]"
        aria-hidden="true"
      />

      {/* Enterprise Multi-Tenant Telemetry Strip */}
      <div className="border-border/80 bg-card/70 text-muted-foreground flex w-full max-w-full min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-2 text-[11px] shadow-2xs backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-foreground flex items-center gap-1.5 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Services Catalog Engine Active
          </span>
          <span className="text-border hidden sm:inline">•</span>
          <span className="font-mono text-[10px]">Buffer Protection: Auto-calculated</span>
          <span className="text-border hidden md:inline">•</span>
          <span className="hidden font-mono text-[10px] md:inline">
            Public Portal: /{publicBookingSlug}
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Double-Booking Safe
          </span>
          <span className="text-border">•</span>
          <span className="text-primary font-semibold">Multi-Tenant TLS</span>
        </div>
      </div>

      {/* Enterprise Page Header */}
      <PageHeader
        breadcrumbs={
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span className="text-primary font-semibold">Operations</span>
            <span>/</span>
            <span>Services &amp; Offerings</span>
          </div>
        }
        title="Services &amp; Offerings Hub"
        description="Curate bookable service tiers, configure automated buffer protection, set deposit guarantees, and share your live client scheduling portal."
        actions={
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBookingLink}
              className="border-border/80 bg-background/80 hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-xl text-xs font-semibold shadow-2xs backdrop-blur-xs transition"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Share Booking Link</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenCreate}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Plus className="h-4 w-4" />
              <span>New Service</span>
            </Button>
          </div>
        }
      />

      {/* Public Booking Link Banner Card */}
      <Card className="border-border/80 from-card via-card overflow-hidden bg-gradient-to-r to-blue-50/20 shadow-xs transition-all hover:border-blue-500/30 dark:to-blue-950/20">
        <CardContent className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 md:flex-row md:items-center">
          <div className="flex w-full min-w-0 items-start gap-3 sm:items-center sm:gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm sm:h-11 sm:w-11">
              <Zap className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <p className="text-foreground text-sm font-bold tracking-tight">
                  Live Client Self-Scheduling Gateway
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-medium">Direct Portal:</span>
                <span className="border-border/60 bg-muted/50 text-primary max-w-[210px] truncate rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold sm:max-w-xs sm:text-[11px] md:max-w-md">
                  {publicBookingUrl}
                </span>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyBookingLink}
              className="border-border/80 bg-background/80 hover:bg-muted/60 h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition sm:h-8.5"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              className="border-border/80 bg-background/80 hover:bg-muted/60 h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition sm:h-8.5"
            >
              <QrCode className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>QR Flyer</span>
            </Button>
            <Link
              href={`/book/${publicBookingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-50 px-3.5 text-xs font-bold text-blue-700 shadow-2xs transition hover:bg-blue-100 sm:col-span-1 sm:h-8.5 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
            >
              <span>Preview Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Executive KPI Scorecards */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        {/* Metric 1: Active Services */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-xs">
          <CardContent className="space-y-2.5 p-4 sm:p-5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Active Catalog
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                {isClient ? kpis.activeCount : 0}
              </span>
              <span className="text-muted-foreground font-mono text-xs font-medium">
                / {isClient ? services.length : 0} published
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate text-[10px]">
                Instant client reservation
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                Ready
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Avg Ticket Rate */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-xs">
          <CardContent className="space-y-2.5 p-4 sm:p-5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Avg Ticket Yield
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                ${isClient ? kpis.avgPrice.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate text-[10px]">
                Baseline session value
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                Revenue
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Protected Buffer */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-xs">
          <CardContent className="space-y-2.5 p-4 sm:p-5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Conflict Guard
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                {isClient ? kpis.avgBuffer : 0}m
              </span>
              <span className="text-muted-foreground font-mono text-xs font-medium">
                breathing room
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate text-[10px]">
                Prep &amp; transition window
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                Conflict Safe
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Bookings Delivered */}
        <Card className="border-border/80 from-card to-card/90 bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-xs">
          <CardContent className="space-y-2.5 p-4 sm:p-5">
            <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Client Deliveries
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-foreground font-mono text-2xl font-black tracking-tight sm:text-3xl">
                {isClient ? kpis.totalAppointments : 0}
              </span>
              <span className="text-muted-foreground font-mono text-xs font-medium">booked</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate text-[10px]">
                Direct client engagements
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                Delivered
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Category Tabs, Filters, and View Toggle */}
      <div className="space-y-3">
        <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          {/* Search Bar */}
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search services by title, description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/80 bg-background text-foreground focus:border-primary h-10 rounded-xl pr-12 pl-10 text-xs shadow-2xs transition sm:text-sm"
            />
            <span className="border-border/70 bg-muted/60 text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold">
              ⌘K
            </span>
          </div>

          {/* Duration Filters & View Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="border-border/80 bg-muted/40 flex items-center rounded-xl border p-1 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setDurationFilter("ALL")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  durationFilter === "ALL"
                    ? "bg-background text-foreground border-border/60 border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Durations
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("SHORT")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  durationFilter === "SHORT"
                    ? "bg-background text-foreground border-border/60 border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                &lt; 30m
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("MEDIUM")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  durationFilter === "MEDIUM"
                    ? "bg-background text-foreground border-border/60 border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                30–60m
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("LONG")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  durationFilter === "LONG"
                    ? "bg-background text-foreground border-border/60 border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                &gt; 60m
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="border-border/80 bg-muted/40 text-muted-foreground flex items-center rounded-xl border p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-foreground border-border/60 border shadow-xs"
                    : "hover:text-foreground"
                }`}
                title="Grid View"
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-background text-foreground border-border/60 border shadow-xs"
                    : "hover:text-foreground"
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-1.5 font-semibold transition-all ${
              selectedCategory === "ALL"
                ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                : "border-border/80 bg-card text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40 shadow-2xs"
            }`}
          >
            All Categories ({isClient ? services.length : 0})
          </button>
          {isClient &&
            categories.map((cat) => {
              const count = services.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 cursor-pointer rounded-xl border px-3.5 py-1.5 font-semibold transition-all ${
                    selectedCategory === cat
                      ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                      : "border-border/80 bg-card text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40 shadow-2xs"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Content Area */}
      {isActuallyLoading ? (
        <div className="space-y-3 py-20 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground text-xs font-semibold">Loading services catalog...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <Card className="border-border/80 bg-card/60 p-12 text-center shadow-2xs">
          <CardContent className="space-y-4">
            <div className="bg-primary/10 text-primary border-primary/20 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-bold">No Services Found</h3>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
                {searchQuery || selectedCategory !== "ALL" || durationFilter !== "ALL"
                  ? "No service offerings match the active filter criteria. Try resetting filters."
                  : "Your organization hasn't published any bookable services yet. Create your first offering to accept client bookings."}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenCreate}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create First Service
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className={`group border-border/80 from-card to-card/95 relative flex flex-col justify-between overflow-hidden bg-gradient-to-b shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/[0.08] ${
                service.isActive ? "" : "opacity-60"
              }`}
            >
              {/* Luxury Top Accent Line */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-70 transition-opacity group-hover:opacity-100" />

              <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
                <div>
                  {/* Card Top: Category, Status & Price */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                      {service.category || "General"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          service.isActive
                            ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                            : "bg-slate-400"
                        }`}
                        title={service.isActive ? "Active in Catalog" : "Inactive / Archived"}
                      />
                      <span className="text-foreground font-mono text-xl font-black tracking-tight">
                        ${service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Service Name & Description */}
                  <h3
                    onClick={() => setSelectedServiceForPeek(service)}
                    className="text-foreground group-hover:text-primary mt-2.5 cursor-pointer text-base font-bold transition-colors"
                  >
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 line-clamp-2 min-h-[34px] text-xs leading-relaxed">
                    {service.description || "No description provided for this service offering."}
                  </p>

                  {/* Interactive Visual Timeline Allocation Bar */}
                  <div className="border-border/60 bg-muted/30 mt-3.5 space-y-1.5 rounded-xl border p-2.5">
                    <div className="text-muted-foreground flex items-center justify-between text-[10px] font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="text-primary h-3 w-3" />
                        Timeline Protection
                      </span>
                      <span className="text-foreground font-mono text-[10px] font-bold">
                        Total{" "}
                        {service.durationMinutes +
                          (service.bufferBefore || 0) +
                          (service.bufferAfter || 0)}
                        m
                      </span>
                    </div>
                    <div className="flex h-5 w-full items-center gap-1 overflow-hidden rounded-md text-center text-[9px] font-bold">
                      {service.bufferBefore > 0 && (
                        <div
                          style={{ flex: service.bufferBefore }}
                          className="flex h-full items-center justify-center rounded border border-blue-500/20 bg-blue-500/15 px-1 font-mono text-blue-700 dark:text-blue-300"
                          title={`Setup buffer: ${service.bufferBefore}m`}
                        >
                          +{service.bufferBefore}m Prep
                        </div>
                      )}
                      <div
                        style={{ flex: service.durationMinutes }}
                        className="bg-primary text-primary-foreground flex h-full items-center justify-center rounded px-1.5 font-mono font-bold shadow-2xs"
                        title={`Session duration: ${service.durationMinutes}m`}
                      >
                        {service.durationMinutes}m Session
                      </div>
                      {service.bufferAfter > 0 && (
                        <div
                          style={{ flex: service.bufferAfter }}
                          className="flex h-full items-center justify-center rounded border border-emerald-500/20 bg-emerald-500/15 px-1 font-mono text-emerald-700 dark:text-emerald-300"
                          title={`Cleanup buffer: ${service.bufferAfter}m`}
                        >
                          +{service.bufferAfter}m Wrap
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deposit Requirement Badge */}
                  {service.requireDeposit && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Deposit Required:{" "}
                        {service.depositType === "PERCENTAGE"
                          ? `${service.depositAmount}% ($${((service.price * (service.depositAmount || 0)) / 100).toFixed(2)})`
                          : `$${Number(service.depositAmount).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Assigned Specialists & Actions */}
                <div className="border-border/70 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Users className="text-muted-foreground h-3.5 w-3.5" />
                    {service.staffMembers && service.staffMembers.length > 0 ? (
                      <div className="flex items-center -space-x-1.5">
                        {service.staffMembers.slice(0, 3).map((sm) => (
                          <div
                            key={sm.id}
                            title={`${sm.name} (${sm.roleTitle})`}
                            className={`border-background flex h-6.5 w-6.5 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white shadow-2xs ${
                              sm.avatarBg || "bg-blue-600"
                            }`}
                          >
                            {sm.initials}
                          </div>
                        ))}
                        {service.staffMembers.length > 3 && (
                          <span className="text-muted-foreground pl-2 text-[10px] font-semibold">
                            +{service.staffMembers.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px] font-medium">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedServiceForPeek(service)}
                      className="text-muted-foreground hover:text-foreground h-7.5 cursor-pointer px-2.5 text-xs"
                    >
                      Quick Peek
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(service)}
                      className="text-primary hover:text-primary/80 h-7.5 cursor-pointer px-2.5 text-xs font-bold"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border/80 bg-muted/40 text-muted-foreground border-b font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Service Offering</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Full Fee</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Buffer Window</th>
                  <th className="px-4 py-3.5">Deposit</th>
                  <th className="px-4 py-3.5">Specialists</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedServiceForPeek(service)}
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-foreground text-sm font-bold">{service.name}</p>
                      <p className="text-muted-foreground max-w-xs truncate text-[11px]">
                        {service.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                        {service.category || "General"}
                      </span>
                    </td>
                    <td className="text-foreground px-4 py-3.5 font-mono text-sm font-black">
                      ${service.price.toFixed(2)}
                    </td>
                    <td className="text-foreground px-4 py-3.5 font-semibold">
                      {service.durationMinutes} mins
                    </td>
                    <td className="px-4 py-3.5">
                      {service.bufferBefore + service.bufferAfter > 0 ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          +{service.bufferBefore + service.bufferAfter}m
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {service.requireDeposit ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {service.depositType === "PERCENTAGE"
                            ? `${service.depositAmount}%`
                            : `$${service.depositAmount}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {service.staffMembers?.length ? (
                        <span className="text-foreground font-semibold">
                          {service.staffMembers.length} assigned
                        </span>
                      ) : (
                        <span className="text-muted-foreground">All / Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          service.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            service.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {service.isActive ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(service)}
                        className="text-primary hover:text-primary/80 h-7.5 cursor-pointer px-2.5 text-xs font-bold"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Builder Modal (Create / Edit) */}
      <ServiceBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        serviceToEdit={serviceToEdit}
      />

      {/* Quick Peek Drawer */}
      <ServiceQuickPeekDrawer
        service={selectedServiceForPeek}
        isOpen={Boolean(selectedServiceForPeek)}
        onClose={() => setSelectedServiceForPeek(null)}
        onOpenEdit={handleOpenEdit}
      />

      {/* QR Code Flyer Modal */}
      <QrCodeFlyerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        organizationName={organizationName || "FlowPilot Business"}
        bookingUrl={publicBookingUrl}
      />
    </div>
  );
}

function QrCodeFlyerModal({
  isOpen,
  onClose,
  organizationName,
  bookingUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  bookingUrl: string;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm duration-200">
      <div className="border-border/80 bg-card relative w-full max-w-sm overflow-hidden rounded-3xl border p-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 cursor-pointer rounded-xl p-1.5"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
          <QrCode className="h-5 w-5" />
        </div>

        <h3 className="text-foreground mt-3 text-lg font-bold">{organizationName}</h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Scan with your smartphone camera to book directly
        </p>

        {/* High-res SVG QR Graphic */}
        <div className="border-border/80 mx-auto my-5 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed bg-white p-3.5 shadow-inner">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full text-slate-900"
            fill="currentColor"
            shapeRendering="crispEdges"
          >
            {/* Corner 1 */}
            <rect
              x="5"
              y="5"
              width="28"
              height="28"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <rect x="12" y="12" width="14" height="14" rx="2" fill="currentColor" />
            {/* Corner 2 */}
            <rect
              x="67"
              y="5"
              width="28"
              height="28"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <rect x="74" y="12" width="14" height="14" rx="2" fill="currentColor" />
            {/* Corner 3 */}
            <rect
              x="5"
              y="67"
              width="28"
              height="28"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <rect x="12" y="74" width="14" height="14" rx="2" fill="currentColor" />
            {/* Sync bars */}
            <rect x="38" y="14" width="24" height="4" fill="currentColor" />
            <rect x="14" y="38" width="4" height="24" fill="currentColor" />
            {/* Simulated Data Matrix Modules */}
            <rect x="42" y="24" width="6" height="6" fill="currentColor" />
            <rect x="52" y="24" width="6" height="6" fill="currentColor" />
            <rect x="42" y="36" width="16" height="16" rx="2" fill="currentColor" />
            <rect x="64" y="38" width="8" height="8" fill="currentColor" />
            <rect x="76" y="42" width="8" height="8" fill="currentColor" />
            <rect x="38" y="62" width="10" height="10" fill="currentColor" />
            <rect x="54" y="56" width="8" height="8" fill="currentColor" />
            <rect x="68" y="68" width="12" height="12" fill="currentColor" />
            <rect x="84" y="68" width="8" height="8" fill="currentColor" />
            <rect x="68" y="84" width="8" height="8" fill="currentColor" />
            <rect x="80" y="80" width="12" height="12" rx="2" fill="currentColor" />
          </svg>
        </div>

        <p className="text-muted-foreground px-2 font-mono text-[11px] break-all">{bookingUrl}</p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 cursor-pointer rounded-xl text-xs font-semibold"
          >
            {copied ? "Copied!" : "Copy URL"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs"
          >
            Print Flyer
          </Button>
        </div>
      </div>
    </div>
  );
}
