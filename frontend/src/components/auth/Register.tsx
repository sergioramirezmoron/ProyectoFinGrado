import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loginUser, registerUser } from "../../services/authService";
import type { Province } from "../../types/provinces";
import { getProvinces } from "../../services/provinceService";

const Register = () => {
  const navigate = useNavigate();
  const { login, isAdmin, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    } else if (isAuthenticated) {
      navigate("/");
    }
  }, [isAdmin, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await getProvinces();
        const data = response.data.member || [];
        setProvinces(data);
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
      await registerUser({
        email,
        plainPassword: password,
        name,
        surname,
        phone,
        province: selectedProvince,
      });

      const loginResponse = await loginUser(email, password);
      login(loginResponse.data.token);
      navigate("/");
    } catch (err) {
      setError(`Error al registrar ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">
        LUXURY<span className="text-blue-500">CARS</span>
      </Link>

      <div className="auth-card-wide">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">
            Únete al club exclusivo y gestiona tus reservas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {error && (
            <div className="auth-error items-start">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label">Nombre</label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input-icon"
                  placeholder="Ej: John"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Apellidos</label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="auth-input"
                  placeholder="Ej: Doe"
                  required
                />
              </div>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <div className="auth-input-icon-left">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-icon"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label">Teléfono</label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input-icon"
                  placeholder="600 000 000"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Provincia</label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon-left z-10 pointer-events-none">
                  <MapPin size={18} />
                </div>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="auth-input-icon appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Selecciona...
                  </option>
                  {provinces.map((prov) => (
                    <option key={prov["@id"]} value={prov["@id"]}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <div className="auth-input-wrapper">
              <div className="auth-input-icon-left">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-icon"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedProvince}
            className="auth-btn-primary mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={18} />
                Completar Registro
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <p className="text-slate-400 text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="auth-link">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
