import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import type { Reservation } from "../types/reservation";

export interface ReservationStatusConfig {
  /** Short label used in admin tables */
  label: string;
  /** Long label used in user-facing reservation cards */
  longLabel: string;
  /** Combined Tailwind classes for background + text color */
  combined: string;
  icon: React.ReactNode;
}

export const RESERVATION_STATUS_CONFIG: Record<string, ReservationStatusConfig> = {
  PENDING: {
    label: "Pendiente",
    longLabel: "Pendiente de confirmación",
    combined: "bg-yellow-100 text-yellow-700",
    icon: <Clock size={14} />,
  },
  CONFIRMED: {
    label: "Confirmada",
    longLabel: "Confirmada",
    combined: "bg-green-100 text-green-700",
    icon: <CheckCircle2 size={14} />,
  },
  REJECTED: {
    label: "Rechazada",
    longLabel: "Rechazada",
    combined: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
  },
  CANCELLED: {
    label: "Cancelada",
    longLabel: "Cancelada",
    combined: "bg-slate-100 text-slate-500",
    icon: <Ban size={14} />,
  },
};

export const RESERVATION_STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "CANCELLED", label: "Cancelada" },
];

/** Returns true if the reservation is confirmed and currently active (today falls within its dates). */
export const isReservationActiveToday = (r: Reservation): boolean => {
  if (r.status !== "CONFIRMED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(r.startDate) <= today && today <= new Date(r.endDate);
};

/** Returns true if the reservation can still be cancelled (confirmed and end date not yet passed). */
export const isReservationCancellable = (r: Reservation): boolean => {
  if (r.status !== "CONFIRMED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(r.endDate) >= today;
};
