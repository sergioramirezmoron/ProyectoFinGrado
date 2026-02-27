import api from "../api/axios";

export const getUsers = () => api.get("/users");

export const updateUserRoles = (id: number, roles: string[]) =>
  api.patch(
    `/users/${id}`,
    { roles },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );
