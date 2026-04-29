import { describe, it, expect } from "vitest";
import {
  buildImageUrl,
  getMainVehicleImage,
  getMainImageOrNull,
} from "../../utils/vehicleImages";
import type { VehicleImage } from "../../types/vehicle";

const PLACEHOLDER = "https://placehold.co/600x400?text=Sin+Foto";

describe("buildImageUrl", () => {
  it("returns an absolute URL unchanged (http)", () => {
    const url = "http://example.com/images/car.jpg";
    expect(buildImageUrl(url)).toBe(url);
  });

  it("returns an absolute URL unchanged (https)", () => {
    const url = "https://cdn.example.com/images/car.jpg";
    expect(buildImageUrl(url)).toBe(url);
  });

  it("returns a proxy-served relative path unchanged", () => {
    const path = "/images/vehicles/abc123.jpg";
    expect(buildImageUrl(path)).toBe(path);
  });

  it("handles relative paths without leading slash", () => {
    const path = "images/vehicles/abc123.jpg";
    expect(buildImageUrl(path)).toBe(path);
  });

  it("handles deeply nested relative paths", () => {
    const path = "/images/enviromentalBadges/eco.png";
    expect(buildImageUrl(path)).toBe(path);
  });
});

describe("getMainVehicleImage", () => {
  it("returns placeholder when images is null", () => {
    expect(getMainVehicleImage(null)).toBe(PLACEHOLDER);
  });

  it("returns placeholder when images is undefined", () => {
    expect(getMainVehicleImage(undefined)).toBe(PLACEHOLDER);
  });

  it("returns placeholder when images array is empty", () => {
    expect(getMainVehicleImage([])).toBe(PLACEHOLDER);
  });

  it("returns the main image URL when one is marked as main", () => {
    const images: VehicleImage[] = [
      {
        id: 1,
        "@id": "/api/vehicle_images/1",
        filename: "secondary.jpg",
        imageUrl: "/images/vehicles/secondary.jpg",
        main: false,
      },
      {
        id: 2,
        "@id": "/api/vehicle_images/2",
        filename: "main.jpg",
        imageUrl: "/images/vehicles/main.jpg",
        main: true,
      },
    ];
    expect(getMainVehicleImage(images)).toBe("/images/vehicles/main.jpg");
  });

  it("returns the first image when no image is marked as main", () => {
    const images: VehicleImage[] = [
      {
        id: 1,
        "@id": "/api/vehicle_images/1",
        filename: "first.jpg",
        imageUrl: "/images/vehicles/first.jpg",
        main: false,
      },
      {
        id: 2,
        "@id": "/api/vehicle_images/2",
        filename: "second.jpg",
        imageUrl: "/images/vehicles/second.jpg",
        main: false,
      },
    ];
    expect(getMainVehicleImage(images)).toBe("/images/vehicles/first.jpg");
  });

  it("returns built URL for a single image", () => {
    const images: VehicleImage[] = [
      {
        id: 1,
        "@id": "/api/vehicle_images/1",
        filename: "only.jpg",
        imageUrl: "/images/vehicles/only.jpg",
        main: true,
      },
    ];
    expect(getMainVehicleImage(images)).toBe("/images/vehicles/only.jpg");
  });

  it("does not prepend BACKEND_URL to absolute image URLs", () => {
    const images: VehicleImage[] = [
      {
        id: 1,
        "@id": "/api/vehicle_images/1",
        filename: "absolute.jpg",
        imageUrl: "https://cdn.example.com/images/absolute.jpg",
        main: true,
      },
    ];
    expect(getMainVehicleImage(images)).toBe(
      "https://cdn.example.com/images/absolute.jpg"
    );
  });
});

describe("getMainImageOrNull", () => {
  it("returns null when images is null", () => {
    expect(getMainImageOrNull(null)).toBeNull();
  });

  it("returns null when images is undefined", () => {
    expect(getMainImageOrNull(undefined)).toBeNull();
  });

  it("returns null when images array is empty", () => {
    expect(getMainImageOrNull([])).toBeNull();
  });

  it("returns built URL for main image", () => {
    const images = [
      { imageUrl: "/images/vehicles/secondary.jpg", main: false },
      { imageUrl: "/images/vehicles/main.jpg", main: true },
    ];
    expect(getMainImageOrNull(images)).toBe("/images/vehicles/main.jpg");
  });

  it("returns first image URL when no main is set", () => {
    const images = [
      { imageUrl: "/images/vehicles/first.jpg", main: false },
      { imageUrl: "/images/vehicles/second.jpg", main: false },
    ];
    expect(getMainImageOrNull(images)).toBe("/images/vehicles/first.jpg");
  });

  it("returns null (not placeholder) when empty — differs from getMainVehicleImage", () => {
    expect(getMainImageOrNull([])).toBeNull();
    expect(getMainVehicleImage([])).toBe(PLACEHOLDER);
  });
});
