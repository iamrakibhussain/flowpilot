export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "INVOICE_ISSUED"
  | "PAYMENT_RECEIVED"
  | "TEAM_INVITE"
  | "SECURITY_ALERT"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  organizationId: string;
  userId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}
