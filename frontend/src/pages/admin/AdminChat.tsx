import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Send,
  User,
  Car,
  MessageSquare,
  CheckCheck,
  Loader2,
  Phone,
  CalendarClock,
  CheckCircle2,
  XCircle,
  BadgeEuro,
  CalendarCheck,
  Lock,
} from "lucide-react";
import api from "../../api/axios";
import { AxiosError } from "axios";
import type { Message } from "../../types/message";
import type { Vehicle } from "../../types/vehicle";
import type { Conversation } from "../../types/reservation";
import Toast from "../../helpers/Toast";
import ConfirmModal from "../../helpers/ConfirmModal";
import { Link } from "react-router-dom";

const AdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"sales" | "bookings">("bookings");
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    status: "CONFIRMED" | "REJECTED";
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- FILTRADO DE CONVERSACIONES ---
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // 1. Filtrar por Pestaña
    if (activeTab === "bookings") {
      filtered = filtered.filter(
        (chat) => chat.reservation !== null && chat.reservation !== undefined,
      );
    } else {
      filtered = filtered.filter(
        (chat) => chat.reservation === null || chat.reservation === undefined,
      );
    }

    // 2. Filtrar por Búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.contactName.toLowerCase().includes(query) ||
          chat.vehicle?.model?.name.toLowerCase().includes(query) ||
          chat.vehicle?.brand?.name.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [conversations, activeTab, searchQuery]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => fetchConversations(true), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      if (selectedChat.status === "NEW") markAsRead(selectedChat);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- FUNCIONES ---

  const fetchConversations = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const response = await api.get("/conversations");
      const data = response.data.member || [];
      setConversations(data);
    } catch (error) {
      throw new Error("Error cargando conversaciones", { cause: error });
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const response = await api.get(`/conversations/${id}`);
      const newMessages = response.data.messages || [];
      const updatedReservation = response.data.reservation;

      setMessages((prev) =>
        prev.length !== newMessages.length ? newMessages : prev,
      );

      if (
        selectedChat &&
        JSON.stringify(selectedChat.reservation) !==
          JSON.stringify(updatedReservation)
      ) {
        setSelectedChat((prev) =>
          prev ? { ...prev, reservation: updatedReservation } : null,
        );
      }
    } catch (error) {
      throw new Error("Error cargando mensajes", { cause: error });
    }
  };

  const markAsRead = async (chat: Conversation) => {
    try {
      setConversations((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, status: "READ" } : c)),
      );
      await api.patch(
        `/conversations/${chat.id}`,
        { status: "READ" },
        { headers: { "Content-Type": "application/merge-patch+json" } },
      );
    } catch (error) {
      throw new Error("Error marcando como leído", { cause: error });
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, content?: string) => {
    if (e) e.preventDefault();
    const msgToSend = content || newMessage;
    if (!msgToSend.trim() || !selectedChat) return;

    setSending(true);
    try {
      const payload = {
        content: msgToSend,
        isAdmin: true,
        conversation:
          selectedChat["@id"] || `/api/conversations/${selectedChat.id}`,
      };
      await api.post("/messages", payload);
      setNewMessage("");
      await fetchMessages(selectedChat.id);
      fetchConversations();
    } catch (error) {
      setToast({ msg: "No se pudo enviar el mensaje", type: "error" });
      throw new Error("Error enviando mensaje", { cause: error });
    } finally {
      setSending(false);
    }
  };

  const getVehicleUniqueId = (v: Vehicle | undefined) => {
    if (!v) return null;
    if (v.id) return v.id;
    if (v["@id"]) {
      const parts = v["@id"].split("/");
      return parseInt(parts[parts.length - 1], 10);
    }
    return null;
  };

  const handleVehicleStatusChange = async (newStatus: string) => {
    if (!selectedChat?.vehicle) return;

    const vehicleId = getVehicleUniqueId(selectedChat.vehicle);

    if (!vehicleId) {
      setToast({
        msg: "Error: No se pudo identificar el vehículo",
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

      setSelectedChat((prev) =>
        prev
          ? { ...prev, vehicle: { ...prev.vehicle!, status: newStatus } }
          : null,
      );

      setConversations((prev) =>
        prev.map((c) => {
          const cVehicleId = getVehicleUniqueId(c.vehicle);
          if (cVehicleId === vehicleId && c.vehicle) {
            return { ...c, vehicle: { ...c.vehicle, status: newStatus } };
          }
          return c;
        }),
      );

      setToast({ msg: "Estado del vehículo actualizado", type: "success" });
    } catch (error) {
      let errorMsg = "Error al actualizar estado.";
      if (error instanceof AxiosError && error.response) {
        errorMsg = error.response.data.detail || error.message;
      }
      setToast({ msg: `Error: ${errorMsg}`, type: "error" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const promptUpdateReservation = (status: "CONFIRMED" | "REJECTED") => {
    setConfirmAction({ status });
  };

  const executeUpdateReservation = async () => {
    if (!selectedChat?.reservation || !confirmAction) return;
    const { status } = confirmAction;
    setConfirmAction(null);

    try {
      setUpdatingStatus(true);
      await api.patch(
        `/reservations/${selectedChat.reservation.id}`,
        { status },
        { headers: { "Content-Type": "application/merge-patch+json" } },
      );

      setSelectedChat((prev) =>
        prev
          ? { ...prev, reservation: { ...prev.reservation!, status } }
          : null,
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id && c.reservation
            ? { ...c, reservation: { ...c.reservation!, status } }
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
        await handleVehicleStatusChange("RESERVED");
      }

      setToast({
        msg:
          status === "CONFIRMED"
            ? "Reserva aceptada con éxito"
            : "Reserva rechazada",
        type: "success",
      });
    } catch (error) {
      setToast({ msg: "Error al actualizar reserva", type: "error" });
      throw new Error("Error actualizando reserva", { cause: error });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getImageUrl = (chat: Conversation) => {
    if (chat.vehicle?.vehicleImages && chat.vehicle.vehicleImages.length > 0) {
      const mainImage =
        chat.vehicle.vehicleImages.find((img) => img.main) ||
        chat.vehicle.vehicleImages[0];
      return `${import.meta.env.VITE_BACKEND_URL}${mainImage.imageUrl}`;
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

  return (
    <div className="h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden relative">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        title={
          confirmAction?.status === "CONFIRMED"
            ? "Aceptar Reserva"
            : "Rechazar Reserva"
        }
        message={
          confirmAction?.status === "CONFIRMED"
            ? "Esto bloqueará las fechas en el calendario y notificará al cliente."
            : "Esto liberará las fechas y notificará al cliente."
        }
        confirmColor={confirmAction?.status === "CONFIRMED" ? "green" : "red"}
        onConfirm={executeUpdateReservation}
        onCancel={() => setConfirmAction(null)}
      />

      {/* SIDEBAR IZQUIERDO */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 min-w-75">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <MessageSquare className="text-blue-600" /> Mensajes
          </h2>

          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "bookings"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarCheck size={14} /> Reservas
            </button>
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "sales"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BadgeEuro size={14} /> Ventas
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin" /> Cargando...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay mensajes en esta sección.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isSold = chat.vehicle?.status === "SOLD";
              const isReserved = chat.vehicle?.status === "RESERVED";

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-all flex gap-3 group relative ${
                    selectedChat?.id === chat.id
                      ? "bg-white border-l-4 border-l-blue-600 shadow-sm"
                      : "border-l-4 border-l-transparent"
                  } ${isSold ? "bg-gray-50/50" : ""}`}
                >
                  {/* --- INDICADOR DE VENDIDO Y RESERVADO --- */}
                  {isSold && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border border-red-200 z-10">
                      <Lock size={8} /> VENDIDO
                    </div>
                  )}

                  {isReserved && (
                    <div className="absolute top-2 right-2 bg-orange-300 text-orange-700 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border border-orange-200 z-10">
                      <Lock size={8} /> RESERVADO
                    </div>
                  )}

                  {chat.status === "NEW" && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse"></div>
                  )}

                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    {getImageUrl(chat) ? (
                      <img
                        src={getImageUrl(chat)!}
                        className={`w-full h-full object-cover ${isSold ? "grayscale opacity-70" : ""}`}
                        alt="coche"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex justify-between items-baseline mb-1 pt-2">
                      <h4
                        className={`text-sm font-bold truncate ${selectedChat?.id === chat.id ? "text-blue-700" : "text-slate-800"}`}
                      >
                        {chat.contactName}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatDate(chat.updatedAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate flex items-center gap-1 ${chat.status === "NEW" ? "font-bold text-slate-700" : "text-gray-500"}`}
                    >
                      <Car size={12} className="text-gray-400" />{" "}
                      {chat.vehicle?.brand?.name} {chat.vehicle?.model?.name}
                    </p>
                    {chat.reservation && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded ml-auto w-fit mt-1 block ${chat.reservation.status === "PENDING" ? "bg-orange-100 text-orange-600 font-bold" : "bg-gray-100 text-gray-500"}`}
                      >
                        {chat.reservation.status === "PENDING"
                          ? "SOLICITUD RESERVA"
                          : chat.reservation.status}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ZONA DERECHA */}
      <div className="flex-1 flex flex-col bg-[#eef1f6]">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedChat.contactName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    {selectedChat.contactName}
                    {selectedChat.contactPhone && (
                      <span className="text-[10px] font-normal bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1">
                        <Phone size={8} /> {selectedChat.contactPhone}
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={10} /> {selectedChat.contactEmail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Link
                  to={`/vehiculo/${selectedChat.vehicle?.["@id"].split("/").pop()}`}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 border border-slate-200 px-3 py-1 rounded-md"
                >
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <Car size={14} className="text-blue-600" />
                    {selectedChat.vehicle?.brand?.name}{" "}
                    {selectedChat.vehicle?.model?.name}
                  </div>
                </Link>
                {selectedChat.reservation ? (
                  <div
                    className={`px-3 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 shadow-sm
                        ${
                          selectedChat.reservation.status === "PENDING"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : selectedChat.reservation.status === "CONFIRMED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }
                    `}
                  >
                    {selectedChat.reservation.status === "PENDING" && (
                      <Loader2 size={10} className="animate-spin" />
                    )}
                    {selectedChat.reservation.status === "CONFIRMED" && (
                      <CheckCircle2 size={12} />
                    )}
                    {selectedChat.reservation.status === "REJECTED" && (
                      <XCircle size={12} />
                    )}
                    {selectedChat.reservation.status === "PENDING"
                      ? "ESPERANDO ACCIÓN"
                      : selectedChat.reservation.status}
                  </div>
                ) : (
                  selectedChat.vehicle && (
                    <div className="relative">
                      <select
                        value={selectedChat.vehicle.status}
                        onChange={(e) =>
                          handleVehicleStatusChange(e.target.value)
                        }
                        disabled={updatingStatus}
                        className={`appearance-none cursor-pointer pl-2 pr-8 py-1 rounded-md text-xs font-bold border transition-all outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 ${getStatusColor(selectedChat.vehicle.status)} ${updatingStatus ? "opacity-50" : "hover:brightness-95"}`}
                      >
                        <option value="AVAILABLE">DISPONIBLE</option>
                        <option value="RESERVED">RESERVADO</option>
                        <option value="SOLD">VENDIDO</option>
                      </select>
                      {updatingStatus && (
                        <Loader2
                          size={10}
                          className="absolute right-2 top-1.5 animate-spin text-slate-500"
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {selectedChat.reservation &&
              selectedChat.reservation.status === "PENDING" && (
                <div className="mx-6 mt-6 p-4 bg-white border border-orange-200 rounded-xl flex flex-col md:flex-row justify-between items-center shadow-[0_4px_20px_-4px_rgba(249,115,22,0.15)] animate-in fade-in slide-in-from-top-2 gap-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <CalendarClock size={18} className="text-orange-500" />{" "}
                      Nueva Solicitud de Reserva
                    </h4>
                    <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5 ml-6">
                      <p>
                        Del{" "}
                        <strong className="text-slate-700">
                          {formatDate(selectedChat.reservation.startDate)}
                        </strong>{" "}
                        al{" "}
                        <strong className="text-slate-700">
                          {formatDate(selectedChat.reservation.endDate)}
                        </strong>
                      </p>
                      <p className="font-semibold text-slate-700">
                        Total:{" "}
                        {formatPrice(selectedChat.reservation.totalPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => promptUpdateReservation("REJECTED")}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm"
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                    <button
                      onClick={() => promptUpdateReservation("CONFIRMED")}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] font-bold rounded-lg text-xs shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Aceptar Reserva
                    </button>
                  </div>
                </div>
              )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative text-sm ${msg.isAdmin ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-gray-200"}`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <div
                      className={`text-[10px] mt-2 flex items-center gap-1 justify-end ${msg.isAdmin ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {formatDate(msg.createdAt)}
                      {msg.isAdmin && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* --- AREA DE INPUT O BLOQUEO DE ESCRITURA --- */}
            <div className="p-4 bg-white border-t border-gray-200">
              {isChatLocked ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium animate-in fade-in">
                  <Lock size={18} className="text-red-400" />
                  <div>
                    <p className="text-slate-700 font-bold">
                      Vehículo marcado como VENDIDO
                    </p>
                    <p className="text-xs">
                      Para escribir mensajes, cambia el estado a "Reservado" o
                      "Disponible".
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => handleSendMessage(e)}
                  className="flex gap-4"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 p-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <MessageSquare size={48} className="text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              Panel de Mensajería
            </h3>
            <p className="text-sm max-w-xs text-center">
              Selecciona una conversación para gestionar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
