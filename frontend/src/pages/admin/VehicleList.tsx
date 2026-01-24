import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, CarFront, Filter } from "lucide-react";
import api from "../../api/axios";
import type { Vehicle } from "../../types/vehicle";
import { useNavigate } from "react-router-dom";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Función para cargar los coches
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vehicles");

      const cars = response.data.member || response.data["hydra:member"] || [];

      setVehicles(cars);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la flota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Función auxiliar para formatear precio
  const formatPrice = (amount?: number, daily?: string, type?: string) => {
    if (type === "RENT") return `${daily} €/día`;
    return amount ? `${amount.toLocaleString()} €` : "Consultar";
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Cargando flota...</div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* CABECERA: Título y Botón Añadir */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestión de Flota
          </h1>
          <p className="text-gray-500 text-sm">
            Administra los vehículos en venta y alquiler
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/coches/nuevo")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Nuevo Vehículo
        </button>
      </div>

      {/* BARRA DE HERRAMIENTAS: Buscador y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por marca, modelo o matrícula..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Estado / Tipo</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((car) => (
                <tr
                  key={car.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Columna 1: Info Principal */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Imagen o Placeholder */}
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {car.vehicleImages && car.vehicleImages.length > 0 ? (
                          // IMPORTANTE: Aquí asumo que imageUrl es completa. Si no, habría que añadir el dominio.
                          <img
                            src={car.vehicleImages[0].imageUrl}
                            alt="Coche"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CarFront className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {car.brand.name} {car.model.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: #{car.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Columna 2: Etiquetas */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          car.type === "SALE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        }`}
                      >
                        {car.type === "SALE" ? "Venta" : "Alquiler"}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {car.status.toLowerCase()}
                      </span>
                    </div>
                  </td>

                  {/* Columna 3: Precio */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {formatPrice(car.price, car.dailyPrice, car.type)}
                  </td>

                  {/* Columna 4: Km y Año */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{car.year}</div>
                    <div className="text-xs">
                      {car.kilometres.toLocaleString()} km
                    </div>
                  </td>

                  {/* Columna 5: Botones */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {vehicles.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No hay vehículos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
