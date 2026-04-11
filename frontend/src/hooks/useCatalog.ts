import { useState, useEffect, useMemo } from "react";
import type { Vehicle, SelectOption, HydraResponse } from "../types/vehicle";
import type { FilterState } from "../types/filters";
import { getAllVehicles, getCatalogOptions } from "../services/vehicleService";

type IriObject = Pick<SelectOption, "@id">;

const getIri = (obj: IriObject | string | null | undefined): string => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj["@id"] ?? "";
};

const matches = (
  obj: IriObject | string | null | undefined,
  filterVal: string,
): boolean => {
  if (!filterVal) return true;
  return getIri(obj) === filterVal;
};

const toNumber = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null || val === "") return 0;
  return Number(val);
};

const EMPTY_FILTERS: FilterState = {
  brand: "",
  fuelType: "",
  transmission: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  minKm: "",
  maxKm: "",
  province: "",
  color: "",
  bodyType: "",
  status: "",
};

export const CATALOG_ITEMS_PER_PAGE = 12;

export const useCatalog = (mode: "SALE" | "RENT") => {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt_desc");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [options, setOptions] = useState({
    brands: [] as SelectOption[],
    fuels: [] as SelectOption[],
    transmissions: [] as SelectOption[],
    provinces: [] as SelectOption[],
    colors: [] as SelectOption[],
    bodyTypes: [] as SelectOption[],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [b, f, t, p, c, bt] = await getCatalogOptions();
        const extract = (res: {
          data: HydraResponse<SelectOption>;
        }): SelectOption[] => res.data.member ?? [];
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

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const vehicles = await getAllVehicles();
        setAllVehicles(vehicles);
      } catch (e) {
        console.error("Error cargando vehículos:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    return allVehicles.filter((v) => {
      if (v.type !== mode) return false;

      if (searchLower) {
        const brandName = typeof v.brand === "string" ? "" : v.brand.name.toLowerCase();
        const modelName = typeof v.model === "string" ? "" : v.model.name.toLowerCase();
        const fullName = `${brandName} ${modelName}`;
        const description = (v.description ?? "").toLowerCase();
        if (!fullName.includes(searchLower) && !description.includes(searchLower)) return false;
      }

      if (mode === "RENT") {
        if (v.status !== "AVAILABLE") return false;
      } else {
        if (filters.status) {
          if (v.status !== filters.status) return false;
        } else {
          if (v.status === "SOLD" || v.status === "DELETED") return false;
        }
      }

      if (!matches(v.brand, filters.brand)) return false;
      if (!matches(v.fuelType, filters.fuelType)) return false;
      if (!matches(v.transmission, filters.transmission)) return false;
      if (!matches(v.province, filters.province)) return false;
      if (!matches(v.color, filters.color)) return false;
      if (!matches(v.bodyType, filters.bodyType)) return false;

      const price = mode === "RENT" ? toNumber(v.dailyPrice) : toNumber(v.price);
      if (filters.minPrice && price < toNumber(filters.minPrice)) return false;
      if (filters.maxPrice && price > toNumber(filters.maxPrice)) return false;
      if (filters.minYear && v.year < Number(filters.minYear)) return false;
      if (filters.maxYear && v.year > Number(filters.maxYear)) return false;
      if (filters.minKm && v.kilometres < toNumber(filters.minKm)) return false;
      if (filters.maxKm && v.kilometres > toNumber(filters.maxKm)) return false;

      return true;
    });
  }, [allVehicles, filters, search, mode]);

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
      } else if (field === "km") {
        vA = a.kilometres;
        vB = b.kilometres;
      } else {
        vA = new Date(a.createdAt).getTime();
        vB = new Date(b.createdAt).getTime();
      }
      return dir === "asc" ? vA - vB : vB - vA;
    });

    return data;
  }, [filteredVehicles, sort, mode]);

  useEffect(() => {
    setPage(1);
  }, [filters, search, mode]);

  const totalItems = sortedVehicles.length;
  const totalPages = Math.ceil(totalItems / CATALOG_ITEMS_PER_PAGE) || 1;
  const displayedVehicles = sortedVehicles.slice(
    (page - 1) * CATALOG_ITEMS_PER_PAGE,
    page * CATALOG_ITEMS_PER_PAGE,
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearch("");
  };

  return {
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
  };
};
