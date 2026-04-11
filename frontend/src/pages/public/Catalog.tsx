import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Loader2, SlidersHorizontal, X } from "lucide-react";
import VehicleCard from "../../components/public/VehicleCard";
import VehicleFilter from "../../components/public/Filter";
import type { CatalogProps } from "../../types/filters";
import { useCatalog } from "../../hooks/useCatalog";

const Catalog = ({ mode }: CatalogProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    loading,
    page,
    setPage,
    sort,
    setSort,
    search,
    setSearch,
    options,
    filters,
    totalItems,
    totalPages,
    displayedVehicles,
    handleFilterChange,
    handleClearFilters,
  } = useCatalog(mode);

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <VehicleFilter
        filters={filters}
        mode={mode}
        options={options}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />

      <main className="lg:w-3/4">
        {/* Barra superior */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar por marca, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Fila inferior: contador + ordenar + botón filtros */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Botón filtros — solo móvil */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-blue-400 transition-colors relative"
            >
              <SlidersHorizontal size={16} className="text-blue-600" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Ordenar */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-3 outline-none shadow-sm hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            >
              <option value="createdAt_desc">Más recientes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="year_desc">Año: Más nuevos</option>
              <option value="year_asc">Año: Más antiguos</option>
              <option value="km_asc">Km: Menor a Mayor</option>
              <option value="km_desc">Km: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <p className="text-sm font-semibold text-slate-600 mb-4">
          {totalItems} vehículo{totalItems !== 1 ? "s" : ""}{" "}
          <span className="text-slate-400 font-normal uppercase text-[10px] tracking-widest">
            {mode === "SALE" ? "en venta" : "en alquiler"}
          </span>
        </p>

        {loading && displayedVehicles.length === 0 ? (
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
