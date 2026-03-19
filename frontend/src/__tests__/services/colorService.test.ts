import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "../../services/colorService";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("colorService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getColors", () => {
    it("calls GET /colors", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });
      await getColors();
      expect(api.get).toHaveBeenCalledWith("/colors");
    });
  });

  describe("createColor", () => {
    it("calls POST /colors with name and hexCode", async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1 } });
      await createColor("Rojo", "#FF0000");
      expect(api.post).toHaveBeenCalledWith("/colors", {
        name: "Rojo",
        hexCode: "#FF0000",
      });
    });

    it("passes hexCode exactly as provided", async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 2 } });
      await createColor("Azul Marino", "#001F5B");
      expect(api.post).toHaveBeenCalledWith("/colors", {
        name: "Azul Marino",
        hexCode: "#001F5B",
      });
    });
  });

  describe("updateColor", () => {
    it("calls PATCH /colors/:id with name, hexCode and merge-patch+json header", async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });
      await updateColor(1, "Rojo Oscuro", "#8B0000");
      expect(api.patch).toHaveBeenCalledWith(
        "/colors/1",
        { name: "Rojo Oscuro", hexCode: "#8B0000" },
        { headers: { "Content-Type": "application/merge-patch+json" } }
      );
    });
  });

  describe("deleteColor", () => {
    it("calls DELETE /colors/:id", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: null });
      await deleteColor(3);
      expect(api.delete).toHaveBeenCalledWith("/colors/3");
    });
  });
});
