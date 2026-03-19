import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import VehicleCard from "../../components/public/VehicleCard";
import VehicleFilter from "../../components/public/Filter";
import type { CatalogProps } from "../../types/filters";
import { useCatalog } from "../../hooks/useCatalog";

const Catalog = ({ mode }: CatalogProps) => {
  const {
    loading,
    page,
    setPage,
    sort,
    setSort,
    options,
    filters,
    totalItems,
    totalPages,
    displayedVehicles,
    handleFilterChange,
    handleClearFilters,
  } = useCatalog(mode);

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
