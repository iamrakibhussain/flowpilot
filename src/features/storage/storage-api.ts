import { apiClient } from "@/lib/api/client";
import type {
  StorageCategory,
  StorageUploadResult,
  StorageVisibility,
  UploadLogoResult,
  StorageSignedUrlResult,
} from "./types";

export interface UploadFileOptions {
  category?: StorageCategory;
  visibility?: StorageVisibility;
  organizationId?: string;
  customPrefix?: string;
}

/**
 * Upload an arbitrary file to multi-tenant cloud storage
 */
export async function uploadFile(
  file: File,
  options: UploadFileOptions = {}
): Promise<StorageUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.category) {
    formData.append("category", options.category);
  }
  if (options.visibility) {
    formData.append("visibility", options.visibility);
  }
  if (options.customPrefix) {
    formData.append("customPrefix", options.customPrefix);
  }

  const response = await apiClient.request<StorageUploadResult>(
    "POST",
    "/storage/upload",
    formData,
    {
      organizationId: options.organizationId,
    }
  );

  return response.data;
}

/**
 * Upload organization brand logo directly to cloud storage and persist in Organization settings
 */
export async function uploadOrganizationLogo(
  file: File,
  organizationId?: string
): Promise<UploadLogoResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.request<UploadLogoResult>(
    "POST",
    "/storage/upload/logo",
    formData,
    {
      organizationId,
    }
  );

  return response.data;
}

/**
 * Fetch a temporary signed URL for a private storage key
 */
export async function getSignedUrl(
  key: string,
  options: { expiresInSeconds?: number; downloadFilename?: string; organizationId?: string } = {}
): Promise<string> {
  const params: Record<string, string | number | undefined> = { key };
  if (options.expiresInSeconds) {
    params.expiresIn = options.expiresInSeconds;
  }
  if (options.downloadFilename) {
    params.download = options.downloadFilename;
  }

  const response = await apiClient.request<StorageSignedUrlResult>(
    "GET",
    "/storage/signed-url",
    undefined,
    {
      params,
      organizationId: options.organizationId,
    }
  );

  return response.data.signedUrl;
}

/**
 * Delete a file from multi-tenant storage (Requires OWNER or ADMIN role)
 */
export async function deleteStorageFile(
  key: string,
  organizationId?: string
): Promise<{ deleted: boolean; key: string }> {
  const response = await apiClient.request<{ deleted: boolean; key: string }>(
    "DELETE",
    "/storage/files",
    undefined,
    {
      params: { key },
      organizationId,
    }
  );

  return response.data;
}
