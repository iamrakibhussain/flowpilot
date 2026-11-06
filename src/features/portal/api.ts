import { apiClient } from "@/lib/api/client";
import type {
  PortalDashboardData,
  PortalCustomer,
  PortalAppointment,
  PortalContract,
  PortalNotification,
  PortalTimeSlot,
  RequestPortalLinkInput,
  VerifyPortalTokenInput,
  RescheduleAppointmentInput,
  CancelAppointmentInput,
  UpdatePortalProfileInput,
  SignPortalContractInput,
  AcceptPortalQuoteInput,
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

export async function getPortalAppointmentSlots(appointmentId: string, dateStr: string) {
  const response = await apiClient.get<PortalTimeSlot[]>(
    `/portal/appointments/${appointmentId}/available-slots?date=${dateStr}`
  );
  return response.data;
}

export async function updatePortalProfile(input: UpdatePortalProfileInput) {
  const response = await apiClient.patch<PortalCustomer>("/portal/profile", input);
  return response.data;
}

export async function getPortalQuoteToken(quoteId: string) {
  const response = await apiClient.post<{ token: string; url: string }>(
    `/portal/quotes/${quoteId}/token`
  );
  return response.data;
}

export async function acceptPortalQuote(quoteId: string, input: AcceptPortalQuoteInput) {
  const response = await apiClient.post<{
    success: boolean;
    quoteNumber: string;
    acceptedAt: string;
    convertedInvoiceId?: string;
    paymentToken?: string;
  }>(`/portal/quotes/${quoteId}/accept`, input);
  return response.data;
}

export async function getPortalContracts() {
  const response = await apiClient.get<PortalContract[]>("/portal/contracts");
  return response.data;
}

export async function getPortalContract(contractId: string) {
  const response = await apiClient.get<PortalContract>(`/portal/contracts/${contractId}`);
  return response.data;
}

export async function signPortalContract(contractId: string, input: SignPortalContractInput) {
  const response = await apiClient.post<{
    success: boolean;
    contractId: string;
    status: string;
    signedAt: string;
    contentChecksum: string;
  }>(`/portal/contracts/${contractId}/sign`, input);
  return response.data;
}

export async function getPortalNotifications() {
  const response = await apiClient.get<{
    notifications: PortalNotification[];
    unreadCount: number;
  }>("/portal/notifications");
  return response.data;
}

export async function markPortalNotificationRead(notificationId: string) {
  const response = await apiClient.patch<PortalNotification>(
    `/portal/notifications/${notificationId}/read`
  );
  return response.data;
}

export async function markAllPortalNotificationsRead() {
  const response = await apiClient.post<{ success: boolean; count: number }>(
    "/portal/notifications/read-all"
  );
  return response.data;
}

export async function logoutPortal() {
  const response = await apiClient.post<null>("/portal/auth/logout");
  return response.data;
}
