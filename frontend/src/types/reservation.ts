import type { Vehicle } from "./vehicle";

export interface ApiError {
  detail?: string;
  "hydra:description"?: string;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface VehicleImage {
  imageUrl: string;
  main: boolean;
}

export interface ReservationVehicle {
  id: number;
  "@id": string;
  brand: { name: string };
  model: { name: string };
  vehicleImages: Array<{ imageUrl: string; main: boolean }>;
  dailyPrice?: string;
  type?: string;
  status?: string;
}

export interface ReservationUser {
  id: number;
  "@id"?: string;
  email: string;
  name?: string;
  surname?: string;
}

export interface Reservation {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  vehicle?: ReservationVehicle | string;
  user?: ReservationUser | string;
}

export interface Conversation {
  id: number;
  "@id": string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vehicle?: Vehicle;
  reservation?: Reservation;
  updatedAt: string;
  status: string;
  messages: Message[];
}
