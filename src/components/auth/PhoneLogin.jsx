import { useState, useEffect, useRef } from "react";
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

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // limpiar cualquier verificador al desmontar
      try {
        cancelPhoneAuth();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== 1) return;

    let initializing = true;

    const initializeRecaptcha = async () => {
      try {
        if (!mountedRef.current || !initializing) return;

        setMessage("Configurando verificación de seguridad...");
        setRecaptchaReady(false);

        // Pequeña espera para asegurar que el DOM se estabilice (evita problemas en StrictMode)
        await new Promise((r) => setTimeout(r, 300));

        if (!mountedRef.current || !initializing) return;

        await setupPhoneAuth("recaptcha-container");

        if (mountedRef.current && initializing) {
          setRecaptchaReady(true);
          setMessage("");
          console.log("✅ reCAPTCHA inicializado correctamente");
        }
      } catch (error) {
        console.error("❌ Error inicializando reCAPTCHA:", error);
        if (mountedRef.current && initializing) {
          setMessage(
            `Error al inicializar verificación de seguridad: ${
              error?.message || error
            }. Recarga la página.`
          );
          setRecaptchaReady(false);
        }
      }
    };

    initializeRecaptcha();

    return () => {
      initializing = false;
    };
  }, [step, setupPhoneAuth, cancelPhoneAuth]);

  useEffect(() => {
    if (confirmationResult && step === 1) {
      setStep(2);
    }
  }, [confirmationResult, step]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!recaptchaReady) {
      setMessage("Verificación no está lista. Espera un momento.");
      return;
    }

    if (!phone || !phone.startsWith("+")) {
      setMessage("El número debe incluir código de país (ej: +5493512525252)");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendSMSCode(phone);
      setMessage("✓ Código enviado por SMS. Revisa tu teléfono.");
    } catch (error) {
      console.error("❌ sendSMSCode:", error);
      setMessage(`✗ ${error?.message || "Error al enviar SMS."}`);
      // Forzar re-inicialización del reCAPTCHA en caso de fallo
      setRecaptchaReady(false);
      // intentar reconfigurar (no bloqueante)
      try {
        await setupPhoneAuth("recaptcha-container");
        setRecaptchaReady(true);
      } catch {
        setRecaptchaReady(false);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      await verifySMSCode(code);
      setMessage("✓ Verificación exitosa. Redirigiendo...");
    } catch (error) {
      console.error("❌ verifySMSCode:", error);
      setMessage(`✗ ${error?.message || "Error al verificar el código."}`);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    try {
      cancelPhoneAuth();
    } catch {
      // ignore
    }
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
              disabled={loading}
            />
            <small className="form-text text-muted">
              Ingresa tu número con código de país. Ejemplo: +5493512525252
            </small>
          </div>

          {/* Contenedor reCAPTCHA (invisible visualmente, pero presente en el DOM) */}
          <div
            id="recaptcha-container"
            style={{
              position: "absolute",
              left: "-9999px",
              width: 1,
              height: 1,
              overflow: "hidden",
            }}
          />

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
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
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
