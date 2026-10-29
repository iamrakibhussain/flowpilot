"use client";

import * as React from "react";
import {
  X,
  Send,
  ShieldCheck,
  Mail,
  UserPlus,
  Copy,
  Check,
  Briefcase,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendTeamInvitation } from "@/features/team/use-team";
import { useStaff } from "@/features/staff/use-staff";
import type { Role, TeamInvitationItem } from "@/features/team/types";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStaffMemberId?: string;
  defaultEmail?: string;
}

const ROLES_INFO: Array<{
  role: Role;
  label: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = [
  {
    role: "ADMIN",
    label: "Administrator",
    badge: "Full Ops Control",
    desc: "Can manage specialists, services, clients, calendar, and invite team members.",
    icon: ShieldCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
  },
  {
    role: "MEMBER",
    label: "Specialist / Member",
    badge: "Service Delivery",
    desc: "Can access assigned client appointments, manage personal status, and deliver sessions.",
    icon: Briefcase,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
  },
  {
    role: "BILLING",
    label: "Billing Manager",
    badge: "Financial Access",
    desc: "Can view and manage customer invoices, payment transactions, and financial reports.",
    icon: Receipt,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
];

export function InviteMemberModal({
  isOpen,
  onClose,
  defaultStaffMemberId,
  defaultEmail,
}: InviteMemberModalProps) {
  const sendInviteMutation = useSendTeamInvitation();
  const { data: staffList = [] } = useStaff();

  const [email, setEmail] = React.useState(defaultEmail || "");
  const [role, setRole] = React.useState<Role>("MEMBER");
  const [staffMemberId, setStaffMemberId] = React.useState(defaultStaffMemberId || "");
  const [error, setError] = React.useState<string | null>(null);

  // Success state with copy link
  const [sentInvitation, setSentInvitation] = React.useState<TeamInvitationItem | null>(null);
  const [hasCopied, setHasCopied] = React.useState(false);

  // Sync state when props change during render without triggering effect lint errors
  const [prevDefaultEmail, setPrevDefaultEmail] = React.useState(defaultEmail);
  const [prevDefaultStaffId, setPrevDefaultStaffId] = React.useState(defaultStaffMemberId);

  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    setEmail(defaultEmail || "");
  }
  if (defaultStaffMemberId !== prevDefaultStaffId) {
    setPrevDefaultStaffId(defaultStaffMemberId);
    setStaffMemberId(defaultStaffMemberId || "");
  }

  // Reset state on close
  const handleModalClose = React.useCallback(() => {
    setSentInvitation(null);
    setHasCopied(false);
    setError(null);
    onClose();
  }, [onClose]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleModalClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please provide a valid email address");
      return;
    }

    try {
      const result = await sendInviteMutation.mutateAsync({
        email: email.trim(),
        role,
        staffMemberId: staffMemberId || undefined,
      });

      setSentInvitation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch invitation";
      setError(msg);
    }
  };

  const handleCopyLink = () => {
    if (!sentInvitation?.acceptUrl) return;
    navigator.clipboard.writeText(sentInvitation.acceptUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2.5 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={handleModalClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="border-border/80 bg-background relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all sm:rounded-3xl">
        {/* Header */}
        <div className="border-border/80 bg-card/60 flex shrink-0 items-center justify-between border-b px-4 py-3.5 sm:px-6 sm:py-4.5">
          <div className="flex min-w-0 items-center gap-2.5 pr-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-foreground truncate text-sm font-bold sm:text-base">
                Invite Colleague to Workspace
              </h2>
              <p className="text-muted-foreground truncate text-[11px] sm:text-xs">
                Grant role-based access to dashboard & calendar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="text-foreground hover:bg-muted border-border/80 bg-muted/30 shrink-0 cursor-pointer rounded-xl border p-2 transition active:scale-95"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {sentInvitation ? (
          /* Post-Invite Success & Quick-Copy View */
          <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs sm:space-y-5 sm:p-6">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-foreground text-base font-bold">Invitation Dispatched!</h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed">
                An invitation email with secure access instructions was delivered to{" "}
                <strong className="text-foreground">{sentInvitation.email}</strong> as{" "}
                <strong className="text-blue-600 uppercase dark:text-blue-400">
                  {sentInvitation.role}
                </strong>
                .
              </p>
            </div>

            {sentInvitation.acceptUrl && (
              <div className="border-border/70 bg-surface/70 space-y-2 rounded-2xl border p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-[11px] font-bold">
                    One-Click Invitation Link (Optional)
                  </span>
                  <span className="text-muted-foreground text-[10px]">Valid for 7 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    readOnly
                    value={sentInvitation.acceptUrl}
                    className="border-border/80 bg-background text-muted-foreground font-mono text-[11px] shadow-2xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyLink}
                    className="cursor-pointer gap-1.5 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  Share this link directly on Slack, WhatsApp, or Teams if you wish to bypass email
                  delivery.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleModalClose}
                className="bg-foreground text-background w-full cursor-pointer rounded-xl px-6 text-xs font-bold hover:opacity-90 sm:w-auto"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Main Invitation Form */
          <form
            onSubmit={handleSubmit}
            className="flex-1 space-y-4 overflow-y-auto p-4 text-xs sm:p-6"
          >
            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Recipient Email <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="colleague@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl pl-9 text-xs shadow-2xs"
                />
              </div>
            </div>

            {/* Role Selection Radio Cards */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Permission Role</Label>
              <div className="space-y-2">
                {ROLES_INFO.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.role;
                  return (
                    <label
                      key={r.role}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-150 ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/5 shadow-xs ring-1 ring-blue-500/30"
                          : "border-border/70 hover:bg-muted/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.role}
                        checked={isSelected}
                        onChange={() => setRole(r.role)}
                        className="mt-0.5 h-4 w-4 text-blue-600"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-md ${r.bg} ${r.color}`}
                            >
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="text-foreground font-bold">{r.label}</span>
                          </div>
                          <span
                            className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold ${r.bg} ${r.border} ${r.color}`}
                          >
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                          {r.desc}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional: Link to Existing Staff Specialist */}
            {role === "MEMBER" && staffList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold">
                  Link to Specialist Profile{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <select
                  value={staffMemberId}
                  onChange={(e) => setStaffMemberId(e.target.value)}
                  className="bg-background border-border text-foreground w-full rounded-xl border p-2.5 text-xs font-medium shadow-2xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Auto-match by email or leave unlinked</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Footer Actions */}
            <div className="border-border/80 flex flex-col-reverse items-center justify-end gap-2.5 border-t pt-4 sm:flex-row sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleModalClose}
                className="border-border w-full cursor-pointer rounded-xl text-xs font-semibold sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={sendInviteMutation.isPending}
                className="w-full cursor-pointer gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {sendInviteMutation.isPending ? "Dispatching..." : "Dispatch Invitation"}
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
