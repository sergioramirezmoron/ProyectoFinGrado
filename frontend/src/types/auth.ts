// Lo que viene DENTRO del token JWT (Payload)
export interface JWTPayload {
  username: string;
  roles: string[];
  exp: number;
  iat: number;
  // Campos opcionales que podrían venir en el token
  id?: number;
  name?: string;
  phone?: string;
}

// Define cómo es tu objeto Usuario en la app
export interface User {
  id?: number;          // <--- AÑADIDO
  "@id"?: string;       // <--- AÑADIDO (Para API Platform)
  email: string;
  roles: string[];
  name?: string;        // <--- AÑADIDO
  phone?: string;       // <--- AÑADIDO
}

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
