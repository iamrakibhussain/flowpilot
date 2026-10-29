import { apiClient } from "@/lib/api/client";
import type {
  ServiceItem,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceListQuery,
  PublicOrganizationProfile,
  TimeSlot,
  PublicBookingInput,
  PublicBookingResult,
} from "./types";

/**
 * Fetch services catalog for the current tenant organization
 */
export async function getServices(
  query?: ServiceListQuery,
  organizationId?: string
): Promise<ServiceItem[]> {
  const params: Record<string, string | boolean | undefined> = {};
  if (query?.activeOnly !== undefined) params.activeOnly = query.activeOnly;
  if (query?.category && query.category !== "ALL") params.category = query.category;
  if (query?.search) params.search = query.search;

  const response = await apiClient.get<ServiceItem[]>("/services", {
    params,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch a single service by ID
 */
export async function getServiceById(id: string, organizationId?: string): Promise<ServiceItem> {
  const response = await apiClient.get<ServiceItem>(`/services/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new service offering
 */
export async function createService(
  data: CreateServiceInput,
  organizationId?: string
): Promise<ServiceItem> {
  const response = await apiClient.post<ServiceItem>("/services", data, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing service offering
 */
export async function updateService(
  id: string,
  data: UpdateServiceInput,
  organizationId?: string
): Promise<ServiceItem> {
  const response = await apiClient.patch<ServiceItem>(`/services/${id}`, data, {
    organizationId,
  });
  return response.data;
}

/**
 * Sync qualified staff members delivering this service
 */
export async function syncServiceStaff(
  id: string,
  staffMemberIds: string[],
  organizationId?: string
): Promise<ServiceItem> {
  const response = await apiClient.put<ServiceItem>(
    `/services/${id}/staff`,
    { staffMemberIds },
    { organizationId }
  );
  return response.data;
}

/**
 * Delete or safely archive a service
 */
export async function deleteService(
  id: string,
  organizationId?: string
): Promise<{ id: string; archived: boolean; message: string }> {
  const response = await apiClient.delete<{ id: string; archived: boolean; message: string }>(
    `/services/${id}`,
    { organizationId }
  );
  return response.data;
}

/**
 * Toggle active/inactive state of a service
 */
export async function toggleServiceActive(
  id: string,
  organizationId?: string
): Promise<ServiceItem> {
  const response = await apiClient.post<ServiceItem>(
    `/services/${id}/toggle-active`,
    {},
    { organizationId }
  );
  return response.data;
}

// -------------------------------------------------------------
// Public Client Self-Scheduling Endpoints (No Auth Required)
// -------------------------------------------------------------

/**
 * Fetch public organization booking details by slug
 */
export async function getPublicBookingProfile(slug: string): Promise<PublicOrganizationProfile> {
  const response = await apiClient.get<PublicOrganizationProfile>(
    `/public/booking/${encodeURIComponent(slug)}`
  );
  return response.data;
}

/**
 * Fetch available time slots for a given service and date
 */
export async function getPublicBookingSlots(
  slug: string,
  serviceId: string,
  date: string,
  staffMemberId?: string
): Promise<TimeSlot[]> {
  const params: Record<string, string | undefined> = {
    serviceId,
    date,
  };
  if (staffMemberId) params.staffMemberId = staffMemberId;

  const response = await apiClient.get<TimeSlot[]>(
    `/public/booking/${encodeURIComponent(slug)}/slots`,
    { params }
  );
  return response.data;
}

/**
 * Book an appointment directly via public client portal
 */
export async function bookPublicAppointment(
  slug: string,
  data: PublicBookingInput
): Promise<PublicBookingResult> {
  const response = await apiClient.post<PublicBookingResult>(
    `/public/booking/${encodeURIComponent(slug)}/book`,
    data
  );
  return response.data;
}
