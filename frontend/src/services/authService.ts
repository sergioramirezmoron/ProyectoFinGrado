import api from "../api/axios";
import type { LoginResponse, RegisterData } from "../types/auth";
import type { ProvincesResponse } from "../types/provinces";

export const loginUser = (email: string, password: string) =>
  api.post<LoginResponse>("/login_check", { email, password });

export const registerUser = (data: RegisterData) =>
  api.post("/users", data);

export const getProvinces = () =>
  api.get<ProvincesResponse>("/provinces");