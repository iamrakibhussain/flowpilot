export interface ServiceStaffMemberSummary {
  id: string;
  name: string;
  roleTitle: string;
  avatarBg: string;
  initials: string;
}

export interface ServiceItem {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  durationMinutes: number;
  bufferBefore: number;
  bufferAfter: number;
  isActive: boolean;
  requireDeposit: boolean;
  depositType: "FIXED" | "PERCENTAGE" | string;
  depositAmount?: number | null;
  staffMembers?: ServiceStaffMemberSummary[];
  staffMemberIds?: string[];
  appointmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  category?: string;
  price: number;
  durationMinutes?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  isActive?: boolean;
  requireDeposit?: boolean;
  depositType?: "FIXED" | "PERCENTAGE";
  depositAmount?: number | null;
  staffMemberIds?: string[];
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  category?: string;
  price?: number;
  durationMinutes?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  isActive?: boolean;
  requireDeposit?: boolean;
  depositType?: "FIXED" | "PERCENTAGE";
  depositAmount?: number | null;
  staffMemberIds?: string[];
}

export interface ServiceListQuery {
  activeOnly?: boolean;
  category?: string;
  search?: string;
}

export interface PublicServiceItem {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  durationMinutes: number;
  bufferBefore: number;
  bufferAfter: number;
  requireDeposit: boolean;
  depositType: string;
  depositAmount?: number | null;
  assignedStaffIds: string[];
}

export interface PublicStaffItem {
  id: string;
  name: string;
  roleTitle: string;
  avatarBg: string;
  initials: string;
  bio?: string | null;
}

export interface PublicOrganizationProfile {
  id: string;
  name: string;
  slug: string;
  bookingEnabled: boolean;
  bookingTitle?: string | null;
  bookingNotice?: string | null;
  services: PublicServiceItem[];
  staffMembers: PublicStaffItem[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  availableStaffIds: string[];
}

export interface PublicBookingInput {
  serviceId: string;
  staffMemberId?: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  notes?: string | null;
}

export interface PublicBookingResult {
  appointmentId: string;
  serviceName: string;
  staffName?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  customerName: string;
  customerEmail: string;
  status: string;
  requireDeposit: boolean;
  depositAmount?: number | null;
}
