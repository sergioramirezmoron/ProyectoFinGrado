import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMyReservations } from "../../hooks/useMyReservations";
import type { Reservation } from "../../types/reservation";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/reservationService", () => ({
  getUserReservations: vi.fn(),
  updateReservationStatus: vi.fn(),
}));

import { useAuth } from "../../hooks/useAuth";
import {
  getUserReservations,
  updateReservationStatus,
} from "../../services/reservationService";

const mockUser = {
  id: 3,
  "@id": "/api/users/3",
  email: "user@example.com",
  roles: ["ROLE_USER"],
  name: "Test User",
};

const makeReservation = (id: number, status = "PENDING"): Reservation => ({
  id,
  startDate: "2026-05-10T00:00:00+02:00",
  endDate: "2026-05-15T00:00:00+02:00",
  totalPrice: 105,
  status,
});

describe("useMyReservations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isAdmin: false,
      token: "fake",
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("starts with loading=true", () => {
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { "hydra:member": [] },
    } as never);

    const { result } = renderHook(() => useMyReservations());
    expect(result.current.loading).toBe(true);
  });

  it("loads reservations for current user", async () => {
    const reservations = [makeReservation(1), makeReservation(2)];
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reservations).toHaveLength(2);
    expect(getUserReservations).toHaveBeenCalledWith(3);
  });

  it("reads from 'member' when 'hydra:member' is absent", async () => {
    const reservations = [makeReservation(1)];
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { member: reservations },
    } as never);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reservations).toHaveLength(1);
  });

  it("sets loading=false even when no reservations", async () => {
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { "hydra:member": [] },
    } as never);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reservations).toHaveLength(0);
  });

  it("does not fetch when user has no id", async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    renderHook(() => useMyReservations());

    expect(getUserReservations).not.toHaveBeenCalled();
  });

  it("handleCancel calls updateReservationStatus and updates local state", async () => {
    const reservations = [makeReservation(5, "PENDING")];
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);
    vi.mocked(updateReservationStatus).mockResolvedValueOnce({
      data: { id: 5, status: "CANCELLED" },
    } as never);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setConfirmId(5);
    });

    await act(async () => {
      await result.current.handleCancel();
    });

    expect(updateReservationStatus).toHaveBeenCalledWith(5, "CANCELLED");
    expect(result.current.reservations[0].status).toBe("CANCELLED");
  });

  it("handleCancel does nothing when confirmId is null", async () => {
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { "hydra:member": [] },
    } as never);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleCancel();
    });

    expect(updateReservationStatus).not.toHaveBeenCalled();
  });

  it("clears cancellingId after cancel completes", async () => {
    const reservations = [makeReservation(7, "PENDING")];
    vi.mocked(getUserReservations).mockResolvedValueOnce({
      data: { "hydra:member": reservations },
    } as never);
    vi.mocked(updateReservationStatus).mockResolvedValueOnce({
      data: {},
    } as never);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setConfirmId(7));
    await act(async () => await result.current.handleCancel());

    expect(result.current.cancellingId).toBeNull();
  });
});
