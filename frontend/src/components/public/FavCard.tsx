import { ChevronRight, Trash2 } from "lucide-react";
import { useContext } from "react";
import { FavoriteContext } from "../../context/FavoriteContext";
import type { Vehicle } from "../../types/vehicle";
import { Link } from "react-router-dom";

const FavCard = ({
  vehicle,
  price,
  image,
  onClose,
}: {
  vehicle: Vehicle;
  price: string;
  image: string;
  onClose: () => void;
}) => {
  const favoriteCtx = useContext(FavoriteContext);
  const isAccessible =
    vehicle.status === "AVAILABLE" || vehicle.status === "RESERVED";
  const to = isAccessible ? `/vehiculo/${vehicle.id}` : "/";

  const statusLabel: Record<string, string> = {
    RESERVED: "Reservado",
    SOLD: "Vendido",
    DELETED: "No disponible",
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favoriteCtx) {
      favoriteCtx.toggleFavorite(vehicle["@id"], e);
    }
  };

  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
      title={!isAccessible ? "Este vehículo ya no está disponible" : undefined}
    >
      <div className="relative w-16 h-12 shrink-0">
        <img
          src={image}
          alt={`${vehicle.brand.name} ${vehicle.model.name}`}
          className={`w-full h-full object-cover rounded-lg bg-slate-100 ${!isAccessible ? "opacity-50 grayscale" : ""}`}
        />
        {!isAccessible && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
            <span className="text-[9px] font-black text-white uppercase tracking-wide text-center leading-tight px-1">
              {statusLabel[vehicle.status] ?? "No disp."}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider truncate">
          {vehicle.brand.name}
        </p>
        <p
          className={`text-sm font-bold truncate ${isAccessible ? "text-slate-800" : "text-slate-400"}`}
        >
          {vehicle.model.name}
        </p>
        <p className="text-xs font-semibold text-slate-500">
          {isAccessible ? (
            price
          ) : (
            <span className="text-orange-400">
              {statusLabel[vehicle.status] ?? "No disponible"}
            </span>
          )}
        </p>
      </div>

      {isAccessible ? (
        <ChevronRight
          size={16}
          className="shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors"
        />
      ) : (
        <button
          onClick={handleRemove}
          className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          title="Eliminar de favoritos"
        >
          <Trash2 size={14} />
        </button>
      )}
    </Link>
  );
};

export default FavCard;
