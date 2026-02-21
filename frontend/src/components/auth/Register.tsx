import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Loader2, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

// Interfaz para las provincias que vienen del backend
interface Province {
  "@id": string;
  id: number;
  name: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { login, isAdmin, isAuthenticated } = useAuth();

  // Estados del formulario
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(""); // Guardará el IRI (ej: /api/provinces/1)

  // Estado para cargar las provincias
  const [provinces, setProvinces] = useState<Province[]>([]);
  
  // Estados de control
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    } else if (isAuthenticated) {
      navigate("/");
    }
  }, [isAdmin, isAuthenticated, navigate]);

  // Cargar Provincias al montar el componente
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await api.get("/provinces");
        const data = response.data.member || [];
        setProvinces(data);
        // Seleccionar la primera por defecto si hay datos
        if (data.length > 0) {
          setSelectedProvince(data[0]["@id"]);
        }
      } catch (err) {
        console.error("Error cargando provincias", err);
      }
    };
    fetchProvinces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/users", {
        email: email,
        plainPassword: password,
        name: name,
        surname: surname,
        phone: phone,
        province: selectedProvince,
      });

      const loginResponse = await api.post("/login_check", {
        email: email,
        password: password, 
      });

      login(loginResponse.data.token);
      navigate("/");

    } catch (err) {
      setError(`Error al registrar ${err}`)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      
      <Link to="/" className="text-2xl font-bold tracking-tighter text-white mb-8 hover:scale-105 transition-transform">
        LUXURY<span className="text-blue-500">CARS</span>
      </Link>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Crear Cuenta
          </h1>
          <p className="text-slate-400 text-sm">
            Únete al club exclusivo y gestiona tus reservas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Fila: Nombre y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                  placeholder="Ej: John"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">
                Apellidos
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                  placeholder="Ej: Doe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          {/* Fila: Teléfono y Provincia */}
          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                  placeholder="600 000 000"
                  required
                />
              </div>
            </div>

            {/* Provincia */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">
                Provincia
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10 pointer-events-none">
                  <MapPin size={18} />
                </div>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Selecciona...</option>
                  {provinces.map((prov) => (
                    <option key={prov["@id"]} value={prov["@id"]}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase ml-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-sm"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading || !selectedProvince}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={18} /> Completar Registro
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-slate-400 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline transition-all">
                    Inicia Sesión
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;