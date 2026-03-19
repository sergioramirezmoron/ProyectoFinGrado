import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCatalog, CATALOG_ITEMS_PER_PAGE } from "../../hooks/useCatalog";
import type { Vehicle, SelectOption } from "../../types/vehicle";

vi.mock("../../services/vehicleService", () => ({
  getAllVehicles: vi.fn(),
  getCatalogOptions: vi.fn(),
}));

import { getAllVehicles, getCatalogOptions } from "../../services/vehicleService";

const makeOption = (id: number, name: string): SelectOption => ({
  id,
  "@id": `/api/options/${id}`,
  name,
});

const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1,
  "@id": "/api/vehicles/1",
  brand: makeOption(1, "Toyota"),
  model: makeOption(1, "Yaris"),
  fuelType: makeOption(1, "Gasolina"),
  transmission: makeOption(1, "Manual"),
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

const emptyOptions = [
  { data: { member: [] } },
  { data: { member: [] } },
  { data: { member: [] } },
  { data: { member: [] } },
  { data: { member: [] } },
  { data: { member: [] } },
];

describe("useCatalog — mode filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogOptions).mockResolvedValue(emptyOptions as never);
  });

  it("shows only SALE vehicles in SALE mode", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE" }),
      makeVehicle({ id: 2, type: "RENT" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].type).toBe("SALE");
  });

  it("shows only RENT vehicles in RENT mode", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE" }),
      makeVehicle({ id: 2, type: "RENT", status: "AVAILABLE" }),
    ]);

    const { result } = renderHook(() => useCatalog("RENT"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].type).toBe("RENT");
  });

  it("RENT mode only shows AVAILABLE vehicles", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "RENT", status: "AVAILABLE" }),
      makeVehicle({ id: 2, type: "RENT", status: "RESERVED" }),
    ]);

    const { result } = renderHook(() => useCatalog("RENT"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].status).toBe("AVAILABLE");
  });

  it("SALE mode hides SOLD vehicles when no status filter", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE" }),
      makeVehicle({ id: 2, type: "SALE", status: "SOLD" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].status).toBe("AVAILABLE");
  });

  it("SALE mode hides DELETED vehicles", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE" }),
      makeVehicle({ id: 2, type: "SALE", status: "DELETED" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(1);
  });

  it("SALE mode shows RESERVED vehicles when no filter", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE" }),
      makeVehicle({ id: 2, type: "SALE", status: "RESERVED" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(2);
  });

  it("SALE mode shows only SOLD when status filter is SOLD", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE" }),
      makeVehicle({ id: 2, type: "SALE", status: "SOLD" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "status", value: "SOLD" },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].status).toBe("SOLD");
  });
});

describe("useCatalog — price filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogOptions).mockResolvedValue(emptyOptions as never);
  });

  it("filters by minimum price in SALE mode", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", price: 15000 }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", price: 30000 }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "minPrice", value: "20000" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].id).toBe(2);
  });

  it("filters by maximum price in SALE mode", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", price: 15000 }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", price: 30000 }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "maxPrice", value: "20000" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].id).toBe(1);
  });

  it("filters by daily price in RENT mode", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "RENT", status: "AVAILABLE", dailyPrice: "50" }),
      makeVehicle({ id: 2, type: "RENT", status: "AVAILABLE", dailyPrice: "200" }),
    ]);

    const { result } = renderHook(() => useCatalog("RENT"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "maxPrice", value: "100" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].id).toBe(1);
  });
});

describe("useCatalog — year filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogOptions).mockResolvedValue(emptyOptions as never);
  });

  it("filters by minimum year", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", year: 2018 }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", year: 2023 }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "minYear", value: "2020" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].year).toBe(2023);
  });

  it("filters by maximum year", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", year: 2018 }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", year: 2023 }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "maxYear", value: "2020" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.displayedVehicles).toHaveLength(1);
    expect(result.current.displayedVehicles[0].year).toBe(2018);
  });
});

