export type StaffStatus = "AVAILABLE" | "IN_SESSION" | "ON_BREAK" | "OFFLINE";
export type StaffTier = "FULL_TIME" | "PART_TIME" | "CONTRACTOR";

export interface StaffServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface StaffItem {
  id: string;
  organizationId: string;
  userId?: string | null;
  name: string;
  roleTitle: string;
  email: string | null;
  phone: string | null;
  initials: string;
  avatarBg: string;
  status: StaffStatus;
  tier: StaffTier;
  hourlyRate: number | null;
  commissionRate: number | null;
  workingDays: string[];
  shiftStart: string;
  shiftEnd: string;
  bio: string | null;
  services: StaffServiceItem[];
  appointmentCount: number;
  revenueGenerated: number;
  createdAt: string;
  updatedAt: string;
}

export interface StaffRecentAppointment {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  customerName: string;
  serviceName: string;
}

export interface StaffDetailedItem extends StaffItem {
  recentAppointments: StaffRecentAppointment[];
}

export interface StaffMetrics {
  totalStaff: number;
  availableStaff: number;
  inSessionStaff: number;
  onBreakStaff: number;
  offlineStaff: number;
  totalAppointments: number;
  totalRevenueBilled: number;
  utilizationRate: number;
}

export interface StaffFilterParams {
  search?: string;
  status?: StaffStatus;
  tier?: StaffTier;
  serviceId?: string;
}

export interface CreateStaffPayload {
  name: string;
  roleTitle: string;
  email?: string;
  phone?: string;
  avatarBg?: string;
  status?: StaffStatus;
  tier?: StaffTier;
  hourlyRate?: number;
  commissionRate?: number;
  workingDays?: string[];
  shiftStart?: string;
  shiftEnd?: string;
  bio?: string;
  serviceIds?: string[];
}

export interface UpdateStaffPayload {
  name?: string;
  roleTitle?: string;
  email?: string | null;
  phone?: string | null;
  avatarBg?: string;
  status?: StaffStatus;
  tier?: StaffTier;
  hourlyRate?: number | null;
  commissionRate?: number | null;
  workingDays?: string[];
  shiftStart?: string;
  shiftEnd?: string;
  bio?: string | null;
  serviceIds?: string[];
}
