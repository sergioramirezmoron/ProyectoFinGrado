import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">

          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold tracking-tighter flex items-center gap-1 text-white"
            >
              LUXURY<span className="text-blue-500">CARS</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              La experiencia definitiva en conducción de lujo. Venta y alquiler de
              vehículos exclusivos para clientes exigentes.
            </p>
            <div className="flex space-x-4 pt-1">
              <a href="#" aria-label="Síguenos en Facebook" className="hover:text-blue-400 transition-colors">
                <Facebook size={19} aria-hidden="true" />
              </a>
              <a href="#" aria-label="Síguenos en Instagram" className="hover:text-purple-400 transition-colors">
                <Instagram size={19} aria-hidden="true" />
              </a>
              <a href="#" aria-label="Síguenos en Twitter / X" className="hover:text-sky-400 transition-colors">
                <Twitter size={19} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Explorar</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              {[
                { to: "/", label: "Inicio" },
                { to: "/venta", label: "Comprar Vehículo" },
                { to: "/alquiler", label: "Alquilar Vehículo" },
                { to: "/admin", label: "Área Privada" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-blue-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Contacto</h3>
            <ul className="space-y-3 sm:space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={17} className="text-blue-500 mt-0.5 shrink-0" />
                <span>Paseo de la Castellana 123,<br />28046 Madrid, España</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={17} className="text-blue-500 shrink-0" />
                <span>+34 912 345 678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={17} className="text-blue-500 shrink-0" />
                <span>contacto@luxurycars.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-3">
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-xs text-slate-400">
            <Link to="/aviso-legal" className="hover:text-slate-200 transition-colors">
              Aviso legal
            </Link>
            <Link to="/politica-privacidad" className="hover:text-slate-200 transition-colors">
              Política de privacidad
            </Link>
            <Link to="/politica-cookies" className="hover:text-slate-200 transition-colors">
              Política de cookies
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
            <p>&copy; {currentYear} LuxuryCars, S.L. · NIF B-12345678 · Todos los derechos reservados.</p>
            <p>Diseñado para amantes del motor.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
