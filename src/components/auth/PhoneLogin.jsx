import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/useAuth";

const PhoneLogin = ({ onSwitchToEmail, onSwitchToGoogle }) => {
  const {
    setupPhoneAuth,
    sendSMSCode,
    verifySMSCode,
    cancelPhoneAuth,
    confirmationResult,
  } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    if (step === 1) {
      const initializeRecaptcha = async () => {
        try {
          setMessage("Inicializando reCAPTCHA...");
          await setupPhoneAuth("recaptcha-container");
          setRecaptchaReady(true);
          setMessage("");
        } catch (error) {
          console.error("Error inicializando reCAPTCHA:", error);
          setMessage(`Error: ${error.message}. Recarga la página.`);
        }
      };

      initializeRecaptcha();
    }
  }, [step, setupPhoneAuth]);

  useEffect(() => {
    if (confirmationResult && step === 1) {
      setStep(2);
    }
  }, [confirmationResult, step]);

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!recaptchaReady) {
      setMessage("reCAPTCHA no está listo. Espera un momento.");
      return;
    }

    // Validar formato del número
    if (!phone.startsWith("+")) {
      setMessage("El número debe incluir código de país (ej: +5493512525252)");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendSMSCode(phone);
      setMessage("✓ Código enviado por SMS. Revisa tu teléfono.");
    } catch (error) {
      setMessage(`✗ ${error.message}`);
      setRecaptchaReady(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await verifySMSCode(code);
      setMessage("✓ Verificación exitosa. Redirigiendo...");
      // Cerrar modal después de éxito (manejado por el componente padre)
    } catch (error) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    cancelPhoneAuth();
    setStep(1);
    setCode("");
    setMessage("");
    setRecaptchaReady(false);
  };

  return (
    <div>
      <h5>Iniciar con Teléfono</h5>

      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <div className="mb-3">
            <input
              type="tel"
              className="form-control"
              placeholder="+5493512525252"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading || !recaptchaReady}
            />
            <small className="form-text text-muted">
              Ingresa tu número con código de país. Ejemplo: +5493512525252
            </small>
          </div>

          <div id="recaptcha-container" className="mb-3"></div>

          {!recaptchaReady && !message && (
            <div className="alert alert-warning">Cargando reCAPTCHA...</div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !recaptchaReady || !phone}
          >
            {loading ? "Enviando código..." : "Enviar código por SMS"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-3">
            <p>
              Verificando: <strong>{phone}</strong>
            </p>
            <input
              type="text"
              className="form-control"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} // Solo números
              required
              maxLength={6}
              disabled={loading}
            />
            <small className="form-text text-muted">
              Ingresa el código de 6 dígitos que recibiste por SMS
            </small>
          </div>
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>
          <button
            type="button"
            className="btn btn-link w-100"
            onClick={handleBackToPhone}
            disabled={loading}
          >
            ← Cambiar número
          </button>
        </form>
      )}

      <div className="mt-3">
        <button
          onClick={onSwitchToEmail}
          className="btn btn-outline-secondary w-100 mb-2"
          disabled={loading}
        >
          Usar email
        </button>
        <button
          onClick={onSwitchToGoogle}
          className="btn btn-outline-primary w-100"
          disabled={loading}
        >
          Continuar con Google
        </button>
      </div>

      {message && (
        <div
          className={`alert ${
            message.includes("✗")
              ? "alert-danger"
              : message.includes("✓")
              ? "alert-success"
              : "alert-info"
          } mt-3`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default PhoneLogin;
