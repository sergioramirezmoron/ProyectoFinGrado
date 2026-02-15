// Imports igual que antes...
import { useState, useEffect } from "react";
import { X, Send, CheckCircle, Loader2, Phone } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleName: string;
}

interface ConversationPayloadInterface {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vehicle: string;
  user?: string;
}


const ContactModal = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
}: ContactModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "Hola, estoy interesado en este vehículo. ¿Sigue disponible?",
  });

  const hasUserPhone = user?.phone && user.phone.trim() !== "";

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || user.email || "",
        email: user.email,
        phone: user.phone || "",
      }));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // PASO 1: Crear la Conversación (SIN MENSAJES ANIDADOS)
      const conversationPayload: ConversationPayloadInterface = {
        contactName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        vehicle: `/api/vehicles/${vehicleId}`,
        // Eliminamos 'messages' de aquí para evitar fallos de anidamiento
      };

      if (user && user["@id"]) {
        conversationPayload.user = user["@id"];
      }

      const conversationRes = await api.post("/conversations", conversationPayload);
      
      // Obtenemos la ID (IRI) de la conversación creada
      // Puede venir como '@id' o construirse con el ID numérico
      const conversationIri = conversationRes.data["@id"] || `/api/conversations/${conversationRes.data.id}`;

      // PASO 2: Crear el Mensaje vinculado a esa conversación
      await api.post("/messages", {
        content: formData.message,
        isAdmin: false,
        conversation: conversationIri, // Vinculamos aquí explícitamente
      });

      setSuccess(true);
    } catch (error) {
      console.error("Error enviando mensaje", error);
      alert("Hubo un error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ... (El resto del renderizado es idéntico a tu código original)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        {/* ... (Tu JSX visual se mantiene igual) ... */}
        {/* Solo he cambiado la lógica de handleSubmit arriba */}
        
        {/* Te pego el JSX resumido para que veas dónde encaja, pero usa el tuyo si no quieres cambiar estilos */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              ¡Mensaje Enviado!
            </h3>
            <p className="text-gray-500 text-sm">
              El vendedor ha recibido tu solicitud.
              {user ? (
                " Verás la respuesta en tu panel de mensajes."
              ) : (
                <span>
                  {" "}Te contactarán pronto a <strong>{formData.email}</strong>.
                </span>
              )}
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Contactar Vendedor
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Interesado en:{" "}
                <span className="font-semibold text-blue-600">
                  {vehicleName}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {user ? (
                // --- MODO LOGUEADO ---
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                        Tus datos
                    </span>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{formData.name}</p>
                            <p className="text-xs text-slate-600">{formData.email}</p>
                        </div>
                        {hasUserPhone && (
                            <span className="bg-white text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-100 flex items-center gap-1 shadow-sm">
                                <Phone size={10} /> {formData.phone}
                            </span>
                        )}
                    </div>
                  </div>

                  {/* Input de teléfono: SOLO SI NO TIENE TELÉFONO */}
                  {!hasUserPhone && (
                    <div className="pt-2 border-t border-blue-200 mt-1">
                      <label className="block text-xs font-bold text-blue-600 mb-1">
                        Falta tu teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                        placeholder="Ej: 600 123 456"
                      />
                    </div>
                  )}
                </div>
              ) : (
                // --- MODO INVITADO ---
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="600 000 000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-900"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm text-gray-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    Enviando <Loader2 className="animate-spin" size={20} />
                  </>
                ) : (
                  <>
                    Enviar Mensaje <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;