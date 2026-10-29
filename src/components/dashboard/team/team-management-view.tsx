"use client";

import * as React from "react";
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Clock,
  Trash2,
  AlertCircle,
  Users,
  Briefcase,
  ShieldAlert,
  Search,
  Crown,
  Receipt,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  useTeamMembers,
  useTeamInvitations,
  useUpdateMemberRole,
  useRemoveTeamMember,
  useRevokeTeamInvitation,
} from "@/features/team/use-team";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import { InviteMemberModal } from "@/components/dashboard/team/invite-member-modal";
import type { Role, TeamMemberItem } from "@/features/team/types";

const ROLE_CONFIG: Record<
  Role,
  {
    label: string;
    badge: string;
    desc: string;
    color: string;
    border: string;
    bg: string;
    icon: React.ElementType;
    capabilities: string[];
  }
> = {
  OWNER: {
    label: "Workspace Owner",
    badge: "Full Custody",
    desc: "Complete administrative custody, workspace deletion, billing & multi-tenant configuration.",
    color: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/25",
    bg: "bg-purple-500/10",
    icon: Crown,
    capabilities: [
      "Workspace Deletion",
      "Subscription & Billing",
      "Invite & Remove All",
      "All Features",
    ],
  },
  ADMIN: {
    label: "Administrator",
    badge: "Operations Lead",
    desc: "Manages specialist roster, service catalog, client schedules, and team invitations.",
    color: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/25",
    bg: "bg-blue-500/10",
    icon: ShieldCheck,
    capabilities: ["Manage Specialists", "Manage Services", "Client Scheduling", "Invite Members"],
  },
  MEMBER: {
    label: "Specialist / Member",
    badge: "Service Delivery",
    desc: "Delivers sessions, views assigned client appointments, and updates live shift availability.",
    color: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/10",
    icon: Briefcase,
    capabilities: [
      "Assigned Appointments",
      "Shift Availability",
      "Client Quick Peek",
      "Portal Access",
    ],
  },
  BILLING: {
    label: "Billing Manager",
    badge: "Financial Ops",
    desc: "Oversees customer invoices, payment transactions, refunds, and financial reporting.",
    color: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/25",
    bg: "bg-amber-500/10",
    icon: Receipt,
    capabilities: [
      "Create & Send Invoices",
      "Payment Transactions",
      "Refunds & Ledger",
      "Financial Reports",
    ],
  },
};

