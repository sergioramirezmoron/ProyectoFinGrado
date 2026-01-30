import { useState, useEffect } from "react";
import {
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import api from "../../api/axios";
import VehicleCard from "../../components/public/VehicleCard";
import type { Vehicle, SelectOption } from "../../types/vehicle";
import type { CatalogProps, FilterState } from "../../types/filters";

const Catalog = ({ mode }: CatalogProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación y Ordenación
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState("createdAt_desc");

  const ITEMS_PER_PAGE = 20;

  // Opciones de los selects
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [fuels, setFuels] = useState<SelectOption[]>([]);
  const [transmissions, setTransmissions] = useState<SelectOption[]>([]);
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [colors, setColors] = useState<SelectOption[]>([]);
  const [bodyTypes, setBodyTypes] = useState<SelectOption[]>([]);

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
  });

  // 1. CARGAR OPCIONES DEL SIDEBAR
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [
          brandsRes,
          fuelsRes,
          transRes,
          provincesRes,
          colorsRes,
          bodyTypesRes,
        ] = await Promise.all([
          api.get("/brands"),
          api.get("/fuels"),
          api.get("/transmissions"),
          api.get("/provinces"),
          api.get("/colors"),
          api.get("/body_types"),
        ]);

        setBrands(
          brandsRes.data["hydra:member"] || brandsRes.data.member || [],
        );
        setFuels(fuelsRes.data["hydra:member"] || fuelsRes.data.member || []);
        setTransmissions(
          transRes.data["hydra:member"] || transRes.data.member || [],
        );
        setProvinces(
          provincesRes.data["hydra:member"] || provincesRes.data.member || [],
        );
        setColors(
          colorsRes.data["hydra:member"] || colorsRes.data.member || [],
        );
        setBodyTypes(
          bodyTypesRes.data["hydra:member"] || bodyTypesRes.data.member || [],
        );
      } catch (error) {
        console.error("Error al cargar opciones:", error);
      }
    };
    fetchOptions();
  }, []);

  // 2. RESETEAR AL CAMBIAR DE MODO
  useEffect(() => {
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
    });
    setPage(1);
    setSort("createdAt_desc");
  }, [mode]);

  // 3. CARGAR VEHÍCULOS (Lógica central)
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // --- FILTROS BÁSICOS ---
        params.append("type", mode);
        params.append("status", "AVAILABLE");
        params.append("page", page.toString());

        if (filters.brand) params.append("brand", filters.brand);
        if (filters.fuelType) params.append("fuelType", filters.fuelType);
        if (filters.transmission)
          params.append("transmission", filters.transmission);

        const priceField = mode === "RENT" ? "dailyPrice" : "price";
        if (filters.minPrice)
          params.append(`${priceField}[gte]`, filters.minPrice);
        if (filters.maxPrice)
          params.append(`${priceField}[lte]`, filters.maxPrice);

        if (filters.minYear) params.append("year[gte]", filters.minYear);
        if (filters.maxYear) params.append("year[lte]", filters.maxYear);

        if (filters.province) params.append("province", filters.province);
        if (filters.color) params.append("color", filters.color);
        if (filters.bodyType) params.append("bodyType", filters.bodyType);

        // --- ORDENACIÓN ---
        const [sortField, sortDir] = sort.split("_");
        let actualSortField = sortField;
        if (sortField === "price") {
          actualSortField = priceField;
        }
        params.append(`order[${actualSortField}]`, sortDir);

        // Llamada API
        const response = await api.get(`/vehicles?${params.toString()}`);

        const data =
          response.data["hydra:member"] || response.data.member || [];
        setVehicles(data);

        if (response.data["hydra:totalItems"]) {
          setTotalItems(response.data["hydra:totalItems"]);
        } else {
          setTotalItems(0);
        }
      } catch (error) {
        throw new Error(`Error al cargar vehículos: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchVehicles();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, mode, page, sort]);

  // --- HANDLERS ---

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
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
    });
    setPage(1);
    setSort("createdAt_desc");
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    const hasMoreKnown = totalItems > 0 && page * ITEMS_PER_PAGE < totalItems;
    const hasMoreUnknown =
      totalItems === 0 && vehicles.length === ITEMS_PER_PAGE;

    if (hasMoreKnown || hasMoreUnknown) {
      setPage(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-4">
            {mode === "SALE" ? "Vehículos en Venta" : "Alquiler de Vehículos"}
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            {mode === "SALE"
              ? "Descubre nuestra selección de coches premium listos para ser tuyos."
              : "Disfruta de la libertad de conducir los mejores coches por días."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR DE FILTROS */}
          <aside className={`lg:w-1/4 lg:block`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Filter size={20} className="text-blue-600" /> Filtros
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Limpiar todo
                </button>
              </div>

              <div className="space-y-6">
                {/* MARCA */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Marca
                  </label>
                  <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  >
                    <option value="">Todas las marcas</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b["@id"]}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PROVINCIA */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Provincia
                  </label>
                  <select
                    name="province"
                    value={filters.province}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  >
                    <option value="">Todas las provincias</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p["@id"]}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRECIO */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {mode === "RENT" ? "Precio / Día (€)" : "Precio Total (€)"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Mín"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Máx"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>

                {/* AÑO */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Año
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minYear"
                      placeholder="Desde"
                      value={filters.minYear}
                      onChange={handleFilterChange}
                      className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <input
                      type="number"
                      name="maxYear"
                      placeholder="Hasta"
                      value={filters.maxYear}
                      onChange={handleFilterChange}
                      className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>

                {/* COMBUSTIBLE */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Combustible
                  </label>
                  <select
                    name="fuelType"
                    value={filters.fuelType}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  >
                    <option value="">Cualquiera</option>
                    {fuels.map((f) => (
                      <option key={f.id} value={f["@id"]}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TRANSMISIÓN */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Cambio
                  </label>
                  <select
                    name="transmission"
                    value={filters.transmission}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  >
                    <option value="">Cualquiera</option>
                    {transmissions.map((t) => (
                      <option key={t.id} value={t["@id"]}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COLOR */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Color
                  </label>
                  <select
                    name="color"
                    value={filters.color}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  >
                    <option value="">Todos los colores</option>
                    {colors.map((c) => (
                      <option key={c.id} value={c["@id"]}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CARROCERÍA */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Carrocería
                  </label>
                  <select
                    name="bodyType"
                    value={filters.bodyType}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  >
                    <option value="">Todas las carrocerías</option>
                    {bodyTypes.map((b) => (
                      <option key={b.id} value={b["@id"]}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* GRID DE RESULTADOS */}
          <main className="lg:w-3/4">
            {/* BARRA SUPERIOR: CONTADOR Y ORDENACIÓN */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">
                  Ordenar:
                </span>
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                >
                  <option value="createdAt_desc">Más recientes</option>
                  <option value="price_asc">Precio: Bajo a Alto</option>
                  <option value="price_desc">Precio: Alto a Bajo</option>
                  <option value="year_desc">Año: Nuevo a Viejo</option>
                  <option value="year_asc">Año: Viejo a Nuevo</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl h-96 border border-gray-200 animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="bg-gray-50 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  No encontramos vehículos
                </h3>
                <button
                  onClick={clearFilters}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>

                {/* CONTROLES DE PAGINACIÓN */}
                <div className="flex justify-center items-center gap-4 py-8">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} /> Anterior
                  </button>

                  <span className="text-gray-600 font-medium">
                    Página {page}
                  </span>

                  <button
                    onClick={handleNextPage}
                    // --- CORRECCIÓN BOTÓN SIGUIENTE ---
                    // Se deshabilita si:
                    // 1. No hay vehículos (lista vacía)
                    // 2. Sabemos el total y ya llegamos al final.
                    // 3. NO sabemos el total (es 0) PERO hemos recibido menos items de los que pedimos (significa fin de página).
                    disabled={
                      vehicles.length === 0 ||
                      (totalItems > 0 && page * ITEMS_PER_PAGE >= totalItems) ||
                      (totalItems === 0 && vehicles.length < ITEMS_PER_PAGE)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
