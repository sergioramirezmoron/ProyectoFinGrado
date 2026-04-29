import { Lock } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Lock size={28} className="text-blue-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Política de Privacidad
        </h1>
      </div>

      <p className="text-slate-400 text-sm mb-8">
        Última actualización: 21 de marzo de 2026
      </p>

      <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">

        {/* 1. Responsable del tratamiento */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            1. Responsable del tratamiento
          </h2>
          <p>
            En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo
            (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos
            Personales y garantía de los derechos digitales (LOPDGDD), le informamos de que sus
            datos personales serán tratados por:
          </p>
          <ul className="list-none space-y-1 pl-4 border-l-2 border-blue-500/30 ml-2 mt-3">
            <li><span className="text-slate-400">Responsable:</span> LuxuryCars, S.L.</li>
            <li><span className="text-slate-400">NIF:</span> B-12345678</li>
            <li>
              <span className="text-slate-400">Domicilio:</span> Paseo de la Castellana 123,
              28046 Madrid, España
            </li>
            <li>
              <span className="text-slate-400">Contacto DPD:</span>{" "}
              <a
                href="mailto:privacidad@luxurycars.com"
                className="text-blue-400 hover:underline"
              >
                privacidad@luxurycars.com
              </a>
            </li>
          </ul>
        </section>

        {/* 2. Datos que tratamos */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            2. Datos personales que tratamos
          </h2>
          <p className="mb-3">Tratamos los siguientes datos personales según la finalidad:</p>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <h3 className="text-white font-medium mb-2">Registro de cuenta de usuario</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Nombre, apellidos, dirección de correo electrónico, número de teléfono y
                provincia de residencia. Esta información es necesaria para crear y gestionar
                su cuenta en la plataforma.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <h3 className="text-white font-medium mb-2">Gestión de reservas</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Datos de identificación del usuario, vehículo seleccionado, fechas de
                inicio y fin, precio acordado y estado de la reserva. Necesarios para
                la ejecución del contrato de arrendamiento o compraventa.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <h3 className="text-white font-medium mb-2">Comunicaciones internas (chat)</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Contenido de los mensajes intercambiados entre el usuario y nuestro equipo
                a través del sistema de mensajería de la plataforma.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
              <h3 className="text-white font-medium mb-2">Datos de navegación técnicos</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Token de sesión cifrado (JWT) almacenado en el almacenamiento local del
                navegador, necesario para mantener la sesión autenticada. No se almacenan
                datos de navegación con fines analíticos o publicitarios.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Finalidades y base jurídica */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            3. Finalidades del tratamiento y base jurídica
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white py-2 pr-4 font-semibold">Finalidad</th>
                  <th className="text-left text-white py-2 pr-4 font-semibold">Base jurídica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 pr-4 text-slate-300">Gestión del registro y acceso a la plataforma</td>
                  <td className="py-3 text-slate-400">Art. 6.1.b RGPD — Ejecución de contrato</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-slate-300">Gestión de reservas de vehículos</td>
                  <td className="py-3 text-slate-400">Art. 6.1.b RGPD — Ejecución de contrato</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-slate-300">Atención al cliente y resolución de incidencias</td>
                  <td className="py-3 text-slate-400">Art. 6.1.b RGPD — Ejecución de contrato</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-slate-300">Cumplimiento de obligaciones legales</td>
                  <td className="py-3 text-slate-400">Art. 6.1.c RGPD — Obligación legal</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-slate-300">Prevención del fraude y seguridad del sistema</td>
                  <td className="py-3 text-slate-400">Art. 6.1.f RGPD — Interés legítimo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Destinatarios */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            4. Destinatarios y transferencias internacionales
          </h2>
          <p>
            Sus datos no serán cedidos a terceros salvo obligación legal o cuando sea
            estrictamente necesario para la prestación del servicio (por ejemplo, entidades
            financieras para el procesamiento de pagos o proveedores de servicios de
            alojamiento web). Dichos proveedores actúan en calidad de encargados del
            tratamiento y están sujetos a contratos de confidencialidad conforme al artículo
            28 del RGPD.
          </p>
          <p className="mt-2">
            No se realizan transferencias internacionales de datos a países fuera del
            Espacio Económico Europeo sin las garantías adecuadas establecidas en el
            Capítulo V del RGPD.
          </p>
        </section>

        {/* 5. Plazos de conservación */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            5. Plazos de conservación de los datos
          </h2>
          <ul className="space-y-2 text-slate-400">
            <li className="flex gap-2">
              <span className="text-blue-400 shrink-0">▸</span>
              <span>
                <strong className="text-white">Datos de la cuenta:</strong> durante la
                vigencia de la relación contractual y hasta 3 años después de la baja,
                para atender posibles reclamaciones.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400 shrink-0">▸</span>
              <span>
                <strong className="text-white">Datos de reservas:</strong> 5 años desde
                la fecha de la operación, en cumplimiento de las obligaciones fiscales y
                mercantiles establecidas en el Código de Comercio y la Ley General
                Tributaria.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400 shrink-0">▸</span>
              <span>
                <strong className="text-white">Mensajes de chat:</strong> 2 años desde
                su envío, salvo que sean necesarios para la resolución de reclamaciones
                pendientes.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400 shrink-0">▸</span>
              <span>
                <strong className="text-white">Token de sesión (JWT):</strong> el
                almacenamiento local del navegador se limpia automáticamente al cerrar
                sesión o transcurrido el período de expiración del token.
              </span>
            </li>
          </ul>
        </section>

        {/* 6. Derechos del usuario */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            6. Sus derechos como interesado
          </h2>
          <p className="mb-3">
            En virtud del RGPD y la LOPDGDD, usted tiene derecho a:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Acceso", desc: "Conocer qué datos tratamos sobre usted (Art. 15 RGPD)." },
              { title: "Rectificación", desc: "Solicitar la corrección de datos inexactos (Art. 16 RGPD)." },
              { title: "Supresión", desc: 'Solicitar el "derecho al olvido" cuando proceda (Art. 17 RGPD).' },
              { title: "Portabilidad", desc: "Recibir sus datos en formato estructurado (Art. 20 RGPD)." },
              { title: "Oposición", desc: "Oponerse al tratamiento basado en interés legítimo (Art. 21 RGPD)." },
              { title: "Limitación", desc: "Solicitar la restricción del tratamiento (Art. 18 RGPD)." },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="bg-slate-800/50 rounded-lg p-3 border border-white/5"
              >
                <p className="text-white text-sm font-medium mb-1">{title}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            Para ejercer sus derechos, puede enviar una solicitud escrita acompañada de
            copia de su documento de identidad a:{" "}
            <a
              href="mailto:privacidad@luxurycars.com"
              className="text-blue-400 hover:underline"
            >
              privacidad@luxurycars.com
            </a>
            . Dispone asimismo del derecho a presentar una reclamación ante la{" "}
            <strong className="text-white">
              Agencia Española de Protección de Datos (AEPD)
            </strong>{" "}
            —<em>www.aepd.es</em>— si considera que el tratamiento vulnera la normativa
            vigente.
          </p>
        </section>

        {/* 7. Seguridad */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            7. Medidas de seguridad
          </h2>
          <p>
            LuxuryCars, S.L. ha adoptado las medidas técnicas y organizativas necesarias
            para garantizar la seguridad e integridad de los datos personales, evitando su
            pérdida, alteración o acceso no autorizado. Entre ellas se incluyen: cifrado de
            contraseñas mediante algoritmo bcrypt, comunicaciones protegidas por TLS/HTTPS,
            autenticación mediante tokens JWT firmados con clave asimétrica RS256 y copias
            de seguridad automáticas de la base de datos.
          </p>
        </section>

        {/* 8. Modificaciones */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            8. Modificaciones de la política
          </h2>
          <p>
            LuxuryCars, S.L. se reserva el derecho a modificar la presente Política de
            Privacidad para adaptarla a cambios legislativos, jurisprudenciales o de práctica
            empresarial. Las modificaciones relevantes serán comunicadas a los usuarios
            registrados mediante correo electrónico o aviso en la plataforma.
          </p>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
