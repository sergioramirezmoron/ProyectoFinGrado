// Lo que viene DENTRO del token JWT (Payload)
export interface JWTPayload {
    iat: number; // Fecha creación
    exp: number; // Fecha expiración
    roles: string[];
    username: string; // Normalmente el email
}

// Nuestro usuario en la aplicación
export interface User {
    email: string;
    roles: string[];
}

// La respuesta del Login del Backend
export interface LoginResponse {
    token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}