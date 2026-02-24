import { useContext } from "react";
import { FavoriteContext } from "../context/FavoriteContext";

export const useFavorite = (vehicleIri: string) => {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error("useFavorite debe usarse dentro de <FavoriteProvider>");
  }

  const { isFavorite, toggleFavorite, loading } = context;

  return {
    isFavorite: isFavorite(vehicleIri),
    loading,
    toggleFavorite: (e: React.MouseEvent) => toggleFavorite(vehicleIri, e),
  };
};
