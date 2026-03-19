import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFavorite } from "../../hooks/useFavorite";
import { FavoriteContext } from "../../context/FavoriteContext";
import type { ReactNode } from "react";

const makeMockContext = (overrides = {}) => ({
  favorites: [],
  isFavorite: vi.fn().mockReturnValue(false),
  toggleFavorite: vi.fn(),
  loading: false,
  ...overrides,
});

describe("useFavorite", () => {
  it("throws when used outside FavoriteProvider", () => {
    expect(() => {
      renderHook(() => useFavorite("/api/vehicles/1"));
    }).toThrow("useFavorite debe usarse dentro de <FavoriteProvider>");
  });

  it("returns isFavorite=false when vehicle is not in favorites", () => {
    const mockCtx = makeMockContext({
      isFavorite: vi.fn().mockReturnValue(false),
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FavoriteContext.Provider value={mockCtx}>
        {children}
      </FavoriteContext.Provider>
    );

    const { result } = renderHook(() => useFavorite("/api/vehicles/1"), {
      wrapper,
    });

    expect(result.current.isFavorite).toBe(false);
    expect(mockCtx.isFavorite).toHaveBeenCalledWith("/api/vehicles/1");
  });

  it("returns isFavorite=true when vehicle is in favorites", () => {
    const mockCtx = makeMockContext({
      isFavorite: vi.fn().mockReturnValue(true),
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FavoriteContext.Provider value={mockCtx}>
        {children}
      </FavoriteContext.Provider>
    );

    const { result } = renderHook(() => useFavorite("/api/vehicles/99"), {
      wrapper,
    });

    expect(result.current.isFavorite).toBe(true);
  });

  it("returns the loading state from context", () => {
    const mockCtx = makeMockContext({ loading: true });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FavoriteContext.Provider value={mockCtx}>
        {children}
      </FavoriteContext.Provider>
    );

    const { result } = renderHook(() => useFavorite("/api/vehicles/1"), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);
  });

  it("wraps toggleFavorite with the vehicleIri", async () => {
    const mockToggle = vi.fn().mockResolvedValue(undefined);
    const mockCtx = makeMockContext({ toggleFavorite: mockToggle });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FavoriteContext.Provider value={mockCtx}>
        {children}
      </FavoriteContext.Provider>
    );

    const { result } = renderHook(() => useFavorite("/api/vehicles/42"), {
      wrapper,
    });

    const fakeEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.MouseEvent;
    result.current.toggleFavorite(fakeEvent);

    expect(mockToggle).toHaveBeenCalledWith("/api/vehicles/42", fakeEvent);
  });

  it("isFavorite is called with the correct vehicleIri on each render", () => {
    const isFavoriteFn = vi.fn().mockReturnValue(false);
    const mockCtx = makeMockContext({ isFavorite: isFavoriteFn });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FavoriteContext.Provider value={mockCtx}>
        {children}
      </FavoriteContext.Provider>
    );

    renderHook(() => useFavorite("/api/vehicles/123"), { wrapper });

    expect(isFavoriteFn).toHaveBeenCalledWith("/api/vehicles/123");
  });
});
