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
  province: string;
  color: string;
  bodyType: string;
  status: string;
}