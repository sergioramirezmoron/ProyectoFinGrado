import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Car,
  Loader2,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getUserReservations, updateReservationStatus } from "../../services/reservation";
import type { Reservation, ReservationVehicle } from "../../types/reservation";
import ConfirmModal from "../../helpers/ConfirmModal";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pendiente de confirmación",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock size={14} />,
  },
  CONFIRMED: {
    label: "Confirmada",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle2 size={14} />,
  },
  REJECTED: {
    label: "Rechazada",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-slate-100 text-slate-500",
    icon: <Ban size={14} />,
  },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const getVehicleImage = (vehicle: ReservationVehicle): string => {
  const img = vehicle.vehicleImages?.find((i) => i.main) ?? vehicle.vehicleImages?.[0];
  if (!img) return "https://placehold.co/120x80?text=Sin+foto";
  if (img.imageUrl.includes("http")) return img.imageUrl;
  return `${import.meta.env.VITE_BACKEND_URL}${img.imageUrl}`;
};

const MyReservations = () => {
  const { user, isAuthenticated } = useAuth();
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
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r))
      );
    } catch (e) {
      console.error("Error cancelando reserva", e);
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle size={48} className="text-slate-400" />
        <p className="text-slate-400">Inicia sesión para ver tus reservas.</p>
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-full transition-all"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const confirmReservation = reservations.find((r) => r.id === confirmId);
  const confirmVehicle =
    confirmReservation && typeof confirmReservation.vehicle === "object"
      ? (confirmReservation.vehicle as ReservationVehicle)
      : null;

  return (
    <>
      <ConfirmModal
        isOpen={confirmId !== null}
        title="Cancelar reserva"
        message={
          confirmVehicle
            ? `¿Seguro que quieres cancelar la reserva del ${confirmVehicle.brand?.name} ${confirmVehicle.model?.name}? Las fechas quedarán libres para otros usuarios.`
            : "¿Seguro que quieres cancelar esta reserva? Las fechas quedarán libres para otros usuarios."
        }
        onConfirm={handleCancel}
        onCancel={() => setConfirmId(null)}
        confirmColor="red"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <CalendarDays size={28} className="text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mis reservas</h1>
            <p className="text-slate-400 text-sm">
              Consulta y gestiona tus reservas de alquiler
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Car size={48} className="text-slate-600" />
            <p className="text-slate-400">Todavía no tienes reservas.</p>
            <Link
              to="/alquiler"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-full transition-all"
            >
              Ver vehículos en alquiler
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const vehicle =
                typeof reservation.vehicle === "object"
                  ? (reservation.vehicle as ReservationVehicle)
                  : null;
              const statusCfg =
                STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG["PENDING"];
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const hasEnded = new Date(reservation.endDate) < today;
              const canCancel =
                (reservation.status === "PENDING" || reservation.status === "CONFIRMED") &&
                !hasEnded;
              const isCancelling = cancellingId === reservation.id;

              return (
                <div
                  key={reservation.id}
                  className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Imagen del vehículo */}
                  <div className="sm:w-44 shrink-0 relative">
                    {vehicle ? (
                      <img
                        src={getVehicleImage(vehicle)}
                        alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
                        className="w-full h-40 sm:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-full bg-slate-800 flex items-center justify-center">
                        <Car size={32} className="text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Info de la reserva */}
                  <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        {vehicle ? (
                          <Link
                            to={`/vehiculo/${vehicle.id}`}
                            className="font-bold text-white text-lg hover:text-blue-400 transition-colors flex items-center gap-1"
                          >
                            {vehicle.brand?.name} {vehicle.model?.name}
                            <ChevronRight size={16} className="text-slate-500" />
                          </Link>
                        ) : (
                          <p className="font-bold text-white text-lg">
                            Vehículo #{String(reservation.vehicle).split("/").pop()}
                          </p>
                        )}
                        <p className="text-slate-500 text-xs mt-0.5">
                          Reserva #{reservation.id}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${statusCfg.color}`}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">
                          Entrada
                        </p>
                        <p className="text-white font-medium">
                          {formatDate(reservation.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">
                          Salida
                        </p>
                        <p className="text-white font-medium">
                          {formatDate(reservation.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-0.5">
                          Total
                        </p>
                        <p className="text-blue-400 font-bold text-base">
                          {formatPrice(reservation.totalPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Aviso + botón cancelar */}
                    {canCancel && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/5">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                          <Info size={13} className="shrink-0" />
                          {reservation.status === "PENDING"
                            ? "Tu solicitud está pendiente de aprobación."
                            : "Reserva confirmada. Puedes cancelarla si cambias de planes."}
                        </p>
                        <button
                          onClick={() => setConfirmId(reservation.id)}
                          disabled={isCancelling}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold text-sm transition-all disabled:opacity-40 shrink-0 border border-red-500/20 hover:border-red-500/40"
                        >
                          {isCancelling ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Ban size={15} />
                          )}
                          Cancelar reserva
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyReservations;
