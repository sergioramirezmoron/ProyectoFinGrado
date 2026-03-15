import { useState, useEffect } from "react";
import {
  Car,
  Users,
  MessageSquare,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import api from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import type { DashboardStats } from "../../types/dashboard";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
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
      <div className="flex h-96 items-center justify-center px-4">
        <div className="text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm">Cargando estadísticas del sistema...</p>
        </div>
      </div>
    );
  }

  if (!stats)
    return (
      <div className="text-red-500 px-4 py-8 text-center">
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 mt-6 sm:mt-10 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex justify-between items-center gap-3 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Resumen en tiempo real.
            <span className="text-xs ml-2 opacity-60">
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
          className="text-xs sm:text-sm text-white hover:text-blue-800 font-medium flex items-center gap-1 transition-colors border-2 border-blue-900 px-3 py-2 rounded bg-sky-500 hover:cursor-pointer whitespace-nowrap shrink-0"
        >
          <Loader2 size={14} className={loading ? "animate-spin" : "hidden"} />
          Actualizar
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Fleet Status */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp size={18} className="text-gray-400" />
              Estado de la Flota
            </h3>

            {/* ← clave: en móvil 1 columna, desde sm 3 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center mb-4 sm:mb-8">
              <div className="p-4 sm:p-5 bg-blue-50/50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-3 sm:gap-0">
                <div className="text-xs text-blue-600 uppercase font-bold tracking-wider sm:mb-2 sm:hidden">
                  Disponibles
                </div>
                <div className="text-3xl sm:text-3xl font-extrabold text-blue-700">
                  {stats.vehiclesAvailable}
                </div>
                <div className="text-xs text-blue-600 uppercase font-bold tracking-wider mt-0 sm:mt-1 hidden sm:block">
                  Disponibles
                </div>
              </div>
              <div className="p-4 sm:p-5 bg-yellow-50/50 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-3 sm:gap-0">
                <div className="text-xs text-yellow-600 uppercase font-bold tracking-wider sm:mb-2 sm:hidden">
                  Reservados
                </div>
                <div className="text-3xl sm:text-3xl font-extrabold text-yellow-700">
                  {stats.vehiclesReserved}
                </div>
                <div className="text-xs text-yellow-600 uppercase font-bold tracking-wider mt-0 sm:mt-1 hidden sm:block">
                  Reservados
                </div>
              </div>
              <div className="p-4 sm:p-5 bg-red-50/50 rounded-xl border border-red-100 hover:shadow-md transition-shadow flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-3 sm:gap-0">
                <div className="text-xs text-red-600 uppercase font-bold tracking-wider sm:mb-2 sm:hidden">
                  Vendidos
                </div>
                <div className="text-3xl sm:text-3xl font-extrabold text-red-700">
                  {stats.vehiclesSold}
                </div>
                <div className="text-xs text-red-600 uppercase font-bold tracking-wider mt-0 sm:mt-1 hidden sm:block">
                  Vendidos
                </div>
              </div>
            </div>
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
            <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm">
              <Clock size={14} className="text-blue-500" />
              Actividad Reciente
            </h3>

            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-1 max-h-64">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start relative pb-3 last:pb-0"
                  >
                    {i !== stats.recentActivity.length - 1 && (
                      <div className="absolute left-1 top-2 bottom-0 w-px bg-gray-100"></div>
                    )}
                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-blue-500 shrink-0 z-10"></div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs text-slate-600 font-medium leading-snug line-clamp-2"
                        title={act.text}
                      >
                        {act.text.replace("Mensaje en chat", "Chat")}
                      </p>
                      <span className="text-[10px] text-gray-400 block mt-1">
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