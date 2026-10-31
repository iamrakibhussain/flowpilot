import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearReadNotifications,
  sendTestDiagnosticEmail,
  sendInvoiceEmail,
} from "./api";
import type { ListNotificationsParams } from "./types";

/**
 * Hook to retrieve notifications for the active organization
 * Polls every 45s for fresh updates
 */
export function useNotifications(params?: ListNotificationsParams) {
  const { organizationId } = useWorkspaceSession();

  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown>, organizationId),
    queryFn: () => getNotifications(params, organizationId),
    enabled: Boolean(organizationId),
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Mutation to mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mutation to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mutation to clear read notifications
 */
export function useClearReadNotifications() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: () => clearReadNotifications(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mutation to send a diagnostic test email
 */
export function useSendTestEmail() {
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (recipientEmail: string) => sendTestDiagnosticEmail(recipientEmail, organizationId),
  });
}

/**
 * Mutation to send invoice statement email directly to customer
 */
export function useSendInvoiceEmail() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (invoiceId: string) => sendInvoiceEmail(invoiceId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
