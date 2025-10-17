import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth/useAuth";

const PhoneLogin = ({ onSwitchToEmail, onSwitchToGoogle }) => {
  const {
    setupPhoneAuth,
    sendSMSCode,
    verifySMSCode,
    cancelPhoneAuth,
    confirmationResult, // Esta variable sí se usa en el renderizado condicional
  } = useAuth();

  const [step, setStep] = useState(1); // 1: input phone, 2: verify code
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (step === 1) {
      setupPhoneAuth("recaptcha-container");
    }
  }, [step, setupPhoneAuth]);

  // Si confirmationResult existe, estamos en paso 2
  useEffect(() => {
    if (confirmationResult && step === 1) {
      setStep(2);
    }
  }, [confirmationResult, step]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await sendSMSCode(phone);
      setMessage("Código enviado por SMS");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
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
      setMessage("Verificación exitosa");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    cancelPhoneAuth();
    setStep(1);
    setCode("");
    setMessage("");
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
              placeholder="+54 351 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              Ingresa tu número con código de país
            </small>
          </div>

          <div id="recaptcha-container" className="mb-3"></div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Código SMS"}
          </button>
        </form>
      )}

      {(step === 2 || confirmationResult) && (
        <form onSubmit={handleVerifyCode}>
          <div className="mb-3">
            <p>
              Verificando: <strong>{phone}</strong>
            </p>
            <input
              type="text"
              className="form-control"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              Ingresa el código que recibiste por SMS
            </small>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Verificar Código"}
          </button>
          <button
            type="button"
            className="btn btn-link w-100"
            onClick={handleBackToPhone}
          >
            Cambiar número de teléfono
          </button>
        </form>
      )}

      <div className="mt-3">
        <button
          onClick={onSwitchToEmail}
          className="btn btn-outline-secondary w-100 mb-2"
        >
          Usar email
        </button>
        <button
          onClick={onSwitchToGoogle}
          className="btn btn-outline-primary w-100"
        >
          Continuar con Google
        </button>
      </div>

      {message && (
        <div
          className={`alert ${
            message.includes("Error") ? "alert-danger" : "alert-info"
          } mt-3`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default PhoneLogin;
