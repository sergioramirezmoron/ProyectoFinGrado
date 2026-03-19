import { useEffect, useState, useMemo } from "react";
import {
  getAllReservations,
  updateReservationStatus,
} from "../services/reservationService";
import { isReservationActiveToday } from "../constants/reservationStatus";
import type {
  Reservation,
  ReservationVehicle,
  ReservationUser,
} from "../types/reservation";

const ITEMS_PER_PAGE = 10;

export const useAdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await getAllReservations();
      const members = res.data["hydra:member"] ?? res.data.member ?? [];
      setReservations(members);
    } catch (e) {
      console.error("Error cargando reservas", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return reservations.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (term) {
        const vehicle =
          typeof r.vehicle === "object" ? (r.vehicle as ReservationVehicle) : null;
        const user =
          typeof r.user === "object" ? (r.user as ReservationUser) : null;
        const vehicleName = vehicle
          ? `${vehicle.brand?.name ?? ""} ${vehicle.model?.name ?? ""}`.toLowerCase()
          : "";
        const userName = user
          ? `${user.name ?? ""} ${user.surname ?? ""} ${user.email ?? ""}`.toLowerCase()
          : "";
        return (
          vehicleName.includes(term) ||
          userName.includes(term) ||
          String(r.id).includes(term)
        );
      }
      return true;
    });
  }, [reservations, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const displayed = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const activeNowCount = reservations.filter(isReservationActiveToday).length;

  const handleStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, newStatus);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
    } catch (e) {
      console.error("Error actualizando estado", e);
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    loading,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    page,
    setPage,
    updatingId,
    filtered,
    totalPages,
    displayed,
    activeNowCount,
    handleStatus,
  };
};
