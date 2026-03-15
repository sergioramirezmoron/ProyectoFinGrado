import { useState, useEffect, useRef, useContext } from "react";
import {
  X,
  Pencil,
  Check,
  LogOut,
  Heart,
  Car,
  Key,
  Phone,
  Mail,
  User as UserIcon,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { FavoriteContext } from "../../context/FavoriteContext";
import type { Vehicle } from "../../types/vehicle";
import FavCard from "../../components/public/FavCard";
import type { EditField, UserProfilePanelProps } from "../../types/auth";
import { updateUserProfile } from "../../services/userService";
import { getFavoriteVehicles } from "../../services/favoriteService";

const UserProfilePanel = ({ isOpen, onClose }: UserProfilePanelProps) => {
  const { user, logout, updateUser } = useAuth();
  const favoriteCtx = useContext(FavoriteContext);
  const favorites = favoriteCtx?.favorites ?? [];

  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [localUser, setLocalUser] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });

  const [favVehicles, setFavVehicles] = useState<Vehicle[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setLocalUser({
        name: user.name ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [isOpen, user]);

  // Resetea el aviso al cerrar el panel
  useEffect(() => {
    if (!isOpen) setProfileUpdated(false);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || favorites.length === 0) {
      setFavVehicles([]);
      return;
    }

    const fetchFavVehicles = async () => {
      setLoadingFavs(true);
      try {
        const vehicles = await getFavoriteVehicles(
          favorites.map((f) => f.vehicleIri),
        );
        setFavVehicles(vehicles);
      } catch (e) {
        console.error("Error cargando vehículos favoritos", e);
      } finally {
        setLoadingFavs(false);
      }
    };

    fetchFavVehicles();
  }, [isOpen, favorites]);

  const favSale = favVehicles.filter((v) => v.type === "SALE");
  const favRent = favVehicles.filter((v) => v.type === "RENT");

  const startEdit = (field: EditField) => {
    setEditField(field);
    setEditValue(field === "name" ? localUser.name : localUser.phone);
  };

  const cancelEdit = () => {
    setEditField(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!user?.id || !editField) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, editField, editValue);
      setLocalUser((prev) => ({ ...prev, [editField]: editValue }));
      updateUser({ [editField]: editValue });
      setProfileUpdated(true);
      cancelEdit();
    } catch (e) {
      console.error("Error actualizando perfil", e);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (v: Vehicle) => {
    const amount = v.type === "SALE" ? v.price : v.dailyPrice;
    if (!amount) return "Consultar";
    const formatted = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
    return v.type === "RENT" ? `${formatted}/día` : formatted;
  };

  const getImageUrl = (v: Vehicle) => {
    const main = v.vehicleImages?.find((i) => i.main) ?? v.vehicleImages?.[0];
    if (!main) return "https://placehold.co/120x80?text=Sin+foto";
    if (main.imageUrl.includes("http")) return main.imageUrl;
    return `${import.meta.env.VITE_BACKEND_URL}${main.imageUrl}`;
  };

  const initials = (localUser.name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isSales = user?.roles?.includes("ROLE_SALES");
  const roleLabel = isAdmin ? "Administrador" : isSales ? "Ventas" : "Cliente";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative bg-slate-950 px-6 pt-10 pb-8 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl ring-4 ring-blue-500/30 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-lg truncate">
                  {localUser.name || "Sin nombre"}
                </p>
                {(isAdmin || isSales) && (
                  <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                )}
              </div>
              <p className="text-slate-400 text-sm truncate">{user?.email}</p>
              <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Mis datos
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    Email
                  </p>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <UserIcon size={16} className="text-slate-400 shrink-0" />
                {editField === "name" ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="flex-1 text-sm bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        Nombre
                      </p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {localUser.name || (
                          <span className="text-slate-400 italic">Sin nombre</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit("name")}
                      className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone size={16} className="text-slate-400 shrink-0" />
                {editField === "phone" ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      type="number"
                      min="0"
                      max="9999999999"
                      value={editValue}
                      onChange={(e) => {
                        if (e.target.value.length <= 10) {
                          setEditValue(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      className="flex-1 text-sm bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        Teléfono
                      </p>
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {localUser.phone || (
                          <span className="text-slate-400 italic">Sin teléfono</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit("phone")}
                      className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Aviso de cambios guardados */}
            {profileUpdated && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center gap-2">
                <Info size={14} className="shrink-0" />
                Cambios guardados. Cierra sesión y vuelve a entrar para verlos reflejados.
              </div>
            )}
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={14} className="text-red-500 fill-red-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Mis favoritos
              </h3>
              <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {favorites.length}
              </span>
            </div>

            {loadingFavs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No tienes favoritos todavía</p>
              </div>
            ) : (
              <div className="space-y-6">
                {favSale.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Car size={14} className="text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        En Venta
                      </span>
                      <span className="text-xs text-slate-400 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                        {favSale.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {favSale.map((v) => (
                        <FavCard
                          key={v.id}
                          vehicle={v}
                          price={formatPrice(v)}
                          image={getImageUrl(v)}
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {favRent.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Key size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        En Alquiler
                      </span>
                      <span className="text-xs text-slate-400 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        {favRent.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {favRent.map((v) => (
                        <FavCard
                          key={v.id}
                          vehicle={v}
                          price={formatPrice(v)}
                          image={getImageUrl(v)}
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold text-sm transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfilePanel;
