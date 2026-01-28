import { createContext } from "react";

import { useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { User, JWTPayload, AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

// Función auxiliar
const decodeTokenIfValid = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return {
      email: decoded.username,
      roles: decoded.roles,
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && decodeTokenIfValid(storedToken)) {
      return storedToken;
    }
    if (storedToken) localStorage.removeItem("token");
    return null;
  });

  // 2. ESTADO DEL USUARIO
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? decodeTokenIfValid(storedToken) : null;
  });

  // 3. FUNCIONES
  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeTokenIfValid(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  let isAuthenticated = false;

  if (user) {
    isAuthenticated = true;
  }

  const isAdmin =
    user?.roles.includes("ROLE_ADMIN") ||
    user?.roles.includes("ROLE_SALES") ||
    false;

  const value = { user, token, isAuthenticated, isAdmin, login, logout };

  return <AuthContext value={value}>{children}</AuthContext>;
};

export default AuthContext;
