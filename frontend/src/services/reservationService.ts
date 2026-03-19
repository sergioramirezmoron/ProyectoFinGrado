import api from "../api/axios";
import type { HydraResponse } from "../types/vehicle";
import type { Reservation } from "../types/reservation";

export const getVehicleReservations = (vehicleId: string) =>
  api.get<HydraResponse<Reservation>>(`/reservations?vehicle.id=${vehicleId}&status=CONFIRMED`);

export const getUserReservations = (userId: number) =>
  api.get<HydraResponse<Reservation>>(`/reservations?user.id=${userId}`);

export const getAllReservations = (status?: string) =>
  api.get<HydraResponse<Reservation>>(
    `/reservations${status ? `?status=${status}` : ""}`
  );

export const updateReservationStatus = (id: number, status: string) =>
  api.patch<Reservation>(
    `/reservations/${id}`,
    { status },
    { headers: { "Content-Type": "application/merge-patch+json" } }
  );

export const createReservation = (payload: {
  startDate: string;
  endDate: string;
  vehicle: string;
  user: string;
  status: string;
}) => api.post<Reservation>("/reservations", payload);