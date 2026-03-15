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
import { getVehicles, archiveVehicle } from "../../services/vehicleService";
import type { Vehicle } from "../../types/vehicle";
import ConfirmModal from "../../helpers/ConfirmModal";

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 20;

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await getVehicles(page, searchTerm);
      const allVehicles = response.data.member || [];
      setVehicles(allVehicles);
      setTotalItems(response.data.totalItems || allVehicles.length);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVehicles();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  const handleDeleteClick = (id: number) => {
    setVehicleToDelete(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete === null) return;
    try {
      await archiveVehicle(vehicleToDelete);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      throw new Error(`Error al eliminar el vehículo: ${err}`);
    } finally {
      setModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setVehicleToDelete(null);
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getThumbnail = (vehicle: Vehicle) => {
    const mainImage =
      vehicle.vehicleImages?.find((img) => img.main) ||
      vehicle.vehicleImages?.[0];
    if (mainImage) {
      return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${mainImage.imageUrl}`;
    }
    return "https://via.placeholder.com/150?text=Sin+Foto";
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };
  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };

  const statusBadge = (vehicle: Vehicle) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        vehicle.type === "SALE"
          ? "bg-blue-100 text-blue-800"
          : "bg-purple-100 text-purple-800"
      }`}
    >
      {vehicle.type === "SALE" ? "Venta" : "Alquiler"}
    </span>
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <ConfirmModal
        isOpen={modalOpen}
        title="Archivar vehículo"
        message="¿Seguro que quieres archivar este vehículo? Esta acción no se puede deshacer."
        confirmColor="red"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Flota de Vehículos</h1>
          <p className="text-gray-500 text-sm">Gestiona el inventario de coches disponibles.</p>
        </div>
        <button
          onClick={() => navigate("/admin/coches/nuevo")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium w-full sm:w-auto justify-center"
        >
          <Plus size={20} /> Nuevo Vehículo
        </button>
      </div>

      {/* Search */}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Cargando flota...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Car size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay vehículos</h3>
            <p className="text-gray-500">No se encontraron coches con ese criterio en esta página.</p>
          </div>
        ) : (
          <>
            {/* ── MÓVIL/TABLET: cards ── */}
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex gap-3 p-4">
                  <div className="h-20 w-28 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={getThumbnail(vehicle)}
                      className="h-full w-full object-cover"
                      alt="miniatura"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">
                        {vehicle.brand.name} {vehicle.model.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin size={11} />
                        {vehicle.province?.name || "Sin provincia"}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {statusBadge(vehicle)}
                        <span className="text-xs text-gray-500 capitalize">
                          {vehicle.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {vehicle.type === "SALE"
                          ? `${vehicle.price?.toLocaleString("es-ES")} €`
                          : `${vehicle.dailyPrice} €/día`}
                      </span>
                      <div className="flex gap-1">
                        <Link
                          to={`/admin/coches/editar/${vehicle.id}`}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(vehicle.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── DESKTOP: tabla ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-4">Vehículo</th>
                    <th className="px-6 py-4">Estado / Tipo</th>
                    <th className="px-6 py-4">Precio</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Detalles</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img
                              src={getThumbnail(vehicle)}
                              className="h-full w-full object-cover"
                              alt="miniatura"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base">
                              {vehicle.brand.name} {vehicle.model.name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin size={12} /> {vehicle.province?.name || "Sin provincia"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {statusBadge(vehicle)}
                          <div className="text-xs text-gray-500 font-medium capitalize">
                            {vehicle.status.toLowerCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">
                          {vehicle.type === "SALE"
                            ? `${vehicle.price?.toLocaleString("es-ES")} €`
                            : `${vehicle.dailyPrice} €/día`}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1"><Calendar size={12} /> {vehicle.year}</div>
                          <div className="flex items-center gap-1"><Gauge size={12} /> {vehicle.kilometres.toLocaleString()} km</div>
                          <div className="flex items-center gap-1"><Fuel size={12} /> {vehicle.fuelType?.name || "N/A"}</div>
                        </div>
                      </td>
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
                            onClick={() => handleDeleteClick(vehicle.id)}
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

            {/* Paginación */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-auto">
              <div className="flex flex-1 justify-between md:hidden">
                <button onClick={handlePrevPage} disabled={page === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Anterior
                </button>
                <span className="flex items-center text-sm text-gray-700 font-medium">
                  {page} / {totalPages > 0 ? totalPages : 1}
                </span>
                <button onClick={handleNextPage} disabled={page >= totalPages} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Siguiente
                </button>
              </div>
              <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
                <p className="text-sm text-gray-700">
                  Mostrando página <span className="font-medium">{page}</span> de{" "}
                  <span className="font-medium">{totalPages > 0 ? totalPages : 1}</span>
                  <span className="ml-1 text-gray-500">({totalItems} resultados)</span>
                </p>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button onClick={handlePrevPage} disabled={page === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 bg-gray-50">
                    {page}
                  </span>
                  <button onClick={handleNextPage} disabled={page >= totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30">
                    <ChevronRight size={20} />
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleList;