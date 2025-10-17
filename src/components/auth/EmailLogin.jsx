import { useState } from "react";
import { useAuth } from "../../context/auth/useAuth";

const EmailLogin = ({ onSwitchToPhone, onSwitchToGoogle }) => {
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isResetting) {
        await resetPassword(formData.email);
        setMessage("Se ha enviado un email para restablecer tu contraseña");
        setIsResetting(false);
      } else if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
        setMessage("Inicio de sesión exitoso");
      } else {
        await signUpWithEmail(
          formData.email,
          formData.password,
          formData.displayName
        );
        setMessage("Registro exitoso");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isResetting) {
    return (
      <div>
        <h5>Recuperar Contraseña</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Email de Recuperación"}
          </button>
          <button
            type="button"
            className="btn btn-link w-100"
            onClick={() => setIsResetting(false)}
          >
            Volver al login
          </button>
        </form>
        {message && <div className="alert alert-info mt-3">{message}</div>}
      </div>
    );
  }

  return (
    <div>
      <h5>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h5>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-3">
            <input
              type="text"
              name="displayName"
              className="form-control"
              placeholder="Nombre completo"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading
            ? "Procesando..."
            : isLogin
            ? "Iniciar Sesión"
            : "Registrarse"}
        </button>
      </form>

      <div className="mt-3 text-center">
        <button
          type="button"
          className="btn btn-link"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
        {isLogin && (
          <button
            type="button"
            className="btn btn-link d-block w-100"
            onClick={() => setIsResetting(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </div>

      <div className="mt-3">
        <button
          onClick={onSwitchToPhone}
          className="btn btn-outline-secondary w-100 mb-2"
        >
          Usar teléfono
        </button>
        <button
          onClick={onSwitchToGoogle}
          className="btn btn-outline-primary w-100"
        >
          Continuar con Google
        </button>
      </div>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default EmailLogin;
