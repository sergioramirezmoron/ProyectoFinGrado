import api from "../api/axios";

export const getColors = () => api.get("/colors");

export const createColor = (name: string, hexCode: string) =>
  api.post("/colors", { name, hexCode });

export const updateColor = (id: number, name: string, hexCode: string) =>
  api.patch(
    `/colors/${id}`,
    { name, hexCode },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );

export const deleteColor = (id: number) => api.delete(`/colors/${id}`);
