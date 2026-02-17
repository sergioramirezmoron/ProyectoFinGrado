import type { Reservation } from "./reservation";
import type { Vehicle } from "./vehicle";

export interface MessagePayload {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vehicle: string;
  messages: { content: string; isAdmin: boolean }[];
  user?: string;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface ApiResource {
  id?: number;
  "@id"?: string;
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
