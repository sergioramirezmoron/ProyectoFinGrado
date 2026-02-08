import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  MessageSquare,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ChatProvider } from "../context/ChatContext"; 
import { useChatNotification } from "../hooks/useChatNotification"; 

// --- 1. CONTENIDO INTERNO (Donde se usa el hook) ---
const AdminLayoutContent = () => {
  const { logout, user } = useAuth();
  const { unreadCount } = useChatNotification();
  const location = useLocation();
  const isSuperAdmin = user?.roles.includes("ROLE_ADMIN");

  return (
    <div className="min-h-screen bg-gray-100 flex text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed flex flex-col z-20">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            LC
          </div>
          <span className="font-bold text-xl tracking-tight">
            Admin Panel
          </span>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/coches"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`
            }
          >
            <Car size={20} />
            Flota de Vehículos
          </NavLink>

          <Link
            to="/admin/mensajes"
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              location.pathname.includes("mensajes")
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={20} />
              <span className="font-medium">Mensajes</span>
            </div>

            {/* 🔴 GLOBO DE NOTIFICACIÓN 🔴 */}
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm animate-in zoom-in">
                {unreadCount > 99 ? "+99" : unreadCount}
              </span>
            )}
          </Link>

          {isSuperAdmin && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Administración
              </div>
              <NavLink
                to="/admin/usuarios"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`
                }
              >
                <Users size={20} />
                Usuarios y Permisos
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 p-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

// --- 2. COMPONENTE WRAPPER (EL PROVEEDOR) ---
const AdminLayout = () => {
  return (
    <ChatProvider>
      <AdminLayoutContent />
    </ChatProvider>
  );
};

export default AdminLayout;