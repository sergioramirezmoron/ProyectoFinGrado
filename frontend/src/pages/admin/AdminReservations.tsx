import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  Car,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Search,
  Filter,
  User,
  BadgeCheck,
} from "lucide-react";
import { getAllReservations, updateReservationStatus } from "../../services/reservation";
import type { Reservation, ReservationVehicle, ReservationUser } from "../../types/reservation";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pendiente",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    icon: <Clock size={13} />,
  },
  CONFIRMED: {
    label: "Confirmada",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: <CheckCircle2 size={13} />,
  },
  REJECTED: {
    label: "Rechazada",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: <XCircle size={13} />,
  },
  CANCELLED: {
    label: "Cancelada",
    color: "text-slate-500",
    bg: "bg-slate-100",
    icon: <Ban size={13} />,
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

const isActiveNow = (r: Reservation): boolean => {
  if (r.status !== "CONFIRMED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(r.startDate);
  const end = new Date(r.endDate);
  return start <= today && today <= end;
};

const AdminReservations = () => {
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
        const vehicle = typeof r.vehicle === "object" ? (r.vehicle as ReservationVehicle) : null;
        const user = typeof r.user === "object" ? (r.user as ReservationUser) : null;
        const vehicleName = vehicle
          ? `${vehicle.brand?.name ?? ""} ${vehicle.model?.name ?? ""}`.toLowerCase()
          : "";
        const userName = user
          ? `${user.name ?? ""} ${user.surname ?? ""} ${user.email ?? ""}`.toLowerCase()
          : "";
        return vehicleName.includes(term) || userName.includes(term) || String(r.id).includes(term);
      }
      return true;
    });
  }, [reservations, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const displayed = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeNowCount = reservations.filter(isActiveNow).length;

  const handleStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, newStatus);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (e) {
      console.error("Error actualizando estado", e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reservas</h1>
          <p className="text-slate-500 text-sm">
            Gestiona y supervisa todas las reservas de alquiler
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays size={26} className="text-blue-600 shrink-0" />
          {activeNowCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <BadgeCheck size={14} />
              {activeNowCount} activa{activeNowCount !== 1 ? "s" : ""} ahora
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por vehículo, cliente o nº reserva..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-52">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm appearance-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla / Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={28} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            No se encontraron reservas
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {displayed.map((r) => {
                const vehicle = typeof r.vehicle === "object" ? (r.vehicle as ReservationVehicle) : null;
                const user = typeof r.user === "object" ? (r.user as ReservationUser) : null;
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG["PENDING"];
                const active = isActiveNow(r);

                return (
                  <div key={r.id} className={`p-4 space-y-3 ${active ? "bg-green-50/50" : ""}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Car size={14} className="text-blue-500 shrink-0" />
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {vehicle
                              ? `${vehicle.brand?.name} ${vehicle.model?.name}`
                              : `Vehículo #${String(r.vehicle).split("/").pop()}`}
                          </p>
                          {active && (
                            <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                              HOY
                            </span>
                          )}
                        </div>
                        {user && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <User size={12} className="text-slate-400" />
                            <p className="text-xs text-slate-400 truncate">
                              {user.name} {user.surname} · {user.email}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color} shrink-0`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                      <span>{formatDate(r.startDate)} → {formatDate(r.endDate)}</span>
                      <span className="font-bold text-blue-600">{formatPrice(r.totalPrice)}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {r.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatus(r.id, "CONFIRMED")}
                            disabled={updatingId === r.id}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all disabled:opacity-40"
                          >
                            {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Confirmar
                          </button>
                          <button
                            onClick={() => handleStatus(r.id, "REJECTED")}
                            disabled={updatingId === r.id}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-40"
                          >
                            {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                            Rechazar
                          </button>
                        </>
                      )}
                      {r.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleStatus(r.id, "CANCELLED")}
                          disabled={updatingId === r.id}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-40"
                        >
                          {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">#</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Vehículo</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Cliente</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Fechas</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Total</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-slate-500">Estado</th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-slate-500">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayed.map((r) => {
                    const vehicle = typeof r.vehicle === "object" ? (r.vehicle as ReservationVehicle) : null;
                    const user = typeof r.user === "object" ? (r.user as ReservationUser) : null;
                    const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG["PENDING"];
                    const active = isActiveNow(r);

                    return (
                      <tr key={r.id} className={`transition-colors ${active ? "bg-green-50/40 hover:bg-green-50/60" : "hover:bg-slate-50/50"}`}>
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{r.id}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {vehicle
                                ? `${vehicle.brand?.name} ${vehicle.model?.name}`
                                : `#${String(r.vehicle).split("/").pop()}`}
                            </span>
                            {active && (
                              <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                                ACTIVA HOY
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {user ? (
                            <div>
                              <p className="font-medium text-slate-800">{user.name} {user.surname}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <div className="text-xs">
                            <p>{formatDate(r.startDate)}</p>
                            <p className="text-slate-400">→ {formatDate(r.endDate)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-blue-600">
                          {formatPrice(r.totalPrice)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleStatus(r.id, "CONFIRMED")}
                                  disabled={updatingId === r.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-all disabled:opacity-40"
                                >
                                  {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => handleStatus(r.id, "REJECTED")}
                                  disabled={updatingId === r.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-40"
                                >
                                  {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                  Rechazar
                                </button>
                              </>
                            )}
                            {r.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleStatus(r.id, "CANCELLED")}
                                disabled={updatingId === r.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-40"
                              >
                                {updatingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                                Cancelar
                              </button>
                            )}
                            {(r.status === "REJECTED" || r.status === "CANCELLED") && (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Paginación */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              {filtered.length} reserva{filtered.length !== 1 ? "s" : ""}
              {(statusFilter || search) && " filtradas"}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border rounded-lg border-slate-200 disabled:opacity-20 hover:bg-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Página</span>
                  <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs shadow-sm">
                    {page}
                  </span>
                  <span className="text-slate-400">de {totalPages}</span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 border rounded-lg border-slate-200 disabled:opacity-20 hover:bg-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReservations;
