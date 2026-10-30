import { apiClient } from "@/lib/api/client";
import type {
  PortalDashboardData,
  PortalCustomer,
  PortalAppointment,
  RequestPortalLinkInput,
  VerifyPortalTokenInput,
  RescheduleAppointmentInput,
  CancelAppointmentInput,
  UpdatePortalProfileInput,
} from "./types";

export async function requestPortalLink(input: RequestPortalLinkInput) {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/portal/auth/request-link",
    input
  );
  return response.data;
}

export async function verifyPortalToken(input: VerifyPortalTokenInput) {
  const response = await apiClient.post<{
    customer: PortalCustomer;
    organization: { id: string; name: string; slug: string };
  }>("/portal/auth/verify", input);
  return response.data;
}

export async function getPortalMe() {
  const response = await apiClient.get<{
    customer: PortalCustomer;
    organization: { id: string; name: string; slug: string };
  }>("/portal/me");
  return response.data;
}

export async function getPortalDashboard() {
  const response = await apiClient.get<PortalDashboardData>("/portal/dashboard");
  return response.data;
}

export async function reschedulePortalAppointment(
  appointmentId: string,
  input: RescheduleAppointmentInput
) {
  const response = await apiClient.patch<PortalAppointment>(
    `/portal/appointments/${appointmentId}/reschedule`,
    input
  );
  return response.data;
}

export async function cancelPortalAppointment(
  appointmentId: string,
  input: CancelAppointmentInput
) {
  const response = await apiClient.patch<PortalAppointment>(
    `/portal/appointments/${appointmentId}/cancel`,
    input
  );
  return response.data;
}

export async function updatePortalProfile(input: UpdatePortalProfileInput) {
  const response = await apiClient.patch<PortalCustomer>("/portal/profile", input);
  return response.data;
}

export async function logoutPortal() {
  const response = await apiClient.post<null>("/portal/auth/logout");
  return response.data;
}
