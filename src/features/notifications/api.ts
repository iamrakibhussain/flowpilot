import { apiClient } from "@/lib/api/client";
import type { NotificationItem, NotificationListResponse, ListNotificationsParams } from "./types";

/**
 * Fetch paginated list of notifications with unread count
 */
export async function getNotifications(
  params?: ListNotificationsParams,
  organizationId?: string
): Promise<NotificationListResponse> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);
  if (params?.isRead !== undefined) queryParams.isRead = String(params.isRead);
  if (params?.type) queryParams.type = params.type;

  const response = await apiClient.get<NotificationListResponse>("/notifications", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  organizationId?: string
): Promise<NotificationItem> {
  const response = await apiClient.patch<NotificationItem>(
    `/notifications/${notificationId}/read`,
    {},
    { organizationId }
  );
  return response.data;
}

/**
 * Mark all unread notifications as read
 */
export async function markAllNotificationsAsRead(
  organizationId?: string
): Promise<{ updatedCount: number }> {
  const response = await apiClient.patch<{ updatedCount: number }>(
    "/notifications/read-all",
    {},
    { organizationId }
  );
  return response.data;
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications(
  organizationId?: string
): Promise<{ deletedCount: number }> {
  const response = await apiClient.delete<{ deletedCount: number }>("/notifications/clear-read", {
    organizationId,
  });
  return response.data;
}

/**
 * Dispatch diagnostic test email to verify SMTP / mail delivery
 */
export async function sendTestDiagnosticEmail(
  recipientEmail: string,
  organizationId?: string
): Promise<{ deliveredTo: string; messageId?: string }> {
  const response = await apiClient.post<{ deliveredTo: string; messageId?: string }>(
    "/notifications/test-email",
    { recipientEmail },
    { organizationId }
  );
  return response.data;
}

/**
 * Dispatch invoice statement email to customer (INV-08)
 */
export async function sendInvoiceEmail(
  invoiceId: string,
  organizationId?: string
): Promise<{ success: boolean; deliveredTo: string }> {
  const response = await apiClient.post<{ success: boolean; deliveredTo: string }>(
    `/invoices/${invoiceId}/send-email`,
    {},
    { organizationId }
  );
  return response.data;
}
