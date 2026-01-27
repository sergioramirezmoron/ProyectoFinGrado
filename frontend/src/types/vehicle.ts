// ==========================================
// 1. TIPOS GENÉRICOS (Para Dropdowns y API)
// ==========================================

export interface SelectOption {
  id: number;
  "@id": string; // El IRI de API Platform (ej: "/api/brands/1")
  name: string;
}

// El Modelo es especial porque necesita la marca para filtrarse
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

// ==========================================
// 2. INTERFACES DEL FORMULARIO (Escritura)
// ==========================================

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

  // Relaciones
  fuelType: string;
  transmission: string;
  enviromentalBadge: string;
  province: string;
  bodyType: string;
  color: string;

  // Números
  year: number;
  kilometres: number;
  power: number;
  displacement: number;
  doors: number;
  owners: number;
  
  price?: string;
  dailyPrice?: string;
}

// ==========================================
// 3. ENTIDAD COMPLETA (Lectura / Listado)
// ==========================================
// Esto lo usarás cuando hagas la página de "Ver Coche" o "Lista de Coches"

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
