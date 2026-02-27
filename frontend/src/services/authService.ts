import api from "../api/axios";
import type { LoginResponse, RegisterData } from "../types/auth";

export const loginUser = (email: string, password: string) =>
  api.post<LoginResponse>("/login_check", { email, password });

export const registerUser = (data: RegisterData) =>
  api.post("/users", data);