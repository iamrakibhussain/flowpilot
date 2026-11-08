"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import {
  uploadFile,
  uploadOrganizationLogo,
  deleteStorageFile,
  getSignedUrl,
  UploadFileOptions,
} from "./storage-api";
import type { StorageUploadResult, UploadLogoResult } from "./types";

/**
 * Mutation hook to upload an arbitrary file to multi-tenant cloud storage
 */
export function useUploadFile() {
  return useMutation<StorageUploadResult, Error, { file: File; options?: UploadFileOptions }>({
    mutationFn: ({ file, options }) => uploadFile(file, options),
  });
}

/**
 * Mutation hook for workspace brand logo upload.
 * Automatically invalidates organization settings query cache upon success.
 */
export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();

  return useMutation<UploadLogoResult, Error, { file: File; organizationId?: string }>({
    mutationFn: ({ file, organizationId }) => uploadOrganizationLogo(file, organizationId),
    onSuccess: (data) => {
      // Optimistically update the settings query cache for instant display across the UI
      queryClient.setQueriesData({ queryKey: queryKeys.organizations.all }, (old: unknown) => {
        if (old && typeof old === "object" && "logoUrl" in old) {
          return { ...(old as Record<string, unknown>), logoUrl: data.logoUrl };
        }
        return old;
      });
      // Refresh organization settings across the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: ["workspace-session"] });
    },
  });
}

/**
 * Mutation hook to delete a file from multi-tenant storage
 */
export function useDeleteStorageFile() {
  return useMutation<
    { deleted: boolean; key: string },
    Error,
    { key: string; organizationId?: string }
  >({
    mutationFn: ({ key, organizationId }) => deleteStorageFile(key, organizationId),
  });
}

export { getSignedUrl };
