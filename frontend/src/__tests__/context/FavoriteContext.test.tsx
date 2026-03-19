import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { useContext } from "react";
import { FavoriteContext, FavoriteProvider } from "../../context/FavoriteContext";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const mockAuthUser = {
  user: {
    id: 1,
    "@id": "/api/users/1",
    email: "test@example.com",
    roles: ["ROLE_USER"],
  },
  isAuthenticated: true,
  isAdmin: false,
  token: "fake-token",
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

const ContextConsumer = () => {
  const ctx = useContext(FavoriteContext);
  if (!ctx) return <div>no-context</div>;
  return (
    <div>
      <span data-testid="count">{ctx.favorites.length}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="fav-1">{String(ctx.isFavorite("/api/vehicles/1"))}</span>
      <span data-testid="fav-2">{String(ctx.isFavorite("/api/vehicles/2"))}</span>
    </div>
  );
};

describe("FavoriteContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children (provider works)", () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    render(
      <FavoriteProvider>
        <div>child content</div>
      </FavoriteProvider>
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("starts with empty favorites and loading=true then resolves", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    render(
      <FavoriteProvider>
        <ContextConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("loads favorites from API for authenticated user", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        member: [
          { id: 10, vehicle: { "@id": "/api/vehicles/1" } },
          { id: 11, vehicle: { "@id": "/api/vehicles/2" } },
        ],
      },
    });

    render(
      <FavoriteProvider>
        <ContextConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("2");
    });
  });

  it("isFavorite returns true for a favorited vehicle IRI", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        member: [{ id: 10, vehicle: { "@id": "/api/vehicles/1" } }],
      },
    });

    render(
      <FavoriteProvider>
        <ContextConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("fav-1").textContent).toBe("true");
    });
    expect(screen.getByTestId("fav-2").textContent).toBe("false");
  });

  it("does not fetch favorites when user is not authenticated", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthUser,
      isAuthenticated: false,
      user: null,
    });

    render(
      <FavoriteProvider>
        <ContextConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(api.get).not.toHaveBeenCalled();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("calls GET /favorites with user IRI and itemsPerPage=200", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    render(
      <FavoriteProvider>
        <ContextConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/favorites", {
        params: { user: "/api/users/1", itemsPerPage: 200 },
      });
    });
  });

  it("handles API errors gracefully (favorites remains empty)", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockRejectedValueOnce(new Error("Network error"));

    render(
      <FavoriteProvider>
        <ContextConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("optimistically removes a favorite on toggleFavorite (remove)", async () => {
    vi.mocked(useAuth).mockReturnValue(mockAuthUser);
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { member: [{ id: 10, vehicle: { "@id": "/api/vehicles/1" } }] },
    });
    vi.mocked(api.delete).mockResolvedValueOnce({ data: null });

    const ToggleConsumer = () => {
      const ctx = useContext(FavoriteContext);
      if (!ctx) return null;
      return (
        <div>
          <span data-testid="fav-1">{String(ctx.isFavorite("/api/vehicles/1"))}</span>
          <button
            data-testid="toggle"
            onClick={(e) => ctx.toggleFavorite("/api/vehicles/1", e)}
          >
            toggle
          </button>
        </div>
      );
    };

    render(
      <FavoriteProvider>
        <ToggleConsumer />
      </FavoriteProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("fav-1").textContent).toBe("true");
    });

    await act(async () => {
      screen.getByTestId("toggle").click();
    });

    expect(screen.getByTestId("fav-1").textContent).toBe("false");
    expect(api.delete).toHaveBeenCalledWith("/favorites/10");
  });
});
