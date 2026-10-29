"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Sparkles,
  CheckCircle2,
  CalendarPlus,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDashboardCustomersData,
  useOnDutyStaffData,
  useDashboardMutations,
} from "@/features/dashboard/use-dashboard";
import { useServices } from "@/features/services/use-services";

export interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAppointmentModal({ isOpen, onClose }: NewAppointmentModalProps) {
  const customersQuery = useDashboardCustomersData();
  const staffQuery = useOnDutyStaffData();
  const servicesQuery = useServices({ activeOnly: true });
  const { createAppointment } = useDashboardMutations();

  const [selectedClient, setSelectedClient] = React.useState<string>("");
  const [customClientName, setCustomClientName] = React.useState<string>("");

  const customers = customersQuery.data ?? [];
  const staffMembers = staffQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  const activeClient =
    customers.length > 0
      ? selectedClient === "__new__"
        ? customClientName
        : selectedClient || customers[0]?.name || ""
      : customClientName || selectedClient;

  const [selectedServiceId, setSelectedServiceId] = React.useState<string>("");
  const [fallbackService, setFallbackService] = React.useState("Strategy Audit (60 min • $500)");

  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  const [selectedStaff, setSelectedStaff] = React.useState<string>("");
  const activeStaff = selectedStaff || (staffMembers[0]?.name ?? "Account Specialist");

  const defaultDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [date, setDate] = React.useState(defaultDate);
  const [time, setTime] = React.useState("10:00");
  const [locationType, setLocationType] = React.useState("Google Meet (Auto-generated)");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleClose = () => {
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createAppointment({
        customerName: activeClient,
        serviceId: activeService?.id,
        serviceTitle: activeService ? activeService.name : fallbackService.split("(")[0].trim(),
        staffName: activeStaff.split("(")[0].trim(),
        date: date,
        time: time,
        locationType: locationType,
        durationMinutes: activeService?.durationMinutes ?? 60,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to schedule appointment. Please try again.";
      console.error("Appointment creation failed:", err);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg rounded-2xl border-slate-200/90 bg-white p-6 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <CalendarPlus className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Schedule Client Appointment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Book an operational engagement with real-time staff double-booking avoidance.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-3 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Appointment Confirmed!</h3>
            <p className="mx-auto max-w-sm text-xs text-slate-500">
              Booked with <span className="font-semibold text-slate-700">{activeClient}</span> on{" "}
              <span className="font-semibold text-slate-700">
                {date} at {time}
              </span>
              . Calendar invites dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Client selection */}
            <div className="space-y-1.5">
              <Label htmlFor="apt-client" className="text-xs font-semibold text-slate-700">
                Customer / Client Account
              </Label>
              {customers.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Users className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                    <select
                      id="apt-client"
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.tier ?? "Client"})
                        </option>
                      ))}
                      <option value="__new__">+ Enter New Customer...</option>
                    </select>
                  </div>
                  {selectedClient === "__new__" && (
                    <Input
                      placeholder="Type customer or client name"
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Users className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="apt-client"
                    placeholder="Enter Customer Name"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    className="h-10 pl-9 text-xs"
                    required
                  />
                </div>
              )}
            </div>

            {/* Service & Staff Selection */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="apt-service" className="text-xs font-semibold text-slate-700">
                  Service Package
                </Label>
                {services.length > 0 ? (
                  <select
                    id="apt-service"
                    value={activeService?.id ?? ""}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.durationMinutes} min • ${s.price})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    id="apt-service"
                    value={fallbackService}
                    onChange={(e) => setFallbackService(e.target.value)}
                    className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                  >
                    <option value="Strategy Audit (60 min • $500)">
                      Strategy Audit (60 min • $500)
                    </option>
                    <option value="Operations Review (90 min • $1,450)">
                      Operations Review (90 min • $1,450)
                    </option>
                    <option value="Workflow Consultation (45 min • $350)">
                      Workflow Consultation (45 min • $350)
                    </option>
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apt-staff" className="text-xs font-semibold text-slate-700">
                  Assigned Team Member
                </Label>
                <select
                  id="apt-staff"
                  value={activeStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                >
                  {staffMembers.length > 0 ? (
                    staffMembers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))
                  ) : (
                    <option value="General Specialist">General Specialist (Workspace Lead)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Date & Time selection */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="apt-date" className="text-xs font-semibold text-slate-700">
                  Appointment Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="apt-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apt-time" className="text-xs font-semibold text-slate-700">
                  Time Slot
                </Label>
                <div className="relative">
                  <Clock className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="apt-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Meeting Channel */}
            <div className="space-y-1.5">
              <Label htmlFor="apt-location" className="text-xs font-semibold text-slate-700">
                Meeting Channel / Room
              </Label>
              <div className="relative">
                <Video className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <select
                  id="apt-location"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-xs font-medium text-slate-800 shadow-2xs outline-none focus:ring-2"
                >
                  <option value="Google Meet (Auto-generated)">
                    Google Meet (Secure Auto-generated Link)
                  </option>
                  <option value="Zoom Meeting Room">Zoom Pro Bridge</option>
                  <option value="On-Site Office Suite B">
                    On-Site Office Suite B (Acme Headquarters)
                  </option>
                  <option value="Direct Phone Call">Direct Recorded Client Phone Call</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="from-primary rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                <span>Confirm & Lock Slot</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
