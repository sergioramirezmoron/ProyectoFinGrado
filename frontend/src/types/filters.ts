import type { SelectOption } from "./vehicle";

export interface CatalogProps {
  mode: "SALE" | "RENT";
}

export interface FilterState {
  brand: string;
  fuelType: string;
  transmission: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  minKm: string;
  maxKm: string;
  province: string;
  color: string;
  bodyType: string;
  status: string;
}

export interface FilterProps {
  filters: FilterState;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onClear: () => void;
  options: {
    brands: SelectOption[];
    fuels: SelectOption[];
    transmissions: SelectOption[];
    provinces: SelectOption[];
    colors: SelectOption[];
    bodyTypes: SelectOption[];
  };
  mode: "SALE" | "RENT";
  isOpen?: boolean;
  onClose?: () => void;
}
