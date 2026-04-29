import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, ChevronDown, ChevronUp, X } from "lucide-react";
import {
  CONSENT_VERSION,
  getCookieConsent,
  saveCookieConsent,
} from "../../utils/cookieConsent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(() => {
    const stored = getCookieConsent();
    return !stored || stored.version !== CONSENT_VERSION;
  });
  const [expanded, setExpanded] = useState(false);
  const [functional, setFunctional] = useState(true);

  const acceptAll = () => {
    saveCookieConsent({ essential: true, functional: true });
    setVisible(false);
  };

  const acceptEssential = () => {
    saveCookieConsent({ essential: true, functional: false });
    setVisible(false);
  };

  const savePreferences = () => {
    saveCookieConsent({ essential: true, functional });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gestión de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-white/10 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        {/* Cabecera */}
        <div className="flex items-start gap-3 mb-3">
          <Cookie size={22} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-white font-semibold text-sm sm:text-base">
              Usamos cookies
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Utilizamos cookies propias esenciales para el funcionamiento del
              sitio (autenticación y preferencias). No empleamos cookies de
              publicidad ni analítica de terceros.{" "}
              <Link
                to="/politica-cookies"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Más información
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Panel de preferencias */}
        {expanded && (
          <div className="bg-slate-800/60 border border-white/8 rounded-lg p-4 mb-3 space-y-3">
            {/* Esenciales */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">
                  Cookies esenciales
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Necesarias para la autenticación y el funcionamiento del
                  servicio. No se pueden desactivar.
                </p>
              </div>
              <span className="text-xs bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded px-2 py-0.5 shrink-0 ml-3">
                Siempre activas
              </span>
            </div>

            {/* Funcionales */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">
                  Cookies funcionales
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Recuerdan tus preferencias de idioma y visualización para
                  mejorar tu experiencia.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={functional}
                onClick={() => setFunctional((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 ml-3 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  functional ? "bg-blue-600" : "bg-slate-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                    functional ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={acceptAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Aceptar todo
          </button>
          <button
            onClick={acceptEssential}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Solo esenciales
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-center gap-1 px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp size={15} /> Ocultar preferencias
              </>
            ) : (
              <>
                <ChevronDown size={15} /> Gestionar preferencias
              </>
            )}
          </button>
          {expanded && (
            <button
              onClick={savePreferences}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors sm:ml-auto"
            >
              Guardar mis preferencias
            </button>
          )}
          <button
            onClick={acceptEssential}
            aria-label="Cerrar banner de cookies"
            className="hidden sm:flex items-center justify-center p-2 text-slate-500 hover:text-white transition-colors sm:ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        {/* Links legales */}
        <div className="mt-2 flex gap-4 text-xs text-slate-600">
          <Link to="/politica-privacidad" className="hover:text-slate-400 transition-colors">
            Política de privacidad
          </Link>
          <Link to="/politica-cookies" className="hover:text-slate-400 transition-colors">
            Política de cookies
          </Link>
          <Link to="/aviso-legal" className="hover:text-slate-400 transition-colors">
            Aviso legal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