describe("useCatalog — sorting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogOptions).mockResolvedValue(emptyOptions as never);
  });

  it("sorts by price ascending", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", price: 30000, createdAt: "2026-01-01T00:00:00+00:00" }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", price: 15000, createdAt: "2026-02-01T00:00:00+00:00" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSort("price_asc"));

    expect(result.current.displayedVehicles[0].id).toBe(2); // cheaper first
    expect(result.current.displayedVehicles[1].id).toBe(1);
  });

  it("sorts by price descending", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", price: 15000, createdAt: "2026-01-01T00:00:00+00:00" }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", price: 30000, createdAt: "2026-02-01T00:00:00+00:00" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSort("price_desc"));

    expect(result.current.displayedVehicles[0].id).toBe(2); // more expensive first
  });

  it("sorts by year descending", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", year: 2020, createdAt: "2026-01-01T00:00:00+00:00" }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", year: 2024, createdAt: "2026-02-01T00:00:00+00:00" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSort("year_desc"));

    expect(result.current.displayedVehicles[0].year).toBe(2024);
    expect(result.current.displayedVehicles[1].year).toBe(2020);
  });

  it("sorts by createdAt descending by default", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", createdAt: "2026-01-01T00:00:00+00:00" }),
      makeVehicle({ id: 2, type: "SALE", status: "AVAILABLE", createdAt: "2026-03-01T00:00:00+00:00" }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sort).toBe("createdAt_desc");
    expect(result.current.displayedVehicles[0].id).toBe(2); // newest first
  });
});

describe("useCatalog — pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogOptions).mockResolvedValue(emptyOptions as never);
  });

  it(`shows ${CATALOG_ITEMS_PER_PAGE} items per page`, async () => {
    const vehicles = Array.from({ length: 20 }, (_, i) =>
      makeVehicle({ id: i + 1, type: "SALE", status: "AVAILABLE", createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00+00:00` })
    );
    vi.mocked(getAllVehicles).mockResolvedValueOnce(vehicles);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayedVehicles).toHaveLength(CATALOG_ITEMS_PER_PAGE);
    expect(result.current.totalPages).toBe(Math.ceil(20 / CATALOG_ITEMS_PER_PAGE));
  });

  it("shows page 2 when page is set to 2", async () => {
    const vehicles = Array.from({ length: 15 }, (_, i) =>
      makeVehicle({ id: i + 1, type: "SALE", status: "AVAILABLE", createdAt: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00+00:00` })
    );
    vi.mocked(getAllVehicles).mockResolvedValueOnce(vehicles);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    expect(result.current.displayedVehicles).toHaveLength(3); // 15 - 12 = 3
  });

  it("resets to page 1 when filters change", async () => {
    const vehicles = Array.from({ length: 30 }, (_, i) =>
      makeVehicle({ id: i + 1, type: "SALE", status: "AVAILABLE", createdAt: `2026-01-01T00:00:0${i % 10}+00:00` })
    );
    vi.mocked(getAllVehicles).mockResolvedValueOnce(vehicles);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.handleFilterChange({
        target: { name: "minPrice", value: "10000" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.page).toBe(1);
  });

  it("totalPages is 1 when no vehicles match", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
  });
});

describe("useCatalog — handleClearFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogOptions).mockResolvedValue(emptyOptions as never);
  });

  it("resets all filters to empty values", async () => {
    vi.mocked(getAllVehicles).mockResolvedValueOnce([
      makeVehicle({ id: 1, type: "SALE", status: "AVAILABLE", price: 30000 }),
    ]);

    const { result } = renderHook(() => useCatalog("SALE"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleFilterChange({
        target: { name: "minPrice", value: "25000" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.filters.minPrice).toBe("25000");

    act(() => result.current.handleClearFilters());

    expect(result.current.filters.minPrice).toBe("");
    expect(result.current.filters.brand).toBe("");
    expect(result.current.filters.status).toBe("");
  });
});
