import { Shield } from "lucide-react";

const LegalNotice = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={28} className="text-blue-400" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Aviso Legal</h1>
      </div>

      <p className="text-slate-400 text-sm mb-8">
        Última actualización: 21 de marzo de 2026
      </p>

      <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">

        {/* 1. Identificación del titular */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            1. Identificación del titular del sitio web
          </h2>
          <p className="mb-2">
            En cumplimiento de lo dispuesto en el artículo 10 de la Ley 34/2002, de 11 de julio,
            de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se
            facilitan los datos identificativos del titular:
          </p>
          <ul className="list-none space-y-1 pl-4 border-l-2 border-blue-500/30 ml-2">
            <li><span className="text-slate-400">Denominación social:</span> LuxuryCars, S.L.</li>
            <li><span className="text-slate-400">NIF:</span> B-12345678</li>
            <li>
              <span className="text-slate-400">Domicilio social:</span> Paseo de la Castellana 123,
              28046 Madrid, España
            </li>
            <li>
              <span className="text-slate-400">Inscrita en el Registro Mercantil de Madrid,</span>{" "}
              Tomo 12345, Folio 67, Hoja M-123456
            </li>
            <li>
              <span className="text-slate-400">Teléfono:</span> +34 912 345 678
            </li>
            <li>
              <span className="text-slate-400">Correo electrónico:</span>{" "}
              <a
                href="mailto:contacto@luxurycars.com"
                className="text-blue-400 hover:underline"
              >
                contacto@luxurycars.com
              </a>
            </li>
          </ul>
        </section>

        {/* 2. Objeto */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            2. Objeto y ámbito de aplicación
          </h2>
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web{" "}
            <strong className="text-white">www.luxurycars.com</strong> (en adelante, "el Sitio
            Web") titularidad de LuxuryCars, S.L. El acceso a este sitio implica la aceptación
            plena y sin reservas de las presentes condiciones legales.
          </p>
          <p className="mt-2">
            LuxuryCars, S.L. se reserva el derecho a modificar unilateralmente, en cualquier
            momento y sin previo aviso, la presentación y configuración del Sitio Web, así como
            los presentes términos y condiciones legales.
          </p>
        </section>

        {/* 3. Propiedad intelectual */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            3. Propiedad intelectual e industrial
          </h2>
          <p>
            Todos los contenidos del Sitio Web —incluyendo, a título enunciativo y no limitativo,
            textos, fotografías, gráficos, imágenes, iconos, tecnología, software, así como el
            diseño gráfico y los códigos fuente— son propiedad intelectual de LuxuryCars, S.L. o
            de terceros que han autorizado su uso, y se encuentran protegidos por las leyes
            nacionales e internacionales de propiedad intelectual e industrial.
          </p>
          <p className="mt-2">
            Queda expresamente prohibida la reproducción, distribución, comunicación pública,
            transformación o cualquier otra forma de explotación de dichos contenidos sin la
            autorización expresa y por escrito de LuxuryCars, S.L.
          </p>
          <p className="mt-4 text-slate-400">
            <span className="text-slate-300 font-medium">Créditos fotográficos:</span> Las
            fotografías de los vehículos mostradas en este sitio web han sido obtenidas de{" "}
            <a
              href="https://olympcars.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              olympcars.com
            </a>
            . LuxuryCars, S.L. reconoce los derechos de imagen de los propietarios originales de
            dichas fotografías y las utiliza únicamente con fines ilustrativos y demostrativos.
          </p>
        </section>

        {/* 4. Condiciones de acceso */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            4. Condiciones de acceso y uso
          </h2>
          <p className="mb-2">
            El usuario se compromete a hacer un uso adecuado de los contenidos y servicios
            ofrecidos a través del Sitio Web, y en particular a no emplearlos para:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li>
              Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden
              público.
            </li>
            <li>
              Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico o que
              atenten contra la dignidad de las personas.
            </li>
            <li>
              Provocar daños en los sistemas físicos y lógicos del Sitio Web o de sus proveedores.
            </li>
            <li>
              Introducir virus informáticos o cualesquiera otros sistemas físicos o lógicos que
              produzcan daños en los sistemas de LuxuryCars, S.L.
            </li>
          </ul>
        </section>

        {/* 5. Exclusión de responsabilidad */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            5. Exclusión de responsabilidad
          </h2>
          <p className="mb-2">
            LuxuryCars, S.L. no se hace responsable de los daños y perjuicios que pudieran
            derivarse de:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li>
              Interferencias, interrupciones, fallos, omisiones, averías telefónicas, retrasos o
              bloqueos causados por deficiencias en la red de Internet.
            </li>
            <li>
              Intromisiones ilegítimas mediante el uso de programas maliciosos de cualquier tipo.
            </li>
            <li>
              El mal uso que los usuarios puedan hacer de los contenidos incluidos en el Sitio Web.
            </li>
            <li>
              Errores u omisiones en los contenidos del Sitio Web.
            </li>
          </ul>
        </section>

        {/* 6. Hiperenlaces */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">6. Hiperenlaces</h2>
          <p>
            El Sitio Web puede contener hipervínculos o enlaces a otros sitios web. LuxuryCars,
            S.L. no ejerce ningún tipo de control sobre dichos sitios y no asume responsabilidad
            alguna por los contenidos, uso de datos personales u otras cuestiones relativas a los
            mismos. El usuario acepta que LuxuryCars, S.L. no es responsable de ningún perjuicio
            derivado del acceso o uso de tales sitios externos.
          </p>
        </section>

        {/* 7. Legislación aplicable */}
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">
            7. Legislación aplicable y fuero
          </h2>
          <p>
            Las presentes condiciones se rigen e interpretan conforme a la legislación española.
            Para la resolución de cualquier controversia derivada del uso del Sitio Web, las partes
            se someten, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, a
            la jurisdicción de los Juzgados y Tribunales de la ciudad de Madrid.
          </p>
          <p className="mt-2 text-slate-400">
            Normativa aplicable: Ley 34/2002 (LSSI-CE), Real Decreto Legislativo 1/1996
            (Propiedad Intelectual), Ley Orgánica 3/2018 (LOPDGDD) y Reglamento (UE) 2016/679
            (RGPD).
          </p>
        </section>

      </div>
    </div>
  );
};

export default LegalNotice;
