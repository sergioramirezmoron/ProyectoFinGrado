import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  getUserReservations,
  updateReservationStatus,
} from "../services/reservationService";
import type { Reservation } from "../types/reservation";

export const useMyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getUserReservations(user.id)
      .then((res) => {
        const members = res.data["hydra:member"] ?? res.data.member ?? [];
        setReservations(members);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleCancel = async () => {
    if (confirmId === null) return;
    const id = confirmId;
    setConfirmId(null);
    setCancellingId(id);
    try {
      await updateReservationStatus(id, "CANCELLED");
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r)),
      );
    } catch (e) {
      console.error("Error cancelando reserva", e);
    } finally {
      setCancellingId(null);
    }
  };

  return { reservations, loading, cancellingId, confirmId, setConfirmId, handleCancel };
};
