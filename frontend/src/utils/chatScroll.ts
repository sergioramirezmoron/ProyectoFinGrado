import type { Message } from "../types/message";

export const CHAT_BOTTOM_THRESHOLD_PX = 80;

type ScrollMetrics = Pick<
  HTMLElement,
  "clientHeight" | "scrollHeight" | "scrollTop"
>;

export const isNearChatBottom = (
  element: ScrollMetrics,
  threshold = CHAT_BOTTOM_THRESHOLD_PX,
): boolean =>
  element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;

export const areChatMessagesEqual = (
  currentMessages: Message[],
  nextMessages: Message[],
): boolean => {
  if (currentMessages.length !== nextMessages.length) {
    return false;
  }

  return currentMessages.every((message, index) => {
    const nextMessage = nextMessages[index];
    return (
      message.id === nextMessage.id &&
      message.content === nextMessage.content &&
      message.createdAt === nextMessage.createdAt &&
      message.isAdmin === nextMessage.isAdmin
    );
  });
};
