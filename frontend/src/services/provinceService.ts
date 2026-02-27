import api from "../api/axios";

export const getProvinces = () => api.get("/provinces");

export const createProvince = (name: string) =>
  api.post("/provinces", { name });

export const updateProvince = (id: number, name: string) =>
  api.patch(`/provinces/${id}`, { name }, {
    headers: { "Content-Type": "application/merge-patch+json" },
  });

export const deleteProvince = (id: number) => api.delete(`/provinces/${id}`);