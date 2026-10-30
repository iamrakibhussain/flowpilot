import type { WorkspaceRole } from "@/features/auth/types";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: WorkspaceRole;
  email: string;
  fullName: string;
  joinedAt: string;
}

export interface OrganizationContextState {
  currentOrganization: Organization | null;
  role: WorkspaceRole | null;
  isLoading: boolean;
}

export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  tagline: string | null;
  brandColor: string | null;
  customDomain: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  bookingEnabled: boolean;
  bookingTitle: string | null;
  bookingNotice: string | null;
  currency: string;
  timezone: string;
  taxId: string | null;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  invoiceFooter: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankRouting: string | null;
  bankSwift: string | null;
  minNoticeHours: number;
  maxHorizonDays: number;
  cancellationHours: number;
  autoConfirmBookings: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateOrganizationSettingsPayload = Partial<{
  name: string;
  slug: string;
  logoUrl: string | null;
  tagline: string | null;
  brandColor: string | null;
  customDomain: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  bookingEnabled: boolean;
  bookingTitle: string | null;
  bookingNotice: string | null;
  currency: string;
  timezone: string;
  taxId: string | null;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  invoiceFooter: string | null;
  bankName: string | null;
  bankAccount: string | null;
  bankRouting: string | null;
  bankSwift: string | null;
  minNoticeHours: number;
  maxHorizonDays: number;
  cancellationHours: number;
  autoConfirmBookings: boolean;
}>;

export interface WorkspaceAuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  category: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}
