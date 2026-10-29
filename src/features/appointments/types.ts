export type AppointmentStatusType = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING";
export type AppointmentMeetingType = "VIDEO" | "IN_PERSON" | "PHONE";
export type StaffStatusType = "AVAILABLE" | "IN_SESSION" | "ON_BREAK" | "OFFLINE";

export interface AppointmentListItem {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceId?: string | null;
  serviceName?: string | null;
  servicePrice?: number | null;
  staffMemberId?: string | null;
  staffMemberName?: string | null;
  staffMemberRole?: string | null;
  staffAvatarBg?: string | null;
  staffInitials?: string | null;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatusType;
  type: AppointmentMeetingType;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListAppointmentsParams {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  staffMemberId?: string;
  serviceId?: string;
  status?: AppointmentStatusType;
  type?: AppointmentMeetingType;
  search?: string;
}

export interface CreateAppointmentPayload {
  customerId: string;
  serviceId?: string;
  staffMemberId?: string;
  title?: string;
  scheduledAt: string;
  durationMinutes?: number;
  type?: AppointmentMeetingType;
  location?: string;
  notes?: string;
  status?: AppointmentStatusType;
}

export interface UpdateAppointmentPayload {
  title?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  type?: AppointmentMeetingType;
  location?: string;
  notes?: string;
  serviceId?: string | null;
  staffMemberId?: string | null;
}

export interface RescheduleAppointmentPayload {
  newScheduledAt: string;
  newDurationMinutes?: number;
  newStaffMemberId?: string;
  reason?: string;
}

export interface CheckConflictPayload {
  staffMemberId: string;
  scheduledAt: string;
  durationMinutes: number;
  excludeAppointmentId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointment?: {
    id: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    staffMemberName?: string;
  } | null;
}

export interface ServiceItem {
  id: string;
  organizationId: string;
  userId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface StaffItem {
  id: string;
  organizationId: string;
  name: string;
  roleTitle: string;
  email?: string | null;
  phone?: string | null;
  initials: string;
  avatarBg: string;
  status: StaffStatusType;
  tier?: "FULL_TIME" | "PART_TIME" | "CONTRACTOR";
  hourlyRate?: number | null;
  commissionRate?: number | null;
  workingDays?: string[];
  shiftStart?: string;
  shiftEnd?: string;
  bio?: string | null;
  services?: StaffServiceItem[];
  appointmentCount?: number;
  revenueGenerated?: number;
  createdAt: string;
  updatedAt: string;
}
