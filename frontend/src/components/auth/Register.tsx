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
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
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
        const provincesResponse = response.data.member ?? response.data["hydra:member"] ?? [];
        const data = provincesResponse.sort((a: Province, b: Province) =>
          a.name.localeCompare(b.name, "es")
        );
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

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑçÇ\s'\-]+$/;
  const phoneRegex = /^\+?[\d\s\-]{9,15}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanSurname = surname.trim().replace(/\s+/g, " ");
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    setName(cleanName);
    setSurname(cleanSurname);
    setPhone(cleanPhone);
    setEmail(cleanEmail);

    if (!nameRegex.test(cleanName)) {
      setError("El nombre solo puede contener letras.");
      return;
    }
    if (!nameRegex.test(cleanSurname)) {
      setError("Los apellidos solo pueden contener letras.");
      return;
    }
    if (!phoneRegex.test(cleanPhone)) {
      setError("El teléfono solo puede contener dígitos (9-15 caracteres).");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        email: cleanEmail,
        plainPassword: password,
        name: cleanName,
        surname: cleanSurname,
        phone: cleanPhone,
        province: selectedProvince,
      });

      const loginResponse = await loginUser(email, password);
      login(loginResponse.data.token);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { violations?: { message: string }[]; detail?: string } } };
      const violations = axiosErr.response?.data?.violations;
      if (violations && violations.length > 0) {
        setError(violations[0].message);
      } else {
        setError("Error al registrar. Inténtalo de nuevo.");
      }
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
                  onBlur={(e) => setName(e.target.value.trim().replace(/\s+/g, " "))}
                  className="auth-input-icon"
                  placeholder="Ej: John"
                  pattern="[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑçÇ\s'\-]+"
                  title="Solo letras, sin números ni símbolos"
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
                  onBlur={(e) => setSurname(e.target.value.trim().replace(/\s+/g, " "))}
                  className="auth-input"
                  placeholder="Ej: Doe"
                  pattern="[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑçÇ\s'\-]+"
                  title="Solo letras, sin números ni símbolos"
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
                  pattern="\+?[\d\s\-]{9,15}"
                  title="Solo dígitos, entre 9 y 15 caracteres"
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

          {/* Aceptación de política de privacidad — obligatoria por RGPD Art. 7 */}
          <div className="flex items-start gap-3 pt-1">
            <input
              id="accept-privacy"
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500 cursor-pointer"
              required
            />
            <label htmlFor="accept-privacy" className="text-slate-400 text-xs leading-relaxed cursor-pointer">
              He leído y acepto la{" "}
              <a
                href="/politica-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Política de Privacidad
              </a>{" "}
              y la{" "}
              <a
                href="/politica-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Política de Cookies
              </a>
              . Consiento el tratamiento de mis datos personales con las finalidades
              descritas en dichas políticas.{" "}
              <span className="text-red-400">*</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedProvince || !acceptedPrivacy}
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
