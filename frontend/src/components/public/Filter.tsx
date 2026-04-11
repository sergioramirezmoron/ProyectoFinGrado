import { Filter as FilterIcon, X } from "lucide-react";
import type { FilterProps } from "../../types/filters";

const VehicleFilter = ({
  filters,
  onChange,
  onClear,
  options,
  mode,
  isOpen = false,
  onClose,
}: FilterProps) => {
  const content = (
    <div className="bg-white p-6 min-h-full lg:min-h-0 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 lg:sticky lg:top-4">
      {/* Header — en móvil muestra botón cerrar */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FilterIcon size={20} className="text-blue-600" /> Filtros
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Limpiar todo
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Cerrar filtros"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Disponibilidad (solo venta) */}
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

        {/* Marca */}
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

        {/* Carrocería */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Carrocería
          </label>
          <select
            name="bodyType"
            value={filters.bodyType}
            onChange={onChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
          >
            <option value="">Cualquier tipo</option>
            {options.bodyTypes.map((bt) => (
              <option key={bt.id} value={bt["@id"]}>
                {bt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Provincia */}
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

        {/* Combustible */}
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

        {/* Transmisión */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Transmisión
          </label>
          <select
            name="transmission"
            value={filters.transmission}
            onChange={onChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
          >
            <option value="">Cualquiera</option>
            {options.transmissions.map((t) => (
              <option key={t.id} value={t["@id"]}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Color
          </label>
          <select
            name="color"
            value={filters.color}
            onChange={onChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
          >
            <option value="">Cualquier color</option>
            {options.colors.map((c) => (
              <option key={c.id} value={c["@id"]}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            {mode === "RENT" ? "Precio / Día (€)" : "Precio Total (€)"}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Mín"
              min={0}
              value={filters.minPrice}
              onChange={onChange}
              className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Máx"
              min={0}
              value={filters.maxPrice}
              onChange={onChange}
              className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            />
          </div>
        </div>

        {/* Año */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Año
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minYear"
              placeholder="Desde"
              min={1900}
              max={new Date().getFullYear()}
              value={filters.minYear}
              onChange={onChange}
              className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            />
            <input
              type="number"
              name="maxYear"
              placeholder="Hasta"
              min={1900}
              max={new Date().getFullYear()}
              value={filters.maxYear}
              onChange={onChange}
              className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            />
          </div>
        </div>

        {/* Kilometraje */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Kilometraje (km)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minKm"
              placeholder="Mín"
              min={0}
              value={filters.minKm}
              onChange={onChange}
              className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            />
            <input
              type="number"
              name="maxKm"
              placeholder="Máx"
              min={0}
              value={filters.maxKm}
              onChange={onChange}
              className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop móvil */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-80 max-w-[90vw] z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:w-1/4 lg:z-auto lg:translate-x-0 lg:overflow-visible lg:block
        `}
      >
        {content}
      </aside>
    </>
  );
};

export default VehicleFilter;
