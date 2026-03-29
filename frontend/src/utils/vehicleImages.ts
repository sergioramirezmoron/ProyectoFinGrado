import type { VehicleImage } from "../types/vehicle";

/**
 * Build a full URL from a relative image path.
 * Handles cases where the DB filename is already a full URL (placehold.co, etc.)
 * and where it's a real file served via nginx proxy to the backend.
 */
export const buildImageUrl = (path: string): string => {
  if (!path) return "https://placehold.co/600x400?text=Sin+Foto";
  // Already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Relative path — nginx proxies /images/ to the backend
  return path;
};

/**
 * Get the main vehicle image URL, or a placeholder if no images exist.
 */
export const getMainVehicleImage = (
  images: VehicleImage[] | undefined | null,
): string => {
  if (!images?.length) return "https://placehold.co/600x400?text=Sin+Foto";
  const main = images.find((img) => img.main) ?? images[0];
  return buildImageUrl(main.imageUrl);
};

/**
 * Get the main vehicle image URL from a lightweight image shape, or null if no images exist.
 * Accepts the minimal { imageUrl, main } shape used in reservations.
 */
export const getMainImageOrNull = (
  images: { imageUrl: string; main: boolean }[] | undefined | null,
): string | null => {
  if (!images?.length) return null;
  const main = images.find((img) => img.main) ?? images[0];
  return buildImageUrl(main.imageUrl);
};
