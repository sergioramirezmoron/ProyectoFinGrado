import { Link } from "react-router-dom";
import { Fuel, Gauge, Calendar, MapPin, ArrowRight } from "lucide-react";
import type { Vehicle } from "../../types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const mainImage =
    vehicle.vehicleImages.find((img) => img.main) || vehicle.vehicleImages[0];
  const imageUrl = mainImage
    ? `${import.meta.env.VITE_BACKEND_URL}${mainImage.imageUrl}`
    : "https://via.placeholder.com/400x300?text=Sin+Foto";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* IMAGEN CON ETIQUETA */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${vehicle.brand.name} ${vehicle.model.name}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
            <MapPin size={12} /> {vehicle.province?.name || "Nacional"}
          </span>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-5 flex flex-col grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {vehicle.brand.name} {vehicle.model.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {vehicle.description}
            </p>
          </div>
        </div>

        {/* PRECIO DESTACADO */}
        <div className="mt-2 mb-4">
          <span className="text-2xl font-extrabold text-blue-700">
            {vehicle.type === "SALE"
              ? `${vehicle.price?.toLocaleString("es-ES")} €`
              : `${vehicle.dailyPrice} €/día`}
          </span>
        </div>

        {/* CARACTERÍSTICAS (GRID) */}
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-gray-100 mt-auto">
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            <Calendar size={16} className="text-gray-400 mb-1" />
            <span className="text-xs font-semibold text-gray-700">
              {vehicle.year}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            <Gauge size={16} className="text-gray-400 mb-1" />
            <span className="text-xs font-semibold text-gray-700">
              {vehicle.kilometres.toLocaleString()} km
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg">
            <Fuel size={16} className="text-gray-400 mb-1" />
            <span className="text-xs font-semibold text-gray-700">
              {vehicle.fuelType.name}
            </span>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <Link
          to={`/vehiculos/${vehicle.id}`}
          className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors group-hover:translate-y-0"
        >
          Ver Detalles <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
