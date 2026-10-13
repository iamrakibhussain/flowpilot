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
