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

export interface ChatContextType {
  unreadCount: number;
  refreshUnreadCount: () => void;
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

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleName: string;
}

export interface ConversationPayloadInterface {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vehicle: string;
  user?: string;
}
