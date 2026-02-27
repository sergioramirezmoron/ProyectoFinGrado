import { createContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

interface FavoriteItem {
  id: number;
  vehicleIri: string;
}

interface FavoriteContextType {
  favorites: FavoriteItem[];
  isFavorite: (vehicleIri: string) => boolean;
  toggleFavorite: (vehicleIri: string, e: React.MouseEvent) => Promise<void>;
  loading: boolean;
}

export const FavoriteContext = createContext<FavoriteContextType | null>(null);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const userIri = user?.["@id"] ?? null;

  useEffect(() => {
    setFavorites([]);

    if (!isAuthenticated || !userIri) return;

    let cancelled = false;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get("/favorites", {
          params: { user: userIri, itemsPerPage: 200 },
        });
        if (cancelled) return;

        const members = response.data.member ?? [];

        setFavorites(
          members.map((f: { id: number; vehicle: { "@id": string } }) => ({
            id: f.id,
            vehicleIri: f.vehicle["@id"],
          })),
        );
      } catch (e) {
        if (!cancelled) console.error("Error cargando favoritos", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFavorites();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userIri]);

  const isFavorite = useCallback(
    (vehicleIri: string) => favorites.some((f) => f.vehicleIri === vehicleIri),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (vehicleIri: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated || !userIri) return;

      const existing = favorites.find((f) => f.vehicleIri === vehicleIri);

      try {
        if (existing) {
          setFavorites((prev) =>
            prev.filter((f) => f.vehicleIri !== vehicleIri),
          );
          await api.delete(`/favorites/${existing.id}`);
        } else {
          const tempId = -Date.now();
          setFavorites((prev) => [...prev, { id: tempId, vehicleIri }]);

          const response = await api.post("/favorites", {
            user: userIri,
            vehicle: vehicleIri,
          });

          setFavorites((prev) =>
            prev.map((f) =>
              f.id === tempId ? { id: response.data.id, vehicleIri } : f,
            ),
          );
        }
      } catch (e) {
        console.error("Error actualizando favorito", e);
        try {
          const response = await api.get("/favorites", {
            params: { user: userIri, itemsPerPage: 200 },
          });
          const members = response.data.member ?? [];
          setFavorites(
            members.map((f: { id: number; vehicle: { "@id": string } }) => ({
              id: f.id,
              vehicleIri: f.vehicle["@id"],
            })),
          );
        } catch {
          setFavorites([]);
        }
      }
    },
    [favorites, isAuthenticated, userIri],
  );

  return (
    <FavoriteContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, loading }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};