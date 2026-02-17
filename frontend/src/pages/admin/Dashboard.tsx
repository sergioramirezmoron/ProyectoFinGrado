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
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p>Cargando estadísticas del sistema...</p>
        </div>
      </div>
    );
  }

  if (!stats)
    return <div className="text-red-500">No se pudieron cargar los datos.</div>;

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
    <div className="space-y-6 animate-in fade-in duration-500 mt-10">
      {/* CABECERA */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-sm">
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
          className="text-sm text-white hover:text-blue-800 font-medium flex items-center gap-1 transition-colors border-2 border-blue-900 p-2 rounded bg-sky-500 hover:cursor-pointer"
        >
          <Loader2 size={14} className={loading ? "animate-spin" : "hidden"} />{" "}
          Actualizar
        </button>
      </div>

      {/* GRID SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* SECCIÓN INFERIOR (LAYOUT ASIMÉTRICO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA (2/3): ESTADO DE LA FLOTA */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-400" /> Estado de la
              Flota
            </h3>

            {/* Contadores Grandes */}
            <div className="grid grid-cols-3 gap-4 text-center mb-8">
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <div className="text-3xl font-extrabold text-blue-700">
                  {stats.vehiclesAvailable}
                </div>
                <div className="text-xs text-blue-600 uppercase font-bold tracking-wider mt-1">
                  Disponibles
                </div>
              </div>
              <div className="p-5 bg-yellow-50/50 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
                <div className="text-3xl font-extrabold text-yellow-700">
                  {stats.vehiclesReserved}
                </div>
                <div className="text-xs text-yellow-600 uppercase font-bold tracking-wider mt-1">
                  Reservados
                </div>
              </div>
              <div className="p-5 bg-red-50/50 rounded-xl border border-red-100 hover:shadow-md transition-shadow">
                <div className="text-3xl font-extrabold text-red-700">
                  {stats.vehiclesSold}
                </div>
                <div className="text-xs text-red-600 uppercase font-bold tracking-wider mt-1">
                  Vendidos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (1/3): MARCAS + ACTIVIDAD */}
        <div className="space-y-4 flex flex-col h-full">
          {/* 1. TARJETA PEQUEÑA: MARCAS (Ahora arriba) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Marcas en Catálogo
              </p>
              <p className="text-3xl font-black text-slate-800 mt-1">
                {stats.totalBrands}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Car size={20} />
            </div>
          </div>

          {/* 2. PANEL: ACTIVIDAD RECIENTE (Con scroll y altura fija para alinear) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-75">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
              <Clock size={16} className="text-blue-500" /> Actividad Reciente
            </h3>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-62.5">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start relative pb-4 last:pb-0"
                  >
                    {/* Línea vertical decorativa */}
                    {i !== stats.recentActivity.length - 1 && (
                      <div className="absolute left-1.25 top-2 bottom-0 w-px bg-gray-100"></div>
                    )}

                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-blue-500 shrink-0 z-10"></div>

                    <div className="min-w-0">
                      <p
                        className="text-xs text-slate-600 font-medium leading-snug line-clamp-2"
                        title={act.text}
                      >
                        {/* Limpiamos un poco el texto visualmente */}
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
