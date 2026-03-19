import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getVehicle,
  createVehicle,
  updateVehicle,
  uploadVehicleImage,
  getVehicles,
  archiveVehicle,
  getCatalogOptions,
  getAllVehicles,
  getFeaturedVehicles,
  getVehicleDetail,
  loadFormOptions,
} from "../../services/vehicleService";
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

const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1,
  "@id": "/api/vehicles/1",
  brand: { id: 1, "@id": "/api/brands/1", name: "Toyota" },
  model: { id: 1, "@id": "/api/models/1", name: "Yaris" },
  fuelType: { id: 1, "@id": "/api/fuels/1", name: "Gasolina" },
  transmission: { id: 1, "@id": "/api/transmissions/1", name: "Manual" },
  year: 2023,
  kilometres: 10000,
  power: 100,
  status: "AVAILABLE",
  type: "SALE",
  price: 25000,
  vehicleImages: [],
  createdAt: "2026-01-01T00:00:00+00:00",
  ...overrides,
});

describe("getVehicle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /vehicles/:id", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: makeVehicle() });
    await getVehicle("1");
    expect(api.get).toHaveBeenCalledWith("/vehicles/1");
  });

  it("passes the correct ID in the URL", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: makeVehicle({ id: 42 }) });
    await getVehicle("42");
    expect(api.get).toHaveBeenCalledWith("/vehicles/42");
  });
});

describe("getVehicleDetail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /vehicles/:id", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: makeVehicle() });
    await getVehicleDetail("5");
    expect(api.get).toHaveBeenCalledWith("/vehicles/5");
  });
});

describe("createVehicle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /vehicles with the payload", async () => {
    const payload = { brand: "/api/brands/1", year: 2023, type: "SALE" };
    vi.mocked(api.post).mockResolvedValueOnce({ data: makeVehicle() });

    await createVehicle(payload);

    expect(api.post).toHaveBeenCalledWith("/vehicles", payload);
  });
});

describe("updateVehicle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PATCH /vehicles/:id with merge-patch+json header", async () => {
    const payload = { price: "30000" };
    vi.mocked(api.patch).mockResolvedValueOnce({ data: makeVehicle() });

    await updateVehicle("1", payload);

    expect(api.patch).toHaveBeenCalledWith("/vehicles/1", payload, {
      headers: { "Content-Type": "application/merge-patch+json" },
    });
  });
});

describe("archiveVehicle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PATCH with status=DELETED and merge-patch+json header", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await archiveVehicle(1);

    expect(api.patch).toHaveBeenCalledWith(
      "/vehicles/1",
      { status: "DELETED" },
      { headers: { "Content-Type": "application/merge-patch+json" } }
    );
  });
});

describe("getVehicles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes page parameter in URL", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    await getVehicles(2);

    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("page=2"));
  });

  it("includes brand.name search term when provided", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    await getVehicles(1, "Toyota");

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("brand.name=Toyota")
    );
  });

  it("does not include brand.name when searchTerm is not provided", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    await getVehicles(1);

    expect(api.get).not.toHaveBeenCalledWith(
      expect.stringContaining("brand.name")
    );
  });
});

describe("uploadVehicleImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /vehicle_images with FormData", async () => {
    const file = new File(["img"], "car.jpg", { type: "image/jpeg" });
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1 } });

    await uploadVehicleImage(file, true);

    expect(api.post).toHaveBeenCalledWith(
      "/vehicle_images",
      expect.any(FormData)
    );
  });

  it("sets main=1 when isMain is true", async () => {
    const file = new File(["img"], "car.jpg", { type: "image/jpeg" });
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1 } });

    await uploadVehicleImage(file, true);

    const formData = vi.mocked(api.post).mock.calls[0][1] as FormData;
    expect(formData.get("main")).toBe("1");
  });

  it("sets main=0 when isMain is false", async () => {
    const file = new File(["img"], "secondary.jpg", { type: "image/jpeg" });
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 2 } });

    await uploadVehicleImage(file, false);

    const formData = vi.mocked(api.post).mock.calls[0][1] as FormData;
    expect(formData.get("main")).toBe("0");
  });
});

describe("getCatalogOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("makes exactly 6 GET requests", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { member: [] } });

    await getCatalogOptions();

    expect(api.get).toHaveBeenCalledTimes(6);
  });

  it("fetches brands, fuels, transmissions, provinces, colors, body_types", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { member: [] } });

    await getCatalogOptions();

    expect(api.get).toHaveBeenCalledWith("/brands");
    expect(api.get).toHaveBeenCalledWith("/fuels");
    expect(api.get).toHaveBeenCalledWith("/transmissions");
    expect(api.get).toHaveBeenCalledWith("/provinces");
    expect(api.get).toHaveBeenCalledWith("/colors");
    expect(api.get).toHaveBeenCalledWith("/body_types");
  });
});

describe("loadFormOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("makes exactly 8 GET requests", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { member: [] } });

    await loadFormOptions();

    expect(api.get).toHaveBeenCalledTimes(8);
  });

  it("also fetches enviromental_badges and models", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { member: [] } });

    await loadFormOptions();

    expect(api.get).toHaveBeenCalledWith("/enviromental_badges");
    expect(api.get).toHaveBeenCalledWith("/models");
  });
});

describe("getAllVehicles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all vehicles from a single page", async () => {
    const vehicles = [makeVehicle({ id: 1 }), makeVehicle({ id: 2 })];
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { member: vehicles, totalItems: 2 },
    });

    const result = await getAllVehicles();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it("paginates through multiple pages", async () => {
    const page1 = Array.from({ length: 30 }, (_, i) => makeVehicle({ id: i + 1 }));
    const page2 = [makeVehicle({ id: 31 }), makeVehicle({ id: 32 })];

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { member: page1, totalItems: 32 } })
      .mockResolvedValueOnce({ data: { member: page2, totalItems: 32 } });

    const result = await getAllVehicles();

    expect(result).toHaveLength(32);
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("returns empty array when no vehicles exist", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { member: [], totalItems: 0 },
    });

    const result = await getAllVehicles();

    expect(result).toEqual([]);
  });
});

describe("getFeaturedVehicles", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns at most 5 vehicles", async () => {
    const vehicles = Array.from({ length: 10 }, (_, i) =>
      makeVehicle({ id: i + 1, type: "SALE", status: "AVAILABLE", createdAt: `2026-0${(i % 9) + 1}-01T00:00:00+00:00` })
    );
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { member: vehicles },
    });

    const result = await getFeaturedVehicles();

    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("only returns SALE / AVAILABLE vehicles", async () => {
    const vehicles = [
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE" }),
      makeVehicle({ id: 2, type: "RENT", status: "AVAILABLE" }),
      makeVehicle({ id: 3, type: "SALE", status: "SOLD" }),
    ];
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { member: vehicles },
    });

    const result = await getFeaturedVehicles();

    expect(result.every((v) => v.type === "SALE" && v.status === "AVAILABLE")).toBe(true);
  });

  it("sorts vehicles by createdAt descending (newest first)", async () => {
    const vehicles = [
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", createdAt: "2026-01-01T00:00:00+00:00" }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", createdAt: "2026-03-01T00:00:00+00:00" }),
      makeVehicle({ id: 3, type: "SALE", status: "AVAILABLE", createdAt: "2026-02-01T00:00:00+00:00" }),
    ];
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { member: vehicles },
    });

    const result = await getFeaturedVehicles();

    expect(result[0].id).toBe(2); // newest
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1); // oldest
  });
});
