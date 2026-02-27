import api from "../api/axios";

export const getBrands = () => api.get("/brands");

export const createBrand = (name: string) => api.post("/brands", { name });

export const updateBrand = (id: number, name: string) =>
  api.patch(
    `/brands/${id}`,
    { name },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );

export const deleteBrand = (id: number) => api.delete(`/brands/${id}`);
