import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/auth/useAuth";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { hasRole } = useAuth();

  // Mover la verificación de permisos DESPUÉS de todos los hooks
  useEffect(() => {
    // Solo cargar mensajes si el usuario es admin
    if (!hasRole("admin")) return;

    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "contactMessages"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const messagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      } catch (error) {
        console.error("Error cargando mensajes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [hasRole]); // Agregar hasRole como dependencia

  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, "contactMessages", messageId), {
        read: true,
        status: "leído",
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, read: true, status: "leído" } : msg
        )
      );

      setSelectedMessage((prev) =>
        prev ? { ...prev, read: true, status: "leído" } : null
      );
    } catch (error) {
      console.error("Error marcando como leído:", error);
    }
  };

  // ✅ Ahora el return condicional va DESPUÉS de todos los hooks
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
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1>📨 Mensajes de Contacto</h1>
          <p className="text-muted">Total: {messages.length} mensajes</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="list-group">
            {messages.map((message) => (
              <button
                key={message.id}
                className={`list-group-item list-group-item-action ${
                  !message.read ? "list-group-item-warning" : ""
                } ${selectedMessage?.id === message.id ? "active" : ""}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{message.name}</h6>
                  <small>
                    {message.createdAt?.toDate().toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-1 text-truncate">{message.email}</p>
                <small>{message.read ? "📖 Leído" : "📨 Nuevo"}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-8">
          {selectedMessage ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Mensaje de {selectedMessage.name}</h5>
                {!selectedMessage.read && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => markAsRead(selectedMessage.id)}
                  >
                    Marcar como leído
                  </button>
                )}
              </div>
              <div className="card-body">
                <p>
                  <strong>📧 Email:</strong> {selectedMessage.email}
                </p>
                <p>
                  <strong>📞 Teléfono:</strong> {selectedMessage.phone}
                </p>
                <p>
                  <strong>📅 Fecha:</strong>{" "}
                  {selectedMessage.createdAt?.toDate().toLocaleString()}
                </p>
                <hr />
                <p>
                  <strong>Mensaje:</strong>
                </p>
                <p className="bg-light p-3 rounded">
                  {selectedMessage.message}
                </p>

                <div className="mt-3">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="btn btn-primary me-2"
                  >
                    📧 Responder
                  </a>
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="btn btn-outline-primary"
                  >
                    📞 Llamar
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <h4>Selecciona un mensaje para ver los detalles</h4>
              {messages.length === 0 && <p>No hay mensajes de contacto aún.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;
