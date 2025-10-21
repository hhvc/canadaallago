import { useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const handleError = (error, defaultMessage) => {
    console.error("❌ Error:", error);
    return (error && error.message) || defaultMessage;
  };
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      throw new Error(
        handleError(error, "Error al iniciar sesión con Google.")
      );
    }
  };
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      return userCredential.user;
    } catch (error) {
      throw new Error(handleError(error, "Error al registrarse."));
    }
  };
  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error(handleError(error, "Error al iniciar sesión."));
    }
  };
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw new Error(
        handleError(error, "Error al enviar email de recuperación.")
      );
    }
  };

  // Carga del script enterprise (espera que index.html incluya site key; si no, intenta añadir uno genérico)
  const loadRecaptchaScript = () =>
    new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        return resolve(
          window.grecaptcha.enterprise ? "enterprise" : "standard"
        );
      }
      // Intento de cargar enterprise genérico (mejor tener site key en index.html)
      const src =
        "https://www.google.com/recaptcha/enterprise.js?render=explicit";
      const existing = Array.from(document.getElementsByTagName("script")).find(
        (s) => s.src && s.src.includes("recaptcha")
      );
      if (existing) {
        existing.addEventListener("load", () =>
          resolve(
            window.grecaptcha && window.grecaptcha.enterprise
              ? "enterprise"
              : "standard"
          )
        );
        existing.addEventListener("error", () =>
          reject(
            new Error("No se pudo cargar el script de reCAPTCHA Enterprise.")
          )
        );
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () =>
        resolve(
          window.grecaptcha && window.grecaptcha.enterprise
            ? "enterprise"
            : "standard"
        );
      script.onerror = () =>
        reject(
          new Error("No se pudo cargar el script de reCAPTCHA Enterprise.")
        );
      document.head.appendChild(script);
    });
  // setupPhoneAuth robusto: intenta varias formas de instanciar RecaptchaVerifier y logea detalles útiles
  const setupPhoneAuth = async (elementIdOrElement) => {
    try {
      if (!auth || typeof auth !== "object") {
        throw new Error(
          "La instancia de auth no está disponible. Revisa src/firebase/config.js"
        );
      }
      const mode = await loadRecaptchaScript();

      // confirmar que grecaptcha.enterprise está disponible cuando se espera enterprise
      if (
        mode === "enterprise" &&
        !(window.grecaptcha && window.grecaptcha.enterprise)
      ) {
        console.warn(
          "Se cargó enterprise.js pero window.grecaptcha.enterprise no está disponible."
        );
      }

      const container =
        typeof elementIdOrElement === "string"
          ? document.getElementById(elementIdOrElement)
          : elementIdOrElement;

      if (!container) {
        throw new Error("Contenedor de reCAPTCHA no encontrado.");
      }

      // reutilizar si ya existe
      if (window.recaptchaVerifier) {
        setRecaptchaVerifier(window.recaptchaVerifier);
        return window.recaptchaVerifier;
      }

      if (container instanceof HTMLElement) container.innerHTML = "";

      const params = { size: "invisible" };
      if (mode === "enterprise") {
        params.badge = "bottomright";
      }

      // Compatibilidad: algunos paquetes exponen la instancia real en auth._delegate
      const authForVerifier = auth && auth._delegate ? auth._delegate : auth;

      // DEBUG: dejar trazas que te ayudarán a diagnosticar (puedes quitar luego)
      console.debug("setupPhoneAuth: mode=", mode);
      console.debug(
        "setupPhoneAuth: auth typeof=",
        typeof auth,
        "authForVerifier typeof=",
        typeof authForVerifier
      );
      console.debug(
        "setupPhoneAuth: auth._delegate exists=",
        !!(auth && auth._delegate)
      );
      console.debug(
        "setupPhoneAuth: window._firebaseAuth=",
        typeof window !== "undefined" ? window._firebaseAuth : undefined
      );

      const verifierTarget =
        typeof elementIdOrElement === "string" ? elementIdOrElement : container;

      // Intentos flexibles de construcción del RecaptchaVerifier
      let verifier = null;
      const attempts = [
        // forma recomendada: (containerOrId, params, auth)
        () => new RecaptchaVerifier(verifierTarget, params, authForVerifier),
        // alternativa (alguna guía muestra (auth, containerOrId, params))
        () => new RecaptchaVerifier(authForVerifier, verifierTarget, params),
        // fallback: sin pasar auth (que permita al SDK usar default)
        () => new RecaptchaVerifier(verifierTarget, params),
      ];

      let lastError = null;
      for (const create of attempts) {
        try {
          verifier = create();
          break;
        } catch (err) {
          lastError = err;
          console.warn(
            "setupPhoneAuth: intento de RecaptchaVerifier falló:",
            err
          );
        }
      }

      if (!verifier) {
        // Construcción fallida en todos los intentos: devolver error claro
        const errMsg =
          lastError?.message ||
          "No se pudo crear RecaptchaVerifier con las variantes probadas.";
        throw new Error(errMsg);
      }

      // Guardar globalmente
      window.recaptchaVerifier = verifier;

      // render -> widgetId (no se usa) - importante para inicializar internals
      await verifier.render();

      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (error) {
      // Incluir detalles extra si el error es de tipo interno de RecaptchaVerifier
      const detailed = error && error.message ? error.message : error;
      throw new Error(
        handleError(
          error,
          `Error al inicializar reCAPTCHA (Enterprise). Detalle: ${detailed}`
        )
      );
    }
  };
  const sendSMSCode = async (phoneNumber) => {
    try {
      const cleanedPhone = phoneNumber.replace(/\s+/g, "");
      if (!cleanedPhone.startsWith("+")) {
        throw new Error(
          "El número debe incluir el código de país (ej: +5493512525252)."
        );
      }
      const currentVerifier = recaptchaVerifier || window.recaptchaVerifier;
      if (!currentVerifier) {
        throw new Error(
          "Verificación de seguridad no configurada. Llama a setupPhoneAuth antes."
        );
      }

      // Usar la misma instancia interna de auth que se pudo usar para crear el verifier
      const authForCall = auth && auth._delegate ? auth._delegate : auth;

      // Intentar obtener/ejecutar token reCAPTCHA explícitamente para diagnosticar timeout
      try {
        // algunos bundles exponen verify(), otros render/execute; probamos verify si existe
        if (typeof currentVerifier.verify === "function") {
          const token = await currentVerifier.verify();
          console.debug(
            "sendSMSCode: token obtenido desde verifier.verify():",
            token
          );
        } else if (
          window.grecaptcha &&
          window.grecaptcha.enterprise &&
          typeof window.grecaptcha.enterprise.execute === "function"
        ) {
          // si la API enterprise está disponible, intentar execute para el widget si existe
          try {
            const executeResult = await window.grecaptcha.enterprise.execute();
            console.debug(
              "sendSMSCode: grecaptcha.enterprise.execute() result:",
              executeResult
            );
          } catch (execErr) {
            console.debug(
              "sendSMSCode: grecaptcha.enterprise.execute() fallo:",
              execErr
            );
          }
        } else {
          console.debug(
            "sendSMSCode: no se pudo ejecutar verify/execute; se delega a signInWithPhoneNumber."
          );
        }
      } catch (verifyErr) {
        console.warn(
          "sendSMSCode: fallo al verificar/ejecutar reCAPTCHA (continuando):",
          verifyErr
        );
      }

      // Llamada principal (Firebase maneja internamente la interacción con reCAPTCHA)
      const result = await signInWithPhoneNumber(
        authForCall,
        cleanedPhone,
        currentVerifier
      );
      setConfirmationResult(result);
      return true;
    } catch (error) {
      // Mejorar mensaje en caso de timeout de reCAPTCHA
      const msg =
        error &&
        error.message &&
        error.message.toLowerCase().includes("timeout")
          ? "Timeout de reCAPTCHA: revisa que la site key enterprise esté bien configurada en Google Cloud y en Firebase, y que el dominio esté autorizado. Prueba en ventana incógnita."
          : (error && error.message) || "Error al enviar SMS.";
      throw new Error(handleError(error, msg));
    }
  };
  const verifySMSCode = async (code) => {
    try {
      if (!confirmationResult) {
        throw new Error("No hay una verificación de teléfono en curso.");
      }
      const result = await confirmationResult.confirm(code.trim());
      setConfirmationResult(null);
      return result.user;
    } catch (error) {
      throw new Error(handleError(error, "Error al verificar el código."));
    }
  };
  const cancelPhoneAuth = () => {
    try {
      if (recaptchaVerifier && typeof recaptchaVerifier.clear === "function") {
        recaptchaVerifier.clear();
      }
    } catch {
      // ignore
    }
    setRecaptchaVerifier(null);
    try {
      if (
        window.recaptchaVerifier &&
        typeof window.recaptchaVerifier.clear === "function"
      ) {
        window.recaptchaVerifier.clear();
      }
      delete window.recaptchaVerifier;
    } catch {
      // ignore
    }

    setConfirmationResult(null);
  };
  const logout = async () => {
    cancelPhoneAuth();
    await signOut(auth);
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    return () => {
      try {
        if (
          window.recaptchaVerifier &&
          typeof window.recaptchaVerifier.clear === "function"
        ) {
          window.recaptchaVerifier.clear();
        }
        delete window.recaptchaVerifier;
      } catch {
        // ignore
      }
    };
  }, []);
  const value = {
    user,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    setupPhoneAuth,
    sendSMSCode,
    verifySMSCode,
    cancelPhoneAuth,
    logout,
    loading,
    confirmationResult,
  };
  return (
    <AuthContext.Provider value={value}>
      {" "}
      {!loading && children}{" "}
    </AuthContext.Provider>
  );
};
