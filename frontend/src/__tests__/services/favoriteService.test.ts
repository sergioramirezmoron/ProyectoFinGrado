import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFavoriteVehicles } from "../../services/favoriteService";
import type { Vehicle } from "../../types/vehicle";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

const makeVehicle = (id: number): Vehicle => ({
  id,
  "@id": `/api/vehicles/${id}`,
  brand: { id: 1, "@id": "/api/brands/1", name: "Toyota" },
  model: { id: 1, "@id": "/api/models/1", name: "Yaris" },
  fuelType: { id: 1, "@id": "/api/fuels/1", name: "Gasolina" },
  transmission: { id: 1, "@id": "/api/transmissions/1", name: "Manual" },
  year: 2023,
  kilometres: 10000,
  power: 100,
  status: "AVAILABLE",
  type: "SALE",
  vehicleImages: [],
  createdAt: "2026-01-01T00:00:00+00:00",
});

describe("getFavoriteVehicles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when given empty IRI list", async () => {
    const result = await getFavoriteVehicles([]);
    expect(result).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("fetches each vehicle by its IRI (strips /api/ prefix)", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: makeVehicle(1) });

    await getFavoriteVehicles(["/api/vehicles/1"]);

    expect(api.get).toHaveBeenCalledWith("/vehicles/1");
  });

  it("returns one vehicle for one IRI", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: makeVehicle(1) });

    const result = await getFavoriteVehicles(["/api/vehicles/1"]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns multiple vehicles for multiple IRIs", async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: makeVehicle(1) })
      .mockResolvedValueOnce({ data: makeVehicle(2) })
      .mockResolvedValueOnce({ data: makeVehicle(3) });

    const result = await getFavoriteVehicles([
      "/api/vehicles/1",
      "/api/vehicles/2",
      "/api/vehicles/3",
    ]);

    expect(result).toHaveLength(3);
  });

  it("skips failed fetches and returns only successful ones", async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: makeVehicle(1) })
      .mockRejectedValueOnce(new Error("Not Found"))
      .mockResolvedValueOnce({ data: makeVehicle(3) });

    const result = await getFavoriteVehicles([
      "/api/vehicles/1",
      "/api/vehicles/2",
      "/api/vehicles/3",
    ]);

    expect(result).toHaveLength(2);
    expect(result.map((v) => v.id)).toContain(1);
    expect(result.map((v) => v.id)).toContain(3);
    expect(result.map((v) => v.id)).not.toContain(2);
  });

  it("returns empty array when all fetches fail", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce(new Error("Error 1"))
      .mockRejectedValueOnce(new Error("Error 2"));

    const result = await getFavoriteVehicles(["/api/vehicles/1", "/api/vehicles/2"]);

    expect(result).toEqual([]);
  });
});
