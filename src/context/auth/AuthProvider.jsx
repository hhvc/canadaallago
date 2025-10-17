import React, { useEffect, useState } from "react";
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

  // Phone Authentication Setup
  const setupPhoneAuth = (elementId) => {
    // Limpiar cualquier instancia previa
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
    }

    const verifier = new RecaptchaVerifier(auth, elementId, {
      size: "normal",
      callback: () => {
        console.log("reCAPTCHA resuelto");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expirado");
      },
    });

    setRecaptchaVerifier(verifier);
    return verifier;
  };

  // Send SMS Code
  const sendSMSCode = async (phoneNumber) => {
    try {
      if (!recaptchaVerifier) {
        throw new Error(
          "reCAPTCHA no configurado. Llama a setupPhoneAuth primero."
        );
      }

      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      setConfirmationResult(result);
      return true;
    } catch (error) {
      console.error("Error al enviar SMS:", error);

      // Limpiar reCAPTCHA en caso de error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }

      throw error;
    }
  };

  // Verify SMS Code
  const verifySMSCode = async (code) => {
    try {
      if (!confirmationResult) {
        throw new Error("No hay una verificación de teléfono en curso");
      }
      const result = await confirmationResult.confirm(code);

      // Limpiar estados después de verificación exitosa
      setConfirmationResult(null);
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }

      return result.user;
    } catch (error) {
      console.error("Error al verificar código:", error);
      throw error;
    }
  };

  // Cancel Phone Auth
  const cancelPhoneAuth = () => {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
    setConfirmationResult(null);
  };

  // Logout
  const logout = () => {
    // Limpiar reCAPTCHA al hacer logout
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
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
        recaptchaVerifier.clear();
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