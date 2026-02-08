import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Send, 
  User, 
  Car, 
  MessageSquare,
  CheckCheck,
  Loader2,
  Phone,
} from "lucide-react";
import api from "../../api/axios";

// --- TIPOS ---
interface Message {
  id: number;
  content: string;
  createdAt: string;
  isAdmin: boolean;
}

interface VehicleImage {
  imageUrl: string;
  main: boolean;
}

interface Vehicle {
  id: number;
  "@id": string;
  status: string; // AVAILABLE, RESERVED, SOLD
  brand?: { name: string };
  model?: { name: string };
  vehicleImages?: VehicleImage[];
}

interface Conversation {
  id: number;
  "@id": string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vehicle?: Vehicle;
  updatedAt: string;
  status: string; // NEW, READ, ARCHIVED
  messages: Message[]; 
}

const AdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. CARGAR LISTA (Polling cada 10s)
  useEffect(() => {
    fetchConversations(); // Carga inicial
    const interval = setInterval(() => {
        fetchConversations(true); // Polling silencioso
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. CARGAR CHAT (Polling cada 3s)
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id); // Carga inicial
      
      // Si es nuevo, marcar como leído al entrar
      if (selectedChat.status === 'NEW') {
        markAsRead(selectedChat);
      }

      const interval = setInterval(() => {
          fetchMessages(selectedChat.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  // 3. AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- FUNCIONES DE CARGA ---

  const fetchConversations = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      
      const response = await api.get("/conversations");
      const data = response.data["hydra:member"] || response.data.member || [];
      
      // Actualizamos el estado (React es inteligente y solo re-renderiza si cambia algo importante)
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
      const newMessages = response.data.messages || [];
      
      setMessages(prev => {
          // Pequeña optimización: Solo actualizamos si cambia la longitud
          // para evitar saltos raros en el scroll si estás leyendo mensajes viejos
          if (prev.length !== newMessages.length) {
              return newMessages;
          }
          return prev;
      });
    } catch (error) {
      console.error("Error cargando mensajes", error);
    }
  };

  const markAsRead = async (chat: Conversation) => {
    try {
        setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, status: 'READ' } : c));
        await api.patch(`/conversations/${chat.id}`, 
            { status: 'READ' }, 
            { headers: { "Content-Type": "application/merge-patch+json" } }
        );
    } catch (error) {
        console.error("Error marcando como leído", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const payload = {
        content: newMessage,
        isAdmin: true, 
        conversation: selectedChat["@id"] || `/api/conversations/${selectedChat.id}`
      };

      await api.post("/messages", payload);
      
      setNewMessage("");
      await fetchMessages(selectedChat.id); // Forzar recarga inmediata
      fetchConversations(); // Para subir el chat arriba

    } catch (error) {
      console.error("Error enviando respuesta", error);
      alert("No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  // --- GESTIÓN DE ESTADO DEL VEHÍCULO ---
  const handleVehicleStatusChange = async (newStatus: string) => {
    if (!selectedChat?.vehicle) return;
    setUpdatingStatus(true);

    try {
        await api.patch(`/vehicles/${selectedChat.vehicle.id}`, 
            { status: newStatus },
            { headers: { "Content-Type": "application/merge-patch+json" } }
        );

        setSelectedChat(prev => prev ? ({
            ...prev,
            vehicle: { ...prev.vehicle!, status: newStatus }
        }) : null);

        setConversations(prev => prev.map(c => 
            c.id === selectedChat.id && c.vehicle 
                ? { ...c, vehicle: { ...c.vehicle, status: newStatus } } 
                : c
        ));

    } catch (error) {
        console.error("Error actualizando estado", error);
        alert("Error al cambiar el estado del coche");
    } finally {
        setUpdatingStatus(false);
    }
  };

  // --- HELPERS ---
  const getImageUrl = (chat: Conversation) => {
    const img = chat.vehicle?.vehicleImages?.[0];
    if (!img) return null;
    return `${import.meta.env.VITE_BACKEND_URL}${img.imageUrl}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'AVAILABLE': return 'bg-green-100 text-green-700 border-green-200';
          case 'RESERVED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'SOLD': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  return (
    <div className="h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
      
      {/* --- SIDEBAR IZQUIERDO (LISTA) --- */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 min-w-[300px]">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> Mensajes
          </h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" /> Cargando...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No hay mensajes aún.</div>
          ) : (
            conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-white transition-all flex gap-3 group relative ${
                  selectedChat?.id === chat.id ? "bg-white border-l-4 border-l-blue-600 shadow-sm" : "border-l-4 border-l-transparent"
                }`}
              >
                {/* INDICADOR DE NO LEÍDO */}
                {chat.status === 'NEW' && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse" title="Nuevo mensaje"></div>
                )}

                {/* IMAGEN DEL VEHÍCULO */}
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200">
                    {getImageUrl(chat) ? (
                        <img 
                            src={getImageUrl(chat)!} 
                            className="w-full h-full object-cover" 
                            alt="coche" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg ...><path ...></svg>'; 
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><Car size={20}/></div>
                    )}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-sm font-bold truncate ${selectedChat?.id === chat.id ? "text-blue-700" : "text-slate-800"}`}>
                        {chat.contactName}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">{formatDate(chat.updatedAt)}</span>
                  </div>
                  <p className={`text-xs truncate flex items-center gap-1 ${chat.status === 'NEW' ? 'font-bold text-slate-700' : 'text-gray-500'}`}>
                    <Car size={12} className="text-gray-400"/> 
                    {chat.vehicle?.brand?.name || "Coche"} {chat.vehicle?.model?.name || "..."}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- ZONA DERECHA (CHAT) --- */}
      <div className="flex-1 flex flex-col bg-[#eef1f6]">
        {selectedChat ? (
          <>
            {/* HEADER CHAT */}
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
                             <Phone size={8}/> {selectedChat.contactPhone}
                         </span>
                      )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User size={10}/> {selectedChat.contactEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <Car size={14} className="text-blue-600"/>
                    {selectedChat.vehicle?.brand?.name} {selectedChat.vehicle?.model?.name}
                 </div>
                 
                 {selectedChat.vehicle && (
                     <div className="relative">
                        <select 
                            value={selectedChat.vehicle.status}
                            onChange={(e) => handleVehicleStatusChange(e.target.value)}
                            disabled={updatingStatus}
                            className={`
                                appearance-none cursor-pointer pl-2 pr-8 py-1 rounded-md text-xs font-bold border transition-all outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
                                ${getStatusColor(selectedChat.vehicle.status)}
                                ${updatingStatus ? 'opacity-50' : 'hover:brightness-95'}
                            `}
                        >
                            <option value="AVAILABLE">DISPONIBLE</option>
                            <option value="RESERVED">RESERVADO</option>
                            <option value="SOLD">VENDIDO</option>
                        </select>
                        {updatingStatus && <Loader2 size={10} className="absolute right-2 top-1.5 animate-spin text-slate-500"/>}
                     </div>
                 )}
              </div>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative text-sm ${
                      msg.isAdmin 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white text-slate-800 rounded-tl-none border border-gray-200"
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className={`text-[10px] mt-2 flex items-center gap-1 justify-end ${msg.isAdmin ? "text-blue-100" : "text-gray-400"}`}>
                        {formatDate(msg.createdAt)}
                        {msg.isAdmin && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                >
                  {sending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <MessageSquare size={48} className="text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Panel de Mensajería</h3>
            <p className="text-sm max-w-xs text-center">Selecciona una conversación de la izquierda para ver el historial y gestionar el estado del vehículo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;