import { useState } from "react";
import { Cookie, Trash2 } from "lucide-react";
import { getCookieConsent } from "../../components/ui/CookieBanner";

const CONSENT_KEY = "luxurycars_cookie_consent";

const CookiePolicy = () => {
  const [consent, setConsent] = useState(getCookieConsent());

  const handleRevoke = () => {
    localStorage.removeItem(CONSENT_KEY);
    setConsent(null);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Cookie size={28} className="text-blue-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Política de Cookies
        </h1>
      </div>

      <p className="text-slate-400 text-sm mb-8">
        Última actualización: 21 de marzo de 2026
      </p>

      <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">

        {/* 1. ¿Qué son las cookies? */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            1. ¿Qué son las cookies y tecnologías similares?
          </h2>
          <p>
            Las cookies son pequeños ficheros de texto que los sitios web almacenan en el
            dispositivo del usuario cuando este los visita. Existen tecnologías similares,
            como el almacenamiento local del navegador (<em>localStorage</em>) y el
            almacenamiento de sesión (<em>sessionStorage</em>), que funcionan de manera
            análoga aunque técnicamente no son cookies en sentido estricto.
          </p>
          <p className="mt-2">
            El uso de estas tecnologías está regulado en España por el artículo 22.2 de la
            Ley 34/2002 (LSSI-CE), en concordancia con la Directiva 2009/136/CE y el
            Reglamento (UE) 2016/679 (RGPD).
          </p>
        </section>

        {/* 2. Qué almacenamos */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            2. ¿Qué almacenamos en su dispositivo?
          </h2>
          <p className="mb-4">
            La plataforma <strong className="text-white">LuxuryCars</strong> utiliza
            exclusivamente tecnologías de almacenamiento local estrictamente necesarias
            para el funcionamiento del servicio. No empleamos cookies de publicidad,
            rastreo ni analítica de terceros.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="text-white py-2 pr-3 font-semibold">Nombre</th>
                  <th className="text-white py-2 pr-3 font-semibold">Tipo</th>
                  <th className="text-white py-2 pr-3 font-semibold">Finalidad</th>
                  <th className="text-white py-2 pr-3 font-semibold">Duración</th>
                  <th className="text-white py-2 font-semibold">Titular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 pr-3 text-slate-300 font-mono">auth_token</td>
                  <td className="py-3 pr-3 text-slate-400">localStorage</td>
                  <td className="py-3 pr-3 text-slate-400">
                    Mantiene la sesión autenticada del usuario mediante un token JWT
                    firmado. Esencial para el acceso a funciones protegidas.
                  </td>
                  <td className="py-3 pr-3 text-slate-400">
                    Hasta cierre de sesión o expiración del token (1 h)
                  </td>
                  <td className="py-3 text-slate-400">LuxuryCars, S.L. (propia)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-3 text-slate-300 font-mono">
                    luxurycars_cookie_consent
                  </td>
                  <td className="py-3 pr-3 text-slate-400">localStorage</td>
                  <td className="py-3 pr-3 text-slate-400">
                    Almacena la decisión del usuario sobre las cookies para no volver a
                    mostrar el banner de consentimiento.
                  </td>
                  <td className="py-3 pr-3 text-slate-400">12 meses</td>
                  <td className="py-3 text-slate-400">LuxuryCars, S.L. (propia)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-3 text-slate-300 font-mono">PHPSESSID</td>
                  <td className="py-3 pr-3 text-slate-400">Cookie HTTP</td>
                  <td className="py-3 pr-3 text-slate-400">
                    Identificador de sesión de servidor generado por PHP/Symfony. Solo se
                    usa en rutas de gestión interna y no contiene datos personales.
                  </td>
                  <td className="py-3 pr-3 text-slate-400">Sesión (se elimina al cerrar el navegador)</td>
                  <td className="py-3 text-slate-400">LuxuryCars, S.L. (propia)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Clasificación */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            3. Clasificación de las cookies utilizadas
          </h2>
          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-white font-medium">Técnicas / Esenciales</h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Permiten la navegación y el uso de las funciones básicas del sitio. Son
                estrictamente necesarias y no requieren consentimiento previo según el
                artículo 22.2 LSSI-CE (excepción de servicios expresamente solicitados).
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <h3 className="text-white font-medium">Funcionales / Preferencias</h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Recuerdan las preferencias del usuario (p. ej., las preferencias de
                cookies). Requieren consentimiento, que puede ser revocado en cualquier
                momento.
              </p>
            </div>
          </div>
          <p className="mt-3 text-slate-400 text-xs sm:text-sm">
            <strong className="text-slate-300">No utilizamos</strong> cookies de
            analítica, de publicidad comportamental, de redes sociales ni de terceros de
            ningún tipo.
          </p>
        </section>

        {/* 4. Cómo gestionar */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            4. Cómo gestionar y revocar el consentimiento
          </h2>
          <p className="mb-3">
            Puede gestionar sus preferencias en cualquier momento desde el panel que
            aparece al acceder al sitio, o bien revocar todo el consentimiento haciendo
            clic en el botón de abajo, lo que restablecerá el banner de cookies.
          </p>

          {/* Estado actual */}
          <div className="bg-slate-800/60 border border-white/8 rounded-lg p-4 mb-4">
            <p className="text-white text-sm font-medium mb-2">
              Estado actual de su consentimiento
            </p>
            {consent ? (
              <ul className="text-xs space-y-1 text-slate-400">
                <li>
                  Cookies esenciales:{" "}
                  <span className="text-green-400 font-medium">Aceptadas</span>
                </li>
                <li>
                  Cookies funcionales:{" "}
                  {consent.functional ? (
                    <span className="text-green-400 font-medium">Aceptadas</span>
                  ) : (
                    <span className="text-red-400 font-medium">Rechazadas</span>
                  )}
                </li>
                <li className="text-slate-500 mt-1">
                  Versión de consentimiento: {consent.version}
                </li>
              </ul>
            ) : (
              <p className="text-xs text-amber-400">
                No se ha registrado ningún consentimiento previo. El banner se mostrará en
                la próxima visita.
              </p>
            )}
          </div>

          {consent && (
            <button
              onClick={handleRevoke}
              className="flex items-center gap-2 px-4 py-2 bg-red-700/30 hover:bg-red-700/50 border border-red-500/30 text-red-400 hover:text-red-300 text-sm rounded-lg transition-colors"
            >
              <Trash2 size={15} />
              Revocar consentimiento y reiniciar preferencias
            </button>
          )}

          <h3 className="text-white font-medium mt-6 mb-2">
            Gestión desde el navegador
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mb-2">
            También puede eliminar o bloquear cookies directamente desde la configuración
            de su navegador:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs sm:text-sm pl-2">
            <li>
              <strong className="text-slate-300">Chrome:</strong> Configuración → Privacidad y
              seguridad → Cookies y otros datos de sitios
            </li>
            <li>
              <strong className="text-slate-300">Firefox:</strong> Opciones → Privacidad y
              seguridad → Cookies y datos del sitio
            </li>
            <li>
              <strong className="text-slate-300">Safari:</strong> Preferencias → Privacidad
            </li>
            <li>
              <strong className="text-slate-300">Edge:</strong> Configuración → Cookies y permisos
              del sitio
            </li>
          </ul>
          <p className="mt-2 text-slate-500 text-xs">
            Tenga en cuenta que bloquear las cookies técnicas puede impedir el correcto
            funcionamiento de la plataforma, incluyendo el inicio de sesión.
          </p>
        </section>

        {/* 5. Actualizaciones */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            5. Actualizaciones de esta política
          </h2>
          <p>
            Podemos actualizar esta Política de Cookies para reflejar cambios en las
            tecnologías que utilizamos o en la normativa aplicable. Cuando lo hagamos,
            modificaremos la fecha de "última actualización" que aparece al inicio de este
            documento. Si los cambios son significativos, le notificaremos mediante un
            nuevo banner de consentimiento o por correo electrónico.
          </p>
        </section>

        {/* 6. Contacto */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">6. Contacto</h2>
          <p>
            Para cualquier consulta relacionada con el uso de cookies, puede contactar con
            nuestro equipo en:{" "}
            <a
              href="mailto:privacidad@luxurycars.com"
              className="text-blue-400 hover:underline"
            >
              privacidad@luxurycars.com
            </a>
            .
          </p>
        </section>

      </div>
    </div>
  );
};

export default CookiePolicy;
