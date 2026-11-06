"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPortalDashboard,
  getPortalMe,
  requestPortalLink,
  verifyPortalToken,
  reschedulePortalAppointment,
  cancelPortalAppointment,
  updatePortalProfile,
  logoutPortal,
  getPortalQuoteToken,
  getPortalContracts,
  getPortalContract,
  signPortalContract,
  acceptPortalQuote,
  getPortalAppointmentSlots,
  getPortalNotifications,
  markPortalNotificationRead,
  markAllPortalNotificationsRead,
} from "./api";
import type {
  RequestPortalLinkInput,
  VerifyPortalTokenInput,
  RescheduleAppointmentInput,
  CancelAppointmentInput,
  UpdatePortalProfileInput,
  SignPortalContractInput,
  AcceptPortalQuoteInput,
} from "./types";

export const portalKeys = {
  all: ["portal"] as const,
  me: () => [...portalKeys.all, "me"] as const,
  dashboard: () => [...portalKeys.all, "dashboard"] as const,
  contracts: () => [...portalKeys.all, "contracts"] as const,
  contract: (id: string) => [...portalKeys.all, "contract", id] as const,
  slots: (appointmentId: string, date: string) =>
    [...portalKeys.all, "slots", appointmentId, date] as const,
  notifications: () => [...portalKeys.all, "notifications"] as const,
};

export function usePortalDashboard(enabled = true) {
  return useQuery({
    queryKey: portalKeys.dashboard(),
    queryFn: getPortalDashboard,
    enabled,
    retry: 1,
    staleTime: 30 * 1000,
  });
}

export function usePortalMe(enabled = true) {
  return useQuery({
    queryKey: portalKeys.me(),
    queryFn: getPortalMe,
    enabled,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useRequestPortalLink() {
  return useMutation({
    mutationFn: (input: RequestPortalLinkInput) => requestPortalLink(input),
  });
}

export function useVerifyPortalToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyPortalTokenInput) => verifyPortalToken(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.all });
    },
  });
}

export function useReschedulePortalAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleAppointmentInput }) =>
      reschedulePortalAppointment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
    },
  });
}

export function useCancelPortalAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CancelAppointmentInput }) =>
      cancelPortalAppointment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
    },
  });
}

export function useUpdatePortalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePortalProfileInput) => updatePortalProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
    },
  });
}

export function usePortalQuoteToken() {
  return useMutation({
    mutationFn: (quoteId: string) => getPortalQuoteToken(quoteId),
  });
}

export function useLogoutPortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutPortal,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: portalKeys.all });
    },
  });
}

export function usePortalContracts(enabled = true) {
  return useQuery({
    queryKey: portalKeys.contracts(),
    queryFn: getPortalContracts,
    enabled,
    staleTime: 30 * 1000,
  });
}

export function usePortalContract(contractId: string, enabled = true) {
  return useQuery({
    queryKey: portalKeys.contract(contractId),
    queryFn: () => getPortalContract(contractId),
    enabled: Boolean(contractId) && enabled,
    staleTime: 15 * 1000,
  });
}

export function useSignPortalContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, input }: { contractId: string; input: SignPortalContractInput }) =>
      signPortalContract(contractId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: portalKeys.contracts() });
      queryClient.invalidateQueries({
        queryKey: portalKeys.contract(variables.contractId),
      });
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: portalKeys.notifications() });
    },
  });
}

export function useAcceptPortalQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, input }: { quoteId: string; input: AcceptPortalQuoteInput }) =>
      acceptPortalQuote(quoteId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: portalKeys.notifications() });
    },
  });
}

export function usePortalAppointmentSlots(appointmentId: string, dateStr: string, enabled = true) {
  return useQuery({
    queryKey: portalKeys.slots(appointmentId, dateStr),
    queryFn: () => getPortalAppointmentSlots(appointmentId, dateStr),
    enabled: Boolean(appointmentId) && Boolean(dateStr) && enabled,
    staleTime: 30 * 1000,
  });
}

export function usePortalNotifications(enabled = true) {
  return useQuery({
    queryKey: portalKeys.notifications(),
    queryFn: getPortalNotifications,
    enabled,
    refetchInterval: 30 * 1000,
    staleTime: 10 * 1000,
  });
}

export function useMarkPortalNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markPortalNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.notifications() });
    },
  });
}

export function useMarkAllPortalNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllPortalNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portalKeys.notifications() });
    },
  });
}
