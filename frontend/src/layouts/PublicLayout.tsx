import { Outlet } from "react-router-dom";
import { User, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const PublicLayout = () => {
  const { logout, isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar Estilo Audi/Tesla (Fixed y con blur) */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-tighter">
            LUXURY<span className="text-blue-500">CARS</span>
          </div>

          {/* Enlaces Centrales */}
          <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
            <a href="/" className="hover:text-blue-400 transition-colors">
              INICIO
            </a>
            <a href="/venta" className="hover:text-blue-400 transition-colors">
              COMPRAR
            </a>
            <a
              href="/alquiler"
              className="hover:text-blue-400 transition-colors"
            >
              ALQUILAR
            </a>
          </div>

          {/* Iconos Derecha */}
          <div className="flex items-center space-x-6">
            <button className="hover:text-blue-400">
              <MessageCircle size={20} />
            </button>
            <button className="hover:text-blue-400">
              <User size={20} />
            </button>
            {isAuthenticated && (
              <button onClick={logout} className="hover:text-blue-400">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Dinámico (Aquí se renderizan las páginas) */}
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
