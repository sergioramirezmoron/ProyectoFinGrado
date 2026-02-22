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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../api/axios";
import { AxiosError } from "axios";
import type { HydraResponse, Vehicle } from "../../types/vehicle";

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // 1. Cargar la flota
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("status[nest]", "DELETED"); 
      
      // Mantenemos esto por si en el futuro configuras el backend
      if (searchTerm) {
        params.append("brand.name", searchTerm);
      }

      const response = await api.get<HydraResponse<Vehicle>>(`/vehicles?${params.toString()}`);
      
      const allVehicles = response.data["hydra:member"] || response.data.member || [];
      const total = response.data["hydra:totalItems"] || response.data.totalItems || allVehicles.length;

      setVehicles(allVehicles);
      setTotalItems(total);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reseteamos página al buscar para no quedarnos en una página vacía
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Efecto con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVehicles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  // 2. Función de Borrar
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres archivar este vehículo?")) return;

    try {
      await api.patch(
        `/vehicles/${id}`,
        { status: "DELETED" },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
      
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const error = err as AxiosError<{ "hydra:description": string }>;
      const serverMessage = error.response?.data?.["hydra:description"] || "Error desconocido";
      alert(`No se pudo borrar. El servidor dice:\n\n${serverMessage}`);
    }
  };

  // 3. RECUPERADO: Filtrado simple por buscador (Local)
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getThumbnail = (vehicle: Vehicle) => {
    const mainImage = vehicle.vehicleImages?.find((img) => img.main) || vehicle.vehicleImages?.[0];
    if (mainImage) {
      return `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${mainImage.imageUrl}`;
    }
    return "https://via.placeholder.com/150?text=Sin+Foto";
  };

  // Handlers de página
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };
  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Flota de Vehículos</h1>
          <p className="text-gray-500 text-sm">Gestiona el inventario de coches disponibles.</p>
        </div>
        <button
          onClick={() => navigate("/admin/coches/nuevo")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium hover:cursor-pointer"
        >
          <Plus size={20} /> Nuevo Vehículo
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por marca..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA / LISTA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             <p className="text-gray-500">Cargando flota...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3"><Car size={32} className="text-gray-400" /></div>
            <h3 className="text-lg font-medium text-gray-900">No hay vehículos</h3>
            <p className="text-gray-500">No se encontraron coches con ese criterio en esta página.</p>
          </div>
        ) : (
          <>
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
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      {/* COLUMNA 1: Vehículo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={getThumbnail(vehicle)} className="h-full w-full object-cover" alt="miniatura" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base">{vehicle.brand.name} {vehicle.model.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin size={12} /> {vehicle.province?.name || "Sin provincia"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* COLUMNA 2: Estado */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.type === "SALE" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                            {vehicle.type === "SALE" ? "Venta" : "Alquiler"}
                          </span>
                          <div className="text-xs text-gray-500 font-medium capitalize">{vehicle.status.toLowerCase()}</div>
                        </div>
                      </td>

                      {/* COLUMNA 3: Precio */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">
                          {vehicle.type === "SALE"
                            ? `${vehicle.price?.toLocaleString("es-ES")} €`
                            : `${vehicle.dailyPrice} €/día`}
                        </div>
                      </td>

                      {/* COLUMNA 4: Detalles */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1"><Calendar size={12} /> {vehicle.year}</div>
                          <div className="flex items-center gap-1"><Gauge size={12} /> {vehicle.kilometres.toLocaleString()} km</div>
                          <div className="flex items-center gap-1"><Fuel size={12} /> {vehicle.fuelType?.name || 'N/A'}</div>
                        </div>
                      </td>

                      {/* COLUMNA 5: Acciones */}
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

            {/* CONTROLES DE PAGINACIÓN */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-auto">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages > 0 ? totalPages : 1}</span>
                    <span className="ml-1 text-gray-500">({totalItems} resultados)</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30"
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeft size={20} aria-hidden="true" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 bg-gray-50">
                      {page}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30"
                    >
                      <span className="sr-only">Siguiente</span>
                      <ChevronRight size={20} aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleList;