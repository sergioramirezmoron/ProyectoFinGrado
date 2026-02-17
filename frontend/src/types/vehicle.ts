
export interface SelectOption {
  id: number;
  "@id": string;
  name: string;
  hexColor?: string;
}
export interface VehicleModel extends SelectOption {
  brand: string | { "@id": string };
}

export interface HydraResponse<T> {
  "hydra:member"?: T[];
  member?: T[];
  "hydra:totalItems"?: number;
  "hydra:view"?: {
    "hydra:last"?: string;
    "hydra:next"?: string;
  };
}

export interface Violation {
  propertyPath: string;
  message: string;
}

export interface FormOptions {
  brands: SelectOption[];
  fuels: SelectOption[];
  transmissions: SelectOption[];
  badges: SelectOption[];
  provinces: SelectOption[];
  bodyTypes: SelectOption[];
  colors: SelectOption[];
}

export interface VehicleFormData {
  brand: string;
  model: string;
  description: string;
  status: string;
  type: "SALE" | "RENT";
  fuelType: string;
  transmission: string;
  enviromentalBadge: string;
  province: string;
  bodyType: string;
  color: string;
  year: number;
  kilometres: number;
  power: number;
  displacement: number;
  doors: number;
  owners: number;
  price?: string;
  dailyPrice?: string;
}

export interface VehicleImage {
  id: number;
  "@id": string;
  imageUrl: string;
  filename: string;
  main: boolean;
}

export interface Vehicle {
  id: number;
  "@id": string;
  brand: SelectOption;
  model: SelectOption;
  fuelType: SelectOption;
  transmission: SelectOption;
  bodyType?: SelectOption;
  enviromentalBadge?: SelectOption;
  color?: SelectOption;
  province?: SelectOption;
  year: number;
  kilometres: number;
  power: number;
  displacement?: number;
  doors?: number;
  owners?: number;
  description?: string;
  status: string;
  type: "SALE" | "RENT";
  price?: number;
  dailyPrice?: string;
  vehicleImages: VehicleImage[];
  createdAt: string;
  updatedAt?: string;
}
