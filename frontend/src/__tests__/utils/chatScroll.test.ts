import { describe, expect, it } from "vitest";
import { areChatMessagesEqual, isNearChatBottom } from "../../utils/chatScroll";
import type { Message } from "../../types/message";

const makeMessage = (id: number, content = "Hola"): Message => ({
  id,
  content,
  createdAt: "2026-05-07T10:00:00+02:00",
  isAdmin: false,
});

describe("isNearChatBottom", () => {
  it("returns true when the scroll is within the bottom threshold", () => {
    expect(
      isNearChatBottom({
        scrollHeight: 1000,
        scrollTop: 540,
        clientHeight: 400,
      } as HTMLElement),
    ).toBe(true);
  });

  it("returns false when the user is reading older messages", () => {
    expect(
      isNearChatBottom({
        scrollHeight: 1000,
        scrollTop: 300,
        clientHeight: 400,
      } as HTMLElement),
    ).toBe(false);
  });
});

describe("areChatMessagesEqual", () => {
  it("returns true for equivalent message lists", () => {
    expect(areChatMessagesEqual([makeMessage(1)], [makeMessage(1)])).toBe(true);
  });

  it("returns false when a new message arrives", () => {
    expect(
      areChatMessagesEqual([makeMessage(1)], [makeMessage(1), makeMessage(2)]),
    ).toBe(false);
  });

  it("returns false when message content changes", () => {
    expect(
      areChatMessagesEqual([makeMessage(1)], [makeMessage(1, "Actualizado")]),
    ).toBe(false);
  });
});
