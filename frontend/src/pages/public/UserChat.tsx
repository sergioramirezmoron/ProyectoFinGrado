import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Car,
  MessageSquare,
  Loader2,
  CheckCheck,
  Lock,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  isAdmin: boolean;
}

interface Vehicle {
  id?: number;
  "@id": string;
  status: string;
  brand?: { name: string };
  model?: { name: string };
  vehicleImages?: { imageUrl: string; main: boolean }[];
}

interface Conversation {
  id: number;
  "@id": string;
  contactName: string;
  vehicle?: Vehicle;
  updatedAt: string;
  messages: Message[];
}

const UserChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userEmail = user?.email || user?.name;
    if (userEmail) {
      fetchConversations(userEmail);
      const interval = setInterval(() => fetchConversations(userEmail), 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async (email: string) => {
    try {
      const response = await api.get(`/conversations?contactEmail=${email}`);
      const data = response.data["hydra:member"] || response.data.member || [];
      setConversations(data);
      if (loading) setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchMessages = async (id: number) => {
    try {
      const response = await api.get(`/conversations/${id}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      await api.post("/messages", {
        content: newMessage,
        isAdmin: false,
        conversation:
          selectedChat["@id"] || `/api/conversations/${selectedChat.id}`,
      });
      setNewMessage("");
      fetchMessages(selectedChat.id);
    } catch (error) {
      console.error("Error enviando", error);
    } finally {
      setSending(false);
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

  // Helper para saber si está disponible
  const isAvailable = (chat: Conversation | null) => {
    return chat?.vehicle?.status === "AVAILABLE";
  };

  if (!user)
    return (
      <div className="p-10 text-center">
        Inicia sesión para ver tus mensajes.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 mt-16 min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <MessageSquare className="text-blue-600" /> Mis Conversaciones
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden h-[600px]">
        {/* LISTA LATERAL */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 min-w-[280px]">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar vehículo..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" /> Cargando...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No tienes conversaciones.
              </div>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-all flex gap-3 ${selectedChat?.id === chat.id ? "bg-white border-l-4 border-l-blue-600 shadow-sm" : "border-l-4 border-l-transparent"}`}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {getImageUrl(chat) ? (
                      <img
                        src={getImageUrl(chat)!}
                        className={`w-full h-full object-cover ${chat.vehicle?.status !== "AVAILABLE" ? "grayscale opacity-70" : ""}`}
                        alt="car"
                      />
                    ) : (
                      <Car size={20} className="text-slate-400" />
                    )}
                    {/* Badge pequeño en la foto si está vendido */}
                    {chat.vehicle?.status === "SOLD" && (
                      <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center text-white font-bold text-[8px]">
                        VENDIDO
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm truncate">
                        {chat.vehicle?.brand?.name} {chat.vehicle?.model?.name}
                      </h4>
                    </div>

                    {/* Badge de estado en la lista */}
                    {chat.vehicle?.status === "SOLD" && (
                      <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded mt-1">
                        VENDIDO
                      </span>
                    )}
                    {chat.vehicle?.status === "RESERVED" && (
                      <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded mt-1">
                        RESERVADO
                      </span>
                    )}

                    <p className="text-xs text-gray-500 mt-1 truncate">
                      Último mensaje: {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ZONA DE CHAT */}
        <div className="flex-1 flex flex-col bg-[#eef1f6]">
          {selectedChat ? (
            <>
              <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm z-10 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Car size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {selectedChat.vehicle?.brand?.name}{" "}
                      {selectedChat.vehicle?.model?.name}
                    </h3>
                    <p className="text-xs text-gray-500">Chat con soporte</p>
                  </div>
                </div>

                {/* Estado en la cabecera */}
                {!isAvailable(selectedChat) && (
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 
                        ${selectedChat.vehicle?.status === "SOLD" ? "bg-red-50 text-red-600 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                  >
                    {selectedChat.vehicle?.status === "SOLD"
                      ? "VEHÍCULO VENDIDO"
                      : "VEHÍCULO RESERVADO"}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${!msg.isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 shadow-sm text-sm relative ${
                        !msg.isAdmin
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-slate-800 rounded-tl-none border border-gray-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${!msg.isAdmin ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {formatDate(msg.createdAt)}
                        {!msg.isAdmin && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* AREA DE INPUT O MENSAJE DE BLOQUEO */}
              <div className="p-4 bg-white border-t border-gray-200">
                {isAvailable(selectedChat) ? (
                  <form onSubmit={handleSendMessage} className="flex gap-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 p-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
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
                ) : (
                  <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium">
                    <Lock size={16} />
                    Este chat está cerrado porque el vehículo ya no está
                    disponible.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={48} className="text-gray-300 mb-4" />
              <p>Selecciona una conversación para leer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserChat;
