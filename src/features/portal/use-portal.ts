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
} from "./api";
import type {
  RequestPortalLinkInput,
  VerifyPortalTokenInput,
  RescheduleAppointmentInput,
  CancelAppointmentInput,
  UpdatePortalProfileInput,
} from "./types";

export const portalKeys = {
  all: ["portal"] as const,
  me: () => [...portalKeys.all, "me"] as const,
  dashboard: () => [...portalKeys.all, "dashboard"] as const,
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

export function useLogoutPortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutPortal,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: portalKeys.all });
    },
  });
}

