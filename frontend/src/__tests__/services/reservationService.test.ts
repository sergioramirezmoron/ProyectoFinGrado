import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getVehicleReservations,
  getUserReservations,
  getAllReservations,
  updateReservationStatus,
  createReservation,
} from "../../services/reservationService";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("getVehicleReservations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET with vehicleId and status=CONFIRMED filter", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getVehicleReservations("425");

    expect(api.get).toHaveBeenCalledWith(
      "/reservations/availability?vehicle.id=425&status=CONFIRMED"
    );
  });

  it("passes different vehicleIds correctly", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getVehicleReservations("999");

    expect(api.get).toHaveBeenCalledWith(
      "/reservations/availability?vehicle.id=999&status=CONFIRMED"
    );
  });
});

describe("getUserReservations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET with user.id filter", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getUserReservations(3);

    expect(api.get).toHaveBeenCalledWith("/reservations?user.id=3");
  });

  it("uses numeric user ID", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getUserReservations(42);

    expect(api.get).toHaveBeenCalledWith("/reservations?user.id=42");
  });
});

describe("getAllReservations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /reservations without filter when no status given", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getAllReservations();

    expect(api.get).toHaveBeenCalledWith("/reservations?itemsPerPage=500");
  });

  it("appends status param when status is provided", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getAllReservations("PENDING");

    expect(api.get).toHaveBeenCalledWith(
      "/reservations?itemsPerPage=500&status=PENDING"
    );
  });

  it("works with CONFIRMED status filter", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getAllReservations("CONFIRMED");

    expect(api.get).toHaveBeenCalledWith(
      "/reservations?itemsPerPage=500&status=CONFIRMED"
    );
  });

  it("works with CANCELLED status filter", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { "hydra:member": [] } });

    await getAllReservations("CANCELLED");

    expect(api.get).toHaveBeenCalledWith(
      "/reservations?itemsPerPage=500&status=CANCELLED"
    );
  });
});

describe("updateReservationStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PATCH /reservations/:id with status and merge-patch+json header", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await updateReservationStatus(16, "CONFIRMED");

    expect(api.patch).toHaveBeenCalledWith(
      "/reservations/16",
      { status: "CONFIRMED" },
      { headers: { "Content-Type": "application/merge-patch+json" } }
    );
  });

  it("works with CANCELLED status", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await updateReservationStatus(5, "CANCELLED");

    expect(api.patch).toHaveBeenCalledWith(
      "/reservations/5",
      { status: "CANCELLED" },
      { headers: { "Content-Type": "application/merge-patch+json" } }
    );
  });

  it("works with REJECTED status", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await updateReservationStatus(10, "REJECTED");

    expect(api.patch).toHaveBeenCalledWith(
      "/reservations/10",
      { status: "REJECTED" },
      expect.anything()
    );
  });
});

describe("createReservation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /reservations with the full payload", async () => {
    const payload = {
      startDate: "2026-05-10",
      endDate: "2026-05-15",
      vehicle: "/api/vehicles/425",
      user: "/api/users/3",
    };
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 17, ...payload } });

    await createReservation(payload);

    expect(api.post).toHaveBeenCalledWith("/reservations", payload);
  });

  it("returns the created reservation data", async () => {
    const payload = {
      startDate: "2026-06-01",
      endDate: "2026-06-05",
      vehicle: "/api/vehicles/1",
      user: "/api/users/1",
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { id: 99, ...payload, totalPrice: 84 },
    });

    const res = await createReservation(payload);

    expect((res as { data: { id: number } }).data.id).toBe(99);
  });
});
