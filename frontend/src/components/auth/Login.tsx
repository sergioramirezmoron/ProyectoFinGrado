import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { loginUser } from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email, password);

      login(response.data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">
        LUXURY<span className="text-blue-500">CARS</span>
      </Link>

      <div className="auth-card">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="auth-title">Bienvenido</h1>
          <p className="auth-subtitle">
            Accede al panel de gestión de Luxury Cars
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="auth-error">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label-normal">Email</label>
            <div className="auth-input-wrapper">
              <div className="auth-input-icon-left">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-icon"
                placeholder="email@email.com"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="auth-field">
            <label className="auth-label-normal">Contraseña</label>
            <div className="auth-input-wrapper">
              <div className="auth-input-icon-left">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-icon"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <p className="text-slate-400 text-sm">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="auth-link">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
