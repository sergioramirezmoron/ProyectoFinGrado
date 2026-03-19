import { Link, NavLink, useLocation } from "react-router-dom";
import {
  MessageCircle,
  LayoutDashboard,
  Car,
  MessageSquare,
  Users,
  Menu,
  X,
  LogIn,
  UserPlus,
  Palette,
  MapPin,
  Tag,
  Layers,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useChatNotification } from "../../hooks/useChatNotification";
import { useState } from "react";
import UserProfilePanel from "../../pages/public/UserProfilePanel";

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useChatNotification();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isSales = user?.roles?.includes("ROLE_SALES");
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = isSales || isAdmin;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-full hover:bg-white/5 hover:text-blue-400 transition-all text-xs xl:text-sm ${
      isActive ? "text-blue-500 bg-white/5" : "text-slate-300"
    }`;

  const adminLinkClass = (color: "blue" | "purple") => ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `p-2 rounded-lg transition-colors ${
      color === "blue"
        ? `hover:bg-blue-600/20 hover:text-blue-400 ${isActive ? "text-blue-500 bg-blue-600/10" : "text-slate-400"}`
        : `hover:bg-purple-600/20 hover:text-purple-400 ${isActive ? "text-purple-500 bg-purple-600/10" : "text-slate-400"}`
    }`;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 text-white transition-all duration-300 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">

          <Link
            to="/"
            className="text-lg sm:text-2xl font-bold tracking-tighter flex items-center gap-1 group shrink-0"
            onClick={closeMobileMenu}
          >
            <span className="group-hover:text-blue-400 transition-colors duration-300">LUXURY</span>
            <span className="text-blue-500 group-hover:text-white transition-colors duration-300">CARS</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1 text-sm font-medium tracking-wide flex-1 justify-center">
            <NavLink to="/" end className={navLinkClass}>INICIO</NavLink>
            <NavLink to="/venta" className={navLinkClass}>COMPRAR</NavLink>
            <NavLink to="/alquiler" className={navLinkClass}>ALQUILAR</NavLink>

            {isAuthenticated && isStaff && (
              <div className="flex items-center space-x-1 border-l border-white/10 pl-3 ml-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-1 tracking-wider">
                  {isAdmin ? "Admin" : "Staff"}
                </span>

                {isAdmin && (
                  <NavLink to="/admin" end className={adminLinkClass("blue")} title="Dashboard">
                    <LayoutDashboard size={17} />
                  </NavLink>
                )}

                <NavLink to="/admin/coches" className={adminLinkClass("blue")} title="Flota">
                  <Car size={17} />
                </NavLink>

                <NavLink to="/admin/reservas" className={adminLinkClass("blue")} title="Reservas">
                  <CalendarDays size={17} />
                </NavLink>

                {isAdmin && (
                  <>
                    <NavLink to="/admin/usuarios" className={adminLinkClass("purple")} title="Usuarios">
                      <Users size={17} />
                    </NavLink>
                    <NavLink to="/admin/colores" className={adminLinkClass("purple")} title="Colores">
                      <Palette size={17} />
                    </NavLink>
                    <NavLink to="/admin/ciudades" className={adminLinkClass("purple")} title="Ciudades">
                      <MapPin size={17} />
                    </NavLink>
                    <NavLink to="/admin/marcas" className={adminLinkClass("purple")} title="Marcas">
                      <Tag size={17} />
                    </NavLink>
                    <NavLink to="/admin/modelos" className={adminLinkClass("purple")} title="Modelos">
                      <Layers size={17} />
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  to={isStaff || isAdmin ? "/admin/mensajes" : "/mis-chats"}
                  className={`p-2 rounded-full hover:bg-white/10 transition-colors relative ${
                    location.pathname.includes("chat") || location.pathname.includes("mensajes")
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

                {!isStaff && !isAdmin && (
                  <Link
                    to="/mis-reservas"
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                      location.pathname === "/mis-reservas"
                        ? "text-blue-500"
                        : "text-slate-300"
                    }`}
                    title="Mis reservas"
                  >
                    <CalendarDays size={20} />
                  </Link>
                )}

                <button
                  onClick={() => setIsPanelOpen(true)}
                  className="flex items-center gap-2 sm:pl-3 sm:border-l sm:border-white/10 hover:opacity-80 transition-opacity cursor-pointer"
                  title="Mi perfil"
                >
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
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 lg:gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 lg:px-3 py-2"
                >
                  <LogIn size={18} />
                  <span className="hidden lg:inline">Iniciar Sesión</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                >
                  <UserPlus size={18} />
                  <span className="hidden lg:inline">Registrarse</span>
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden absolute w-full bg-slate-900/98 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-[calc(100vh-4rem)] opacity-100 overflow-y-auto"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="p-5 flex flex-col space-y-1">
            {[
              { to: "/", label: "INICIO" },
              { to: "/venta", label: "COMPRAR" },
              { to: "/alquiler", label: "ALQUILAR" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                className="text-base font-medium text-slate-200 hover:text-blue-400 py-3 px-2 border-b border-white/5 transition-colors"
              >
                {label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 bg-slate-800 py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors text-sm"
                >
                  <LogIn size={17} /> Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors text-sm"
                >
                  <UserPlus size={17} /> Registrarse
                </Link>
              </div>
            )}

            {isAuthenticated && isStaff && (
              <div className="pt-4 mt-2">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 block px-2">
                  {isAdmin ? "Panel Admin" : "Panel Staff"}
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {isAdmin && (
                    <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                      <LayoutDashboard size={18} className="text-blue-400" /> Dashboard
                    </Link>
                  )}
                  <Link to="/admin/coches" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                    <Car size={18} className="text-blue-400" /> Flota
                  </Link>
                  <Link to="/admin/mensajes" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                    <MessageSquare size={18} className="text-blue-400" /> Mensajes
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/admin/reservas" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                    <CalendarDays size={18} className="text-blue-400" /> Reservas
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin/usuarios" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                        <Users size={18} className="text-purple-400" /> Usuarios
                      </Link>
                      <Link to="/admin/colores" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                        <Palette size={18} className="text-purple-400" /> Colores
                      </Link>
                      <Link to="/admin/ciudades" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                        <MapPin size={18} className="text-purple-400" /> Ciudades
                      </Link>
                      <Link to="/admin/marcas" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                        <Tag size={18} className="text-purple-400" /> Marcas
                      </Link>
                      <Link to="/admin/modelos" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm">
                        <Layers size={18} className="text-purple-400" /> Modelos
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {isAuthenticated && !isStaff && !isAdmin && (
              <div className="pt-4 mt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block px-2">
                  Mi cuenta
                </span>
                <Link
                  to="/mis-reservas"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm"
                >
                  <CalendarDays size={18} className="text-blue-400" /> Mis reservas
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-4 mt-2 border-t border-white/5">
                <button
                  onClick={() => { closeMobileMenu(); setIsPanelOpen(true); }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/30">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{user?.name || "Usuario"}</p>
                    <p className="text-xs text-slate-400">
                      {isAdmin ? "Administrador" : isSales ? "Ventas" : "Cliente"}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <UserProfilePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </>
  );
};

export default Header;
