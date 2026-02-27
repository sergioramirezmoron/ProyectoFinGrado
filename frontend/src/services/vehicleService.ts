import api from "../api/axios";

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
