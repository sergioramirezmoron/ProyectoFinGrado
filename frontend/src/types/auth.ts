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
  updateUser: (fields: Partial<User>) => void;
}

export interface RegisterData {
  email: string;
  plainPassword: string;
  name: string;
  surname: string;
  phone: string;
  province: string;
}

export interface UserProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export type EditField = "name" | "phone" | null;
