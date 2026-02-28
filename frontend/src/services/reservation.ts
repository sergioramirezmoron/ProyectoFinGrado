import api from "../api/axios";
import type { HydraResponse } from "../types/vehicle";
import type { Reservation } from "../types/reservation";

export const getVehicleReservations = (vehicleId: string) =>
  api.get<HydraResponse<Reservation>>(`/reservations?vehicle.id=${vehicleId}`);

export const createReservation = (payload: {
  startDate: string;
  endDate: string;
  vehicle: string;
  user: string;
  status: string;
}) => api.post<Reservation>("/reservations", payload);