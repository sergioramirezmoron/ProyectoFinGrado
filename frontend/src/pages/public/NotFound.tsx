import { Link, useNavigate } from "react-router-dom";
import { Home, ChevronLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl sm:text-9xl font-black text-blue-600/20 select-none leading-none mb-2">
        404
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        Página no encontrada
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-sm mb-8">
        La URL que has introducido no existe o el contenido ha sido eliminado.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition-all"
        >
          <ChevronLeft size={18} /> Volver atrás
        </button>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          <Home size={18} /> Ir al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
