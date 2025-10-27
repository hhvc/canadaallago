// hooks/useDashboardStats.js
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalCabanas: 0,
    cabanasDisponibles: 0,
    cabanasDestacadas: 0,
    totalUsuarios: 0,
    totalContactos: 0,
    contactosNoLeidos: 0,
    contactosHoy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Obtener estadísticas de cabañas
        const cabanasRef = collection(db, "cabanas");
        const cabanasSnapshot = await getDocs(cabanasRef);
        const cabanasData = cabanasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calcular estadísticas de cabañas
        const totalCabanas = cabanasData.length;
        const cabanasDisponibles = cabanasData.filter(
          (cabana) => cabana.disponible
        ).length;
        const cabanasDestacadas = cabanasData.filter(
          (cabana) => cabana.destacada
        ).length;

        // Obtener estadísticas de usuarios
        let totalUsuarios = 0;
        try {
          const usuariosRef = collection(db, "users");
          const usuariosSnapshot = await getDocs(usuariosRef);
          totalUsuarios = usuariosSnapshot.size;
        } catch (userError) {
          console.log("Colección de usuarios no disponible:", userError);
        }

        // Obtener estadísticas de contactos
        let totalContactos = 0;
        let contactosNoLeidos = 0;
        let contactosHoy = 0;

        try {
          const contactosRef = collection(db, "contactMessages");
          const contactosSnapshot = await getDocs(contactosRef);
          const contactosData = contactosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          totalContactos = contactosData.length;

          // Contactos no leídos (donde read es false o no existe)
          contactosNoLeidos = contactosData.filter(
            (contacto) => !contacto.read
          ).length;

          // Contactos de hoy
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0); // Inicio del día de hoy

          contactosHoy = contactosData.filter((contacto) => {
            if (!contacto.createdAt) return false;

            const fechaCreacion = contacto.createdAt.toDate();
            return fechaCreacion >= hoy;
          }).length;
        } catch (contactosError) {
          console.log("Colección de contactos no disponible:", contactosError);
        }

        setStats({
          totalCabanas,
          cabanasDisponibles,
          cabanasDestacadas,
          totalUsuarios,
          totalContactos,
          contactosNoLeidos,
          contactosHoy,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