export function TeamManagementView() {
  const { organizationId, session, organizationRole } = useWorkspaceSession();
  const currentUserId = session?.user?.id;
  const isOwnerOrAdmin = organizationRole === "OWNER" || organizationRole === "ADMIN";

  const { data: members = [], isLoading: isLoadingMembers } = useTeamMembers(organizationId);
  const { data: invitations = [], isLoading: isLoadingInvites } =
    useTeamInvitations(organizationId);

  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveTeamMember();
  const revokeInviteMutation = useRevokeTeamInvitation();

  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<TeamMemberItem | null>(null);
  const [selectedMemberForProfile, setSelectedMemberForProfile] =
    React.useState<TeamMemberItem | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedMemberForProfile) setSelectedMemberForProfile(null);
        if (memberToRemove) setMemberToRemove(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMemberForProfile, memberToRemove]);

  // Search & Filter State
  const [memberSearch, setMemberSearch] = React.useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<Role | "ALL">("ALL");

  const filteredMembers = React.useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (m.staffProfile?.roleTitle || "").toLowerCase().includes(memberSearch.toLowerCase());
      const matchesRole = selectedRoleFilter === "ALL" || m.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, memberSearch, selectedRoleFilter]);

  const handleRoleChange = async (membershipId: string, newRole: Role) => {
    setActionError(null);
    try {
      await updateRoleMutation.mutateAsync({ membershipId, role: newRole });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      setActionError(msg);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setActionError(null);
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove member";
      setActionError(msg);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    setActionError(null);
    try {
      await revokeInviteMutation.mutateAsync(invitationId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke invitation";
      setActionError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="border-border/70 flex flex-col justify-between gap-4 rounded-3xl border bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent p-5 shadow-xs sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-base font-bold tracking-tight">
                Role-Based Access Control (RBAC) & Team Directory
              </h2>
              <p className="text-muted-foreground text-xs">
                Manage authorized workspace users, system access tiers, and pending cryptographic
                invitations.
              </p>
            </div>
          </div>
        </div>

        {isOwnerOrAdmin && (
          <Button
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 sm:w-auto sm:self-center"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Colleague</span>
          </Button>
        )}
      </div>

      {actionError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2.5 rounded-xl border p-3.5 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Role Permission Matrix Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => {
          const meta = ROLE_CONFIG[r];
          const Icon = meta.icon;
          const memberCount = members.filter((m) => m.role === r).length;

          return (
            <Card
              key={r}
              className="border-border/70 from-card to-card/90 hover:border-border bg-gradient-to-b shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs"
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-foreground text-xs font-bold">{meta.label}</span>
                  </div>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                    {memberCount} active
                  </span>
                </div>

                <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                  {meta.desc}
                </p>

                {/* Capability Chips */}
                <div className="border-border/60 border-t pt-2.5">
                  <span className="text-muted-foreground mb-1.5 block text-[9px] font-bold tracking-wider uppercase">
                    Core Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {meta.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${meta.bg} ${meta.border} ${meta.color}`}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Invitations Section */}
      <div className="border-border/70 bg-card space-y-3.5 rounded-3xl border p-5 shadow-2xs sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Pending Invitations
                </h3>
                <span className="py-0.2 rounded-full bg-amber-500/10 px-2 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {invitations.length}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Cryptographic one-time links with 7-day automated expiration
              </p>
            </div>
          </div>
        </div>

        {isLoadingInvites ? (
          <div className="text-muted-foreground py-8 text-center text-xs">
            Loading pending invitations...
          </div>
        ) : invitations.length === 0 ? (
          <div className="border-border/50 bg-muted/20 rounded-2xl border border-dashed py-7 text-center">
            <Clock className="text-muted-foreground mx-auto h-7 w-7 opacity-30" />
            <p className="text-muted-foreground mt-2 text-xs font-medium">
              No pending invitations for this workspace.
            </p>
          </div>
        ) : (
          <div className="divide-border/60 border-border/60 divide-y overflow-hidden rounded-2xl border">
            {invitations.map((inv) => {
              const roleMeta = ROLE_CONFIG[inv.role] || ROLE_CONFIG.MEMBER;
              const RoleIcon = roleMeta.icon;

              return (
                <div
                  key={inv.id}
                  className="bg-card hover:bg-muted/30 flex flex-col justify-between gap-3 p-3.5 transition sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-xs font-bold">{inv.email}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold ${roleMeta.bg} ${roleMeta.border} ${roleMeta.color}`}
                        >
                          <RoleIcon className="h-2.5 w-2.5" />
                          {roleMeta.label}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-[10px]">
                        <span>
                          Invited by: <strong>{inv.inviterName}</strong>
                        </span>
                        {inv.staffMemberName && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              Linked Specialist: {inv.staffMemberName}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span suppressHydrationWarning className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires:{" "}
                          {new Date(inv.expiresAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwnerOrAdmin && (
                    <div className="border-border/40 flex w-full items-center justify-end gap-2 border-t pt-2 sm:w-auto sm:border-0 sm:pt-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeInvite(inv.id)}
                        disabled={revokeInviteMutation.isPending}
                        className="text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5 rounded-xl text-xs font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Revoke</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Team Members Directory */}
      <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-5 shadow-2xs sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Active Workspace Directory
                </h3>
                <span className="bg-primary/10 text-primary py-0.2 rounded-full px-2 font-mono text-[10px] font-bold">
                  {members.length}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Authenticated multi-tenant accounts with active permissions
              </p>
            </div>
          </div>

          {/* Member Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-3.5 w-3.5" />
            <Input
              type="text"
              placeholder="Search member by name/email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="border-border/80 bg-background/90 h-8.5 rounded-xl pl-8.5 text-xs shadow-2xs"
            />
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1">
          {(["ALL", "OWNER", "ADMIN", "MEMBER", "BILLING"] as const).map((r) => {
            const count = r === "ALL" ? members.length : members.filter((m) => m.role === r).length;
            const active = selectedRoleFilter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRoleFilter(r)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-foreground text-background shadow-xs"
                    : "border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border"
                }`}
              >
                <span>{r === "ALL" ? "All Roles" : ROLE_CONFIG[r].label}</span>
                <span
                  className={`py-0.2 rounded-full px-1.5 font-mono text-[9px] ${
                    active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {isLoadingMembers ? (
          <div className="text-muted-foreground py-8 text-center text-xs">
            Loading team members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="border-border/50 bg-muted/20 rounded-2xl border border-dashed py-8 text-center">
            <Users className="text-muted-foreground mx-auto h-8 w-8 opacity-30" />
            <p className="text-muted-foreground mt-2 text-xs font-medium">
              No team members match your current search or filter.
            </p>
          </div>
        ) : (
          <div className="divide-border/60 border-border/60 divide-y overflow-hidden rounded-2xl border">
            {filteredMembers.map((member) => {
              const roleMeta = ROLE_CONFIG[member.role] || ROLE_CONFIG.MEMBER;
              const RoleIcon = roleMeta.icon;
              const isSelf = member.userId === currentUserId;
              const isOwner = member.role === "OWNER";
              const canEditRole = isOwnerOrAdmin && !isOwner && !isSelf;
              const canRemove = isOwnerOrAdmin && !isOwner && !isSelf;

              const initials =
                member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U";

              return (
                <div
                  key={member.id}
                  className="bg-card hover:bg-muted/30 flex flex-col justify-between gap-3 p-4 transition sm:flex-row sm:items-center"
                >
                  <div
                    className="group flex min-w-0 flex-1 cursor-pointer items-center gap-3.5"
                    onClick={() => setSelectedMemberForProfile(member)}
                    title="Click to view member profile"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-sm transition group-hover:scale-105 ${
                        member.staffProfile?.avatarBg ||
                        "bg-gradient-to-br from-blue-600 to-indigo-700"
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground truncate text-xs font-bold transition group-hover:text-blue-600">
                          {member.name}
                        </span>
                        {isSelf && (
                          <span className="border-border/80 bg-muted/60 text-foreground py-0.2 shrink-0 rounded-md border px-1.5 text-[9px] font-bold">
                            You
                          </span>
                        )}
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold ${roleMeta.bg} ${roleMeta.border} ${roleMeta.color}`}
                        >
                          <RoleIcon className="h-2.5 w-2.5" />
                          {roleMeta.label}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="truncate">{member.email}</span>
                        <span>•</span>
                        <span suppressHydrationWarning>
                          Joined{" "}
                          {new Date(member.joinedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {member.staffProfile && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Specialist: {member.staffProfile.roleTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-border/40 flex w-full items-center justify-between gap-2 border-t pt-2.5 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
                    {/* View Profile Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMemberForProfile(member)}
                      className="border-border/80 h-8.5 shrink-0 cursor-pointer rounded-xl px-2.5 text-xs font-semibold"
                      title="View Member Profile"
                    >
                      <span>Profile</span>
                    </Button>

                    {/* Role Selector */}
                    {canEditRole ? (
                      <div className="relative flex-1 sm:flex-none">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                          disabled={updateRoleMutation.isPending}
                          className="border-border/80 bg-background text-foreground h-8.5 w-full cursor-pointer rounded-xl border px-3 text-xs font-semibold shadow-2xs focus:border-blue-500 focus:outline-none sm:w-auto"
                        >
                          <option value="ADMIN">Administrator</option>
                          <option value="MEMBER">Specialist / Member</option>
                          <option value="BILLING">Billing Manager</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs font-medium">
                        {isOwner ? "Workspace Custodian" : roleMeta.label}
                      </span>
                    )}

                    {/* Remove Member Button */}
                    {canRemove && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMemberToRemove(member)}
                        disabled={removeMemberMutation.isPending}
                        className="text-destructive hover:bg-destructive/10 h-8.5 shrink-0 cursor-pointer rounded-xl px-2.5 text-xs font-semibold"
                        title="Revoke workspace access"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* Team Member Profile Modal */}
      {selectedMemberForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2.5 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedMemberForProfile(null)}
            aria-hidden="true"
          />

          <div className="border-border/80 bg-background relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all sm:rounded-3xl">
            {/* Header */}
            <div className="border-border/80 bg-card/60 flex shrink-0 items-center justify-between border-b px-4 py-3.5 sm:px-6 sm:py-4.5">
              <div className="flex min-w-0 items-center gap-3 pr-2">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-sm sm:h-12 sm:w-12 ${
                    selectedMemberForProfile.staffProfile?.avatarBg ||
                    "bg-gradient-to-br from-blue-600 to-indigo-700"
                  }`}
                >
                  {selectedMemberForProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-foreground truncate text-sm font-bold sm:text-base">
                    {selectedMemberForProfile.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-muted-foreground truncate text-[11px] sm:text-xs">
                      {selectedMemberForProfile.email}
                    </span>
                    {selectedMemberForProfile.userId === currentUserId && (
                      <span className="border-border/80 bg-muted/60 text-foreground py-0.2 rounded-md border px-1.5 text-[8.5px] font-bold">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberForProfile(null)}
                className="text-foreground hover:bg-muted border-border/80 bg-muted/30 shrink-0 cursor-pointer rounded-xl border p-2 transition active:scale-95"
                aria-label="Close modal"
                title="Close (Esc)"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Profile Body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs sm:p-6">
              {/* Role & Permissions Card */}
              <div className="border-border/80 bg-surface/70 space-y-3 rounded-2xl border p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                    Assigned Workspace Role
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                      ROLE_CONFIG[selectedMemberForProfile.role].bg
                    } ${ROLE_CONFIG[selectedMemberForProfile.role].border} ${
                      ROLE_CONFIG[selectedMemberForProfile.role].color
                    }`}
                  >
                    {ROLE_CONFIG[selectedMemberForProfile.role].label}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {ROLE_CONFIG[selectedMemberForProfile.role].desc}
                </p>

                {/* Role Switcher if current user can edit role */}
                {isOwnerOrAdmin &&
                  selectedMemberForProfile.role !== "OWNER" &&
                  selectedMemberForProfile.userId !== currentUserId && (
                    <div className="border-border/60 space-y-1.5 border-t pt-3">
                      <label className="text-foreground text-[11px] font-semibold">
                        Change Workspace Access Role
                      </label>
                      <select
                        value={selectedMemberForProfile.role}
                        onChange={async (e) => {
                          const newRole = e.target.value as Role;
                          await handleRoleChange(selectedMemberForProfile.id, newRole);
                          setSelectedMemberForProfile({
                            ...selectedMemberForProfile,
                            role: newRole,
                          });
                        }}
                        disabled={updateRoleMutation.isPending}
                        className="bg-background border-border/80 text-foreground w-full rounded-xl border p-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                      >
                        <option value="ADMIN">Administrator (Full Ops Control)</option>
                        <option value="MEMBER">Specialist / Member (Appointments & Roster)</option>
                        <option value="BILLING">Billing Manager (Invoices & Payments)</option>
                      </select>
                    </div>
                  )}
              </div>

              {/* Linked Specialist Profile */}
              {selectedMemberForProfile.staffProfile ? (
                <div className="border-border/80 space-y-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-foreground text-xs font-bold">
                        Linked Specialist Operations Profile
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Active Specialist
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-foreground font-semibold">
                      {selectedMemberForProfile.staffProfile.roleTitle}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Operational Status:{" "}
                      <span className="text-foreground font-medium capitalize">
                        {selectedMemberForProfile.staffProfile.status
                          .toLowerCase()
                          .replace("_", " ")}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-border/70 bg-muted/20 space-y-2 rounded-2xl border p-4">
                  <span className="text-foreground block text-xs font-semibold">
                    No Specialist Deliverable Profile Linked
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    This user functions as a workspace collaborator. You can link them to a
                    specialist profile when onboarding staff.
                  </p>
                </div>
              )}

              {/* Membership Metadata */}
              <div className="border-border/70 space-y-2 rounded-2xl border p-4 text-[11px]">
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Joined Organization</span>
                  <span className="text-foreground font-medium" suppressHydrationWarning>
                    {new Date(selectedMemberForProfile.joinedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Member Record ID</span>
                  <code className="text-foreground font-mono text-[10px]">
                    {selectedMemberForProfile.id.slice(0, 12)}...
                  </code>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-border/80 bg-surface/90 flex shrink-0 flex-col items-center justify-between gap-2.5 border-t px-4 py-3 sm:flex-row sm:px-6 sm:py-3.5">
              {isOwnerOrAdmin &&
              selectedMemberForProfile.role !== "OWNER" &&
              selectedMemberForProfile.userId !== currentUserId ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toRemove = selectedMemberForProfile;
                    setSelectedMemberForProfile(null);
                    setMemberToRemove(toRemove);
                  }}
                  className="w-full cursor-pointer rounded-xl border-rose-500/30 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 sm:w-auto"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  <span>Revoke Access</span>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMemberForProfile(null)}
                className="border-border w-full cursor-pointer rounded-xl text-xs font-semibold sm:w-auto"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMemberToRemove(null)}
          />
          <div className="border-border bg-card relative z-10 mx-3 w-full max-w-md rounded-3xl border p-5 shadow-2xl sm:mx-0 sm:p-6">
            <div className="flex items-center gap-3 text-red-500">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-foreground text-sm font-bold">Revoke Workspace Access</h3>
                <p className="text-muted-foreground text-xs">Immediate authorization termination</p>
              </div>
            </div>

            <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{memberToRemove.name}</strong> (
              {memberToRemove.email}) from this workspace? They will lose access to all
              appointments, clients, and operational tools immediately.
            </p>

            <div className="mt-6 flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMemberToRemove(null)}
                className="w-full cursor-pointer rounded-xl text-xs font-semibold sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRemove}
                disabled={removeMemberMutation.isPending}
                className="w-full cursor-pointer rounded-xl bg-red-600 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 sm:w-auto"
              >
                {removeMemberMutation.isPending ? "Removing..." : "Confirm Revocation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
