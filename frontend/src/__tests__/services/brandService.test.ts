import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../services/brandService";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("brandService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getBrands", () => {
    it("calls GET /brands", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });
      await getBrands();
      expect(api.get).toHaveBeenCalledWith("/brands");
    });
  });

  describe("createBrand", () => {
    it("calls POST /brands with name", async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1, name: "Ferrari" } });
      await createBrand("Ferrari");
      expect(api.post).toHaveBeenCalledWith("/brands", { name: "Ferrari" });
    });
  });

  describe("updateBrand", () => {
    it("calls PATCH /brands/:id with name and merge-patch+json header", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateBrand(1, "Ferrari Updated");
      expect(api.patch).toHaveBeenCalledWith(
        "/brands/1",
        { name: "Ferrari Updated" },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
    });

    it("uses correct ID in URL", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateBrand(42, "NewName");
      expect(api.patch).toHaveBeenCalledWith(
        "/brands/42",
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe("deleteBrand", () => {
    it("calls DELETE /brands/:id", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: null });
      await deleteBrand(1);
      expect(api.delete).toHaveBeenCalledWith("/brands/1");
    });

    it("uses correct ID in URL", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: null });
      await deleteBrand(99);
      expect(api.delete).toHaveBeenCalledWith("/brands/99");
    });
  });
});
