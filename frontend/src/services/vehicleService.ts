import api from "../api/axios";
import type { HydraResponse, Vehicle } from "../types/vehicle";

export const loadFormOptions = () =>
  Promise.all([
    api.get("/brands"),
    api.get("/fuels"),
    api.get("/transmissions"),
    api.get("/enviromental_badges"),
    api.get("/provinces"),
    api.get("/body_types"),
    api.get("/models"),
    api.get("/colors"),
  ]);

export const getVehicle = (id: string) => api.get(`/vehicles/${id}`);

export const createVehicle = (payload: object) =>
  api.post("/vehicles", payload);

export const updateVehicle = (id: string, payload: object) =>
  api.patch(`/vehicles/${id}`, payload, {
    headers: { "Content-Type": "application/merge-patch+json" },
  });

export const uploadVehicleImage = (file: File, isMain: boolean) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("main", isMain ? "1" : "0");
  return api.post("/vehicle_images", formData);
};

export const getVehicles = (page: number, searchTerm?: string) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("status[nest]", "DELETED");
  if (searchTerm) params.append("brand.name", searchTerm);
  return api.get(`/vehicles?${params.toString()}`);
};

export const archiveVehicle = (id: number) =>
  api.patch(
    `/vehicles/${id}`,
    { status: "DELETED" },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );

export const getCatalogOptions = () =>
  Promise.all([
    api.get("/brands"),
    api.get("/fuels"),
    api.get("/transmissions"),
    api.get("/provinces"),
    api.get("/colors"),
    api.get("/body_types"),
  ]);

export const getAllVehicles = async (): Promise<Vehicle[]> => {
  const PAGE_SIZE = 30;
  let currentPage = 1;
  let collected: Vehicle[] = [];
  let totalItems = Infinity;

  while (collected.length < totalItems) {
    const response = await api.get(
      `/vehicles?page=${currentPage}&itemsPerPage=${PAGE_SIZE}`,
    );
    const data = response.data;
    const batch: Vehicle[] = data.member ?? (Array.isArray(data) ? data : []);

    if (currentPage === 1) totalItems = data.totalItems ?? batch.length;

    collected = [...collected, ...batch];
    if (batch.length === 0 || collected.length >= totalItems) break;
    currentPage++;
  }

  return collected;
};

export const getFeaturedVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<HydraResponse<Vehicle>>("/vehicles", {
    params: { type: "SALE", status: "AVAILABLE" },
  });
  return (response.data.member || [])
    .filter((v) => v.type === "SALE" && v.status === "AVAILABLE")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
};

export const getVehicleDetail = (id: string) =>
  api.get<Vehicle>(`/vehicles/${id}`);
