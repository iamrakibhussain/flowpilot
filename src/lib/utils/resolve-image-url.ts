/**
 * Resolves a storage or image URL to ensure it loads reliably in any browser context.
 * - Handles relative `/api/v1/...` URLs
 * - Normalizes legacy `%2F` / `%2f` sequences to clean `/`
 * - Leaves absolute URLs (`http://`, `https://`, `data:`) intact
 */
export function resolveStorageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Clean any accidental encoded slashes
  const cleanUrl = trimmed.replace(/%2f/gi, "/");

  // If already absolute or data url, return as is
  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("data:")
  ) {
    return cleanUrl;
  }

  // If relative path starting with /
  if (cleanUrl.startsWith("/")) {
    return cleanUrl;
  }

  return `/${cleanUrl}`;
}
