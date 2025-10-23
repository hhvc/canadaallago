import React, { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Cabana from "./Cabana";

const CabanasList = () => {
  const [cabanas, setCabanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCabanas = async () => {
      try {
        // Solo traer cabañas disponibles, ordenadas por el campo 'orden'
        const q = query(
          collection(db, "cabanas"),
          where("disponible", "==", true),
          orderBy("orden", "asc")
        );
        const querySnapshot = await getDocs(q);
        const cabanasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCabanas(cabanasData);
      } catch (error) {
        console.error("Error cargando cabañas:", error);
        setError("Error al cargar las cabañas. Por favor, recarga la página.");
      } finally {
        setLoading(false);
      }
    };

    fetchCabanas();
  }, []);

  if (loading) {
    return (
      <section
        className="pricing py-5"
        style={{ backgroundImage: "url('/assets/img/bgTop2.jpg')" }}
      >
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-white mt-2">Cargando cabañas...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="pricing py-5"
        style={{ backgroundImage: "url('/assets/img/bgTop2.jpg')" }}
      >
        <div className="container">
          <div className="alert alert-danger text-center">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="cabañas"
      className="pricing py-5"
      style={{ backgroundImage: "url('/assets/img/bgTop2.jpg')" }}
    >
      <div className="container">
        <div className="row text-center mb-5">
          <div className="col-lg-12">
            <h1 className="text-white mb-3">Nuestras Cabañas</h1>
            <p className="text-white-50 lead">
              Descubre nuestro exclusivo selección de cabañas para tu escapada
              perfecta
            </p>
          </div>
        </div>

        {cabanas.length === 0 ? (
          <div className="text-center py-5">
            <div className="alert alert-info text-white bg-transparent border-light">
              <h4>Próximamente más cabañas</h4>
              <p>Estamos preparando nuevas opciones para ti.</p>
            </div>
          </div>
        ) : (
          <div className="row">
            {cabanas.map((cabana) => (
              <Cabana key={cabana.id} cabana={cabana} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CabanasList;
