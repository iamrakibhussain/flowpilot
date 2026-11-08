export type StorageCategory = "branding" | "documents" | "avatars" | "exports" | "attachments";

export type StorageVisibility = "public" | "private";

export interface StorageUploadResult {
  key: string;
  url: string;
  publicUrl?: string;
  signedUrl?: string;
  originalFilename: string;
  sanitizedFilename: string;
  mimeType: string;
  sizeBytes: number;
  category: StorageCategory;
  organizationId: string;
  visibility: StorageVisibility;
  createdAt: string;
}

export interface UploadLogoResult {
  upload: StorageUploadResult;
  logoUrl: string;
}

export interface StorageSignedUrlResult {
  key: string;
  signedUrl: string;
}
