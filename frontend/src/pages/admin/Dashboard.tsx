import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Users,
  MessageSquare,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Clock,
  CalendarDays,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import type { DashboardStats } from "../../types/dashboard";
import { getAllReservations } from "../../services/reservationService";
import type { Reservation } from "../../types/reservation";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetchStats();
    getAllReservations()
      .then((res) => setReservations(res.data["hydra:member"] ?? res.data.member ?? []))
      .catch(console.error);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm">Cargando estadísticas del sistema...</p>
        </div>
      </div>
    );
  }

  if (!stats)
    return (
      <div className="text-red-500 py-8 text-center">
        No se pudieron cargar los datos.
      </div>
    );

  const statCardsData = [
    {
      title: "En Venta",
      value: stats.vehiclesAvailable.toString(),
      icon: Car,
      color: "bg-blue-500",
    },
    {
      title: "Vendidos",
      value: stats.vehiclesSold.toString(),
      icon: CheckCircle2,
      color: "bg-green-500",
    },
    {
      title: "Mensajes",
      value: stats.totalMessages.toString(),
      icon: MessageSquare,
      color: "bg-purple-500",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pending = reservations.filter((r) => r.status === "PENDING").length;
  const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
  const activeNow = reservations.filter((r) => {
    if (r.status !== "CONFIRMED") return false;
    return new Date(r.startDate) <= today && today <= new Date(r.endDate);
  }).length;

  const fleetItems = [
    {
      label: "Disponibles",
      value: stats.vehiclesAvailable,
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
      sub: "text-blue-500",
    },
    {
      label: "Reservados",
      value: stats.vehiclesReserved,
      bg: "bg-yellow-50",
      border: "border-yellow-100",
      text: "text-yellow-700",
      sub: "text-yellow-500",
    },
    {
      label: "Vendidos",
      value: stats.vehiclesSold,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
      sub: "text-red-500",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Resumen en tiempo real
            <span className="ml-2 opacity-60">
              (
              {new Date(stats.serverTime.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              )
            </span>
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-white font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCardsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Reservations Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
            <CalendarDays size={17} className="text-blue-500" />
            Reservas de Alquiler
          </h3>
          <Link
            to="/admin/reservas"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
            <p className="text-2xl sm:text-3xl font-black text-yellow-700">{pending}</p>
            <p className="text-[10px] sm:text-xs text-yellow-600 font-bold uppercase tracking-wide mt-1">
              Pendientes
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <p className="text-2xl sm:text-3xl font-black text-green-700">{confirmed}</p>
            <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase tracking-wide mt-1">
              Confirmadas
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-2xl sm:text-3xl font-black text-blue-700">{activeNow}</p>
            <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase tracking-wide mt-1">
              Activas hoy
            </p>
          </div>
        </div>
      </div>

      {/* Fleet + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Fleet Status */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp size={17} className="text-gray-400" />
            Estado de la Flota
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {fleetItems.map((item) => (
              <div
                key={item.label}
                className={`${item.bg} ${item.border} border rounded-xl p-3 sm:p-5 text-center hover:shadow-md transition-shadow`}
              >
                <p className={`text-2xl sm:text-3xl font-extrabold ${item.text}`}>
                  {item.value}
                </p>
                <p className={`text-[10px] sm:text-xs ${item.sub} font-bold uppercase tracking-wide mt-1`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 flex flex-col">
          {/* Brands Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Marcas en Catálogo
              </p>
              <p className="text-3xl font-black text-slate-800 mt-1">
                {stats.totalBrands}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Car size={18} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <Clock size={14} className="text-blue-500" />
              Actividad Reciente
            </h3>
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-56">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start relative pb-3 last:pb-0"
                  >
                    {i !== stats.recentActivity.length - 1 && (
                      <div className="absolute left-1 top-2 bottom-0 w-px bg-gray-100" />
                    )}
                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-blue-500 shrink-0 z-10" />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs text-slate-600 font-medium leading-snug line-clamp-2"
                        title={act.text}
                      >
                        {act.text.replace("Mensaje en chat", "Chat")}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {new Date(act.date).toLocaleDateString([], {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        •{" "}
                        {new Date(act.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
                  Sin actividad reciente
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
