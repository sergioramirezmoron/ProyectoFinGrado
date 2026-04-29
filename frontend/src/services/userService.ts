import api from "../api/axios";

export const getUsers = () => api.get("/users?pagination=false");

export const updateUserRoles = (id: number, roles: string[]) =>
  api.patch(
    `/users/${id}/roles`,
    { roles },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );

export const updateUserProfile = (id: number, field: string, value: string) =>
  api.patch(
    `/users/${id}`,
    { [field]: value },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );
