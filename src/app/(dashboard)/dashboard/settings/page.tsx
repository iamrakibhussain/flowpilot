"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  DollarSign,
  Calendar,
  Bell,
  Shield,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
  Save,
  RotateCcw,
  MailCheck,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Upload,
  History,
  Globe,
  Sun,
  Moon,
  Copy,
  Landmark,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getCurrentUser,
  changePassword,
  deleteAccount,
  requestPasswordReset,
  sendEmailVerification,
} from "@/features/auth/api";
import type { AuthSession } from "@/features/auth/types";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  useOrganizationSettings,
  useUpdateOrganizationSettings,
  useCheckSlug,
  useWorkspaceAuditLogs,
} from "@/features/organizations/use-organization-settings";
import type { UpdateOrganizationSettingsPayload } from "@/features/organizations/types";
import { ApiClientError } from "@/lib/api/errors";

// Supported Global Currencies
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar ($)" },
  { code: "EUR", symbol: "€", name: "Euro (€)" },
  { code: "GBP", symbol: "£", name: "British Pound (£)" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar ($)" },
  { code: "AUD", symbol: "AU$", name: "Australian Dollar ($)" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka (৳)" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen (¥)" },
  { code: "SGD", symbol: "SG$", name: "Singapore Dollar ($)" },
  { code: "AED", symbol: "AED", name: "UAE Dirham (AED)" },
];

// Common Business Timezones
const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New York (Eastern Time, ET)" },
  { value: "America/Chicago", label: "America/Chicago (Central Time, CT)" },
  { value: "America/Denver", label: "America/Denver (Mountain Time, MT)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (Pacific Time, PT)" },
  { value: "Europe/London", label: "Europe/London (GMT / BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET / CEST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +4)" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka (BST +6)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT +8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST +9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
];

// Password Change Schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Account Deletion Schema
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Your password is required to confirm account deletion"),
  confirmationText: z.string().min(1, 'Please type "DELETE" to confirm'),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

// Curated Luxury Enterprise Palettes
const BRAND_PALETTES = [
  { name: "Royal Cobalt", hex: "#2563eb", bg: "bg-blue-600" },
  { name: "Emerald Mint", hex: "#059669", bg: "bg-emerald-600" },
  { name: "Imperial Violet", hex: "#7c3aed", bg: "bg-purple-600" },
  { name: "Sunset Amber", hex: "#d97706", bg: "bg-amber-600" },
  { name: "Rose Crimson", hex: "#e11d48", bg: "bg-rose-600" },
  { name: "Titanium Slate", hex: "#475569", bg: "bg-slate-600" },
];

type SettingsTab = "general" | "finance" | "booking" | "notifications" | "security" | "audit";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { organizationRole, organizationName } = useWorkspaceSession();
  const isOwnerOrAdmin = organizationRole === "OWNER" || organizationRole === "ADMIN";

  const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedCname, setCopiedCname] = React.useState(false);

  // Settings Queries & Mutations
  const { data: settings, isLoading: isSettingsLoading } = useOrganizationSettings();
  const { data: auditLogs = [], isLoading: isAuditLoading } = useWorkspaceAuditLogs(30);
  const updateSettingsMutation = useUpdateOrganizationSettings();
  const checkSlugMutation = useCheckSlug();

  // Advanced Logo & Brand Asset States
  const [logoInputMode, setLogoInputMode] = React.useState<"upload" | "url">("upload");
  const [logoContrastMode, setLogoContrastMode] = React.useState<"light" | "dark">("light");
  const [isDraggingLogo, setIsDraggingLogo] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Financial safety confirmation for sensitive wire coordinates
  const [bankVerificationConfirmed, setBankVerificationConfirmed] = React.useState(false);

  // Local Form Draft State for Dirty Checking
  const [formData, setFormData] = React.useState<UpdateOrganizationSettingsPayload>({});
  const [isDirty, setIsDirty] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Slug verification state
  const [slugStatus, setSlugStatus] = React.useState<"idle" | "checking" | "available" | "taken">(
    "idle"
  );

  // Sync loaded settings into local form state
  React.useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name,
        slug: settings.slug,
        logoUrl: settings.logoUrl,
        tagline: settings.tagline,
        brandColor: settings.brandColor || "#2563eb",
        customDomain: settings.customDomain || "",
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address,
        bookingEnabled: settings.bookingEnabled,
        bookingTitle: settings.bookingTitle,
        bookingNotice: settings.bookingNotice,
        currency: settings.currency || "USD",
        timezone: settings.timezone || "UTC",
        taxId: settings.taxId,
        defaultTaxRate: settings.defaultTaxRate ?? 0,
        defaultPaymentTerms: settings.defaultPaymentTerms || "NET_15",
        invoiceFooter: settings.invoiceFooter,
        bankName: settings.bankName,
        bankAccount: settings.bankAccount,
        bankRouting: settings.bankRouting,
        bankSwift: settings.bankSwift,
        minNoticeHours: settings.minNoticeHours ?? 2,
        maxHorizonDays: settings.maxHorizonDays ?? 30,
        cancellationHours: settings.cancellationHours ?? 24,
        autoConfirmBookings: settings.autoConfirmBookings ?? true,
      });
      setIsDirty(false);
      setBankVerificationConfirmed(false);
    }
  }, [settings]);

  // Handle generic input change
  const handleFieldChange = (field: keyof UpdateOrganizationSettingsPayload, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
    setFeedbackMsg(null);
  };

  // Image upload processor
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFeedbackMsg({
        type: "error",
        text: "Please upload an image file (PNG, JPG, SVG, WebP).",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedbackMsg({
        type: "error",
        text: "File size exceeds 2MB limit. Please choose a smaller asset.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleFieldChange("logoUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Debounced slug check
  const handleSlugChange = (raw: string) => {
    const sanitized = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-");
    handleFieldChange("slug", sanitized);

    if (sanitized === settings?.slug) {
      setSlugStatus("available");
      return;
    }

    if (sanitized.length < 2) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    checkSlugMutation.mutate(sanitized, {
      onSuccess: (data) => {
        setSlugStatus(data.available ? "available" : "taken");
      },
      onError: () => {
        setSlugStatus("idle");
      },
    });
  };

  // Discard local changes
  const handleDiscard = () => {
    if (settings) {
      setFormData({
        name: settings.name,
        slug: settings.slug,
        logoUrl: settings.logoUrl,
        tagline: settings.tagline,
        brandColor: settings.brandColor || "#2563eb",
        customDomain: settings.customDomain || "",
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address,
        bookingEnabled: settings.bookingEnabled,
        bookingTitle: settings.bookingTitle,
        bookingNotice: settings.bookingNotice,
        currency: settings.currency || "USD",
        timezone: settings.timezone || "UTC",
        taxId: settings.taxId,
        defaultTaxRate: settings.defaultTaxRate ?? 0,
        defaultPaymentTerms: settings.defaultPaymentTerms || "NET_15",
        invoiceFooter: settings.invoiceFooter,
        bankName: settings.bankName,
        bankAccount: settings.bankAccount,
        bankRouting: settings.bankRouting,
        bankSwift: settings.bankSwift,
        minNoticeHours: settings.minNoticeHours ?? 2,
        maxHorizonDays: settings.maxHorizonDays ?? 30,
        cancellationHours: settings.cancellationHours ?? 24,
        autoConfirmBookings: settings.autoConfirmBookings ?? true,
      });
      setIsDirty(false);
      setBankVerificationConfirmed(false);
      setFeedbackMsg(null);
    }
  };

  // Save changes
  const handleSaveSettings = async () => {
    if (!isOwnerOrAdmin) return;
    setFeedbackMsg(null);

    // Check if sensitive bank wire coordinates were modified
    const isBankDetailsModified = Boolean(
      (formData.bankAccount && formData.bankAccount !== settings?.bankAccount) ||
      (formData.bankRouting && formData.bankRouting !== settings?.bankRouting) ||
      (formData.bankSwift && formData.bankSwift !== settings?.bankSwift) ||
      (formData.taxId && formData.taxId !== settings?.taxId)
    );

    if (isBankDetailsModified && !bankVerificationConfirmed) {
      setFeedbackMsg({
        type: "error",
        text: "Security Requirement: Please review and check the banking wire verification confirmation in the Finance tab before saving.",
      });
      setActiveTab("finance");
      return;
    }

    try {
      const sanitizedCustomDomain = formData.customDomain
        ? formData.customDomain
            .trim()
            .replace(/^https?:\/\//i, "")
            .replace(/\/+$/, "")
            .toLowerCase()
        : null;

      const sanitizedPayload: UpdateOrganizationSettingsPayload = {
        ...formData,
        customDomain: sanitizedCustomDomain || null,
        brandColor: formData.brandColor?.trim() ? formData.brandColor.trim() : "#2563eb",
        tagline: formData.tagline?.trim() ? formData.tagline.trim() : null,
        contactEmail: formData.contactEmail?.trim()
          ? formData.contactEmail.trim().toLowerCase()
          : null,
        contactPhone: formData.contactPhone?.trim() ? formData.contactPhone.trim() : null,
        address: formData.address?.trim() ? formData.address.trim() : null,
        taxId: formData.taxId?.trim() ? formData.taxId.trim() : null,
        invoiceFooter: formData.invoiceFooter?.trim() ? formData.invoiceFooter.trim() : null,
        bankName: formData.bankName?.trim() ? formData.bankName.trim() : null,
        bankAccount: formData.bankAccount?.trim() ? formData.bankAccount.trim() : null,
        bankRouting: formData.bankRouting?.trim() ? formData.bankRouting.trim() : null,
        bankSwift: formData.bankSwift?.trim() ? formData.bankSwift.trim() : null,
      };

      await updateSettingsMutation.mutateAsync(sanitizedPayload);
      setIsDirty(false);
      setBankVerificationConfirmed(false);
      setFeedbackMsg({
        type: "success",
        text: "Workspace settings updated successfully! Changes have propagated across invoices and booking portals.",
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setFeedbackMsg({
          type: "error",
          text: err.message || "Failed to update workspace configuration.",
        });
      } else {
        setFeedbackMsg({ type: "error", text: "An unexpected error occurred while saving." });
      }
    }
  };

  // Public booking & Client Portal links
  const activeSlug = formData.slug || settings?.slug || "my-business";
  const publicBookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/${activeSlug}`
      : `/book/${activeSlug}`;

  const clientPortalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/portal/${activeSlug}`
      : `/portal/${activeSlug}`;

  const [copiedPortalLink, setCopiedPortalLink] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicBookingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(clientPortalUrl);
      setCopiedPortalLink(true);
      setTimeout(() => setCopiedPortalLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyCname = async () => {
    try {
      await navigator.clipboard.writeText("cname.flowpilot.app");
      setCopiedCname(true);
      setTimeout(() => setCopiedCname(false), 2000);
    } catch {
      // Fallback
    }
  };

  // ==========================================
  // SECURITY & CREDENTIALS TAB STATE & LOGIC
  // ==========================================
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = React.useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = React.useState<string | null>(null);
  const [isSendingResetEmail, setIsSendingResetEmail] = React.useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = React.useState(false);
  const [verificationFeedback, setVerificationFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        setSession(data);
      } catch {
        // Fallback
      }
    }
    loadUser();
  }, []);

  const handleSendVerificationFromSettings = async () => {
    setIsSendingVerification(true);
    setVerificationFeedback(null);
    try {
      const response = await sendEmailVerification();
      if (response.isAlreadyVerified) {
        const refreshed = await getCurrentUser();
        setSession(refreshed);
        setIsSendingVerification(false);
        return;
      }
      router.push("/verify-email?sent=true");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setVerificationFeedback(err.message || "Failed to dispatch verification code.");
      } else {
        setVerificationFeedback("An unexpected error occurred while requesting verification code.");
      }
      setIsSendingVerification(false);
    }
  };

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedNewPassword = watchPassword("newPassword", "");
  const requirements = [
    { label: "At least 8 characters", met: watchedNewPassword.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(watchedNewPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(watchedNewPassword) },
    { label: "One number", met: /[0-9]/.test(watchedNewPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(watchedNewPassword) },
  ];

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordErrorMessage(null);
    setPasswordSuccessMessage(null);
    try {
      const response = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccessMessage(
        response.message ||
          "Password updated successfully! All other active sessions have been terminated."
      );
      resetPasswordForm();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setPasswordErrorMessage("Your current password is incorrect. Please try again.");
        } else if (err.status === 400) {
          setPasswordErrorMessage(
            err.message || "New password cannot be the same as your current password."
          );
        } else {
          setPasswordErrorMessage(err.message || "Failed to update password.");
        }
      } else if (err instanceof Error) {
        setPasswordErrorMessage(err.message);
      } else {
        setPasswordErrorMessage("An unexpected network error occurred.");
      }
    }
  };

  const handleSendResetEmail = async () => {
    if (!session?.user?.email || isSendingResetEmail) return;
    setIsSendingResetEmail(true);
    setResetEmailSent(null);
    try {
      await requestPasswordReset({ email: session.user.email });
      setResetEmailSent(`A recovery reset link has been dispatched to ${session.user.email}.`);
    } catch {
      setPasswordErrorMessage("Failed to send reset link to your email.");
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors, isSubmitting: isDeletingAccount },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmationText: "",
    },
  });

  const onDeleteSubmit = async (data: DeleteAccountFormData) => {
    setDeleteErrorMessage(null);
    const normalized = data.confirmationText.trim().toUpperCase();
    if (normalized !== "DELETE" && normalized !== "DELETE MY ACCOUNT") {
      setDeleteErrorMessage('You must type "DELETE" or "DELETE MY ACCOUNT" to confirm.');
      return;
    }

    try {
      await deleteAccount({
        password: data.password,
        confirmationText: data.confirmationText,
      });
      setIsDeleteDialogOpen(false);
      router.push("/login?logged_out=true");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setDeleteErrorMessage("Incorrect password. Account deletion aborted.");
        } else if (err.status === 403) {
          setDeleteErrorMessage(
            err.message ||
              "You are the sole owner of a team workspace. Please transfer ownership before deleting."
          );
        } else {
          setDeleteErrorMessage(err.message || "Failed to delete account.");
        }
      } else if (err instanceof Error) {
        setDeleteErrorMessage(err.message);
      } else {
        setDeleteErrorMessage("An unexpected error occurred during account deletion.");
      }
    }
  };

  return (
    <div className="relative space-y-6 pb-24">
      {/* Ambient Radial Lighting */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.06),transparent)]"
        aria-hidden="true"
      />

      {/* Enterprise Multi-Tenant Telemetry Strip */}
      <div className="border-border/70 from-card/90 via-card/75 to-card/90 flex w-full max-w-full min-w-0 flex-col justify-between gap-2.5 rounded-2xl border bg-gradient-to-r p-3 text-[11px] shadow-xs backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Configuration Engine Live
          </span>
          <span className="text-border hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-muted-foreground">Tenant:</span>
            <span className="text-foreground max-w-[140px] truncate font-bold sm:max-w-xs">
              {organizationName}
            </span>
          </div>
          <span className="text-border hidden md:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-[10px]">Privilege:</span>
            <Badge
              variant="outline"
              className="border-blue-500/30 bg-blue-500/10 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400"
            >
              {organizationRole}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2.5 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>RBAC Protected</span>
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Activity className="h-3.5 w-3.5" />
            <span>PostgreSQL Isolated</span>
          </span>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        breadcrumbs={
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
            <span className="text-primary font-semibold">Configuration</span>
            <span>/</span>
            <span>Organization &amp; Workspace Settings</span>
          </div>
        }
        title="Workspace Configuration &amp; Brand Operating Hub"
        description="Manage company branding, public self-scheduling gateway URL, currency localization, invoice bank details, and security policies."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="border-border/80 bg-background/80 hover:bg-muted/60 flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition"
              title="Copy public booking link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Booking Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Copy Booking Link</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPortalLink}
              className="border-border/80 bg-background/80 hover:bg-muted/60 flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl text-xs font-semibold shadow-2xs transition"
              title="Copy client self-service portal link"
            >
              {copiedPortalLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Portal Copied!</span>
                </>
              ) : (
                <>
                  <Globe className="text-blue-500 h-3.5 w-3.5" />
                  <span>Copy Portal Link</span>
                </>
              )}
            </Button>

            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl text-xs font-bold shadow-2xs transition"
            >
              <a href={clientPortalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Portal</span>
              </a>
            </Button>
          </div>
        }
      />

      {/* Non-Admin RBAC Notice */}
      {!isOwnerOrAdmin && (
        <div className="border-border/80 flex items-center gap-3 rounded-2xl border bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <p>
            You are viewing workspace settings with <strong>{organizationRole}</strong> privileges.
            Only workspace <strong>Owners</strong> and <strong>Admins</strong> can modify
            organization identity, currency, and booking rules.
          </p>
        </div>
      )}

      {/* Modern Segmented Pill Track Navigation */}
      <div className="border-border/70 bg-muted/40 rounded-2xl border p-1.5 shadow-2xs backdrop-blur-md">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          {[
            { id: "general", label: "General & Branding", icon: Building2 },
            { id: "finance", label: "Finance & Invoicing", icon: DollarSign },
            { id: "booking", label: "Scheduling & Policies", icon: Calendar },
            { id: "notifications", label: "Alerts & Notifications", icon: Bell },
            { id: "security", label: "Security & Credentials", icon: Shield },
            {
              id: "audit",
              label: "Audit & History",
              icon: History,
              count: auditLogs.length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-background text-foreground ring-border/80 font-bold shadow-xs ring-1"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground font-medium"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`py-0.2 ml-1 rounded-full px-1.5 font-mono text-[10px] ${
                      isActive
                        ? "bg-primary/15 text-primary font-bold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-medium ${
            feedbackMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* TAB 1: GENERAL PROFILE & BRANDING */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form Inputs */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
              <CardHeader className="flex flex-row items-start gap-3.5 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-2xs dark:text-blue-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-foreground text-base font-bold">
                    Company Profile &amp; Identity
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Legal enterprise name, logo asset, and client-facing branding details.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="org-name" className="text-foreground text-xs font-semibold">
                      Organization Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="org-name"
                      disabled={!isOwnerOrAdmin || isSettingsLoading}
                      value={formData.name || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="e.g. Acme Creative Agency"
                      className="border-border/80 bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="org-slug" className="text-foreground text-xs font-semibold">
                        Public Booking URL Slug <span className="text-rose-500">*</span>
                      </Label>
                      {slugStatus === "checking" && (
                        <span className="text-muted-foreground font-mono text-[10px]">
                          Checking...
                        </span>
                      )}
                      {slugStatus === "available" && (
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ Available
                        </span>
                      )}
                      {slugStatus === "taken" && (
                        <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          ✕ Already Taken
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="text-muted-foreground border-border/80 bg-muted/40 absolute left-3 z-10 font-mono text-xs select-none">
                        /book/
                      </span>
                      <Input
                        id="org-slug"
                        disabled={!isOwnerOrAdmin || isSettingsLoading}
                        value={formData.slug || ""}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="my-company"
                        className="border-border/80 bg-background text-foreground pl-16 font-mono text-xs"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <span className="font-semibold text-foreground">Public Booking:</span> /book/{formData.slug || "slug"}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Client Portal:</span> /portal/{formData.slug || "slug"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="org-tagline" className="text-foreground text-xs font-semibold">
                    Corporate Tagline / Slogan
                  </Label>
                  <Input
                    id="org-tagline"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.tagline || ""}
                    onChange={(e) => handleFieldChange("tagline", e.target.value)}
                    placeholder="e.g. World-class architectural and strategy consulting"
                    className="border-border/80 bg-background text-foreground"
                  />
                </div>

                {/* Logo & Visual Asset Customizer */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="org-logo" className="text-foreground text-xs font-semibold">
                      Brand Logo Asset
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="border-border/80 bg-muted/30 flex items-center rounded-lg border p-0.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setLogoInputMode("upload")}
                          className={`rounded-md px-2 py-0.5 font-medium transition ${
                            logoInputMode === "upload"
                              ? "bg-background text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoInputMode("url")}
                          className={`rounded-md px-2 py-0.5 font-medium transition ${
                            logoInputMode === "url"
                              ? "bg-background text-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Asset URL
                        </button>
                      </div>

                      {formData.logoUrl && (
                        <button
                          type="button"
                          title="Toggle Contrast Preview"
                          onClick={() =>
                            setLogoContrastMode((prev) => (prev === "light" ? "dark" : "light"))
                          }
                          className="border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded-md border text-[10px]"
                        >
                          {logoContrastMode === "light" ? (
                            <Sun className="h-3 w-3" />
                          ) : (
                            <Moon className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    className="hidden"
                  />

                  {logoInputMode === "upload" ? (
                    formData.logoUrl ? (
                      <div
                        className={`border-border/80 relative flex items-center justify-between rounded-xl border p-3 ${
                          logoContrastMode === "dark"
                            ? "bg-slate-950 text-white"
                            : "bg-white text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.logoUrl}
                            alt="Logo preview"
                            className="h-10 w-10 object-contain"
                          />
                          <div>
                            <span className="text-[11px] font-semibold">Active Logo Asset</span>
                            <p className="text-[10px] opacity-70">
                              Previewing in {logoContrastMode} mode
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 text-[11px]"
                          >
                            Replace
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleFieldChange("logoUrl", null)}
                            className="h-7 text-[11px] text-rose-500 hover:text-rose-600"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingLogo(true);
                        }}
                        onDragLeave={() => setIsDraggingLogo(false)}
                        onDrop={handleLogoDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-border/80 hover:border-primary/60 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition ${
                          isDraggingLogo
                            ? "border-primary bg-primary/5"
                            : "bg-muted/10 hover:bg-muted/20"
                        }`}
                      >
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
                          <Upload className="text-muted-foreground h-5 w-5" />
                        </div>
                        <p className="text-foreground mt-2 text-xs font-semibold">
                          Click to browse or drag and drop logo here
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[10px]">
                          PNG, SVG, WEBP, or JPG up to 2MB (high-resolution transparent recommended)
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="org-logo"
                        disabled={!isOwnerOrAdmin || isSettingsLoading}
                        value={formData.logoUrl || ""}
                        onChange={(e) => handleFieldChange("logoUrl", e.target.value)}
                        placeholder="https://cdn.example.com/brand-logo.png"
                        className="border-border/80 bg-background text-foreground text-xs"
                      />
                      {formData.logoUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldChange("logoUrl", null)}
                          className="border-border/80 text-muted-foreground hover:text-foreground h-9 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Brand Color Theme Palette */}
                <div className="border-border/60 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground text-xs font-semibold">
                        Brand Identity Accent Color
                      </Label>
                      <p className="text-muted-foreground text-[11px]">
                        Dynamic primary color applied to client portals, self-scheduling buttons,
                        and invoice headers.
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {formData.brandColor || "#2563eb"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {BRAND_PALETTES.map((palette) => {
                      const isSelected =
                        (formData.brandColor || "#2563eb").toLowerCase() ===
                        palette.hex.toLowerCase();
                      return (
                        <button
                          key={palette.hex}
                          type="button"
                          onClick={() => handleFieldChange("brandColor", palette.hex)}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground ring-primary ring-1"
                              : "border-border/80 bg-background text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full shadow-2xs"
                            style={{ backgroundColor: palette.hex }}
                          />
                          <span>{palette.name}</span>
                          {isSelected && <Check className="text-primary h-3 w-3" />}
                        </button>
                      );
                    })}

                    {/* Custom Hex Picker Input */}
                    <div className="border-border/80 bg-background flex items-center gap-1.5 rounded-lg border px-2 py-1">
                      <input
                        type="color"
                        value={formData.brandColor || "#2563eb"}
                        onChange={(e) => handleFieldChange("brandColor", e.target.value)}
                        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <Input
                        type="text"
                        value={formData.brandColor || "#2563eb"}
                        onChange={(e) => handleFieldChange("brandColor", e.target.value)}
                        placeholder="#2563eb"
                        maxLength={7}
                        className="h-6 w-20 border-0 bg-transparent p-0 font-mono text-xs focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-border/60 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-email"
                      className="text-foreground text-xs font-semibold"
                    >
                      Public Invoicing &amp; Support Email
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      disabled={!isOwnerOrAdmin || isSettingsLoading}
                      value={formData.contactEmail || ""}
                      onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
                      placeholder="billing@mycompany.com"
                      className="border-border/80 bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-phone"
                      className="text-foreground text-xs font-semibold"
                    >
                      Support Phone Number
                    </Label>
                    <Input
                      id="contact-phone"
                      disabled={!isOwnerOrAdmin || isSettingsLoading}
                      value={formData.contactPhone || ""}
                      onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="border-border/80 bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="org-address" className="text-foreground text-xs font-semibold">
                    Registered Business Address (Rendered on Invoices)
                  </Label>
                  <textarea
                    id="org-address"
                    rows={2}
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.address || ""}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    placeholder="742 Evergreen Terrace, Suite 100, New York, NY 10001"
                    className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  />
                </div>

                {/* Custom White-Label Domain (CNAME) Configuration */}
                <div className="border-border/60 space-y-3 border-t pt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label
                        htmlFor="org-custom-domain"
                        className="text-foreground text-xs font-semibold"
                      >
                        Custom White-Label Domain (CNAME)
                      </Label>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Serve your self-scheduling portal on your own branded subdomain (e.g.,
                      booking.yourbrand.com).
                    </p>
                  </div>

                  <Input
                    id="org-custom-domain"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.customDomain || ""}
                    onChange={(e) => handleFieldChange("customDomain", e.target.value)}
                    placeholder="e.g. book.yourbrand.com"
                    className="border-border/80 bg-background font-mono text-xs"
                  />

                  {formData.customDomain && (
                    <div className="border-border/80 bg-muted/30 space-y-2 rounded-xl border p-3 text-[11px]">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-foreground">Required DNS CNAME Record</span>
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          SSL Auto-Provisioned
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 font-mono text-[10px] sm:grid-cols-3">
                        <div className="border-border/60 bg-background rounded-lg border p-2">
                          <span className="text-muted-foreground block text-[9px] uppercase">
                            Type
                          </span>
                          <span className="text-foreground font-bold">CNAME</span>
                        </div>
                        <div className="border-border/60 bg-background rounded-lg border p-2">
                          <span className="text-muted-foreground block text-[9px] uppercase">
                            Host / Name
                          </span>
                          <span className="text-foreground block truncate font-bold">
                            {formData.customDomain.includes(".")
                              ? formData.customDomain.split(".")[0]
                              : "book"}
                          </span>
                        </div>
                        <div className="border-border/60 bg-background flex items-center justify-between rounded-lg border p-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-muted-foreground block text-[9px] uppercase">
                              Target / Value
                            </span>
                            <span className="text-primary block truncate font-bold">
                              cname.flowpilot.app
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyCname}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted ml-1 flex h-6 w-6 items-center justify-center rounded-md p-0.5 transition"
                            title="Copy CNAME target"
                          >
                            {copiedCname ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Brand & Portal Preview Card */}
          <div className="space-y-6">
            <Card className="border-border/80 from-card to-card/90 sticky top-6 overflow-hidden bg-gradient-to-b shadow-md">
              {/* Browser Window Header Mockup */}
              <div className="border-border/60 bg-muted/40 flex items-center justify-between border-b px-3.5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80 shadow-2xs" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80 shadow-2xs" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 shadow-2xs" />
                </div>
                <div className="border-border/60 bg-background/80 text-muted-foreground flex max-w-[210px] flex-1 items-center justify-center gap-1.5 truncate rounded-lg border px-2 py-0.5 font-mono text-[10px]">
                  <Globe className="h-2.5 w-2.5 shrink-0 text-blue-500" />
                  <span className="truncate">
                    flowpilot.app/book/{formData.slug || settings?.slug || "my-business"}
                  </span>
                </div>
                <a
                  href={`/book/${formData.slug || settings?.slug || "my-business"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded-md transition"
                  title="Open live preview in new tab"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Dynamic Brand Color Accent Strip */}
              <div
                className="h-1.5 w-full transition-colors duration-300"
                style={{ backgroundColor: formData.brandColor || "#2563eb" }}
              />

              <CardContent className="space-y-4 p-5">
                {/* Brand Monogram or Uploaded Image */}
                <div className="border-border/80 bg-card space-y-4 rounded-2xl border p-4 shadow-2xs">
                  <div className="flex items-center gap-3">
                    {formData.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logoUrl}
                        alt="Workspace Logo"
                        className="h-12 w-12 rounded-xl border object-contain p-1 shadow-2xs"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-sm transition-colors duration-300"
                        style={{ backgroundColor: formData.brandColor || "#2563eb" }}
                      >
                        {(formData.name || organizationName || "F").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-bold">
                        {formData.name || organizationName || "Your Company Name"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {formData.tagline || "Professional Service Provider"}
                      </p>
                    </div>
                  </div>

                  {/* Simulated Client Booking Experience Mini-Widget */}
                  <div className="border-border/60 bg-muted/20 space-y-2.5 rounded-xl border p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Selected Offering:</span>
                      <span className="text-foreground font-semibold">Strategy Consultation</span>
                    </div>

                    {/* Simulated Dynamic CTA Button */}
                    <div
                      className="flex h-8 w-full items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs transition-colors duration-300"
                      style={{ backgroundColor: formData.brandColor || "#2563eb" }}
                    >
                      <Sparkles className="mr-1.5 h-3 w-3" />
                      Book Client Session
                    </div>

                    <div className="text-muted-foreground flex items-center justify-between pt-0.5 text-[10px]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Verified Gateway
                      </span>
                      <span className="font-mono">{formData.brandColor || "#2563eb"}</span>
                    </div>
                  </div>

                  {formData.customDomain && (
                    <div className="border-border/60 border-t pt-2.5 text-[11px]">
                      <span className="text-muted-foreground block text-[10px]">
                        Custom Domain Route:
                      </span>
                      <span className="truncate font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        https://{formData.customDomain}
                      </span>
                    </div>
                  )}

                  <div className="border-border/60 grid grid-cols-2 gap-2 border-t pt-2.5 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Currency:</span>
                      <p className="text-foreground font-mono font-bold">
                        {formData.currency || "USD"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timezone:</span>
                      <p className="text-foreground truncate font-mono font-bold">
                        {(formData.timezone || "UTC").split("/").pop()?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-center text-[10px] leading-relaxed">
                  ✦ Dynamic brand styles propagate across client-facing booking interfaces, invoice
                  statements, and digital receipts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCE & INVOICING DEFAULTS */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader className="flex flex-row items-start gap-3.5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-2xs dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-foreground text-base font-bold">
                  Currency &amp; Tax Localization
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Configure primary billing currency, business tax identification number, and
                  default invoice rates.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="currency-select"
                    className="text-foreground text-xs font-semibold"
                  >
                    Primary Operating Currency <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    id="currency-select"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.currency || "USD"}
                    onChange={(e) => handleFieldChange("currency", e.target.value)}
                    className="border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary/20 h-9 w-full rounded-xl border px-3 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="timezone-select"
                    className="text-foreground text-xs font-semibold"
                  >
                    Operational Timezone <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    id="timezone-select"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.timezone || "UTC"}
                    onChange={(e) => handleFieldChange("timezone", e.target.value)}
                    className="border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary/20 h-9 w-full rounded-xl border px-3 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tax-id" className="text-foreground text-xs font-semibold">
                    Tax / VAT Registration ID
                  </Label>
                  <Input
                    id="tax-id"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.taxId || ""}
                    onChange={(e) => handleFieldChange("taxId", e.target.value)}
                    placeholder="e.g. US-EIN-123456789 or GB987654321"
                    className="border-border/80 bg-background text-foreground font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tax-rate" className="text-foreground text-xs font-semibold">
                    Default Tax Rate (%)
                  </Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.defaultTaxRate !== undefined ? formData.defaultTaxRate : 0}
                    onChange={(e) =>
                      handleFieldChange("defaultTaxRate", parseFloat(e.target.value) || 0)
                    }
                    className="border-border/80 bg-background text-foreground font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payment-terms" className="text-foreground text-xs font-semibold">
                    Standard Payment Terms
                  </Label>
                  <select
                    id="payment-terms"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.defaultPaymentTerms || "NET_15"}
                    onChange={(e) => handleFieldChange("defaultPaymentTerms", e.target.value)}
                    className="border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary/20 h-9 w-full rounded-xl border px-3 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  >
                    <option value="DUE_ON_RECEIPT">Due Upon Receipt (Immediate)</option>
                    <option value="NET_7">Net 7 Days</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Wire & Remittance Details */}
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader className="flex flex-row items-start gap-3.5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-2xs dark:text-blue-400">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-foreground text-base font-bold">
                  Bank Remittance &amp; Payout Coordinates
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Rendered on client invoices for B2B direct bank deposit, ACH, and SWIFT wire
                  transfers.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-name" className="text-foreground text-xs font-semibold">
                    Depository Bank Name
                  </Label>
                  <Input
                    id="bank-name"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.bankName || ""}
                    onChange={(e) => handleFieldChange("bankName", e.target.value)}
                    placeholder="e.g. JPMorgan Chase & Co."
                    className="border-border/80 bg-background text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bank-account" className="text-foreground text-xs font-semibold">
                    Account / IBAN Number
                  </Label>
                  <Input
                    id="bank-account"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.bankAccount || ""}
                    onChange={(e) => handleFieldChange("bankAccount", e.target.value)}
                    placeholder="e.g. 1234567890 or GB82WEST12345698765432"
                    className="border-border/80 bg-background text-foreground font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bank-routing" className="text-foreground text-xs font-semibold">
                    Routing / Sort Code / BSB
                  </Label>
                  <Input
                    id="bank-routing"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.bankRouting || ""}
                    onChange={(e) => handleFieldChange("bankRouting", e.target.value)}
                    placeholder="e.g. 021000021"
                    className="border-border/80 bg-background text-foreground font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bank-swift" className="text-foreground text-xs font-semibold">
                    SWIFT / BIC Code (International)
                  </Label>
                  <Input
                    id="bank-swift"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.bankSwift || ""}
                    onChange={(e) => handleFieldChange("bankSwift", e.target.value)}
                    placeholder="e.g. CHASUS33"
                    className="border-border/80 bg-background text-foreground font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invoice-footer" className="text-foreground text-xs font-semibold">
                  Custom Invoice Footer / Terms Disclaimer
                </Label>
                <textarea
                  id="invoice-footer"
                  rows={2}
                  disabled={!isOwnerOrAdmin || isSettingsLoading}
                  value={formData.invoiceFooter || ""}
                  onChange={(e) => handleFieldChange("invoiceFooter", e.target.value)}
                  placeholder="e.g. Payment is due within 15 days of invoice date. Late payments are subject to a 1.5% monthly finance charge."
                  className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Financial Wire Transfer Security Guard */}
              <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1">
                    <p className="text-foreground text-xs font-bold">
                      Critical Financial Coordinates Protection
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Bank account, routing numbers, and tax identification are legally rendered on
                      outbound client invoices. Modifying these details redirects client remittance
                      funds.
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={bankVerificationConfirmed}
                    onChange={(e) => setBankVerificationConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-400 text-amber-600 focus:ring-amber-500/30"
                  />
                  <span className="text-foreground text-xs font-semibold">
                    I verify and confirm that these banking coordinates and remittance details are
                    accurate.
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: SCHEDULING & BOOKING POLICIES */}
      {activeTab === "booking" && (
        <div className="space-y-6">
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader className="flex flex-row items-start gap-3.5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 shadow-2xs dark:text-indigo-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-foreground text-base font-bold">
                  Client Self-Scheduling Gateway Controls
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Configure your public booking portal availability and client preparation
                  instructions.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Master Gateway Toggle */}
              <div className="border-border/80 bg-muted/20 flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-2xs">
                <div className="min-w-0">
                  <p className="text-foreground text-xs font-bold">Public Self-Scheduling Portal</p>
                  <p className="text-muted-foreground text-[11px]">
                    When active, clients can browse your service offerings and schedule appointments
                    via /book/{formData.slug || "slug"}.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!isOwnerOrAdmin || isSettingsLoading}
                  onClick={() => handleFieldChange("bookingEnabled", !formData.bookingEnabled)}
                  className={`flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    formData.bookingEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                      formData.bookingEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-title" className="text-foreground text-xs font-semibold">
                  Custom Booking Portal Heading
                </Label>
                <Input
                  id="booking-title"
                  disabled={!isOwnerOrAdmin || isSettingsLoading}
                  value={formData.bookingTitle || ""}
                  onChange={(e) => handleFieldChange("bookingTitle", e.target.value)}
                  placeholder={`e.g. Book an Appointment with ${formData.name || "Our Specialists"}`}
                  className="border-border/80 bg-background text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-notice" className="text-foreground text-xs font-semibold">
                  Client Booking Notice / Instructions
                </Label>
                <textarea
                  id="booking-notice"
                  rows={3}
                  disabled={!isOwnerOrAdmin || isSettingsLoading}
                  value={formData.bookingNotice || ""}
                  onChange={(e) => handleFieldChange("bookingNotice", e.target.value)}
                  placeholder="e.g. Please arrive 10 minutes prior to your session. Free guest parking is available behind the building."
                  className="border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Policy Windows Grid */}
              <div className="border-border/60 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="text-primary h-3.5 w-3.5" />
                    <Label htmlFor="min-notice" className="text-foreground text-xs font-semibold">
                      Minimum Advance Notice
                    </Label>
                  </div>
                  <select
                    id="min-notice"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.minNoticeHours ?? 2}
                    onChange={(e) =>
                      handleFieldChange("minNoticeHours", parseInt(e.target.value, 10))
                    }
                    className="border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary/20 h-9 w-full rounded-xl border px-3 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  >
                    <option value={0}>Instant (0 hours notice)</option>
                    <option value={1}>1 hour prior</option>
                    <option value={2}>2 hours prior</option>
                    <option value={4}>4 hours prior</option>
                    <option value={12}>12 hours prior</option>
                    <option value={24}>24 hours (1 full day)</option>
                    <option value={48}>48 hours (2 days)</option>
                  </select>
                  <p className="text-muted-foreground text-[10px]">
                    Prevents clients from booking surprise immediate slots.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="max-horizon" className="text-foreground text-xs font-semibold">
                      Maximum Booking Horizon
                    </Label>
                  </div>
                  <select
                    id="max-horizon"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.maxHorizonDays ?? 30}
                    onChange={(e) =>
                      handleFieldChange("maxHorizonDays", parseInt(e.target.value, 10))
                    }
                    className="border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary/20 h-9 w-full rounded-xl border px-3 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  >
                    <option value={14}>Up to 14 days in advance</option>
                    <option value={30}>Up to 30 days (1 month)</option>
                    <option value={60}>Up to 60 days (2 months)</option>
                    <option value={90}>Up to 90 days (1 quarter)</option>
                    <option value={180}>Up to 180 days (6 months)</option>
                  </select>
                  <p className="text-muted-foreground text-[10px]">
                    Restricts how far into the future appointments can be scheduled.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <Label
                      htmlFor="cancellation-window"
                      className="text-foreground text-xs font-semibold"
                    >
                      Cancellation Cut-off Window
                    </Label>
                  </div>
                  <select
                    id="cancellation-window"
                    disabled={!isOwnerOrAdmin || isSettingsLoading}
                    value={formData.cancellationHours ?? 24}
                    onChange={(e) =>
                      handleFieldChange("cancellationHours", parseInt(e.target.value, 10))
                    }
                    className="border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary/20 h-9 w-full rounded-xl border px-3 text-xs focus:ring-2 focus:outline-none sm:text-sm"
                  >
                    <option value={0}>Anytime until start time</option>
                    <option value={4}>Up to 4 hours prior</option>
                    <option value={12}>Up to 12 hours prior</option>
                    <option value={24}>Up to 24 hours prior</option>
                    <option value={48}>Up to 48 hours prior</option>
                  </select>
                  <p className="text-muted-foreground text-[10px]">
                    Clients cannot cancel or reschedule after this cut-off window.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: ALERTS & NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader className="flex flex-row items-start gap-3.5 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-2xs dark:text-purple-400">
                <Bell className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-foreground text-base font-bold">
                  Automated Operational Alerts
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Configure automated email dispatches for customer appointments, payment
                  settlements, and team updates.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-border/60 divide-y">
                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-foreground text-xs font-bold">New Booking Dispatches</p>
                    <p className="text-muted-foreground text-[11px]">
                      Send automated confirmation emails to clients and assigned specialists when a
                      booking is created.
                    </p>
                  </div>
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-foreground text-xs font-bold">
                      Invoice Paid &amp; Payment Receipts
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Instantly email verified digital receipts to clients upon successful credit
                      card or wire settlement.
                    </p>
                  </div>
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-foreground text-xs font-bold">
                      24-Hour Client Appointment Reminder
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Automated calendar reminder sent 24 hours before session to eliminate
                      no-shows.
                    </p>
                  </div>
                  <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Auto-Scheduled
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-foreground text-xs font-bold">
                      Daily Executive Morning Briefing
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Receive a daily 8:00 AM briefing summarizing today&apos;s scheduled sessions
                      and pending receivables.
                    </p>
                  </div>
                  <Badge className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: SECURITY & CREDENTIALS (Preserved & Hardened) */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Account Identity Card */}
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 shadow-2xs dark:text-rose-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-base font-semibold">
                    Account Identity
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Primary profile credentials associated with your authenticated session.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session?.user?.isEmailVerified ? (
                  <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Email Verified
                  </Badge>
                ) : (
                  <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border-border/60 bg-muted/20 rounded-xl border p-3">
                  <span className="text-muted-foreground block text-[11px]">User Name</span>
                  <span className="text-foreground text-sm font-semibold">
                    {session?.user?.name || "User"}
                  </span>
                </div>
                <div className="border-border/60 bg-muted/20 rounded-xl border p-3">
                  <span className="text-muted-foreground block text-[11px]">Corporate Email</span>
                  <span className="text-foreground text-sm font-semibold">
                    {session?.user?.email || "—"}
                  </span>
                </div>
              </div>

              {!session?.user?.isEmailVerified && (
                <div className="space-y-2">
                  <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2.5">
                      <MailCheck className="h-4 w-4 shrink-0 text-amber-400" />
                      <span>
                        Your email is not verified yet. Click to receive a confirmation code in your
                        inbox.
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSendVerificationFromSettings}
                      disabled={isSendingVerification}
                      className="h-8 shrink-0 border border-amber-400/40 bg-amber-500/20 text-xs text-amber-200 hover:bg-amber-500/30"
                    >
                      {isSendingVerification ? "Dispatching..." : "Verify Email"}
                    </Button>
                  </div>
                  {verificationFeedback && (
                    <p className="text-xs text-rose-400">{verificationFeedback}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-foreground text-base font-semibold">
                  Change Password
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-xs">
                Ensure your account is protected with a unique, cryptographically strong password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                {passwordSuccessMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{passwordSuccessMessage}</span>
                  </div>
                )}

                {passwordErrorMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordErrorMessage}</span>
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="currentPassword"
                      className="text-foreground text-xs font-medium"
                    >
                      Current Password
                    </Label>
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isSendingResetEmail}
                      className="text-primary hover:text-primary/80 text-[11px] hover:underline"
                    >
                      {isSendingResetEmail ? "Sending Link..." : "Forgot Current Password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      {...registerPassword("currentPassword")}
                      className="border-border/80 bg-background text-foreground pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-[11px] text-rose-400">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                  {resetEmailSent && (
                    <p className="text-[11px] text-emerald-400">{resetEmailSent}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-foreground text-xs font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      {...registerPassword("newPassword")}
                      className="border-border/80 bg-background text-foreground pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-[11px] text-rose-400">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Requirements Grid */}
                <div className="border-border/60 bg-muted/20 space-y-2 rounded-xl border p-3">
                  <span className="text-muted-foreground text-[10px] font-bold uppercase">
                    Password Requirements:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {requirements.map((req, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 ${
                          req.met ? "font-medium text-emerald-500" : "text-muted-foreground"
                        }`}
                      >
                        {req.met ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-foreground text-xs font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      {...registerPassword("confirmPassword")}
                      className="border-border/80 bg-background text-foreground pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-400">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-primary text-primary-foreground h-9 cursor-pointer text-xs font-semibold shadow-xs"
                  >
                    {isChangingPassword ? "Securing Account..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone: Account Deletion */}
          <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-base font-semibold text-rose-500">
                  Danger Zone: Delete Account
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-xs">
                Irreversible account termination. This will purge your profile and personal
                credentials from FlowPilot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-muted-foreground">
                Once confirmed, your account will be immediately de-provisioned and all active
                session tokens revoked.
              </p>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9 cursor-pointer gap-1.5 text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete My Account</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border/80 bg-card text-foreground sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-rose-500">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Confirm Irreversible Account Deletion</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                      This action cannot be undone. You will lose access to all affiliated
                      workspaces.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleDeleteSubmit(onDeleteSubmit)} className="space-y-4 pt-2">
                    {deleteErrorMessage && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                        {deleteErrorMessage}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="delete-password" className="text-xs font-medium">
                        Confirm Account Password
                      </Label>
                      <Input
                        id="delete-password"
                        type="password"
                        placeholder="••••••••••••"
                        {...registerDelete("password")}
                        className="border-border/80 bg-background text-xs"
                      />
                      {deleteErrors.password && (
                        <p className="text-[11px] text-rose-400">{deleteErrors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="delete-confirm" className="text-xs font-medium">
                        Type{" "}
                        <span className="font-mono font-bold text-rose-400">
                          &quot;DELETE&quot;
                        </span>{" "}
                        to Confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        type="text"
                        placeholder="DELETE"
                        {...registerDelete("confirmationText")}
                        className="border-border/80 bg-background font-mono text-xs"
                      />
                      {deleteErrors.confirmationText && (
                        <p className="text-[11px] text-rose-400">
                          {deleteErrors.confirmationText.message}
                        </p>
                      )}
                    </div>

                    <DialogFooter className="gap-2 pt-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={isDeletingAccount}
                        className="text-xs font-bold"
                      >
                        {isDeletingAccount ? "Deleting..." : "Permanently Delete Account"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 6: AUDIT & HISTORY FEED */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <Card className="border-border/80 from-card to-card/95 bg-gradient-to-b shadow-xs">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <History className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-foreground text-base font-bold">
                    Workspace Operational Audit Trail
                  </CardTitle>
                </div>
                <CardDescription className="text-muted-foreground text-xs">
                  Immutable chronological log recording configuration adjustments, brand identity
                  changes, and sensitive financial coordinates updates.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-border/80 bg-background font-mono text-[11px]"
              >
                {auditLogs.length} events logged
              </Badge>
            </CardHeader>
            <CardContent>
              {isAuditLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="text-muted-foreground h-8 w-8 animate-spin opacity-50" />
                  <p className="text-muted-foreground mt-3 text-xs font-medium">
                    Loading audit trail events...
                  </p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-2xl">
                    <History className="text-muted-foreground h-6 w-6" />
                  </div>
                  <h4 className="text-foreground mt-3 text-sm font-semibold">
                    No Audit Events Recorded Yet
                  </h4>
                  <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                    Whenever you update workspace settings, branding colors, or bank coordinates, a
                    tamper-evident record will appear here.
                  </p>
                </div>
              ) : (
                <div className="before:bg-border/60 relative space-y-3 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-[1.5px]">
                  {auditLogs.map((log) => {
                    const dateFormatted = new Date(log.createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    // Dynamic category color & badge styling
                    const getCategoryBadge = (category: string) => {
                      switch (category.toUpperCase()) {
                        case "FINANCE":
                        case "BANKING":
                          return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                        case "SECURITY":
                          return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
                        case "BRANDING":
                        case "GENERAL":
                          return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
                        case "BOOKING":
                          return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
                        default:
                          return "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400";
                      }
                    };

                    return (
                      <div
                        key={log.id}
                        className="hover:bg-muted/30 relative flex flex-col gap-2 rounded-xl p-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="border-border/80 bg-card z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-2xs">
                            <span className="text-primary font-mono text-[10px]">
                              {log.userName.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-foreground text-xs font-bold">
                                {log.userName}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold tracking-wider uppercase ${getCategoryBadge(
                                  log.category
                                )}`}
                              >
                                {log.category}
                              </Badge>
                              <span className="text-muted-foreground font-mono text-[11px]">
                                {log.action}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs">{log.details}</p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-row items-center gap-3 pl-11 text-[11px] sm:flex-col sm:items-end sm:gap-1 sm:pl-0">
                          <span className="text-foreground/80 flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="text-muted-foreground h-3 w-3" />
                            {dateFormatted}
                          </span>
                          {log.ipAddress && (
                            <span className="text-muted-foreground font-mono text-[10px]">
                              IP: {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Save / Discard Changes Action Bar */}
      {isDirty && (
        <div className="animate-in fade-in slide-in-from-bottom-5 fixed right-0 bottom-5 left-0 z-40 flex justify-center px-4">
          <div className="border-border/80 bg-card/90 flex w-full max-w-xl items-center justify-between gap-4 rounded-full border p-2 pl-4 shadow-2xl backdrop-blur-xl sm:py-2 sm:pr-2.5 sm:pl-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
              </span>
              <span className="text-foreground text-xs font-bold tracking-tight">
                <span className="sm:hidden">Unsaved changes</span>
                <span className="hidden sm:inline">Unsaved workspace changes</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                disabled={updateSettingsMutation.isPending}
                className="hover:bg-muted/70 h-8 rounded-full px-3 text-xs font-semibold"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="h-8.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
