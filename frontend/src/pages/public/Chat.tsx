import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Send,
  User,
  Car,
  MessageSquare,
  CheckCheck,
  Loader2,
  CalendarClock,
  CheckCircle2,
  XCircle,
  BadgeEuro,
  CalendarCheck,
  Lock,
  Tag,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useChatNotification } from "../../hooks/useChatNotification";
import Toast from "../../helpers/Toast";
import ConfirmModal from "../../helpers/ConfirmModal";

import type { ApiResource, Message } from "../../types/message";
import type { Conversation } from "../../types/reservation";
import {
  getConversation,
  getConversations,
  markConversationAsRead,
  sendMessage,
  updateReservationStatus,
  updateVehicleStatus,
} from "../../services/conversationService";

const Chat = () => {
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
      if (hasUnreadMessages(selectedChat)) {
        markAsRead(selectedChat);
      }
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

  const getUniqueId = (
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
    if (!chat.messages || chat.messages.length === 0) return false;
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
      setToast({
        msg: "Error: No se encuentra ID del vehículo",
        type: "error",
      });
      return;
    }
    setUpdatingStatus(true);
    try {
      await updateVehicleStatus(vehicleId, newStatus);
      setSelectedChat((prev) =>
        prev
          ? { ...prev, vehicle: { ...prev.vehicle!, status: newStatus } }
          : null,
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
      await updateReservationStatus(reservationId!, status);
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

  const getImageUrl = (chat: Conversation) => {
    if (chat.vehicle?.vehicleImages?.length) {
      const main =
        chat.vehicle.vehicleImages.find((img) => img.main) ||
        chat.vehicle.vehicleImages[0];
      return `${import.meta.env.VITE_BACKEND_URL}${main.imageUrl}`;
    }
    return null;
  };

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const formatPrice = (a: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(a);

  const getStatusColor = (s: string) => {
    switch (s) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "RESERVED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "SOLD":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
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

  if (!user)
    return (
      <div className="p-10 text-center text-sm sm:text-base">
        Cargando sesión...
      </div>
    );

  return (
    <div
      className={`bg-white shadow-sm flex overflow-hidden relative ${
        isAdmin
          ? "h-[calc(100vh-100px)] rounded-none sm:rounded-2xl border-0 sm:border sm:border-gray-200"
          : "h-[calc(100vh-80px)] rounded-none sm:rounded-xl border-0 sm:border-x sm:border-gray-200"
      }`}
    >
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {isAdmin && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title={
            confirmAction?.status === "CONFIRMED"
              ? "Aceptar Reserva"
              : "Rechazar Reserva"
          }
          message={
            confirmAction?.status === "CONFIRMED"
              ? "Bloqueará fechas y notificará."
              : "Liberará fechas y notificará."
          }
          confirmColor={confirmAction?.status === "CONFIRMED" ? "green" : "red"}
          onConfirm={handleAdminAction_Reservation}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Overlay para cerrar sidebar en móvil */}
      {isSidebarOpen && selectedChat && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar de conversaciones */}
      <div
        className={`
          ${selectedChat ? "absolute lg:static" : "static"}
          ${isSidebarOpen && selectedChat ? "left-0" : selectedChat ? "-left-full lg:left-0" : "left-0"}
          top-0 bottom-0
          w-full sm:w-96 lg:w-1/3
          border-r border-gray-200 
          flex flex-col 
          bg-white
          transition-all duration-300 ease-in-out 
          z-40
        `}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white shrink-0">
          <button
            onClick={() => setActiveTab("RENT")}
            className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold flex justify-center items-center gap-1.5 sm:gap-2 hover:cursor-pointer ${activeTab === "RENT" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500"}`}
          >
            <CalendarCheck size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Reservas</span>
            {unreadRents > 0 && (
              <span className="bg-red-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 rounded-full">
                {unreadRents}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("SALE")}
            className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold flex justify-center items-center gap-1.5 sm:gap-2 hover:cursor-pointer ${activeTab === "SALE" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500"}`}
          >
            <BadgeEuro size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="whitespace-nowrap">
              {isAdmin ? "Ventas" : "Compra"}
            </span>
            {unreadSales > 0 && (
              <span className="bg-red-500 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 rounded-full">
                {unreadSales}
              </span>
            )}
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white shrink-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-2 sm:top-2.5 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
          {loading ? (
            <div className="p-6 sm:p-8 text-center flex flex-col items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-xs sm:text-sm">Cargando...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">
              No hay conversaciones.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isUnread = hasUnreadMessages(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full text-left p-3 sm:p-4 border-b border-gray-100 hover:bg-white transition-all flex gap-2 sm:gap-3 relative hover:cursor-pointer hover:shadow-sm ${selectedChat?.id === chat.id ? "bg-white border-l-4 border-l-blue-600 shadow-sm" : "border-l-4 border-l-transparent"}`}
                >
                  {isUnread && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-pulse z-10"></div>
                  )}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                    {getImageUrl(chat) ? (
                      <img
                        src={getImageUrl(chat)!}
                        className={`w-full h-full object-cover ${chat.vehicle?.status === "SOLD" ? "grayscale opacity-70" : ""}`}
                        alt="car"
                      />
                    ) : (
                      <Car className="w-full h-full p-2 sm:p-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate flex-1 ${isUnread ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {isAdmin
                          ? chat.contactName
                          : `${chat.vehicle?.brand?.name} ${chat.vehicle?.model?.name}`}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 shrink-0">
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] sm:text-xs truncate ${isUnread ? "font-bold text-blue-600" : "text-gray-500"}`}
                    >
                      {isAdmin
                        ? `${chat.vehicle?.brand?.name} ${chat.vehicle?.model?.name}`
                        : isUnread
                          ? "Tienes nuevos mensajes"
                          : "Ver conversación"}
                    </p>
                    {chat.vehicle?.status !== "AVAILABLE" && (
                      <span
                        className={`inline-block text-[8px] sm:text-[9px] px-1 sm:px-1.5 rounded mt-1 font-bold ${chat.vehicle?.status === "SOLD" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {chat.vehicle?.status === "SOLD"
                          ? "VENDIDO"
                          : "RESERVADO"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div
        className={`flex-1 flex flex-col bg-[#eef1f6] min-w-0 ${selectedChat ? "" : "hidden lg:flex"}`}
      >
        {selectedChat ? (
          <>
            {/* Header del chat */}
            <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm min-h-16 sm:h-20 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Botón hamburguesa integrado */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden shrink-0 text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>

                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg text-white shadow-sm shrink-0 ${isAdmin ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-slate-700"}`}
                >
                  {isAdmin ? (
                    selectedChat.contactName.charAt(0).toUpperCase()
                  ) : (
                    <Car size={16} className="sm:w-5 sm:h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                    {isAdmin
                      ? selectedChat.contactName
                      : `${selectedChat.vehicle?.brand?.name} ${selectedChat.vehicle?.model?.name}`}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 truncate">
                    {isAdmin ? (
                      <>
                        <User size={8} className="sm:w-2.5 sm:h-2.5 shrink-0" />{" "}
                        <span className="truncate">
                          {selectedChat.contactEmail}
                        </span>
                      </>
                    ) : (
                      "Chat con Soporte"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 sm:gap-1 shrink-0 ml-2">
                <Link
                  to={`/vehiculo/${selectedChat.vehicle?.["@id"].split("/").pop()}`}
                  className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-blue-600 border-2 px-2 py-1 sm:p-2 rounded-full hover:bg-sky-300"
                >
                  <span className="hidden sm:inline">Ver ficha</span>
                  <Car size={10} className="sm:w-3 sm:h-3" />
                </Link>
                {isAdmin ? (
                  <>
                    {selectedChat.vehicle && (
                      <div className="relative">
                        <select
                          value={selectedChat.vehicle.status}
                          onChange={(e) =>
                            handleAdminAction_StatusChange(e.target.value)
                          }
                          disabled={updatingStatus}
                          className={`cursor-pointer pl-1.5 sm:pl-2 pr-4 sm:pr-6 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold border outline-none ${getStatusColor(selectedChat.vehicle.status)} flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${updatingStatus ? "bg-gray-200" : ""}`}
                        >
                          <option value="AVAILABLE">DISPONIBLE</option>
                          <option value="RESERVED">RESERVADO</option>
                          <option value="SOLD">VENDIDO</option>
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border flex items-center gap-1 sm:gap-1.5 ${selectedChat.vehicle?.status === "SOLD" ? "bg-red-50 text-red-600 border-red-200" : selectedChat.vehicle?.status === "RESERVED" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                  >
                    {selectedChat.vehicle?.status === "SOLD" ? (
                      <Lock size={10} className="sm:w-3 sm:h-3" />
                    ) : (
                      <Tag size={10} className="sm:w-3 sm:h-3" />
                    )}
                    <span className="hidden sm:inline">
                      {selectedChat.vehicle?.status === "AVAILABLE"
                        ? "DISPONIBLE"
                        : selectedChat.vehicle?.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Banner de reserva pendiente */}
            {selectedChat.reservation &&
              selectedChat.reservation.status === "PENDING" && (
                <div className="mx-3 sm:mx-6 mt-3 sm:mt-6 p-3 sm:p-4 bg-white border border-orange-200 rounded-xl flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between items-start sm:items-center shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                  <div className="w-full sm:w-auto">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <CalendarClock
                        size={14}
                        className="sm:w-4.5 sm:h-4.5 text-orange-500"
                      />
                      Solicitud de Reserva
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 ml-0 sm:ml-6">
                      {formatDate(selectedChat.reservation.startDate)} -{" "}
                      {formatDate(selectedChat.reservation.endDate)}
                      <span className="block font-bold text-slate-700 mt-1">
                        Total:{" "}
                        {formatPrice(selectedChat.reservation.totalPrice)}
                      </span>
                    </p>
                  </div>
                  {isAdmin ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() =>
                          setConfirmAction({ status: "REJECTED" })
                        }
                        className="flex-1 sm:flex-none px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <XCircle size={12} className="sm:w-3.5 sm:h-3.5" />{" "}
                        Rechazar
                      </button>
                      <button
                        onClick={() =>
                          setConfirmAction({ status: "CONFIRMED" })
                        }
                        className="flex-1 sm:flex-none px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                      >
                        <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />{" "}
                        Aceptar
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto text-center sm:text-left px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-bold rounded-lg animate-pulse">
                      Pendiente de confirmación
                    </div>
                  )}
                </div>
              )}

            {/* Mensajes */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scroll-smooth"
            >
              {messages.map((msg) => {
                const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-4 shadow-sm text-xs sm:text-sm relative ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-gray-200"}`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <div
                        className={`text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 flex items-center justify-end gap-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {formatDate(msg.createdAt)}
                        {isMe && (
                          <CheckCheck size={10} className="sm:w-3 sm:h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input de mensaje */}
            <div className="p-2 sm:p-4 bg-white border-t border-gray-200">
              {isChatLocked ? (
                <div className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-xs sm:text-sm font-medium">
                  <Lock size={14} className="text-red-400 shrink-0" />
                  <span className="text-center">
                    Vehículo no disponible para mensajes.
                    {isAdmin && " Por favor, actualice el estado del vehículo."}
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-1.5 sm:gap-3"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe..."
                    className="flex-1 px-3 py-2 sm:p-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none text-xs sm:text-sm transition-all text-black min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white px-3 py-2 sm:p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200 shrink-0 flex items-center justify-center min-w-[44px] sm:min-w-[48px]"
                  >
                    {sending ? (
                      <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Send size={16} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/50 p-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm border border-gray-100">
              <MessageSquare
                size={32}
                className="sm:w-10 sm:h-10 text-blue-200"
              />
            </div>
            <p className="text-xs sm:text-base text-center">
              Selecciona una conversación
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;