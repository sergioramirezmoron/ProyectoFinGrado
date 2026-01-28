import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Fuel,
  Calendar,
  Gauge,
  Car,
} from "lucide-react";
import api from "../../api/axios";
import { AxiosError } from "axios";
import type { HydraResponse, Vehicle } from "../../types/vehicle";

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Cargar la flota
  const fetchVehicles = async () => {
    try {
      const response = await api.get<HydraResponse<Vehicle>>("/vehicles");
      // Filtramos visualmente los que ya están borrados
      const allVehicles = response.data["hydra:member"] || response.data.member || [];
      setVehicles(allVehicles.filter(v => v.status !== 'DELETED'));
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // 2. Función de Borrar (MEJORADA PARA VER ERRORES REALES)
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres archivar este vehículo?")) return;

    try {
      await api.patch(
        `/vehicles/${id}`,
        { status: "DELETED" },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
      
      // Actualizamos la lista localmente
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      
    } catch (err) {
      const error = err as AxiosError<{ "hydra:description": string }>;
      console.error("Error al eliminar:", error);
      
      // ESTO ES LO IMPORTANTE: Leemos el mensaje real del servidor
      const serverMessage = error.response?.data?.["hydra:description"] || "Error desconocido";
      
      alert(`No se pudo borrar. El servidor dice:\n\n${serverMessage}`);
    }
  };

  // 3. Filtrado simple por buscador
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Helper para mostrar la imagen correcta
  const getThumbnail = (vehicle: Vehicle) => {
    const mainImage = vehicle.vehicleImages.find((img) => img.main) || vehicle.vehicleImages[0];

    if (mainImage) {
      return `http://127.0.0.1:8000${mainImage.imageUrl}`;
    }
    return "https://via.placeholder.com/150?text=Sin+Foto";
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Flota de Vehículos
          </h1>
          <p className="text-gray-500 text-sm">
            Gestiona el inventario de coches disponibles.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/coches/nuevo")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} /> Nuevo Vehículo
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por marca o modelo..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA / LISTA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando flota...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Car size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No hay vehículos
            </h3>
            <p className="text-gray-500">
              No se encontraron coches con ese criterio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Estado / Tipo</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 hidden md:table-cell">Detalles</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* COLUMNA 1: FOTO Y NOMBRE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={getThumbnail(vehicle)}
                            alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">
                            {vehicle.brand.name} {vehicle.model.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin size={12} />{" "}
                            {vehicle.province?.name || "Sin provincia"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA 2: ESTADO Y TIPO */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.type === "SALE"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {vehicle.type === "SALE" ? "Venta" : "Alquiler"}
                        </span>
                        <div className="text-xs text-gray-500 font-medium">
                          {vehicle.status}
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA 3: PRECIO */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">
                        {vehicle.type === "SALE"
                          ? `${vehicle.price?.toLocaleString("es-ES")} €`
                          : `${vehicle.dailyPrice} €/día`}
                      </div>
                    </td>

                    {/* COLUMNA 4: DETALLES TÉCNICOS */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} /> {vehicle.year}
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge size={12} />{" "}
                          {vehicle.kilometres.toLocaleString()} km
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel size={12} /> {vehicle.fuelType.name}
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA 5: ACCIONES */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/coches/editar/${vehicle.id}`}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;