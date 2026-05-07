import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Conversation } from "../../types/reservation";
import type { Message } from "../../types/message";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../hooks/useChatNotification", () => ({
  useChatNotification: vi.fn(),
}));

vi.mock("../../services/conversationService", () => ({
  getConversation: vi.fn(),
  getConversations: vi.fn(),
  markConversationAsRead: vi.fn(),
  sendMessage: vi.fn(),
  updateVehicleStatus: vi.fn(),
}));

vi.mock("../../services/reservationService", () => ({
  updateReservationStatus: vi.fn(),
}));

import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useChatNotification } from "../../hooks/useChatNotification";
import {
  getConversation,
  getConversations,
  markConversationAsRead,
} from "../../services/conversationService";

const makeMessage = (id: number): Message => ({
  id,
  content: `Mensaje ${id}`,
  createdAt: `2026-05-07T10:0${id}:00+02:00`,
  isAdmin: false,
});

const selectedChat = {
  id: 1,
  "@id": "/api/conversations/1",
  contactName: "Cliente",
  contactEmail: "cliente@example.com",
  contactPhone: "600000000",
  updatedAt: "2026-05-07T10:00:00+02:00",
  status: "READ",
  messages: [],
} as Conversation;

describe("useChat autoscroll", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        "@id": "/api/users/1",
        email: "cliente@example.com",
        roles: ["ROLE_USER"],
        name: "Cliente",
      },
      isAuthenticated: true,
      isAdmin: false,
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.mocked(useChatNotification).mockReturnValue({
      unreadCount: 0,
      refreshUnreadCount: vi.fn(),
    });

    vi.mocked(getConversations).mockResolvedValue({
      data: { "hydra:member": [] },
    } as never);
    vi.mocked(markConversationAsRead).mockResolvedValue({} as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not scroll to bottom again when polling returns the same messages", async () => {
    const messages = [makeMessage(1)];
    vi.mocked(getConversation).mockResolvedValue({
      data: { messages },
    } as never);

    const { result } = renderHook(() => useChat());
    const scrollTo = vi.fn();

    await act(async () => {
      result.current.messagesContainerRef.current = {
        clientHeight: 400,
        scrollHeight: 1000,
        scrollTop: 600,
        scrollTo,
      } as unknown as HTMLDivElement;
      result.current.handleSelectChat(selectedChat);
    });

    await waitFor(() => expect(result.current.selectedChat?.id).toBe(1));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("keeps the current position when new messages arrive while reading older messages", async () => {
    vi.mocked(getConversation)
      .mockResolvedValueOnce({ data: { messages: [makeMessage(1)] } } as never)
      .mockResolvedValueOnce({
        data: { messages: [makeMessage(1), makeMessage(2)] },
      } as never);

    const { result } = renderHook(() => useChat());
    const scrollTo = vi.fn();
    const container = {
      clientHeight: 400,
      scrollHeight: 1000,
      scrollTop: 600,
      scrollTo,
    } as unknown as HTMLDivElement;

    await act(async () => {
      result.current.messagesContainerRef.current = container;
      result.current.handleSelectChat(selectedChat);
    });

    await waitFor(() => expect(result.current.selectedChat?.id).toBe(1));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));

    act(() => {
      container.scrollTop = 200;
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });
});
