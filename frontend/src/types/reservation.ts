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

export interface Reservation {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
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
