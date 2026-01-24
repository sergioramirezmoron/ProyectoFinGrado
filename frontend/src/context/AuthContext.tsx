import { createContext } from 'react';
import type { User } from '../types/auth';

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (token: string) => void;
    logout: () => void;
}

// Aquí solo creamos la "caja" vacía
export const AuthContext = createContext<AuthContextType | null>(null);