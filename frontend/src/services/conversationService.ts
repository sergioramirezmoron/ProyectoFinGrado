import api from "../api/axios";
import type { ConversationPayloadInterface } from "../types/message";

export const getConversations = (isAdmin: boolean, userEmail?: string) => {
  let url = isAdmin ? "/conversations?itemsPerPage=500" : "/conversations";
  if (!isAdmin && userEmail) url += `?contactEmail=${userEmail}`;
  return api.get(url);
};

export const getConversation = (id: number) => api.get(`/conversations/${id}`);

export const markConversationAsRead = (id: number) =>
  api.patch(
    `/conversations/${id}`,
    { status: "READ" },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );

export const sendMessage = (
  content: string,
  _isAdmin: boolean,
  conversationIri: string,
) => api.post("/messages", { content, conversation: conversationIri });

export const updateVehicleStatus = (
  vehicleId: string | number,
  status: string,
) =>
  api.patch(
    `/vehicles/${vehicleId}`,
    { status },
    {
      headers: { "Content-Type": "application/merge-patch+json" },
    },
  );

export const createConversation = (payload: ConversationPayloadInterface) =>
  api.post("/conversations", payload);

export const sendPublicMessage = (content: string, conversationIri: string) =>
  api.post("/messages", {
    content,
    conversation: conversationIri,
  });
