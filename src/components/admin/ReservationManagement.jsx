// components/admin/ReservationManagement.jsx
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import ReservationSystem from "../components/ReservationSystem";
import { useAuth } from "../../context/auth/useAuth";

const ReservationManagement = () => {
  const [cabanas, setCabanas] = useState([]);
  const [selectedCabana, setSelectedCabana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasRole } = useAuth();

  // Cargar todas las cabañas
  useEffect(() => {
    const fetchCabanas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cabanas"));
        const cabanasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCabanas(cabanasData);
        if (cabanasData.length > 0) {
          setSelectedCabana(cabanasData[0]); // Seleccionar primera cabaña por defecto
        }
      } catch (error) {
        console.error("Error cargando cabañas:", error);
        setError("No se pudieron cargar las cabañas");
      } finally {
        setLoading(false);
      }
    };

    fetchCabanas();
  }, []);

  const handleClose = () => {
    // En este contexto de administración, no cerramos el componente
    // sino que mostramos un mensaje de éxito
    alert(
      "Reserva procesada correctamente. Puedes continuar gestionando reservas."
    );
  };

  if (!hasRole("admin")) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando sistema de reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          <h4>❌ Error</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (cabanas.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning text-center">
          <h4>📝 No hay cabañas configuradas</h4>
          <p>
            Primero debes crear cabañas en el sistema para gestionar reservas.
          </p>
          <a href="/admin/cabanas" className="btn btn-primary">
            🏠 Gestionar Cabañas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>📅 Sistema de Reservas - Administración</h1>
              <p className="text-muted mb-0">
                Gestiona reservas para todas las cabañas del complejo
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">
                Cabañas disponibles: <strong>{cabanas.length}</strong>
              </small>
              <small className="text-muted">
                Selecciona una cabaña para gestionar sus reservas
              </small>
            </div>
          </div>

          {/* Selector de Cabaña */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">🏠 Seleccionar Cabaña</h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Cabaña:</label>
                  <select
                    className="form-select"
                    value={selectedCabana?.id || ""}
                    onChange={(e) => {
                      const cabanaId = e.target.value;
                      const cabana = cabanas.find((c) => c.id === cabanaId);
                      setSelectedCabana(cabana);
                    }}
                  >
                    {cabanas.map((cabana) => (
                      <option key={cabana.id} value={cabana.id}>
                        {cabana.nombre} - ${cabana.precios?.base || 100}/noche
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  {selectedCabana && (
                    <div className="bg-light p-3 rounded">
                      <h6 className="mb-1">{selectedCabana.nombre}</h6>
                      <small className="text-muted d-block">
                        Capacidad: {selectedCabana.capacidad} huéspedes •
                        Dormitorios: {selectedCabana.dormitorios}
                      </small>
                      <small className="text-muted">
                        Precio base: ${selectedCabana.precios?.base || 100}
                        /noche
                        {selectedCabana.precios?.temporadas &&
                          selectedCabana.precios.temporadas.length > 0 && (
                            <span className="text-success">
                              {" "}
                              • Tarifas especiales configuradas
                            </span>
                          )}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información del modo administración */}
          <div className="alert alert-info mb-4">
            <h6>💡 Modo Administración</h6>
            <p className="mb-2">
              En este modo puedes crear reservas en nombre de los clientes. Las
              reservas se crearán con estado "pending" y deberás contactar al
              cliente para confirmar los detalles.
            </p>
            <small className="text-muted">
              <strong>Nota:</strong> Este sistema no procesa pagos. Las reservas
              son solicitudes que requieren confirmación manual.
            </small>
          </div>

          {/* Sistema de Reservas */}
          {selectedCabana && (
            <div className="reservation-container">
              <ReservationSystem
                cabana={selectedCabana}
                onClose={handleClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;
