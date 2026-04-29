import { createContext } from "react";

export interface FavoriteItem {
  id: number;
  vehicleIri: string;
}

export interface FavoriteContextType {
  favorites: FavoriteItem[];
  isFavorite: (vehicleIri: string) => boolean;
  toggleFavorite: (vehicleIri: string, e: React.MouseEvent) => Promise<void>;
  loading: boolean;
}

export const FavoriteContext = createContext<FavoriteContextType | null>(null);
