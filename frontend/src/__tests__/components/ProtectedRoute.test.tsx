import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../../helpers/ProtectedRoute";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../hooks/useAuth";

const baseAuthValue = {
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

const renderWithRouter = (initialPath = "/admin") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <div>Contenido Admin</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route path="/" element={<div>Página de Inicio</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /login when user is not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });

    renderWithRouter("/admin");

    expect(screen.getByText("Página de Login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido Admin")).not.toBeInTheDocument();
  });

  it("redirects to / when user is authenticated but not admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: { id: 1, "@id": "/api/users/1", email: "user@example.com", roles: ["ROLE_USER"] },
      isAuthenticated: true,
      isAdmin: false,
    });

    renderWithRouter("/admin");

    expect(screen.getByText("Página de Inicio")).toBeInTheDocument();
    expect(screen.queryByText("Contenido Admin")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated and is admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: { id: 2, "@id": "/api/users/2", email: "admin@example.com", roles: ["ROLE_ADMIN"] },
      isAuthenticated: true,
      isAdmin: true,
    });

    renderWithRouter("/admin");

    expect(screen.getByText("Contenido Admin")).toBeInTheDocument();
  });

  it("renders children when user has ROLE_SALES", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: { id: 3, "@id": "/api/users/3", email: "sales@example.com", roles: ["ROLE_SALES"] },
      isAuthenticated: true,
      isAdmin: true,
    });

    renderWithRouter("/admin");

    expect(screen.getByText("Contenido Admin")).toBeInTheDocument();
  });

  it("does not render login page when admin is authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: { id: 2, "@id": "/api/users/2", email: "admin@example.com", roles: ["ROLE_ADMIN"] },
      isAuthenticated: true,
      isAdmin: true,
    });

    renderWithRouter("/admin");

    expect(screen.queryByText("Página de Login")).not.toBeInTheDocument();
  });
});
