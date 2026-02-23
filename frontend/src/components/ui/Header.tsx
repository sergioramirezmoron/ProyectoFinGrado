import { Link, NavLink, useLocation } from "react-router-dom";
import {
  MessageCircle,
  LogOut,
  LayoutDashboard,
  Car,
  MessageSquare,
  Users,
  Menu,
  X,
  LogIn,
  UserPlus,
  Palette,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useChatNotification } from "../../hooks/useChatNotification";
import { useState } from "react";

const Header = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const { unreadCount } = useChatNotification();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isSales = user?.roles?.includes("ROLE_SALES");
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = isSales || isAdmin;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 text-white transition-all duration-300 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tighter flex items-center gap-2 group"
          onClick={closeMobileMenu}
        >
          <span className="group-hover:text-blue-400 transition-colors duration-300">
            LUXURY
          </span>
          <span className="text-blue-500 group-hover:text-white transition-colors duration-300">
            CARS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1 text-sm font-medium tracking-wide">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full hover:bg-white/5 hover:text-blue-400 transition-all ${isActive ? "text-blue-500 bg-white/5" : "text-slate-300"}`
            }
          >
            INICIO
          </NavLink>
          <NavLink
            to="/venta"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full hover:bg-white/5 hover:text-blue-400 transition-all ${isActive ? "text-blue-500 bg-white/5" : "text-slate-300"}`
            }
          >
            COMPRAR
          </NavLink>
          <NavLink
            to="/alquiler"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full hover:bg-white/5 hover:text-blue-400 transition-all ${isActive ? "text-blue-500 bg-white/5" : "text-slate-300"}`
            }
          >
            ALQUILAR
          </NavLink>

          {/* Admin / Staff Links */}
          {isAuthenticated && isStaff && (
            <div className="flex items-center space-x-1 border-l border-white/10 pl-4 ml-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-2 tracking-wider">
                {isAdmin ? "Admin" : "Staff"}
              </span>

              {/* Dashboard: Admin Only */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `p-2 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 transition-colors ${
                      isActive ? "text-blue-500 bg-blue-600/10" : "text-slate-400"
                    }`
                  }
                  title="Dashboard"
                >
                  <LayoutDashboard size={18} />
                </NavLink>
              )}

              {/* Fleet: Sales + Admin */}
              <NavLink
                to="/admin/coches"
                className={({ isActive }) =>
                  `p-2 rounded-lg hover:bg-blue-600/20 hover:text-blue-400 transition-colors ${
                    isActive ? "text-blue-500 bg-blue-600/10" : "text-slate-400"
                  }`
                }
                title="Gestión de Flota"
              >
                <Car size={18} />
              </NavLink>

              {/* Users + Colores: Admin Only */}
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/usuarios"
                    className={({ isActive }) =>
                      `p-2 rounded-lg hover:bg-purple-600/20 hover:text-purple-400 transition-colors ${
                        isActive ? "text-purple-500 bg-purple-600/10" : "text-slate-400"
                      }`
                    }
                    title="Gestión de Usuarios"
                  >
                    <Users size={18} />
                  </NavLink>

                  <NavLink
                    to="/admin/colores"
                    className={({ isActive }) =>
                      `p-2 rounded-lg hover:bg-purple-600/20 hover:text-purple-400 transition-colors ${
                        isActive ? "text-purple-500 bg-purple-600/10" : "text-slate-400"
                      }`
                    }
                    title="Gestión de Colores"
                  >
                    <Palette size={18} />
                  </NavLink>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to={isStaff || isAdmin ? "/admin/mensajes" : "/mis-chats"}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors relative ${
                  location.pathname.includes("chat") ||
                  location.pathname.includes("mensajes")
                    ? "text-blue-500"
                    : "text-slate-300"
                }`}
                title="Chats"
              >
                <MessageCircle size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-slate-950">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10">
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-medium text-white leading-none">
                    {user?.name || "Usuario"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin ? "Administrador" : isSales ? "Ventas" : "Cliente"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/30">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              <button
                onClick={logout}
                className="hover:cursor-pointer p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all ml-2"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                <UserPlus size={18} />
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden absolute w-full bg-slate-900/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 flex flex-col space-y-4">
          <Link to="/" onClick={closeMobileMenu} className="text-lg font-medium hover:text-blue-400 py-2 border-b border-white/5">INICIO</Link>
          <Link to="/venta" onClick={closeMobileMenu} className="text-lg font-medium hover:text-blue-400 py-2 border-b border-white/5">COMPRAR</Link>
          <Link to="/alquiler" onClick={closeMobileMenu} className="text-lg font-medium hover:text-blue-400 py-2 border-b border-white/5">ALQUILAR</Link>

          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Link to="/login" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors">
                <LogIn size={18} /> Iniciar Sesión
              </Link>
              <Link to="/login" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
                <UserPlus size={18} /> Registrarse
              </Link>
            </div>
          )}

          {isAuthenticated && isStaff && (
            <div className="pt-4 mt-2">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 block">
                {isAdmin ? "Panel Admin" : "Panel Staff"}
              </span>
              <div className="grid grid-cols-1 gap-2">
                {isAdmin && (
                  <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <LayoutDashboard size={20} className="text-blue-400" /> Dashboard
                  </Link>
                )}
                <Link to="/admin/coches" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <Car size={20} className="text-blue-400" /> Flota
                </Link>
                <Link to="/admin/mensajes" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <MessageSquare size={20} className="text-blue-400" /> Mensajes
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <>
                    <Link to="/admin/usuarios" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <Users size={20} className="text-purple-400" /> Usuarios
                    </Link>
                    <Link to="/admin/colores" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <Palette size={20} className="text-purple-400" /> Colores
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
