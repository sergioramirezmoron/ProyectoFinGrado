export interface JWTPayload {
  username: string;
  roles: string[];
  exp: number;
  iat: number;
  id?: number;
  name?: string;
  phone?: string;
}

export interface User {
  id?: number;          
  "@id"?: string;       
  email: string;
  roles: string[];
  name?: string;        
  surname?: string;        
  phone?: string;
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
