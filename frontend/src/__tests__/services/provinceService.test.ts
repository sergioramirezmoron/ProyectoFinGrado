import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
} from "../../services/provinceService";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("provinceService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getProvinces", () => {
    it("calls GET /provinces", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });
      await getProvinces();
      expect(api.get).toHaveBeenCalledWith("/provinces");
    });
  });

  describe("createProvince", () => {
    it("calls POST /provinces with name", async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1 } });
      await createProvince("Girona");
      expect(api.post).toHaveBeenCalledWith("/provinces", { name: "Girona" });
    });
  });

  describe("updateProvince", () => {
    it("calls PATCH /provinces/:id with name and merge-patch+json header", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateProvince(8, "Madrid");
      expect(api.patch).toHaveBeenCalledWith(
        "/provinces/8",
        { name: "Madrid" },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
    });
  });

  describe("deleteProvince", () => {
    it("calls DELETE /provinces/:id", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: null });
      await deleteProvince(8);
      expect(api.delete).toHaveBeenCalledWith("/provinces/8");
    });
  });
});
