import { Filter as FilterIcon } from "lucide-react";
import type { FilterProps } from "../../types/filters";

const VehicleFilter = ({
  filters,
  onChange,
  onClear,
  options,
  mode,
}: FilterProps) => {
  return (
    <aside className="lg:w-1/4 lg:block">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FilterIcon size={20} className="text-blue-600" /> Filtros
          </h3>
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Limpiar todo
          </button>
        </div>

        <div className="space-y-6">
          {mode !== "RENT" && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Disponibilidad
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={onChange}
                className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl outline-none text-blue-900 font-medium"
              >
                <option value="">Ver Todos</option>
                <option value="AVAILABLE">Solo Disponibles</option>
                <option value="RESERVED">Solo Reservados</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Marca
            </label>
            <select
              name="brand"
              value={filters.brand}
              onChange={onChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            >
              <option value="">Todas las marcas</option>
              {options.brands.map((b) => (
                <option key={b.id} value={b["@id"]}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Provincia
            </label>
            <select
              name="province"
              value={filters.province}
              onChange={onChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            >
              <option value="">Todas las provincias</option>
              {options.provinces.map((p) => (
                <option key={p.id} value={p["@id"]}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

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
                onChange={onChange}
                className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Máx"
                value={filters.maxPrice}
                onChange={onChange}
                className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Combustible
            </label>
            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={onChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            >
              <option value="">Cualquiera</option>
              {options.fuels.map((f) => (
                <option key={f.id} value={f["@id"]}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default VehicleFilter;
