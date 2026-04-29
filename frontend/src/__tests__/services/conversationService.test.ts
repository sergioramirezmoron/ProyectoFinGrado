import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getConversations,
  getConversation,
  markConversationAsRead,
  sendMessage,
  updateVehicleStatus,
  createConversation,
  sendPublicMessage,
} from "../../services/conversationService";
import type { ConversationPayloadInterface } from "../../types/message";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("getConversations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /conversations for admin (no email filter)", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    await getConversations(true);

    expect(api.get).toHaveBeenCalledWith("/conversations?itemsPerPage=500");
  });

  it("calls GET /conversations with contactEmail filter for regular user", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    await getConversations(false, "user@example.com");

    expect(api.get).toHaveBeenCalledWith(
      "/conversations?contactEmail=user@example.com"
    );
  });

  it("calls GET /conversations without email when user has no email", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { member: [] } });

    await getConversations(false, undefined);

    expect(api.get).toHaveBeenCalledWith("/conversations");
  });
});

describe("getConversation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /conversations/:id", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await getConversation(12);

    expect(api.get).toHaveBeenCalledWith("/conversations/12");
  });

  it("uses the correct ID in the URL", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await getConversation(999);

    expect(api.get).toHaveBeenCalledWith("/conversations/999");
  });
});

describe("markConversationAsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PATCH /conversations/:id with status=READ", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await markConversationAsRead(12);

    expect(api.patch).toHaveBeenCalledWith(
      "/conversations/12",
      { status: "READ" },
      { headers: { "Content-Type": "application/merge-patch+json" } }
    );
  });
});

describe("sendMessage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /messages with content and conversation IRI", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 47 } });

    await sendMessage("Hola!", false, "/api/conversations/12");

    expect(api.post).toHaveBeenCalledWith("/messages", {
      content: "Hola!",
      conversation: "/api/conversations/12",
    });
  });

  it("does not send client-side admin flags", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 48 } });

    await sendMessage("Respuesta del admin", true, "/api/conversations/12");

    expect(api.post).toHaveBeenCalledWith("/messages", {
      content: "Respuesta del admin",
      conversation: "/api/conversations/12",
    });
  });
});

describe("updateVehicleStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PATCH /vehicles/:id with new status and merge-patch header", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await updateVehicleStatus(425, "SOLD");

    expect(api.patch).toHaveBeenCalledWith(
      "/vehicles/425",
      { status: "SOLD" },
      { headers: { "Content-Type": "application/merge-patch+json" } }
    );
  });

  it("works with string vehicleId", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await updateVehicleStatus("100", "AVAILABLE");

    expect(api.patch).toHaveBeenCalledWith(
      "/vehicles/100",
      { status: "AVAILABLE" },
      expect.anything()
    );
  });
});

describe("createConversation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /conversations with the payload", async () => {
    const payload: ConversationPayloadInterface = {
      contactName: "Juan",
      contactEmail: "juan@example.com",
      contactPhone: "600000000",
      vehicle: "/api/vehicles/1",
    };
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 12 } });

    await createConversation(payload);

    expect(api.post).toHaveBeenCalledWith("/conversations", payload);
  });
});

describe("sendPublicMessage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /messages without client-side admin flag", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 50 } });

    await sendPublicMessage("Mensaje público", "/api/conversations/5");

    expect(api.post).toHaveBeenCalledWith("/messages", {
      content: "Mensaje público",
      conversation: "/api/conversations/5",
    });
  });
});
