import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAdminReservations } from "../../hooks/useAdminReservations";
import type { Reservation, ReservationVehicle, ReservationUser } from "../../types/reservation";

vi.mock("../../services/reservationService", () => ({
  getAllReservations: vi.fn(),
  updateReservationStatus: vi.fn(),
}));

import {
  getAllReservations,
  updateReservationStatus,
} from "../../services/reservationService";

const makeReservation = (
  id: number,
  status = "PENDING",
  vehicle?: Partial<ReservationVehicle>,
  user?: Partial<ReservationUser>
): Reservation => ({
  id,
  startDate: "2026-05-10T00:00:00+02:00",
  endDate: "2026-05-15T00:00:00+02:00",
  totalPrice: 100,
  status,
  vehicle: {
    id: 1,
    "@id": "/api/vehicles/1",
    brand: { name: "Toyota" },
    model: { name: "Yaris" },
    vehicleImages: [],
    ...vehicle,
  } as ReservationVehicle,
  user: {
    id: 1,
    email: "user@example.com",
    name: "Juan",
    surname: "Pérez",
    ...user,
  } as ReservationUser,
});

// Build reservations covering today (for activeNowCount test)
const todayStart = new Date();
todayStart.setDate(todayStart.getDate() - 1);
todayStart.setHours(0, 0, 0, 0);
const todayEnd = new Date();
todayEnd.setDate(todayEnd.getDate() + 1);
todayEnd.setHours(0, 0, 0, 0);

const confirmedActive: Reservation = {
  id: 999,
  startDate: todayStart.toISOString(),
  endDate: todayEnd.toISOString(),
  totalPrice: 200,
  status: "CONFIRMED",
};

describe("useAdminReservations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading=true", () => {
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": [] },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    expect(result.current.loading).toBe(true);
  });

  it("loads all reservations on mount", async () => {
    const reservations = [makeReservation(1), makeReservation(2)];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filtered).toHaveLength(2);
  });

  it("filters by statusFilter", async () => {
    const reservations = [
      makeReservation(1, "PENDING"),
      makeReservation(2, "CONFIRMED"),
      makeReservation(3, "CANCELLED"),
    ];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setStatusFilter("PENDING"));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].status).toBe("PENDING");
  });

  it("filters by search term (vehicle name)", async () => {
    const reservations = [
      makeReservation(1, "PENDING", { brand: { name: "Toyota" }, model: { name: "Yaris" } }),
      makeReservation(2, "PENDING", { brand: { name: "Audi" }, model: { name: "A4" } }),
    ];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch("audi"));
    expect(result.current.filtered).toHaveLength(1);
    expect((result.current.filtered[0].vehicle as ReservationVehicle).brand.name).toBe("Audi");
  });

  it("filters by search term (user name)", async () => {
    const reservations = [
      makeReservation(1, "PENDING", {}, { name: "Juan", surname: "Pérez" }),
      makeReservation(2, "PENDING", {}, { name: "María", surname: "García" }),
    ];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch("maría"));
    expect(result.current.filtered).toHaveLength(1);
    expect((result.current.filtered[0].user as ReservationUser).name).toBe("María");
  });

  it("filters by search term (reservation ID)", async () => {
    const reservations = [makeReservation(123), makeReservation(456)];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setSearch("123"));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe(123);
  });

  it("paginates correctly with 10 items per page", async () => {
    const reservations = Array.from({ length: 25 }, (_, i) =>
      makeReservation(i + 1)
    );
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.displayed).toHaveLength(10);
    expect(result.current.totalPages).toBe(3);
  });

  it("shows page 2 items when page changes", async () => {
    const reservations = Array.from({ length: 15 }, (_, i) =>
      makeReservation(i + 1)
    );
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    expect(result.current.displayed).toHaveLength(5); // last 5 of 15
    expect(result.current.displayed[0].id).toBe(11);
  });

  it("resets to page 1 when filter changes", async () => {
    const reservations = Array.from({ length: 25 }, (_, i) =>
      makeReservation(i + 1)
    );
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);

    act(() => result.current.setStatusFilter("PENDING"));
    expect(result.current.page).toBe(1);
  });

  it("resets to page 1 when search term changes", async () => {
    const reservations = Array.from({ length: 25 }, (_, i) =>
      makeReservation(i + 1)
    );
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));
    act(() => result.current.setSearch("something"));
    expect(result.current.page).toBe(1);
  });

  it("handleStatus updates reservation status locally", async () => {
    const reservations = [makeReservation(1, "PENDING")];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);
    vi.mocked(updateReservationStatus).mockResolvedValueOnce({
      data: {},
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatus(1, "CONFIRMED");
    });

    expect(result.current.filtered[0].status).toBe("CONFIRMED");
    expect(updateReservationStatus).toHaveBeenCalledWith(1, "CONFIRMED");
  });

  it("activeNowCount counts CONFIRMED reservations active today", async () => {
    const reservations = [
      confirmedActive,
      makeReservation(1, "PENDING"), // not active
      makeReservation(2, "CONFIRMED"), // future dates, not active
    ];
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.activeNowCount).toBe(1);
  });

  it("totalPages is at least 1 even with 0 results", async () => {
    vi.mocked(getAllReservations).mockResolvedValueOnce({
      data: { "hydra:member": [] },
    } as never);

    const { result } = renderHook(() => useAdminReservations());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalPages).toBe(1);
  });
});
