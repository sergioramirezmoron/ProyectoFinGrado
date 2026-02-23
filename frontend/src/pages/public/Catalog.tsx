import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import api from "../../api/axios";
import VehicleCard from "../../components/public/VehicleCard";
import VehicleFilter from "../../components/public/Filter";
import type { Vehicle, SelectOption, HydraResponse } from "../../types/vehicle";
import type { CatalogProps, FilterState } from "../../types/filters";

type IriObject = Pick<SelectOption, "@id">;

// Extrae el IRI de un objeto relacionado de la API (e.g. brand, fuelType...)
// Acepta cualquiera de las dos formas que puede devolver la API:
//   { "@id": "/api/brands/51", "name": "Audi" }
//   o directamente el string IRI "/api/brands/51"
const getIri = (obj: IriObject | string | null | undefined): string => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj["@id"] ?? "";
};

// Compara el IRI de un campo relacional del vehículo con el valor del filtro
const matches = (obj: IriObject | string | null | undefined, filterVal: string): boolean => {
  if (!filterVal) return true; // Sin filtro → pasa todo
  return getIri(obj) === filterVal;
};

// Normaliza price que puede llegar como string "45000" o number 45000
const toNumber = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null || val === "") return 0;
  return Number(val);
};

const ITEMS_PER_PAGE = 12;

const Catalog = ({ mode }: CatalogProps) => {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt_desc");

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

  // 1. Cargar opciones de filtros
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

        // La API puede devolver "hydra:member" o "member" según la versión
        const extract = (res: { data: HydraResponse<SelectOption> }): SelectOption[] =>
          res.data["hydra:member"] ??
          res.data.member ??
          [];

        setOptions({
          brands: extract(b),
          fuels: extract(f),
          transmissions: extract(t),
          provinces: extract(p),
          colors: extract(c),
          bodyTypes: extract(bt),
        });
      } catch (e) {
        console.error("Error cargando opciones de filtros:", e);
      }
    };
    fetchOptions();
  }, []);

  // 2. Cargar todos los vehículos paginando hasta agotar el total
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const PAGE_SIZE = 30;
        let currentPage = 1;
        let collected: Vehicle[] = [];
        let totalItems = Infinity;

        while (collected.length < totalItems) {
          const response = await api.get(
            `/vehicles?page=${currentPage}&itemsPerPage=${PAGE_SIZE}`
          );
          const data = response.data;

          const batch: Vehicle[] =
            data["hydra:member"] ??
            data.member ??
            (Array.isArray(data) ? data : []);

          // Leemos totalItems en la primera respuesta
          if (currentPage === 1) {
            totalItems = data["hydra:totalItems"] ?? data.totalItems ?? batch.length;
          }

          collected = [...collected, ...batch];

          // Si el batch está vacío o ya tenemos todo, paramos
          if (batch.length === 0 || collected.length >= totalItems) break;

          currentPage++;
        }

        setAllVehicles(collected);
      } catch (e) {
        console.error("Error cargando vehículos:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // 3. Filtrado — mode es la fuente de verdad para SALE vs RENT
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((v) => {
      // Separación estricta por tipo de página
      if (v.type !== mode) return false;

      // Lógica de estado según modo
      if (mode === "RENT") {
        if (v.status !== "AVAILABLE") return false;
      } else {
        // SALE: si hay filtro de estado lo aplicamos, si no ocultamos SOLD y DELETED
        if (filters.status) {
          if (v.status !== filters.status) return false;
        } else {
          if (v.status === "SOLD" || v.status === "DELETED") return false;
        }
      }

      // Filtros relacionales (comparación por IRI)
      if (!matches(v.brand, filters.brand)) return false;
      if (!matches(v.fuelType, filters.fuelType)) return false;
      if (!matches(v.transmission, filters.transmission)) return false;
      if (!matches(v.province, filters.province)) return false;
      if (!matches(v.color, filters.color)) return false;
      if (!matches(v.bodyType, filters.bodyType)) return false;

      // Filtro de precio — price puede llegar como string o number desde la API
      const price =
        mode === "RENT" ? toNumber(v.dailyPrice) : toNumber(v.price);
      if (filters.minPrice && price < toNumber(filters.minPrice)) return false;
      if (filters.maxPrice && price > toNumber(filters.maxPrice)) return false;

      // Filtro de año
      if (filters.minYear && v.year < Number(filters.minYear)) return false;
      if (filters.maxYear && v.year > Number(filters.maxYear)) return false;

      return true;
    });
  }, [allVehicles, filters, mode]);

  // 4. Ordenación
  const sortedVehicles = useMemo(() => {
    const data = [...filteredVehicles];
    const [field, dir] = sort.split("_");

    data.sort((a, b) => {
      let vA: number, vB: number;

      if (field === "price") {
        vA = mode === "RENT" ? toNumber(a.dailyPrice) : toNumber(a.price);
        vB = mode === "RENT" ? toNumber(b.dailyPrice) : toNumber(b.price);
      } else if (field === "year") {
        vA = a.year;
        vB = b.year;
      } else {
        // createdAt por defecto
        vA = new Date(a.createdAt).getTime();
        vB = new Date(b.createdAt).getTime();
      }

      return dir === "asc" ? vA - vB : vB - vA;
    });

    return data;
  }, [filteredVehicles, sort, mode]);

  // 5. Paginación sobre el resultado ya filtrado y ordenado
  const totalItems = sortedVehicles.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const displayedVehicles = sortedVehicles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset de página cuando cambian filtros o mode
  useEffect(() => {
    setPage(1);
  }, [filters, mode]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClearFilters = () => {
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
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <VehicleFilter
        filters={filters}
        mode={mode}
        options={options}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <main className="lg:w-3/4">
        {/* Barra superior: contador + ordenación */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            {totalItems} vehículos{" "}
            <span className="text-slate-400 font-normal uppercase text-[10px] tracking-widest">
              {mode === "SALE" ? "en venta" : "en alquiler"}
            </span>
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg p-2 outline-none"
          >
            <option value="createdAt_desc">Más recientes</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="year_desc">Año: Más nuevos</option>
          </select>
        </div>

        {/* Estados: cargando / sin resultados / grid */}
        {loading && allVehicles.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : displayedVehicles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Search className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-800">
              No hay unidades disponibles
            </h3>
            <p className="text-slate-400 mt-2 text-sm">
              Prueba a cambiar o limpiar los filtros
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 py-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-lg border-gray-300 disabled:opacity-20 hover:bg-gray-50 transition-colors text-black hover:cursor-pointer"
                >
                  <ChevronLeft />
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">Página</span>
                  <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-md">
                    {page}
                  </span>
                  <span className="text-slate-400 text-sm">de {totalPages}</span>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 border rounded-lg border-gray-300 disabled:opacity-20 hover:bg-gray-50 transition-colors text-black hover:cursor-pointer"
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