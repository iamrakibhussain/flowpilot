import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api/client";
import {
  uploadFile,
  uploadOrganizationLogo,
  getSignedUrl,
  deleteStorageFile,
} from "../storage-api";

describe("Storage Frontend API Client Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uploadFile should package file into FormData and call /storage/upload", async () => {
    const mockResult = {
      key: "organizations/org-123/branding/uuid-logo.png",
      url: "https://storage.flowpilot.io/logo.png",
      originalFilename: "logo.png",
      sanitizedFilename: "logo.png",
      mimeType: "image/png",
      sizeBytes: 1024,
      category: "branding",
      organizationId: "org-123",
      visibility: "public",
      createdAt: new Date().toISOString(),
    };

    const requestSpy = vi
      .spyOn(apiClient, "request")
      .mockResolvedValueOnce({ success: true, data: mockResult });

    const dummyFile = new File(["dummy-bytes"], "logo.png", { type: "image/png" });

    const result = await uploadFile(dummyFile, {
      category: "branding",
      visibility: "public",
      organizationId: "org-123",
    });

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const [method, endpoint, body, options] = requestSpy.mock.calls[0];
    expect(method).toBe("POST");
    expect(endpoint).toBe("/storage/upload");
    expect(body).toBeInstanceOf(FormData);
    expect(options?.organizationId).toBe("org-123");
    expect(result).toEqual(mockResult);
  });

  it("uploadOrganizationLogo should call /storage/upload/logo", async () => {
    const mockLogoResult = {
      upload: {
        key: "organizations/org-123/branding/uuid-logo.png",
        url: "https://storage.flowpilot.io/logo.png",
        originalFilename: "logo.png",
        sanitizedFilename: "logo.png",
        mimeType: "image/png",
        sizeBytes: 1024,
        category: "branding" as const,
        organizationId: "org-123",
        visibility: "public" as const,
        createdAt: new Date().toISOString(),
      },
      logoUrl: "https://storage.flowpilot.io/logo.png",
    };

    const requestSpy = vi
      .spyOn(apiClient, "request")
      .mockResolvedValueOnce({ success: true, data: mockLogoResult });

    const dummyFile = new File(["dummy-bytes"], "logo.png", { type: "image/png" });

    const result = await uploadOrganizationLogo(dummyFile, "org-123");

    expect(requestSpy).toHaveBeenCalledWith(
      "POST",
      "/storage/upload/logo",
      expect.any(FormData),
      expect.objectContaining({ organizationId: "org-123" })
    );
    expect(result.logoUrl).toBe("https://storage.flowpilot.io/logo.png");
  });

  it("getSignedUrl should request /storage/signed-url with query params", async () => {
    vi.spyOn(apiClient, "request").mockResolvedValueOnce({
      success: true,
      data: { key: "org/doc.pdf", signedUrl: "https://signed.url/token" },
    });

    const url = await getSignedUrl("org/doc.pdf", {
      expiresInSeconds: 300,
      organizationId: "org-123",
    });

    expect(url).toBe("https://signed.url/token");
    expect(apiClient.request).toHaveBeenCalledWith(
      "GET",
      "/storage/signed-url",
      undefined,
      expect.objectContaining({
        params: expect.objectContaining({ key: "org/doc.pdf", expiresIn: 300 }),
        organizationId: "org-123",
      })
    );
  });

  it("deleteStorageFile should call DELETE /storage/files", async () => {
    vi.spyOn(apiClient, "request").mockResolvedValueOnce({
      success: true,
      data: { deleted: true, key: "org/doc.pdf" },
    });

    const result = await deleteStorageFile("org/doc.pdf", "org-123");
    expect(result.deleted).toBe(true);
    expect(apiClient.request).toHaveBeenCalledWith(
      "DELETE",
      "/storage/files",
      undefined,
      expect.objectContaining({
        params: { key: "org/doc.pdf" },
        organizationId: "org-123",
      })
    );
  });
});
