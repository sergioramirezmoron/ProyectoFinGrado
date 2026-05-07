import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useChatNotification } from "./useChatNotification";
import {
  getConversation,
  getConversations,
  markConversationAsRead,
  sendMessage,
  updateVehicleStatus,
} from "../services/conversationService";
import { updateReservationStatus } from "../services/reservationService";
import { isReservationExpired } from "../constants/reservationStatus";
import type { Message, ApiResource } from "../types/message";
import type { Conversation } from "../types/reservation";
import { getApiErrorMessage } from "../utils/apiErrors";
import { areChatMessagesEqual, isNearChatBottom } from "../utils/chatScroll";
import { buildImageUrl } from "../utils/vehicleImages";

/** Extract a numeric or string ID from a Hydra API resource object. */
export const getUniqueId = (
  obj: ApiResource | null | undefined,
): string | number | null => {
  if (!obj) return null;
  if (obj.id) return obj.id;
  if (obj["@id"]) {
    const parts = obj["@id"].split("/");
    return parts[parts.length - 1];
  }
  return null;
};

export const useChat = () => {
  const { user } = useAuth();
  const { refreshUnreadCount } = useChatNotification();
  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SALES") ||
    false;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"SALE" | "RENT">("RENT");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    status: "CONFIRMED" | "REJECTED";
  } | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollMessagesRef = useRef(false);
  const selectedChatIdRef = useRef<number | null>(null);

  const fetchConversations = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const response = await getConversations(isAdmin, user?.email);
      setConversations(response.data.member ?? response.data["hydra:member"] ?? []);
    } catch (error) {
      console.error("Error cargando chats", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [isAdmin, user?.email]);

  const fetchMessages = useCallback(async (
    id: number,
    options: { forceScroll?: boolean } = {},
  ) => {
    try {
      const response = await getConversation(id);
      const nextMessages = response.data.messages || [];
      const container = messagesContainerRef.current;
      const shouldScroll =
        options.forceScroll || (container ? isNearChatBottom(container) : true);

      setMessages((currentMessages) => {
        if (areChatMessagesEqual(currentMessages, nextMessages)) {
          return currentMessages;
        }

        shouldScrollMessagesRef.current = shouldScroll;
        return nextMessages;
      });

      if (isAdmin) {
        const updatedReservation = response.data.reservation;
        setSelectedChat((prev) => {
          if (
            !prev ||
            JSON.stringify(prev.reservation) === JSON.stringify(updatedReservation)
          ) {
            return prev;
          }

          return { ...prev, reservation: updatedReservation };
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [isAdmin]);

  const hasUnreadMessages = useCallback((chat: Conversation) => {
    if (!chat.messages?.length) return false;
    const lastMsg = chat.messages[chat.messages.length - 1];
    const isSenderOther = isAdmin ? !lastMsg.isAdmin : lastMsg.isAdmin;
    return isSenderOther && chat.status !== "READ";
  }, [isAdmin]);

  const markAsRead = useCallback(async (chat: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, status: "READ" } : c)),
    );
    try {
      await markConversationAsRead(chat.id);
      refreshUnreadCount();
    } catch (e) {
      console.error(e);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const interval = setInterval(() => fetchConversations(true), 10000);
      return () => clearInterval(interval);
    }
  }, [fetchConversations, user]);

  useEffect(() => {
    if (selectedChat) {
      const isNewSelectedChat = selectedChatIdRef.current !== selectedChat.id;
      selectedChatIdRef.current = selectedChat.id;

      fetchMessages(selectedChat.id, { forceScroll: isNewSelectedChat });
      if (hasUnreadMessages(selectedChat)) markAsRead(selectedChat);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, hasUnreadMessages, markAsRead, selectedChat]);

  useEffect(() => {
    if (messagesContainerRef.current && shouldScrollMessagesRef.current) {
      shouldScrollMessagesRef.current = false;
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (
    e?: React.FormEvent,
    forcedContent?: string,
  ) => {
    if (e) e.preventDefault();
    const content = forcedContent || newMessage;
    if (!content.trim() || !selectedChat) return;

    setSending(true);
    try {
      const conversationIri =
        selectedChat["@id"] || `/api/conversations/${selectedChat.id}`;
      await sendMessage(content, isAdmin, conversationIri);
      setNewMessage("");
      fetchMessages(selectedChat.id, { forceScroll: true });
      fetchConversations(true);
    } catch (error) {
      setToast({ msg: "Error al enviar el mensaje", type: "error" });
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (activeTab === "RENT") {
      filtered = filtered.filter(
        (c) => c.vehicle?.type === "RENT" || c.reservation,
      );
    } else {
      filtered = filtered.filter(
        (c) => !c.reservation && c.vehicle?.type !== "RENT",
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.contactName && c.contactName.toLowerCase().includes(q)) ||
          (c.vehicle?.model?.name &&
            c.vehicle.model.name.toLowerCase().includes(q)) ||
          (c.vehicle?.brand?.name &&
            c.vehicle.brand.name.toLowerCase().includes(q)),
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [conversations, activeTab, searchQuery]);

  const handleAdminAction_StatusChange = async (newStatus: string) => {
    if (!isAdmin || !selectedChat?.vehicle) return;
    const vehicleId = getUniqueId(selectedChat.vehicle);
    if (!vehicleId) {
      setToast({ msg: "Error: No se encuentra ID del vehículo", type: "error" });
      return;
    }
    setUpdatingStatus(true);
    try {
      await updateVehicleStatus(vehicleId, newStatus);
      setSelectedChat((prev) =>
        prev ? { ...prev, vehicle: { ...prev.vehicle!, status: newStatus } } : null,
      );
      setConversations((prev) =>
        prev.map((c) => {
          const cVehicleId = getUniqueId(c.vehicle);
          if (
            cVehicleId &&
            String(cVehicleId) === String(vehicleId) &&
            c.vehicle
          ) {
            return { ...c, vehicle: { ...c.vehicle, status: newStatus } };
          }
          return c;
        }),
      );
      setToast({ msg: "Estado actualizado", type: "success" });
    } catch (e) {
      setToast({ msg: "Error al actualizar estado", type: "error" });
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAdminAction_Reservation = async () => {
    if (!isAdmin || !selectedChat?.reservation || !confirmAction) return;
    const { status } = confirmAction;
    const reservationId = getUniqueId(selectedChat.reservation);
    setConfirmAction(null);

    if (status === "CONFIRMED" && isReservationExpired(selectedChat.reservation)) {
      setToast({
        msg: "No se puede aceptar una reserva que ya ha finalizado. Rechazala para cerrar la solicitud.",
        type: "error",
      });
      return;
    }

    setUpdatingStatus(true);
    try {
      await updateReservationStatus(Number(reservationId!), status);
      setSelectedChat((prev) =>
        prev
          ? { ...prev, reservation: { ...prev.reservation!, status } }
          : null,
      );
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id && c.reservation
            ? { ...c, reservation: { ...c.reservation, status } }
            : c,
        ),
      );
      const reply =
        status === "CONFIRMED"
          ? "✅ Hemos aceptado tu solicitud. El vehículo está reservado para ti."
          : "❌ Lo siento, no hemos podido aceptar la reserva.";
      await handleSendMessage(undefined, reply);
      setToast({
        msg: `Reserva ${status === "CONFIRMED" ? "aceptada" : "rechazada"}`,
        type: "success",
      });
    } catch (e) {
      setToast({
        msg: getApiErrorMessage(
          e,
          "Error procesando reserva. Es posible que el vehiculo ya este reservado en esta fecha.",
        ),
        type: "error",
      });
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getChatImageUrl = (chat: Conversation): string | null => {
    if (!chat.vehicle?.vehicleImages?.length) return null;
    const main =
      chat.vehicle.vehicleImages.find((img) => img.main) ||
      chat.vehicle.vehicleImages[0];
    return buildImageUrl(main.imageUrl);
  };

  const isChatLocked = selectedChat?.vehicle?.status === "SOLD";

  const unreadSales = conversations.filter(
    (c) => !c.reservation && c.vehicle?.type !== "RENT" && hasUnreadMessages(c),
  ).length;
  const unreadRents = conversations.filter(
    (c) =>
      (c.reservation || c.vehicle?.type === "RENT") && hasUnreadMessages(c),
  ).length;

  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    setIsSidebarOpen(false);
  };

  return {
    conversations,
    selectedChat,
    messages,
    newMessage,
    loading,
    sending,
    searchQuery,
    activeTab,
    isSidebarOpen,
    updatingStatus,
    confirmAction,
    toast,
    messagesContainerRef,
    isAdmin,
    isChatLocked,
    filteredConversations,
    unreadSales,
    unreadRents,
    user,
    setNewMessage,
    setSearchQuery,
    setActiveTab,
    setIsSidebarOpen,
    setConfirmAction,
    setToast,
    handleSelectChat,
    handleSendMessage,
    handleAdminAction_StatusChange,
    handleAdminAction_Reservation,
    getChatImageUrl,
  };
};
