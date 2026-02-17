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
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import Toast from "../../helpers/Toast";
import ConfirmModal from "../../helpers/ConfirmModal";

// Tipos
import type { Message } from "../../types/message";
import type { Conversation } from "../../types/reservation";

interface ApiResource {
  id?: number;
  "@id"?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SALES") ||
    false;

  // ESTADOS COMUNES
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"SALE" | "RENT">("RENT");

  // Estados Admin
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    status: "CONFIRMED" | "REJECTED";
  } | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // --- 1. CARGA DE DATOS ---
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

  // Use container scrolling instead of scrollIntoView to avoid scrolling the main page/body
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

    // Si ya tiene ID numérico, lo devolvemos
    if (obj.id) return obj.id;

    if (obj["@id"]) {
      const parts = obj["@id"].split("/");
      return parts[parts.length - 1];
    }

    return null;
  };

  // --- 2. LÓGICA ---
  const fetchConversations = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      let url = "/conversations";
      if (!isAdmin && user) {
        const email = user.email || user.name;
        url += `?contactEmail=${email}`;
      }
      const response = await api.get(url);
      const data = response.data.member || [];
      setConversations(data);
    } catch (error) {
      console.error("Error cargando chats", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const response = await api.get(`/conversations/${id}`);
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
      await api.patch(
        `/conversations/${chat.id}`,
        { status: "READ" },
        { headers: { "Content-Type": "application/merge-patch+json" } },
      );
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
      await api.post("/messages", {
        content: content,
        isAdmin: isAdmin,
        conversation:
          selectedChat["@id"] || `/api/conversations/${selectedChat.id}`,
      });
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

  // --- 3. FILTRADO ---
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

  // --- 4. ACCIONES DE ADMIN ---

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
      await api.patch(
        `/vehicles/${vehicleId}`,
        { status: newStatus },
        { headers: { "Content-Type": "application/merge-patch+json" } },
      );

      // 1. Actualizar el chat seleccionado
      setSelectedChat((prev) =>
        prev
          ? { ...prev, vehicle: { ...prev.vehicle!, status: newStatus } }
          : null,
      );

      // 2. Actualizar TODAS las conversaciones que tengan ESE vehículo
      setConversations((prev) =>
        prev.map((c) => {
          // Usamos el helper para comparar IDs de forma segura
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
      await api.patch(
        `/reservations/${reservationId}`,
        { status },
        { headers: { "Content-Type": "application/merge-patch+json" } },
      );

      // Actualizar solo el chat actual (La reserva es única por chat)
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

      if (
        status === "CONFIRMED" &&
        selectedChat.vehicle?.status === "AVAILABLE"
      ) {
        // Si se confirma, esto llamará a la función de arriba que ahora SÍ actualiza todos los chats
        await handleAdminAction_StatusChange("RESERVED");
      }
      setToast({
        msg: `Reserva ${status === "CONFIRMED" ? "aceptada" : "rechazada"}`,
        type: "success",
      });
    } catch (e) {
      setToast({ msg: "Error procesando reserva", type: "error" });
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // UI Helpers
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

  // Contadores
  const unreadSales = conversations.filter(
    (c) => !c.reservation && c.vehicle?.type !== "RENT" && hasUnreadMessages(c),
  ).length;
  const unreadRents = conversations.filter(
    (c) =>
      (c.reservation || c.vehicle?.type === "RENT") && hasUnreadMessages(c),
  ).length;

  if (!user) return <div className="p-10 text-center">Cargando sesión...</div>;

  return (
    <div
      className={`bg-white rounded-none shadow-sm border-x border-gray-200 flex overflow-hidden relative ${
        isAdmin 
          ? "h-[calc(100vh-100px)] rounded-2xl border-y" // Admin layout has padding, so we keep rounded corners and border
          : "h-[calc(100vh-80px)]" // Public layout: Full height minus header (80px), no rounded corners, no top/bottom border to blend perfectly
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

      {/* SIDEBAR */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 min-w-[280px]">
        <div className="flex border-b border-gray-100 bg-white">
          <button
            onClick={() => setActiveTab("RENT")}
            className={`flex-1 py-3 text-xs font-bold flex justify-center gap-2 ${activeTab === "RENT" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500"}`}
          >
            <CalendarCheck size={14} /> Reservas
            {unreadRents > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                {unreadRents}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("SALE")}
            className={`flex-1 py-3 text-xs font-bold flex justify-center gap-2 ${activeTab === "SALE" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-500"}`}
          >
            <BadgeEuro size={14} /> Ventas
            {unreadSales > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                {unreadSales}
              </span>
            )}
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center flex flex-col items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" /> Cargando...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay conversaciones.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isUnread = hasUnreadMessages(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-all flex gap-3 relative ${selectedChat?.id === chat.id ? "bg-white border-l-4 border-l-blue-600 shadow-sm" : "border-l-4 border-l-transparent"}`}
                >
                  {isUnread && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse z-10"></div>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                    {getImageUrl(chat) ? (
                      <img
                        src={getImageUrl(chat)!}
                        className={`w-full h-full object-cover ${chat.vehicle?.status === "SOLD" ? "grayscale opacity-70" : ""}`}
                        alt="car"
                      />
                    ) : (
                      <Car className="w-full h-full p-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`text-sm font-bold truncate ${isUnread ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {isAdmin
                          ? chat.contactName
                          : `${chat.vehicle?.brand?.name} ${chat.vehicle?.model?.name}`}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${isUnread ? "font-bold text-blue-600" : "text-gray-500"}`}
                    >
                      {isAdmin
                        ? `${chat.vehicle?.brand?.name} ${chat.vehicle?.model?.name}`
                        : isUnread
                          ? "Tienes nuevos mensajes"
                          : "Ver conversación"}
                    </p>
                    {chat.vehicle?.status !== "AVAILABLE" && (
                      <span
                        className={`inline-block text-[9px] px-1.5 rounded mt-1 font-bold ${chat.vehicle?.status === "SOLD" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}
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

      {/* ZONA DE CHAT (DERECHA) */}
      <div className="flex-1 flex flex-col bg-[#eef1f6]">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm h-20 z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm ${isAdmin ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-slate-700"}`}
                >
                  {isAdmin ? (
                    selectedChat.contactName.charAt(0).toUpperCase()
                  ) : (
                    <Car size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {isAdmin
                      ? selectedChat.contactName
                      : `${selectedChat.vehicle?.brand?.name} ${selectedChat.vehicle?.model?.name}`}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <User size={10} /> {selectedChat.contactEmail}
                      </>
                    ) : (
                      "Chat con Soporte"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Link
                  to={`/vehiculo/${selectedChat.vehicle?.["@id"].split("/").pop()}`}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Ver ficha <Car size={12} />
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
                          className={`cursor-pointer pl-2 pr-6 py-1 rounded text-xs font-bold border outline-none ${getStatusColor(selectedChat.vehicle.status)}`}
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
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${selectedChat.vehicle?.status === "SOLD" ? "bg-red-50 text-red-600 border-red-200" : selectedChat.vehicle?.status === "RESERVED" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                  >
                    {selectedChat.vehicle?.status === "SOLD" ? (
                      <Lock size={12} />
                    ) : (
                      <Tag size={12} />
                    )}
                    {selectedChat.vehicle?.status === "AVAILABLE"
                      ? "DISPONIBLE"
                      : selectedChat.vehicle?.status}
                  </div>
                )}
              </div>
            </div>

            {selectedChat.reservation &&
              selectedChat.reservation.status === "PENDING" && (
                <div className="mx-6 mt-6 p-4 bg-white border border-orange-200 rounded-xl flex flex-col md:flex-row justify-between items-center shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <CalendarClock size={18} className="text-orange-500" />{" "}
                      Solicitud de Reserva
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 ml-6">
                      {formatDate(selectedChat.reservation.startDate)} -{" "}
                      {formatDate(selectedChat.reservation.endDate)}
                      <span className="block font-bold text-slate-700 mt-1">
                        Total:{" "}
                        {formatPrice(selectedChat.reservation.totalPrice)}
                      </span>
                    </p>
                  </div>
                  {isAdmin ? (
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => setConfirmAction({ status: "REJECTED" })}
                        className="px-3 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <XCircle size={14} /> Rechazar
                      </button>
                      <button
                        onClick={() =>
                          setConfirmAction({ status: "CONFIRMED" })
                        }
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <CheckCircle2 size={14} /> Aceptar
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 md:mt-0 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg animate-pulse">
                      Pendiente de confirmación
                    </div>
                  )}
                </div>
              )}

            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.map((msg) => {
                const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 shadow-sm text-sm relative ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-gray-200"}`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <div
                        className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {formatDate(msg.createdAt)}
                        {isMe && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              {isChatLocked ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium">
                  <Lock size={16} className="text-red-400" /> Vehículo no
                  disponible para mensajes.
                  {isAdmin && "Por favor, actualice el estado del vehículo."}
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none text-sm transition-all text-black"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-200"
                  >
                    {sending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <MessageSquare size={40} className="text-blue-200" />
            </div>
            <p>Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
