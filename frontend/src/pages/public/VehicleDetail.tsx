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
  Phone,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  Loader2,
  Palette,
  DoorClosed,
} from "lucide-react";
import { AxiosError } from "axios";
import type { Vehicle } from "../../types/vehicle";
import { useAuth } from "../../hooks/useAuth";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale/es";
import { eachDayOfInterval, parseISO, format } from "date-fns";
import SpecItem from "../../components/public/SpecItem";
import ContactModal from "../../components/public/ContactModal";
import type { ApiError } from "../../types/reservation";
import { getVehicleDetail } from "../../services/vehicleService";
import {
  createReservation,
  getVehicleReservations,
} from "../../services/reservationService";
import { formatPrice, formatDailyPrice } from "../../utils/formatters";
import { buildImageUrl } from "../../utils/vehicleImages";

registerLocale("es", es);

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [blockedDatesStrings, setBlockedDatesStrings] = useState<string[]>([]);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await getVehicleDetail(id!);
        setVehicle(response.data);

        if (response.data.vehicleImages?.length > 0) {
          const main =
            response.data.vehicleImages.find((img) => img.main) ||
            response.data.vehicleImages[0];
          setActiveImage(buildImageUrl(main.imageUrl));
        }

        if (response.data.type === "RENT") {
          const resReservations = await getVehicleReservations(id!);
          const reservations = resReservations.data["hydra:member"] ?? resReservations.data.member ?? [];
          const newBlockedStrings: string[] = [];

          reservations.forEach((res) => {
            if (!["CONFIRMED"].includes(res.status)) return;

            const start = parseISO(res.startDate);
            const end = parseISO(res.endDate);

            try {
              const interval = eachDayOfInterval({ start, end });
              interval.forEach((date) => {
                newBlockedStrings.push(format(date, "yyyy-MM-dd"));
              });
            } catch (e) {
              console.error("Fecha inválida en reserva:", res);
              throw new Error(
                "Error procesando reservas. Contacta con soporte.",
                { cause: e },
              );
            }
          });

          setBlockedDatesStrings(newBlockedStrings);
        }
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleData();
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && vehicle?.dailyPrice) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0 && endDate >= startDate) {
        setTotalPrice(Math.round(diffDays * Number(vehicle.dailyPrice) * 100) / 100);
        setReserveError("");
      } else {
        setTotalPrice(null);
      }
    } else {
      setTotalPrice(null);
    }
  }, [startDate, endDate, vehicle]);

  const handleReserve = async () => {
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: `/vehiculo/${id}` } });
      return;
    }
    if (!totalPrice || !startDate || !endDate) return;

    setReserving(true);
    setReserveError("");

    try {
      const formatDateAPI = (d: Date) => format(d, "yyyy-MM-dd");

      await createReservation({
        startDate: formatDateAPI(startDate),
        endDate: formatDateAPI(endDate),
        vehicle: `/api/vehicles/${id}`,
        user: user["@id"] || `/api/users/${user.id}`,
        status: "PENDING",
      });

      setReserveSuccess(true);
      setStartDate(null);
      setEndDate(null);

      const newInterval = eachDayOfInterval({ start: startDate, end: endDate });
      const newStrings = newInterval.map((d) => format(d, "yyyy-MM-dd"));
      setBlockedDatesStrings((prev) => [...prev, ...newStrings]);
    } catch (error) {
      console.error("Error reservando", error);
      const err = error as AxiosError<ApiError>;
      const msg =
        err.response?.data?.detail ??
        err.response?.data?.["hydra:description"];
      setReserveError(msg ?? "Error al procesar. Verifica las fechas.");
    } finally {
      setReserving(false);
    }
  };

  const isDateBlocked = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return blockedDatesStrings.includes(dateString);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-900"></div>
      </div>
    );
  if (!vehicle)
    return <div className="text-center py-20">Vehículo no encontrado</div>;

  const currentImage =
    activeImage || "https://placehold.co/800x600?text=Sin+Foto";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-slate-900 font-medium transition-colors hover:cursor-pointer"
          >
            <ChevronLeft size={20} /> Volver al catálogo
          </button>
         
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative bg-gray-100">
                <img
                  src={currentImage}
                  alt="Vista principal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg text-white shadow-lg ${vehicle.type === "RENT" ? "bg-indigo-600" : "bg-slate-900"}`}
                  >
                    {vehicle.type === "RENT" ? "ALQUILER" : "EN VENTA"}
                  </span>
                </div>
              </div>
              {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                  {vehicle.vehicleImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() =>
                        setActiveImage(
                          buildImageUrl(img.imageUrl),
                        )
                      }
                      className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage.includes(img.imageUrl) ? "border-blue-600 ring-2 ring-blue-100" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <img
                        src={buildImageUrl(img.imageUrl)}
                        className="w-full h-full object-cover"
                        alt="thumbnail"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings2 className="text-blue-600" /> Ficha Técnica
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 sm:gap-y-8 gap-x-4">
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
                  icon={<DoorClosed />}
                  label="Puertas"
                  value={vehicle?.doors || "-"}
                />
                <SpecItem
                  icon={<MapPin />}
                  label="Ubicación"
                  value={vehicle.province?.name || "Nacional"}
                />
                <SpecItem
                  icon={<Palette />}
                  label="Color"
                  value={vehicle.color?.name || "No disponible"}
                  color={vehicle.color?.hexCode}
                />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="text-blue-600" /> Descripción
              </h3>
              <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {vehicle.description ||
                  "El vendedor no ha proporcionado una descripción detallada."}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
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
                    {vehicle.type === "SALE"
                      ? "Precio al contado"
                      : "Tarifa diaria"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">
                      {vehicle.type === "SALE"
                        ? formatPrice(vehicle.price)
                        : formatDailyPrice(vehicle.dailyPrice)}
                    </span>
                    {vehicle.type === "RENT" && (
                      <span className="text-lg text-gray-500 font-medium">
                        /día
                      </span>
                    )}
                  </div>
                </div>

                {vehicle.type === "RENT" ? (
                  <div className="space-y-4">
                    {reserveSuccess ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in fade-in">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <h3 className="font-bold text-green-800 text-lg">
                          ¡Solicitud Enviada!
                        </h3>
                        <p className="text-sm text-green-700 mt-2">
                          Hemos recibido tu petición. El equipo revisará y
                          confirmará.
                        </p>
                        <button
                          onClick={() => setReserveSuccess(false)}
                          className="mt-4 text-xs font-bold text-green-800 underline hover:text-green-900"
                        >
                          Nueva reserva
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 relative z-10">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase mb-1 block">
                              Selecciona Fechas
                            </label>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <div className="relative">
                                <DatePicker
                                  selected={startDate}
                                  onChange={(date: Date | null) =>
                                    setStartDate(date)
                                  }
                                  selectsStart
                                  startDate={startDate}
                                  endDate={endDate}
                                  minDate={new Date()}
                                  filterDate={(date) => !isDateBlocked(date)}
                                  placeholderText="Recogida"
                                  locale="es"
                                  wrapperClassName="w-full"
                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium cursor-pointer transition-all hover:border-indigo-300 text-black"
                                  dateFormat="dd/MM/yyyy"
                                  dayClassName={(date) =>
                                    isDateBlocked(date)
                                      ? "react-datepicker__day--excluded"
                                      : ""
                                  }
                                />
                              </div>
                              <div className="relative">
                                <DatePicker
                                  selected={endDate}
                                  onChange={(date: Date | null) =>
                                    setEndDate(date)
                                  }
                                  selectsEnd
                                  startDate={startDate}
                                  endDate={endDate}
                                  minDate={startDate ? new Date(startDate.getTime() + 86_400_000) : new Date()}
                                  filterDate={(date) => !isDateBlocked(date)}
                                  placeholderText="Devolución"
                                  locale="es"
                                  wrapperClassName="w-full"
                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium cursor-pointer transition-all hover:border-indigo-300 text-black"
                                  dateFormat="dd/MM/yyyy"
                                  dayClassName={(date) =>
                                    isDateBlocked(date)
                                      ? "react-datepicker__day--excluded"
                                      : ""
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {totalPrice && (
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                            <span className="text-indigo-800 font-medium text-sm">
                              Total Estimado
                            </span>
                            <span className="text-xl font-black text-indigo-900">
                              {formatPrice(totalPrice)}
                            </span>
                          </div>
                        )}

                        {reserveError && (
                          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in">
                            <AlertCircle
                              size={14}
                              className="mt-0.5 shrink-0"
                            />
                            {reserveError}
                          </div>
                        )}

                        <button
                          onClick={handleReserve}
                          disabled={!totalPrice || reserving}
                          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:cursor-pointer"
                        >
                          {reserving ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <CalendarDays size={20} />
                          )}
                          {isAuthenticated
                            ? "Solicitar Reserva"
                            : "Inicia sesión para reservar"}
                        </button>
                      </>
                    )}
                    <p className="text-[10px] text-center text-gray-400">
                      Los días marcados en rojo no están disponibles.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!isAuthenticated || !user) {
                          navigate("/login", { state: { from: `/vehiculo/${id}` } });
                          return;
                        }
                        setIsContactModalOpen(true);
                      }}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                    >
                      Contactar Vendedor
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-slate-900 mb-4">
                  ¿Dudas urgentes?
                </h4>
                <div className="space-y-4">
                  <a
                    href="tel:+34600000000"
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Llámanos ahora
                      </p>
                      <p className="font-bold text-slate-900">
                        +34 600 000 000
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {vehicle && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          vehicleId={vehicle.id}
          vehicleName={`${vehicle.brand.name} ${vehicle.model.name}`}
        />
      )}
    </div>
  );
};

export default VehicleDetail;
