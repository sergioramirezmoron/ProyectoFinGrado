import { useState, useEffect, useRef, useMemo } from "react";
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
import type { Message, ApiResource } from "../types/message";
import type { Conversation } from "../types/reservation";
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

  useEffect(() => {
    if (user) {
      fetchConversations();
      const interval = setInterval(() => fetchConversations(true), 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      if (hasUnreadMessages(selectedChat)) markAsRead(selectedChat);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const fetchConversations = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const email = user?.email || user?.name;
      const response = await getConversations(isAdmin, email);
      setConversations(response.data.member || []);
    } catch (error) {
      console.error("Error cargando chats", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const response = await getConversation(id);
      setMessages(response.data.messages || []);
      if (isAdmin && selectedChat) {
        const updatedReservation = response.data.reservation;
        if (
          JSON.stringify(selectedChat.reservation) !==
          JSON.stringify(updatedReservation)
        ) {
          setSelectedChat((prev) =>
            prev ? { ...prev, reservation: updatedReservation } : null,
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const hasUnreadMessages = (chat: Conversation) => {
    if (!chat.messages?.length) return false;
    const lastMsg = chat.messages[chat.messages.length - 1];
    const isSenderOther = isAdmin ? !lastMsg.isAdmin : lastMsg.isAdmin;
    return isSenderOther && chat.status !== "READ";
  };

  const markAsRead = async (chat: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, status: "READ" } : c)),
    );
    try {
      await markConversationAsRead(chat.id);
      refreshUnreadCount();
    } catch (e) {
      console.error(e);
    }
  };

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
      fetchMessages(selectedChat.id);
      fetchConversations(true);
    } catch (error) {
      if (isAdmin) setToast({ msg: "Error al enviar", type: "error" });
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
        msg: "Error procesando reserva. Es posible que el vehiculo ya esté reservado en esta fecha.",
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
