import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter flex items-center gap-2 text-white"
          >
            LUXURY<span className="text-blue-500">CARS</span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            La experiencia definitiva en conducción de lujo. Venta y alquiler de
            vehículos exclusivos para clientes exigentes.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="hover:text-blue-400 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-sky-400 transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-6 text-lg">Explorar</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-400 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/venta"
                className="hover:text-blue-400 transition-colors"
              >
                Comprar Vehículo
              </Link>
            </li>
            <li>
              <Link
                to="/alquiler"
                className="hover:text-blue-400 transition-colors"
              >
                Alquilar Vehículo
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="hover:text-blue-400 transition-colors"
              >
                Área Privada
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-bold mb-6 text-lg">Legal</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/aviso-legal"
                className="hover:text-blue-400 transition-colors"
              >
                Aviso Legal
              </Link>
            </li>
            <li>
              <Link
                to="/privacidad"
                className="hover:text-blue-400 transition-colors"
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                to="/cookies"
                className="hover:text-blue-400 transition-colors"
              >
                Política de Cookies
              </Link>
            </li>
            <li>
              <Link
                to="/condiciones"
                className="hover:text-blue-400 transition-colors"
              >
                Términos y Condiciones
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold mb-6 text-lg">Contacto</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 mt-1" />
              <span>
                Paseo de la Castellana 123,
                <br />
                28046 Madrid, España
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-blue-500" />
              <span>+34 912 345 678</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-blue-500" />
              <span>contacto@luxurycars.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <p>&copy; {currentYear} LuxuryCars. Todos los derechos reservados.</p>
        <p className="mt-2 md:mt-0">Diseñado para amantes del motor.</p>
      </div>
    </footer>
  );
};

export default Footer;
