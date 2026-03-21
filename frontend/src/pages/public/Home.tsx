import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Zap,
  Award,
  ChevronDown,
  Check,
} from "lucide-react";
import type { Vehicle } from "../../types/vehicle";
import { useAuth } from "../../hooks/useAuth";
import { getFeaturedVehicles } from "../../services/vehicleService";

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getFeaturedVehicles();
        const vehiclesData = response || [];
        setFeaturedVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const getImageUrl = (vehicle: Vehicle) => {
    if (vehicle.vehicleImages && vehicle.vehicleImages.length > 0) {
      const mainImg =
        vehicle.vehicleImages.find((img) => img.main) ||
        vehicle.vehicleImages[0];
      return `${import.meta.env.VITE_BACKEND_URL}${mainImg.imageUrl}`;
    }
    return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=70&w=800&fm=webp&fit=crop";
  };

  const carouselItems = loading
    ? []
    : [...featuredVehicles, ...featuredVehicles];

  return (
    <div className="bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-infinite-scroll {
          animation: scroll 40s linear infinite;
        }
        .pause-on-hover:hover .animate-infinite-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376763036-066120622c74?q=75&w=1920&fm=webp&fit=crop"
            alt="Luxury Car Background"
            fetchPriority="high"
            className="w-full h-full object-cover scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-slate-950"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-10">
          <div className="space-y-10 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-500/30 rounded-full bg-blue-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">
                Colección Premium 2026
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Conduce lo <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-blue-500 to-blue-600 drop-shadow-2xl">
                Extraordinario
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed font-light border-l-2 border-blue-500/30 pl-6">
              Experimenta la emoción de la ingeniería automotriz más exclusiva
              del mundo.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <Link
                to="/venta"
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-3"
              >
                Comprar Vehículo{" "}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/alquiler"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold rounded-full transition-all hover:border-blue-500/50 flex items-center gap-2"
              >
                Servicio de Renting
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 opacity-60 animate-bounce cursor-pointer">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
            Descubre Más
          </span>
          <ChevronDown className="text-blue-500" size={24} />
        </div>
      </section>

      <section className="py-32 bg-slate-950 relative border-b border-white/5 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 mb-16 text-center">
          <span className="text-blue-500 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">
            Nuestra Selección
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Iconos del <span className="text-white">Motor</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-light">
            Modelos seleccionados a mano por su historia, rendimiento y
            exclusividad.
          </p>
        </div>

        <div className="w-full overflow-hidden flex pause-on-hover py-10">
          {loading ? (
            <div className="w-full flex justify-center py-20">
              <span className="animate-pulse text-blue-500 font-bold tracking-widest text-lg flex items-center gap-2">
                <Zap className="animate-bounce" /> CARGANDO JOYAS...
              </span>
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="flex w-max animate-infinite-scroll gap-8 hover:[animation-play-state:paused]">
              {carouselItems.map((vehicle, index) => (
                <Link
                  to={`/vehiculo/${vehicle.id}`}
                  key={`${vehicle.id}-${index}`}
                  className="shrink-0 w-[85vw] md:w-150 h-100 relative rounded-3xl overflow-hidden group cursor-pointer border border-white/5 block hover:border-blue-500/50 transition-colors"
                >
                  <div className="absolute inset-0 bg-slate-900/50 animate-pulse"></div>
                  <img
                    src={getImageUrl(vehicle)}
                    alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=70&w=800&fm=webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>

                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {vehicle.power} CV
                      </span>
                      <span className="text-slate-200 font-mono text-lg font-bold">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        }).format(Number(vehicle.price))}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 leading-tight">
                      {vehicle.brand.name}{" "}
                      <span className="text-blue-400">
                        {vehicle.model.name}
                      </span>
                    </h3>
                    <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <span className="text-white text-sm font-bold flex items-center gap-2">
                        Ver Especificaciones{" "}
                        <ArrowRight size={16} className="text-blue-500" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="w-full text-center text-slate-500 py-20 border border-white/10 rounded-3xl mx-6">
              <p className="text-xl">
                Inventario exclusivo agotado temporalmente.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-32 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-2xl"></div>
            <img
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?q=70&w=1200&fm=webp&fit=crop"
              alt="Interior de vehículo de lujo"
              loading="lazy"
              className="relative rounded-3xl shadow-2xl border border-white/10 w-full object-cover h-150"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Más que conducir, <br />
              <span className="text-blue-500">Sentir.</span>
            </h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Entendemos que un superdeportivo no es solo una máquina; es una
              extensión de tu personalidad.
            </p>
            <ul className="space-y-6 pt-4">
              {[
                "Asesoramiento personalizado por pilotos profesionales",
                "Acceso a eventos exclusivos en circuitos europeos",
                "Mantenimiento Concierge: recogemos y entregamos tu coche",
                "Personalización a medida (Bespoke Services)",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <Check
                      size={18}
                      className="text-blue-500 group-hover:text-white transition-colors"
                    />
                  </div>
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-950 relative overflow-hidden">
  <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
    <div className="text-center mb-20 space-y-4">
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
        Excelencia sin <span className="text-blue-500">Límites</span>
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        {
          icon: Shield,
          title: "Garantía Total",
          desc: "Cobertura integral...",
        },
        {
          icon: Zap,
          title: "Entrega Express",
          desc: "Tu vehículo listo en menos de 24h...",
        },
        {
          icon: Award,
          title: "Club Elite",
          desc: "Membresía exclusiva...",
        },
      ].map((feature, idx) => (
        <div
          key={idx}
          className="group p-10 rounded-4xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-900 transition-all duration-500 relative overflow-hidden hover:shadow-2xl"
        >
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 border border-white/5">
            <feature.icon size={28} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-slate-100">
            {feature.title}
          </h3>
          <p className="text-slate-400 leading-relaxed text-sm">
            {feature.desc}
          </p>
        </div>
      ))}
      
      {/* Enlace a GasoFlow */}
      <a
        href="https://www.gasoflow.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group p-10 rounded-4xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 hover:border-blue-500/50 hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-500 relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
      >
        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30">
          <Zap size={28} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
          GasoFlow
          <ArrowRight size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </h3>
        <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
          Encuentra las gasolineras más baratas en tiempo real y ahorra en cada repostaje.
        </p>
      </a>
    </div>
  </div>
</section>

      {!user && (
        <section className="py-40 relative overflow-hidden flex items-center justify-center bg-fixed">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=50&w=1200&fm=webp&fit=crop"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-full object-cover opacity-20 grayscale scale-110"
            />
            <div className="absolute inset-0 bg-slate-950/90"></div>
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-10">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tight">
              Tu Legado <br /> Comienza Aquí
            </h2>
            <Link
              to="/register"
              className="inline-flex px-12 py-5 bg-white text-slate-950 font-bold text-lg rounded-full hover:bg-blue-500 hover:text-white transition-all"
            >
              Solicitar Acceso
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
