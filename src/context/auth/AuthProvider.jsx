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

  // Google Authentication
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  // Email/Password Registration
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrarse:", error);
      throw error;
    }
  };

  // Email/Password Login
  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Error al enviar email de recuperación:", error);
      throw error;
    }
  };

  // Phone Authentication Setup - CORREGIDA
  const setupPhoneAuth = (elementId) => {
    return new Promise((resolve, reject) => {
      try {
        // Limpiar cualquier instancia previa
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
          setRecaptchaVerifier(null);
        }

        // Esperar a que el DOM esté listo
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (!element) {
            reject(new Error(`Elemento con ID ${elementId} no encontrado`));
            return;
          }

          try {
            // Crear el verificador de reCAPTCHA
            const verifier = new RecaptchaVerifier(
              element,
              {
                size: "normal",
                callback: () => {
                  console.log("reCAPTCHA resuelto - listo para enviar SMS");
                },
                "expired-callback": () => {
                  console.log("reCAPTCHA expirado");
                  if (recaptchaVerifier) {
                    recaptchaVerifier.clear();
                    setRecaptchaVerifier(null);
                  }
                },
              },
              auth
            );

            setRecaptchaVerifier(verifier);
            resolve(verifier);
          } catch (error) {
            console.error("Error creando reCAPTCHA:", error);
            reject(error);
          }
        }, 100);
      } catch (error) {
        console.error("Error en setupPhoneAuth:", error);
        reject(error);
      }
    });
  };

  // Send SMS Code - CORREGIDA
  const sendSMSCode = async (phoneNumber) => {
    try {
      // Validar formato del número
      const cleanedPhone = phoneNumber.replace(/\s+/g, "");
      if (!cleanedPhone.startsWith("+")) {
        throw new Error(
          "El número debe incluir código de país (ej: +5493512525252)"
        );
      }

      if (cleanedPhone.length < 10) {
        throw new Error("El número de teléfono es demasiado corto");
      }

      if (!recaptchaVerifier) {
        throw new Error(
          "reCAPTCHA no está configurado. Intenta recargar la página."
        );
      }

      console.log("Enviando SMS a:", cleanedPhone);

      // Verificar que reCAPTCHA esté listo
      try {
        await recaptchaVerifier.verify();
      } catch (recaptchaError) {
        console.error("Error verificando reCAPTCHA:", recaptchaError);
        throw new Error(
          "reCAPTCHA no está listo. Completa la verificación primero."
        );
      }

      const result = await signInWithPhoneNumber(
        auth,
        cleanedPhone,
        recaptchaVerifier
      );

      setConfirmationResult(result);
      console.log("SMS enviado correctamente");
      return true;
    } catch (error) {
      console.error("Error detallado al enviar SMS:", error);

      // Limpiar reCAPTCHA en caso de error
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (clearError) {
          console.log("Error limpiando reCAPTCHA:", clearError);
        }
        setRecaptchaVerifier(null);
      }

      // Mensajes de error más específicos
      let errorMessage = "Error al enviar SMS. Intenta nuevamente.";

      if (error.code === "auth/invalid-phone-number") {
        errorMessage =
          "Número de teléfono inválido. Usa formato: +5493512525252";
      } else if (error.code === "auth/quota-exceeded") {
        errorMessage = "Límite de SMS excedido. Intenta más tarde.";
      } else if (error.code === "auth/captcha-check-failed") {
        errorMessage =
          "Error con reCAPTCHA. Recarga la página e intenta nuevamente.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Espera unos minutos.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  // Verify SMS Code - CORREGIDA
  const verifySMSCode = async (code) => {
    try {
      if (!confirmationResult) {
        throw new Error(
          "No hay una verificación de teléfono en curso. Envía un SMS primero."
        );
      }

      // Limpiar espacios y validar código
      const cleanedCode = code.replace(/\s+/g, "");
      if (cleanedCode.length !== 6) {
        throw new Error("El código debe tener 6 dígitos");
      }

      console.log("Verificando código:", cleanedCode);
      const result = await confirmationResult.confirm(cleanedCode);

      // Limpiar estados después de verificación exitosa
      setConfirmationResult(null);
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (clearError) {
          console.log("Error limpiando reCAPTCHA:", clearError);
        }
        setRecaptchaVerifier(null);
      }

      console.log("Código verificado correctamente");
      return result.user;
    } catch (error) {
      console.error("Error al verificar código:", error);

      let errorMessage = "Error al verificar código. Intenta nuevamente.";

      if (error.code === "auth/invalid-verification-code") {
        errorMessage =
          "Código inválido. Verifica el código e intenta nuevamente.";
      } else if (error.code === "auth/code-expired") {
        errorMessage = "Código expirado. Solicita uno nuevo.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  // Cancel Phone Auth
  const cancelPhoneAuth = () => {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (error) {
        console.log("Error limpiando reCAPTCHA:", error);
      }
      setRecaptchaVerifier(null);
    }
    setConfirmationResult(null);
  };

  // Logout
  const logout = () => {
    // Limpiar reCAPTCHA al hacer logout
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (error) {
        console.log("Error limpiando reCAPTCHA:", error);
      }
      setRecaptchaVerifier(null);
    }
    setConfirmationResult(null);

    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (error) {
          console.log("Error limpiando reCAPTCHA en cleanup:", error);
        }
      }
    };
  }, [recaptchaVerifier]);

  const value = {
    user,
    // Google
    signInWithGoogle,
    // Email
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    // Phone
    setupPhoneAuth,
    sendSMSCode,
    verifySMSCode,
    cancelPhoneAuth,
    confirmationResult,
    recaptchaVerifier,
    // General
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
