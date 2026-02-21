import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import api from "../../api/axios";
import VehicleCard from "../../components/public/VehicleCard";
import VehicleFilter from "../../components/public/Filter";
import type { Vehicle, SelectOption } from "../../types/vehicle";
import type { CatalogProps, FilterState } from "../../types/filters";

const Catalog = ({ mode }: CatalogProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState("createdAt_desc");

  const ITEMS_PER_PAGE = 20;

  const [options, setOptions] = useState({
    brands: [] as SelectOption[],
    fuels: [] as SelectOption[],
    transmissions: [] as SelectOption[],
    provinces: [] as SelectOption[],
    colors: [] as SelectOption[],
    bodyTypes: [] as SelectOption[],
  });

  const [filters, setFilters] = useState<FilterState>({
    brand: "",
    fuelType: "",
    transmission: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    province: "",
    color: "",
    bodyType: "",
    status: "",
  });

  // 1. Cargar opciones de filtros al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [b, f, t, p, c, bt] = await Promise.all([
          api.get("/brands"),
          api.get("/fuels"),
          api.get("/transmissions"),
          api.get("/provinces"),
          api.get("/colors"),
          api.get("/body_types"),
        ]);
        setOptions({
          brands: b.data.member || [],
          fuels: f.data.member || [],
          transmissions: t.data.member || [],
          provinces: p.data.member || [],
          colors: c.data.member || [],
          bodyTypes: bt.data.member || [],
        });
      } catch (e) {
        console.error("Error cargando opciones de filtro", e);
      }
    };
    fetchOptions();
  }, []);

  // 2. Cargar vehículos cuando cambian filtros, modo, página o orden
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("type", mode);
        params.append("page", page.toString());

        // --- LÓGICA DE ESTADO SEGÚN MODO ---
        if (mode === "RENT") {
          // Si es Alquiler, forzamos SOLO disponibles
          params.append("status", "AVAILABLE");
        } else {
          // Si es Venta, permitimos filtrar o mostramos disponibles + reservados por defecto
          if (filters.status) {
            params.append("status", filters.status);
          } else {
            params.append("status[]", "AVAILABLE");
            params.append("status[]", "RESERVED");
          }
        }

        // Mapeo de filtros dinámicos (GTE/LTE para números)
        const priceField = mode === "RENT" ? "dailyPrice" : "price";

        if (filters.brand) params.append("brand", filters.brand);
        if (filters.fuelType) params.append("fuelType", filters.fuelType);
        if (filters.transmission)
          params.append("transmission", filters.transmission);
        if (filters.province) params.append("province", filters.province);
        if (filters.color) params.append("color", filters.color);
        if (filters.bodyType) params.append("bodyType", filters.bodyType);

        // Filtros de rango
        if (filters.minPrice)
          params.append(`${priceField}[gte]`, filters.minPrice);
        if (filters.maxPrice)
          params.append(`${priceField}[lte]`, filters.maxPrice);
        if (filters.minYear) params.append("year[gte]", filters.minYear);
        if (filters.maxYear) params.append("year[lte]", filters.maxYear);

        // Ordenación
        const [sortField, sortDir] = sort.split("_");
        const actualSortField = sortField === "price" ? priceField : sortField;
        params.append(`order[${actualSortField}]`, sortDir);

        const response = await api.get(`/vehicles?${params.toString()}`);

        const member = response.data.member || [];
        const total = response.data.totalItems || member.length;

        setVehicles(member);
        setTotalItems(total);
      } catch (e) {
        console.error("Error cargando vehículos", e);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchVehicles, 400);
    return () => clearTimeout(timer);
  }, [filters, mode, page, sort]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page * ITEMS_PER_PAGE < totalItems) setPage(page + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* SIDEBAR DE FILTROS */}
      <VehicleFilter
        filters={filters}
        mode={mode}
        options={options}
        onChange={(e) => {
          setFilters({ ...filters, [e.target.name]: e.target.value });
          setPage(1); // Resetear a página 1 al filtrar
        }}
        onClear={() =>
          setFilters({
            brand: "",
            fuelType: "",
            transmission: "",
            minPrice: "",
            maxPrice: "",
            minYear: "",
            maxYear: "",
            province: "",
            color: "",
            bodyType: "",
            status: "",
          })
        }
      />

      <main className="lg:w-3/4">
        {/* BARRA SUPERIOR: Info y Ordenación */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt_desc">Más recientes</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="year_desc">Año: Más nuevos</option>
          </select>
        </div>

        {/* LISTADO O ESTADOS DE CARGA */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 animate-pulse h-80 rounded-2xl"
              />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Search className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-800">Sin resultados</h3>
            <p className="text-gray-500">
              No hay vehículos disponibles con los criterios seleccionados.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalItems > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-4 py-12">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Página</span>
                  <span className="font-bold text-slate-700">{page}</span>
                  <span className="text-sm text-gray-400">
                    de {Math.ceil(totalItems / ITEMS_PER_PAGE)}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={page * ITEMS_PER_PAGE >= totalItems}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Catalog;
