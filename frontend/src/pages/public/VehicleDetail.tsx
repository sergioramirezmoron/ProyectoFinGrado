import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Zap,
  Car,
  Info,
  Share2,
  CheckCircle2,
} from "lucide-react";
import api from "../../api/axios";
import type { Vehicle } from "../../types/vehicle";
import SpecItem from "../../helpers/SpecItem";

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await api.get<Vehicle>(`/vehicles/${id}`);
        setVehicle(response.data);

        if (
          response.data.vehicleImages &&
          response.data.vehicleImages.length > 0
        ) {
          const main =
            response.data.vehicleImages.find((img) => img.main) ||
            response.data.vehicleImages[0];
          setActiveImage(`${import.meta.env.VITE_BACKEND_URL}${main.imageUrl}`);
        }
      } catch (error) {
        throw new Error(`Error fetching vehicle: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  // Formateador de moneda
  const formatPrice = (amount: number | string | undefined | null) => {
    if (!amount) return "Consultar";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-900"></div>
      </div>
    );
  }

  if (!vehicle) {
    return <div className="text-center py-20">Vehículo no encontrado</div>;
  }

  // Fallback si no hay imágenes
  const currentImage =
    activeImage || "https://via.placeholder.com/800x600?text=Sin+Foto";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* --- HEADER DE NAVEGACIÓN --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ChevronLeft size={20} /> Volver al catálogo
          </button>

          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- COLUMNA IZQUIERDA: GALERÍA Y DESCRIPCIÓN (2/3 ancho) --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* GALERÍA */}
            <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
              {/* Imagen Principal */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative bg-gray-100">
                <img
                  src={currentImage}
                  alt="Vista principal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg text-white shadow-lg ${
                      vehicle.type === "RENT" ? "bg-indigo-600" : "bg-slate-900"
                    }`}
                  >
                    {vehicle.type === "RENT" ? "ALQUILER" : "EN VENTA"}
                  </span>
                </div>
              </div>

              {vehicle.vehicleImages.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                  {vehicle.vehicleImages.map((img) => {
                    const url = `${import.meta.env.VITE_BACKEND_URL}${img.imageUrl}`;
                    return (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(url)}
                        className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === url
                            ? "border-blue-600 ring-2 ring-blue-100"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt="thumbnail"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ESPECIFICACIONES TÉCNICAS (GRID) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings2 className="text-blue-600" /> Ficha Técnica
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                <SpecItem
                  icon={<Calendar />}
                  label="Año"
                  value={vehicle.year}
                />
                <SpecItem
                  icon={<Gauge />}
                  label="Kilómetros"
                  value={`${vehicle.kilometres.toLocaleString()} km`}
                />
                <SpecItem
                  icon={<Fuel />}
                  label="Combustible"
                  value={vehicle.fuelType.name}
                />
                <SpecItem
                  icon={<Settings2 />}
                  label="Cambio"
                  value={vehicle.transmission.name}
                />
                <SpecItem
                  icon={<Zap />}
                  label="Potencia"
                  value={`${vehicle.power} CV`}
                />
                <SpecItem
                  icon={<Car />}
                  label="Carrocería"
                  value={vehicle.bodyType?.name || "-"}
                />
                <SpecItem
                  icon={<Car />}
                  label="Puertas"
                  value={vehicle.doors || "-"}
                />
                <SpecItem
                  icon={<MapPin />}
                  label="Ubicación"
                  value={vehicle.province?.name || "Nacional"}
                />
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="text-blue-600" /> Descripción del vehículo
              </h3>
              <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {vehicle.description ||
                  "El vendedor no ha proporcionado una descripción detallada para este vehículo."}
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: INFO Y CONTACTO (STICKY) --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* TARJETA RESUMEN */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">
                    {vehicle.brand.name}
                  </h2>
                  <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                    {vehicle.model.name}
                  </h1>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Precio al contado
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">
                      {vehicle.type === "SALE"
                        ? formatPrice(vehicle.price)
                        : formatPrice(vehicle.dailyPrice)}
                    </span>
                    {vehicle.type === "RENT" && (
                      <span className="text-lg text-gray-500 font-medium">
                        /día
                      </span>
                    )}
                  </div>
                </div>

                {/* VENTAJAS / GARANTIAS */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2
                      size={18}
                      className="text-green-500 shrink-0"
                    />
                    <span>Garantía 12 meses incluida</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2
                      size={18}
                      className="text-green-500 shrink-0"
                    />
                    <span>Revisión pre-entrega certificada</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2
                      size={18}
                      className="text-green-500 shrink-0"
                    />
                    <span>Financiación a tu medida</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]">
                    Contactar Vendedor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
