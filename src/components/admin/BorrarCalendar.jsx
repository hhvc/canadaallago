// components/admin/Calendar.jsx
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/auth/useAuth";
import "./Calendar.css"; // Importar los estilos adicionales

// Función auxiliar para manejar fechas de Firestore
const getFirestoreDate = (firestoreTimestamp) => {
  if (!firestoreTimestamp) return null;

  if (typeof firestoreTimestamp.toDate === "function")
    return firestoreTimestamp.toDate();
  if (firestoreTimestamp.seconds !== undefined)
    return new Date(firestoreTimestamp.seconds * 1000);
  if (firestoreTimestamp instanceof Date) return firestoreTimestamp;
  if (typeof firestoreTimestamp === "string")
    return new Date(firestoreTimestamp);

  console.warn("Formato de fecha no reconocido:", firestoreTimestamp);
  return null;
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', 'day'
  const { hasRole } = useAuth();

  useEffect(() => {
    if (!hasRole("admin")) return;

    const fetchCalendarEvents = async () => {
      try {
        const q = query(
          collection(db, "contactMessages"),
          where("scheduledFollowUp", "!=", null),
          orderBy("scheduledFollowUp", "asc")
        );

        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventsData);
      } catch (error) {
        console.error("Error cargando eventos del calendario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [hasRole]);

  useEffect(() => {
    const checkOverdueEvents = async () => {
      const now = new Date();
      const overdueEvents = events.filter((event) => {
        const eventDate = getFirestoreDate(event.scheduledFollowUp);
        return (
          eventDate && eventDate < now && event.followUpStatus !== "vencido"
        );
      });

      for (const event of overdueEvents) {
        try {
          await updateDoc(doc(db, "contactMessages", event.id), {
            followUpStatus: "vencido",
            status: "Perdido",
            lastUpdated: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error actualizando evento vencido:", error);
        }
      }

      if (overdueEvents.length > 0) {
        setEvents((prev) =>
          prev.map((event) => {
            const isOverdue = overdueEvents.find((oe) => oe.id === event.id);
            if (isOverdue) {
              return { ...event, followUpStatus: "vencido", status: "Perdido" };
            }
            return event;
          })
        );
      }
    };

    if (events.length > 0) checkOverdueEvents();
  }, [events]);

  const getEventsForDate = (date) =>
    events.filter((event) => {
      const eventDate = getFirestoreDate(event.scheduledFollowUp);
      if (!eventDate) return false;
      return eventDate.toDateString() === date.toDateString();
    });

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() + direction);
    else if (view === "week")
      newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const markEventAsCompleted = async (eventId) => {
    try {
      await updateDoc(doc(db, "contactMessages", eventId), {
        followUpStatus: "completado",
        lastUpdated: serverTimestamp(),
      });

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, followUpStatus: "completado" }
            : event
        )
      );
    } catch (error) {
      console.error("Error marcando evento como completado:", error);
    }
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const weeks = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const days = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || day > daysInMonth) {
          days.push(<td key={j} className="text-muted bg-light"></td>);
        } else {
          const currentDate = new Date(year, month, day);
          const dayEvents = getEventsForDate(currentDate);

          days.push(
            <td key={j} className="calendar-day p-1">
              <div className="d-flex justify-content-between align-items-start">
                <span
                  className={`badge ${
                    currentDate.toDateString() === new Date().toDateString()
                      ? "bg-primary text-white"
                      : "bg-light text-dark"
                  }`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="badge bg-warning text-dark">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="calendar-events mt-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const eventDate = getFirestoreDate(event.scheduledFollowUp);
                  const isOverdue =
                    eventDate &&
                    eventDate < new Date() &&
                    event.followUpStatus !== "completado";

                  return (
                    <div
                      key={event.id}
                      className={`small p-1 mb-1 rounded text-white ${
                        event.followUpStatus === "vencido" || isOverdue
                          ? "bg-danger"
                          : event.followUpStatus === "completado"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                      title={`${event.name} - ${
                        event.followUpType || "Seguimiento"
                      } - ${eventDate?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                    >
                      <div className="fw-bold">{event.name}</div>
                      <small>
                        {eventDate?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="small text-muted">
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </td>
          );
          day++;
        }
      }
      weeks.push(<tr key={i}>{days}</tr>);
      if (day > daysInMonth) break;
    }

    return weeks;
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
        <p className="mt-2">Cargando calendario...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Encabezado y botones de vista */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>📅 Calendario de Seguimientos</h1>
            <div>
              <button
                className={`btn btn-sm ${
                  view === "month" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setView("month")}
              >
                Mes
              </button>
              <button
                className={`btn btn-sm mx-2 ${
                  view === "week" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setView("week")}
              >
                Semana
              </button>
              <button
                className={`btn btn-sm ${
                  view === "day" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setView("day")}
              >
                Día
              </button>
            </div>
          </div>

          {/* Navegación de fechas */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigateDate(-1)}
                >
                  ‹ Anterior
                </button>
                <h4 className="mb-0 text-center">
                  {selectedDate
                    .toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </h4>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigateDate(1)}
                >
                  Siguiente ›
                </button>
              </div>
            </div>
          </div>

          {/* Vista de mes */}
          {view === "month" && (
            <div className="card">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered calendar-table mb-0">
                    <thead className="table-light">
                      <tr>
                        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                          (day) => (
                            <th key={day} className="text-center py-3">
                              {day}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>{renderMonthView()}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vista de semana y día */}
          {view === "week" && (
            <div className="card">
              <div className="card-body text-center">
                <h5>Vista de Semana</h5>
                <p className="text-muted">
                  Esta vista estará disponible próximamente.
                </p>
              </div>
            </div>
          )}
          {view === "day" && (
            <div className="card">
              <div className="card-body text-center">
                <h5>Vista de Día</h5>
                <p className="text-muted">
                  Esta vista estará disponible próximamente.
                </p>
              </div>
            </div>
          )}

          {/* Eventos próximos */}
          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Eventos Próximos</h5>
              <span className="badge bg-primary">
                {
                  events.filter((event) => {
                    const eventDate = getFirestoreDate(event.scheduledFollowUp);
                    return eventDate && eventDate >= new Date();
                  }).length
                }{" "}
                eventos
              </span>
            </div>
            <div className="card-body">
              {events.filter((event) => {
                const eventDate = getFirestoreDate(event.scheduledFollowUp);
                return eventDate && eventDate >= new Date();
              }).length === 0 ? (
                <p className="text-muted">No hay eventos programados.</p>
              ) : (
                <div className="list-group">
                  {events
                    .filter((event) => {
                      const eventDate = getFirestoreDate(
                        event.scheduledFollowUp
                      );
                      return eventDate && eventDate >= new Date();
                    })
                    .sort((a, b) => {
                      const dateA = getFirestoreDate(a.scheduledFollowUp);
                      const dateB = getFirestoreDate(b.scheduledFollowUp);
                      return (dateA || 0) - (dateB || 0);
                    })
                    .slice(0, 10)
                    .map((event) => {
                      const eventDate = getFirestoreDate(
                        event.scheduledFollowUp
                      );
                      const statusInfo =
                        event.followUpStatus === "vencido"
                          ? { badge: "bg-danger", text: "Vencido" }
                          : event.followUpStatus === "completado"
                          ? { badge: "bg-success", text: "Completado" }
                          : {
                              badge: "bg-warning text-dark",
                              text: "Programado",
                            };

                      return (
                        <div key={event.id} className="list-group-item">
                          <div className="d-flex w-100 justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{event.name}</h6>
                              <p className="mb-1 text-muted small">
                                {event.email}
                              </p>
                              <p className="mb-1">
                                {event.message?.substring(0, 100)}...
                              </p>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block">
                                {eventDate?.toLocaleDateString()}
                              </small>
                              <small className="text-muted d-block">
                                {eventDate?.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`badge ${statusInfo.badge} me-2`}>
                              {statusInfo.text}
                            </span>
                            <span className="badge bg-secondary me-2">
                              {FOLLOW_UP_TYPES.find(
                                (f) => f.value === event.followUpType
                              )?.label || "Seguimiento"}
                            </span>
                            <span className="badge bg-info">
                              {event.status || "nuevo"}
                            </span>
                            {event.followUpStatus !== "completado" && (
                              <button
                                className="btn btn-success btn-sm ms-2"
                                onClick={() => markEventAsCompleted(event.id)}
                              >
                                ✅ Completar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Eventos vencidos - RESTAURADO */}
          <div className="card mt-4 border-danger">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">⚠️ Eventos Vencidos</h5>
              <span className="badge bg-light text-danger">
                {
                  events.filter((event) => {
                    const eventDate = getFirestoreDate(event.scheduledFollowUp);
                    return (
                      eventDate &&
                      eventDate < new Date() &&
                      event.followUpStatus !== "completado"
                    );
                  }).length
                }{" "}
                eventos
              </span>
            </div>
            <div className="card-body">
              {events.filter((event) => {
                const eventDate = getFirestoreDate(event.scheduledFollowUp);
                return (
                  eventDate &&
                  eventDate < new Date() &&
                  event.followUpStatus !== "completado"
                );
              }).length === 0 ? (
                <p className="text-muted">
                  No hay eventos vencidos. ¡Buen trabajo!
                </p>
              ) : (
                <div className="list-group">
                  {events
                    .filter((event) => {
                      const eventDate = getFirestoreDate(
                        event.scheduledFollowUp
                      );
                      return (
                        eventDate &&
                        eventDate < new Date() &&
                        event.followUpStatus !== "completado"
                      );
                    })
                    .sort((a, b) => {
                      const dateA = getFirestoreDate(a.scheduledFollowUp);
                      const dateB = getFirestoreDate(b.scheduledFollowUp);
                      return (dateA || 0) - (dateB || 0);
                    })
                    .map((event) => {
                      const eventDate = getFirestoreDate(
                        event.scheduledFollowUp
                      );

                      return (
                        <div
                          key={event.id}
                          className="list-group-item border-danger"
                        >
                          <div className="d-flex w-100 justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1 text-danger">{event.name}</h6>
                              <p className="mb-1 text-muted small">
                                {event.email}
                              </p>
                              <p className="mb-1 small">
                                {event.message?.substring(0, 100)}...
                              </p>
                            </div>
                            <div className="text-end">
                              <small className="text-danger d-block fw-bold">
                                Vencido el {eventDate?.toLocaleDateString()}
                              </small>
                              <small className="text-muted d-block">
                                {eventDate?.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </div>
                          </div>
                          <div className="mt-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => markEventAsCompleted(event.id)}
                            >
                              ✅ Marcar como Completado
                            </button>
                            <span className="badge bg-secondary ms-2">
                              {FOLLOW_UP_TYPES.find(
                                (f) => f.value === event.followUpType
                              )?.label || "Seguimiento"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FOLLOW_UP_TYPES = [
  { value: "llamada", label: "📞 Llamada" },
  { value: "email", label: "📧 Email" },
  { value: "reunion", label: "👥 Reunión" },
  { value: "propuesta", label: "📄 Enviar Propuesta" },
  { value: "seguimiento", label: "🔄 Seguimiento" },
];

export default Calendar;

// // components/admin/Calendar.jsx
// import { useState, useEffect } from "react";
// import {
//   collection,
//   getDocs,
//   query,
//   orderBy,
//   updateDoc,
//   doc,
//   where,
//   Timestamp,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db } from "../../firebase/config";
// import { useAuth } from "../../context/auth/useAuth";

// // Función auxiliar para manejar fechas de Firestore (la misma que en ContactMessages)
// const getFirestoreDate = (firestoreTimestamp) => {
//   if (!firestoreTimestamp) return null;

//   // Si es un objeto Timestamp de Firestore con método toDate
//   if (typeof firestoreTimestamp.toDate === "function") {
//     return firestoreTimestamp.toDate();
//   }

//   // Si es un objeto Timestamp con propiedades seconds/nanoseconds
//   if (firestoreTimestamp.seconds !== undefined) {
//     return new Date(firestoreTimestamp.seconds * 1000);
//   }

//   // Si ya es un objeto Date
//   if (firestoreTimestamp instanceof Date) {
//     return firestoreTimestamp;
//   }

//   // Si es un string de fecha
//   if (typeof firestoreTimestamp === "string") {
//     return new Date(firestoreTimestamp);
//   }

//   console.warn("Formato de fecha no reconocido:", firestoreTimestamp);
//   return null;
// };

// const Calendar = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [view, setView] = useState("month"); // 'month', 'week', 'day'
//   const { hasRole } = useAuth();

//   useEffect(() => {
//     if (!hasRole("admin")) return;

//     const fetchCalendarEvents = async () => {
//       try {
//         // Obtener contactos con fechas de seguimiento
//         const q = query(
//           collection(db, "contactMessages"),
//           where("scheduledFollowUp", "!=", null),
//           orderBy("scheduledFollowUp", "asc")
//         );

//         const querySnapshot = await getDocs(q);
//         const eventsData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setEvents(eventsData);
//       } catch (error) {
//         console.error("Error cargando eventos del calendario:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCalendarEvents();
//   }, [hasRole]);

//   // Verificar y actualizar estados vencidos
//   useEffect(() => {
//     const checkOverdueEvents = async () => {
//       const now = new Date();
//       const overdueEvents = events.filter((event) => {
//         const eventDate = getFirestoreDate(event.scheduledFollowUp);
//         return (
//           eventDate && eventDate < now && event.followUpStatus !== "vencido"
//         );
//       });

//       for (const event of overdueEvents) {
//         try {
//           await updateDoc(doc(db, "contactMessages", event.id), {
//             followUpStatus: "vencido",
//             status: "Perdido",
//             lastUpdated: serverTimestamp(),
//           });
//         } catch (error) {
//           console.error("Error actualizando evento vencido:", error);
//         }
//       }

//       // Actualizar el estado local si hubo cambios
//       if (overdueEvents.length > 0) {
//         setEvents((prev) =>
//           prev.map((event) => {
//             const isOverdue = overdueEvents.find((oe) => oe.id === event.id);
//             if (isOverdue) {
//               return { ...event, followUpStatus: "vencido", status: "Perdido" };
//             }
//             return event;
//           })
//         );
//       }
//     };

//     if (events.length > 0) {
//       checkOverdueEvents();
//     }
//   }, [events]);

//   const getEventsForDate = (date) => {
//     return events.filter((event) => {
//       const eventDate = getFirestoreDate(event.scheduledFollowUp);
//       if (!eventDate) return false;

//       return eventDate.toDateString() === date.toDateString();
//     });
//   };

//   const navigateDate = (direction) => {
//     const newDate = new Date(selectedDate);
//     if (view === "month") {
//       newDate.setMonth(newDate.getMonth() + direction);
//     } else if (view === "week") {
//       newDate.setDate(newDate.getDate() + direction * 7);
//     } else {
//       newDate.setDate(newDate.getDate() + direction);
//     }
//     setSelectedDate(newDate);
//   };

//   const renderMonthView = () => {
//     const year = selectedDate.getFullYear();
//     const month = selectedDate.getMonth();

//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();

//     const startDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

//     const weeks = [];
//     let day = 1;

//     for (let i = 0; i < 6; i++) {
//       const days = [];
//       for (let j = 0; j < 7; j++) {
//         if ((i === 0 && j < startDay) || day > daysInMonth) {
//           days.push(<td key={j} className="text-muted bg-light"></td>);
//         } else {
//           const currentDate = new Date(year, month, day);
//           const dayEvents = getEventsForDate(currentDate);

//           days.push(
//             <td
//               key={j}
//               className="calendar-day p-1"
//               style={{ height: "120px", verticalAlign: "top" }}
//             >
//               <div className="d-flex justify-content-between align-items-start">
//                 <span
//                   className={`badge ${
//                     currentDate.toDateString() === new Date().toDateString()
//                       ? "bg-primary"
//                       : ""
//                   }`}
//                 >
//                   {day}
//                 </span>
//                 {dayEvents.length > 0 && (
//                   <span className="badge bg-warning">{dayEvents.length}</span>
//                 )}
//               </div>
//               <div className="calendar-events mt-1">
//                 {dayEvents.slice(0, 3).map((event) => {
//                   const eventDate = getFirestoreDate(event.scheduledFollowUp);
//                   const isOverdue =
//                     eventDate &&
//                     eventDate < new Date() &&
//                     event.followUpStatus !== "completado";

//                   return (
//                     <div
//                       key={event.id}
//                       className={`small p-1 mb-1 rounded text-white ${
//                         event.followUpStatus === "vencido" || isOverdue
//                           ? "bg-danger"
//                           : event.followUpStatus === "completado"
//                           ? "bg-success"
//                           : "bg-warning"
//                       }`}
//                       title={`${event.name} - ${
//                         event.followUpType || "Seguimiento"
//                       } - ${eventDate?.toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}`}
//                     >
//                       <div className="fw-bold">{event.name}</div>
//                       <small>
//                         {eventDate?.toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </small>
//                     </div>
//                   );
//                 })}
//                 {dayEvents.length > 3 && (
//                   <div className="small text-muted">
//                     +{dayEvents.length - 3} más
//                   </div>
//                 )}
//               </div>
//             </td>
//           );
//           day++;
//         }
//       }
//       weeks.push(<tr key={i}>{days}</tr>);
//       if (day > daysInMonth) break;
//     }

//     return weeks;
//   };

//   const markEventAsCompleted = async (eventId) => {
//     try {
//       await updateDoc(doc(db, "contactMessages", eventId), {
//         followUpStatus: "completado",
//         lastUpdated: serverTimestamp(),
//       });

//       setEvents((prev) =>
//         prev.map((event) =>
//           event.id === eventId
//             ? { ...event, followUpStatus: "completado" }
//             : event
//         )
//       );
//     } catch (error) {
//       console.error("Error marcando evento como completado:", error);
//     }
//   };

//   if (!hasRole("admin")) {
//     return (
//       <div className="container mt-4">
//         <div className="alert alert-danger text-center">
//           <h4>🚫 Acceso Denegado</h4>
//           <p>No tienes permisos para acceder a esta sección.</p>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="container mt-4">
//         <div className="text-center">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Cargando...</span>
//           </div>
//           <p className="mt-2">Cargando calendario...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         <div className="col-12">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h1>📅 Calendario de Seguimientos</h1>
//             <div>
//               <button
//                 className={`btn btn-sm ${
//                   view === "month" ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setView("month")}
//               >
//                 Mes
//               </button>
//               <button
//                 className={`btn btn-sm mx-2 ${
//                   view === "week" ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setView("week")}
//               >
//                 Semana
//               </button>
//               <button
//                 className={`btn btn-sm ${
//                   view === "day" ? "btn-primary" : "btn-outline-primary"
//                 }`}
//                 onClick={() => setView("day")}
//               >
//                 Día
//               </button>
//             </div>
//           </div>

//           {/* Controles de navegación */}
//           <div className="card mb-4">
//             <div className="card-body">
//               <div className="d-flex justify-content-between align-items-center">
//                 <button
//                   className="btn btn-outline-primary"
//                   onClick={() => navigateDate(-1)}
//                 >
//                   ‹ Anterior
//                 </button>

//                 <h4 className="mb-0 text-center">
//                   {selectedDate
//                     .toLocaleDateString("es-ES", {
//                       month: "long",
//                       year: "numeric",
//                     })
//                     .toUpperCase()}
//                 </h4>

//                 <button
//                   className="btn btn-outline-primary"
//                   onClick={() => navigateDate(1)}
//                 >
//                   Siguiente ›
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Vista de mes */}
//           {view === "month" && (
//             <div className="card">
//               <div className="card-body p-0">
//                 <div className="table-responsive">
//                   <table className="table table-bordered calendar-table mb-0">
//                     <thead className="table-light">
//                       <tr>
//                         {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
//                           (day) => (
//                             <th key={day} className="text-center py-3">
//                               {day}
//                             </th>
//                           )
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>{renderMonthView()}</tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Vista de día (placeholder) */}
//           {view === "day" && (
//             <div className="card">
//               <div className="card-body text-center">
//                 <h5>Vista de Día</h5>
//                 <p className="text-muted">
//                   Esta vista estará disponible próximamente.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Vista de semana (placeholder) */}
//           {view === "week" && (
//             <div className="card">
//               <div className="card-body text-center">
//                 <h5>Vista de Semana</h5>
//                 <p className="text-muted">
//                   Esta vista estará disponible próximamente.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Lista de eventos próximos */}
//           <div className="card mt-4">
//             <div className="card-header d-flex justify-content-between align-items-center">
//               <h5 className="mb-0">📋 Eventos Próximos</h5>
//               <span className="badge bg-primary">
//                 {
//                   events.filter((event) => {
//                     const eventDate = getFirestoreDate(event.scheduledFollowUp);
//                     return eventDate && eventDate >= new Date();
//                   }).length
//                 }{" "}
//                 eventos
//               </span>
//             </div>
//             <div className="card-body">
//               {events.filter((event) => {
//                 const eventDate = getFirestoreDate(event.scheduledFollowUp);
//                 return eventDate && eventDate >= new Date();
//               }).length === 0 ? (
//                 <p className="text-muted">No hay eventos programados.</p>
//               ) : (
//                 <div className="list-group">
//                   {events
//                     .filter((event) => {
//                       const eventDate = getFirestoreDate(
//                         event.scheduledFollowUp
//                       );
//                       return eventDate && eventDate >= new Date();
//                     })
//                     .sort((a, b) => {
//                       const dateA = getFirestoreDate(a.scheduledFollowUp);
//                       const dateB = getFirestoreDate(b.scheduledFollowUp);
//                       return (dateA || 0) - (dateB || 0);
//                     })
//                     .slice(0, 10)
//                     .map((event) => {
//                       const eventDate = getFirestoreDate(
//                         event.scheduledFollowUp
//                       );
//                       const statusInfo =
//                         event.followUpStatus === "vencido"
//                           ? { badge: "bg-danger", text: "Vencido" }
//                           : event.followUpStatus === "completado"
//                           ? { badge: "bg-success", text: "Completado" }
//                           : { badge: "bg-warning", text: "Programado" };

//                       return (
//                         <div key={event.id} className="list-group-item">
//                           <div className="d-flex w-100 justify-content-between align-items-start">
//                             <div className="flex-grow-1">
//                               <h6 className="mb-1">{event.name}</h6>
//                               <p className="mb-1 text-muted small">
//                                 {event.email}
//                               </p>
//                               <p className="mb-1">
//                                 {event.message?.substring(0, 100)}...
//                               </p>
//                             </div>
//                             <div className="text-end">
//                               <small className="text-muted d-block">
//                                 {eventDate?.toLocaleDateString()}
//                               </small>
//                               <small className="text-muted d-block">
//                                 {eventDate?.toLocaleTimeString([], {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </small>
//                             </div>
//                           </div>
//                           <div className="mt-2">
//                             <span className={`badge ${statusInfo.badge} me-2`}>
//                               {statusInfo.text}
//                             </span>
//                             <span className="badge bg-secondary me-2">
//                               {FOLLOW_UP_TYPES.find(
//                                 (f) => f.value === event.followUpType
//                               )?.label || "Seguimiento"}
//                             </span>
//                             <span className="badge bg-info">
//                               {event.status || "nuevo"}
//                             </span>
//                             {event.followUpStatus !== "completado" && (
//                               <button
//                                 className="btn btn-success btn-sm ms-2"
//                                 onClick={() => markEventAsCompleted(event.id)}
//                               >
//                                 ✅ Completar
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Eventos vencidos */}
//           <div className="card mt-4 border-danger">
//             <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
//               <h5 className="mb-0">⚠️ Eventos Vencidos</h5>
//               <span className="badge bg-light text-danger">
//                 {
//                   events.filter((event) => {
//                     const eventDate = getFirestoreDate(event.scheduledFollowUp);
//                     return (
//                       eventDate &&
//                       eventDate < new Date() &&
//                       event.followUpStatus !== "completado"
//                     );
//                   }).length
//                 }{" "}
//                 eventos
//               </span>
//             </div>
//             <div className="card-body">
//               {events.filter((event) => {
//                 const eventDate = getFirestoreDate(event.scheduledFollowUp);
//                 return (
//                   eventDate &&
//                   eventDate < new Date() &&
//                   event.followUpStatus !== "completado"
//                 );
//               }).length === 0 ? (
//                 <p className="text-muted">
//                   No hay eventos vencidos. ¡Buen trabajo!
//                 </p>
//               ) : (
//                 <div className="list-group">
//                   {events
//                     .filter((event) => {
//                       const eventDate = getFirestoreDate(
//                         event.scheduledFollowUp
//                       );
//                       return (
//                         eventDate &&
//                         eventDate < new Date() &&
//                         event.followUpStatus !== "completado"
//                       );
//                     })
//                     .sort((a, b) => {
//                       const dateA = getFirestoreDate(a.scheduledFollowUp);
//                       const dateB = getFirestoreDate(b.scheduledFollowUp);
//                       return (dateA || 0) - (dateB || 0);
//                     })
//                     .map((event) => {
//                       const eventDate = getFirestoreDate(
//                         event.scheduledFollowUp
//                       );

//                       return (
//                         <div
//                           key={event.id}
//                           className="list-group-item border-danger"
//                         >
//                           <div className="d-flex w-100 justify-content-between align-items-start">
//                             <div className="flex-grow-1">
//                               <h6 className="mb-1 text-danger">{event.name}</h6>
//                               <p className="mb-1 text-muted small">
//                                 {event.email}
//                               </p>
//                               <p className="mb-1 small">
//                                 {event.message?.substring(0, 100)}...
//                               </p>
//                             </div>
//                             <div className="text-end">
//                               <small className="text-danger d-block fw-bold">
//                                 Vencido el {eventDate?.toLocaleDateString()}
//                               </small>
//                               <small className="text-muted d-block">
//                                 {eventDate?.toLocaleTimeString([], {
//                                   hour: "2-digit",
//                                   minute: "2-digit",
//                                 })}
//                               </small>
//                             </div>
//                           </div>
//                           <div className="mt-2">
//                             <button
//                               className="btn btn-success btn-sm"
//                               onClick={() => markEventAsCompleted(event.id)}
//                             >
//                               ✅ Marcar como Completado
//                             </button>
//                             <span className="badge bg-secondary ms-2">
//                               {FOLLOW_UP_TYPES.find(
//                                 (f) => f.value === event.followUpType
//                               )?.label || "Seguimiento"}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Definir FOLLOW_UP_TYPES aquí también para consistencia
// const FOLLOW_UP_TYPES = [
//   { value: "llamada", label: "📞 Llamada" },
//   { value: "email", label: "📧 Email" },
//   { value: "reunion", label: "👥 Reunión" },
//   { value: "propuesta", label: "📄 Enviar Propuesta" },
//   { value: "seguimiento", label: "🔄 Seguimiento" },
// ];

// export default Calendar;
