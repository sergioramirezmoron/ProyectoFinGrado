import type { VehicleImage } from "../types/vehicle";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

/**
 * Build a full URL from a relative image path.
 * Returns the path unchanged if it already includes "http".
 */
export const buildImageUrl = (path: string): string => {
  if (path.includes("http")) return path;
  return `${BACKEND_URL}${path}`;
};

/**
 * Get the main vehicle image URL, or a placeholder if no images exist.
 */
export const getMainVehicleImage = (
  images: VehicleImage[] | undefined | null,
): string => {
  if (!images?.length) return "https://via.placeholder.com/600x400?text=Sin+Foto";
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
