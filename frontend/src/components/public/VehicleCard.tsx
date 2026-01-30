import { Link } from "react-router-dom";
import { 
  Fuel, 
  Gauge, 
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  Settings2, 
  CarFront, 
  Zap 
} from "lucide-react";
import type { Vehicle } from "../../types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  // Lógica de imagen
  const mainImage = vehicle.vehicleImages.find((img) => img.main) || vehicle.vehicleImages[0];
  const imageUrl = mainImage
    ? `${import.meta.env.VITE_BACKEND_URL}${mainImage.imageUrl}`
    : "https://via.placeholder.com/600x400?text=Sin+Foto";

  // Formateador de moneda
  const formatPrice = (amount: number | string | undefined | null) => {
    if (!amount) return "Consultar";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <Link 
      to={`/vehiculo/${vehicle.id}`} // Enlace en toda la tarjeta
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* --- SECCIÓN IMAGEN --- */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${vehicle.brand.name} ${vehicle.model.name}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Overlay degradado para que se vea el texto blanco si lo hubiera */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

        {/* Badge: Estado (Venta/Alquiler) */}
        <div className="absolute top-4 left-4">
          <span className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full backdrop-blur-md shadow-sm border border-white/20 text-white ${
            vehicle.type === 'RENT' ? 'bg-indigo-600/80' : 'bg-slate-900/80'
          }`}>
            {vehicle.type === 'RENT' ? 'ALQUILER' : 'EN VENTA'}
          </span>
        </div>

        {/* Badge: Ubicación (Bottom Right) */}
        <div className="absolute bottom-4 right-4">
           <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
            <MapPin size={12} className="text-blue-600" />
            {vehicle.province?.name || "Nacional"}
          </span>
        </div>
      </div>

      {/* --- SECCIÓN CONTENIDO --- */}
      <div className="p-6 flex flex-col grow">
        
        {/* Encabezado: Marca y Modelo */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            {vehicle.brand.name}
          </h3>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
            {vehicle.model.name}
          </h2>
        </div>

        {/* Grid de Especificaciones (Limpio y Ordenado) */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
            {/* Año */}
            <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} className="text-slate-400 stroke-[2.5]" />
                <span className="text-sm font-medium">{vehicle.year}</span>
            </div>
            
            {/* Kilómetros */}
            <div className="flex items-center gap-2 text-slate-600">
                <Gauge size={16} className="text-slate-400 stroke-[2.5]" />
                <span className="text-sm font-medium">{vehicle.kilometres.toLocaleString()} km</span>
            </div>

            {/* Combustible */}
            <div className="flex items-center gap-2 text-slate-600">
                <Fuel size={16} className="text-slate-400 stroke-[2.5]" />
                <span className="text-sm font-medium">{vehicle.fuelType.name}</span>
            </div>

            {/* Transmisión */}
            <div className="flex items-center gap-2 text-slate-600">
                <Settings2 size={16} className="text-slate-400 stroke-[2.5]" />
                <span className="text-sm font-medium">{vehicle.transmission.name}</span>
            </div>

            {/* Carrocería (Opcional si existe) */}
            {vehicle.bodyType && (
                <div className="flex items-center gap-2 text-slate-600">
                    <CarFront size={16} className="text-slate-400 stroke-[2.5]" />
                    <span className="text-sm font-medium">{vehicle.bodyType.name}</span>
                </div>
            )}

            {/* Potencia */}
            <div className="flex items-center gap-2 text-slate-600">
                <Zap size={16} className="text-slate-400 stroke-[2.5]" />
                <span className="text-sm font-medium">{vehicle.power} CV</span>
            </div>
        </div>

        {/* Footer: Precio y CTA */}
        <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">
                {vehicle.type === 'SALE' ? 'Precio al contado' : 'Precio por día'}
            </p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {vehicle.type === 'SALE' 
                ? formatPrice(vehicle.price) 
                : formatPrice(vehicle.dailyPrice) + '/día'
              }
            </p>
          </div>

          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <ArrowUpRight size={20} className="stroke-[3]" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;