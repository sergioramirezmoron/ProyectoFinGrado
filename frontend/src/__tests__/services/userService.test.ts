import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUsers,
  updateUserRoles,
  updateUserProfile,
} from "../../services/userService";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("userService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getUsers", () => {
    it("calls GET /users", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });
      await getUsers();
      expect(api.get).toHaveBeenCalledWith("/users?pagination=false");
    });
  });

  describe("updateUserRoles", () => {
    it("calls PATCH /users/:id with roles array and merge-patch+json header", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateUserRoles(3, ["ROLE_USER", "ROLE_SALES"]);
      expect(api.patch).toHaveBeenCalledWith(
        "/users/3/roles",
        { roles: ["ROLE_USER", "ROLE_SALES"] },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
    });

    it("works with a single role", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateUserRoles(1, ["ROLE_ADMIN"]);
      expect(api.patch).toHaveBeenCalledWith(
        "/users/1/roles",
        { roles: ["ROLE_ADMIN"] },
        expect.anything()
      );
    });
  });

  describe("updateUserProfile", () => {
    it("calls PATCH /users/:id with the given field and value", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateUserProfile(3, "name", "María");
      expect(api.patch).toHaveBeenCalledWith(
        "/users/3",
        { name: "María" },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
    });

    it("works with phone field", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateUserProfile(5, "phone", "666999888");
      expect(api.patch).toHaveBeenCalledWith(
        "/users/5",
        { phone: "666999888" },
        expect.anything()
      );
    });

    it("uses dynamic field key (computed property name)", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateUserProfile(10, "surname", "García");
      const call = vi.mocked(api.patch).mock.calls[0];
      expect(call[1]).toEqual({ surname: "García" });
    });
  });
});
