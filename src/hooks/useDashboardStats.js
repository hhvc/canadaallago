import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalCabanas: 0,
    cabanasDisponibles: 0,
    cabanasDestacadas: 0,
    totalUsuarios: 0,
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

        // Calcular estadísticas
        const totalCabanas = cabanasData.length;
        const cabanasDisponibles = cabanasData.filter(
          (cabana) => cabana.disponible
        ).length;
        const cabanasDestacadas = cabanasData.filter(
          (cabana) => cabana.destacada
        ).length;

        // Obtener estadísticas de usuarios (si tienes colección de usuarios)
        let totalUsuarios = 0;
        try {
          const usuariosRef = collection(db, "users");
          const usuariosSnapshot = await getDocs(usuariosRef);
          totalUsuarios = usuariosSnapshot.size;
        } catch (userError) {
          console.log("Colección de usuarios no disponible:", userError);
          // Si no existe la colección users, podrías contar documentos en otra colección
          // o simplemente dejar 0
        }

        setStats({
          totalCabanas,
          cabanasDisponibles,
          cabanasDestacadas,
          totalUsuarios,
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
