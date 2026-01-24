// 1. Sub-interfaces para mantenerlo ordenado
export interface Brand {
    id?: string;
    name: string;
}

export interface Model {
    id?: string;
    name: string;
}

export interface Fuel {
    name: string;
}

export interface Transmission {
    name: string;
}

export interface BodyType {
    name: string;
}

export interface Color {
    name: string;
}

export interface Province {
    name: string;
}

export interface EnviromentalBadge {
    name: string;
    imageUrl?: string;
}

export interface VehicleImage {
    id: number;
    imageUrl: string; // La ruta completa o parcial que devuelve tu backend
    filename: string;
    main: boolean;
}

// 2. La Interfaz Principal
export interface Vehicle {
    id: number;
    '@id'?: string; // Identificador de JSON-LD
    
    // Relaciones
    brand: Brand;
    model: Model;
    fuelType: Fuel;
    transmission: Transmission;
    bodyType?: BodyType;
    enviromentalBadge?: EnviromentalBadge;
    color?: Color;
    province?: Province;

    // Datos numéricos y texto
    year: number;
    kilometres: number;
    power: number;
    displacement?: number;
    doors?: number;
    owners?: number;
    description?: string;
    
    // Estado y Tipo (Crucial para tu lógica de negocio)
    status: string; // Ej: "AVAILABLE", "RESERVED"
    type: 'SALE' | 'RENT'; 

    // Precios (Opcionales porque dependen del tipo)
    price?: number;       // Para Venta
    dailyPrice?: string;  // Para Alquiler (Viene como string "99.00")

    // Imágenes
    vehicleImages: VehicleImage[];
    
    createdAt: string;
}