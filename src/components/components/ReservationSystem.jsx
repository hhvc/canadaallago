// components/ReservationSystem.jsx
import { useState, useEffect, useMemo } from "react"; // ✅ Agregar useMemo
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/auth/useAuth";

// Función auxiliar para manejar fechas de Firestore
const getFirestoreDate = (firestoreTimestamp) => {
  if (!firestoreTimestamp) return null;
  if (typeof firestoreTimestamp.toDate === "function") {
    return firestoreTimestamp.toDate();
  }
  if (firestoreTimestamp.seconds !== undefined) {
    return new Date(firestoreTimestamp.seconds * 1000);
  }
  if (firestoreTimestamp instanceof Date) {
    return firestoreTimestamp;
  }
  if (typeof firestoreTimestamp === "string") {
    return new Date(firestoreTimestamp);
  }
  console.warn("Formato de fecha no reconocido:", firestoreTimestamp);
  return null;
};

// Función para determinar el precio por noche según la temporada
const getPrecioPorNoche = (fecha, preciosConfig) => {
  // ✅ CORRECCIÓN: Manejar caso cuando preciosConfig es undefined
  if (!preciosConfig || !preciosConfig.base) {
    return 100; // Precio por defecto
  }

  const precioBase = preciosConfig.base;
  let precioFinal = precioBase;
  let temporadaAplicada = "Base";

  // Verificar si hay temporadas configuradas
  if (preciosConfig.temporadas && preciosConfig.temporadas.length > 0) {
    for (const temporada of preciosConfig.temporadas) {
      // Temporada por fechas específicas
      if (temporada.fechaInicio && temporada.fechaFin) {
        const inicio = new Date(temporada.fechaInicio);
        const fin = new Date(temporada.fechaFin);

        if (fecha >= inicio && fecha <= fin) {
          precioFinal = precioBase * temporada.multiplicador;
          temporadaAplicada = temporada.nombre;
          break;
        }
      }

      // Temporada por días de la semana (ej: fines de semana)
      if (temporada.diasSemana && temporada.diasSemana.length > 0) {
        const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        if (temporada.diasSemana.includes(diaSemana)) {
          // Si ya aplicamos un multiplicador, usar el mayor
          const nuevoPrecio = precioBase * temporada.multiplicador;
          if (nuevoPrecio > precioFinal) {
            precioFinal = nuevoPrecio;
            temporadaAplicada = temporada.nombre;
          }
        }
      }
    }
  }

  return {
    precio: Math.round(precioFinal),
    temporada: temporadaAplicada,
    esTemporadaEspecial: temporadaAplicada !== "Base",
  };
};

// Función para calcular el desglose de precios
const calcularDesglosePrecios = (checkIn, checkOut, preciosConfig) => {
  if (!checkIn || !checkOut) return { total: 0, desglose: [], noches: 0 };

  const noches = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const desglose = [];
  let total = 0;

  for (let i = 0; i < noches; i++) {
    const fecha = new Date(checkIn);
    fecha.setDate(fecha.getDate() + i);

    const precioNoche = getPrecioPorNoche(fecha, preciosConfig);
    desglose.push({
      fecha: new Date(fecha),
      precio: precioNoche.precio,
      temporada: precioNoche.temporada,
      esTemporadaEspecial: precioNoche.esTemporadaEspecial,
    });

    total += precioNoche.precio;
  }

  return {
    total,
    desglose,
    noches,
  };
};

const ReservationSystem = ({ cabana, onClose }) => {
  const [selectedDates, setSelectedDates] = useState({
    checkIn: null,
    checkOut: null,
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [reservationInfo, setReservationInfo] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guests: 1,
    specialRequests: "",
  });
  const [desglosePrecios, setDesglosePrecios] = useState({
    total: 0,
    desglose: [],
    noches: 0,
  });
  const [mostrarDesglose, setMostrarDesglose] = useState(false);
  const { user } = useAuth();

  // ✅ CORRECCIÓN CRÍTICA: Usar useMemo para preciosConfig con manejo seguro
  const preciosConfig = useMemo(() => {
    // Si cabana no existe o no tiene precios, usar valores por defecto
    if (!cabana || !cabana.precios) {
      return { base: 100, temporadas: [] };
    }
    return cabana.precios;
  }, [cabana]); // Dependencia de cabana completa

  // Cargar fechas reservadas para esta cabaña
  useEffect(() => {
    if (!cabana?.id) return; // ✅ Prevenir ejecución si no hay cabana.id

    const fetchBookedDates = async () => {
      try {
        const q = query(
          collection(db, "reservations"),
          where("cabanaId", "==", cabana.id),
          where("status", "in", ["confirmed", "pending"])
        );

        const querySnapshot = await getDocs(q);
        const reservations = querySnapshot.docs.map((doc) => doc.data());

        const allBookedDates = [];
        reservations.forEach((reservation) => {
          const checkIn = getFirestoreDate(reservation.checkIn);
          const checkOut = getFirestoreDate(reservation.checkOut);

          if (checkIn && checkOut) {
            // Generar array con todas las fechas entre checkIn y checkOut
            const currentDate = new Date(checkIn);
            while (currentDate <= checkOut) {
              allBookedDates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });

        setBookedDates(allBookedDates);
      } catch (error) {
        console.error("Error cargando reservas:", error);
      }
    };

    fetchBookedDates();
  }, [cabana?.id]); // ✅ Dependencia segura

  // ✅ CORRECCIÓN: Actualizar desglose de precios cuando cambian las fechas
  useEffect(() => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const resultado = calcularDesglosePrecios(
        selectedDates.checkIn,
        selectedDates.checkOut,
        preciosConfig
      );
      setDesglosePrecios(resultado);
    } else {
      setDesglosePrecios({ total: 0, desglose: [], noches: 0 });
    }
  }, [selectedDates, preciosConfig]); // ✅ preciosConfig es ahora estable

  const isDateBooked = (date) => {
    return bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === date.toDateString()
    );
  };

  const isDateSelected = (date) => {
    if (!selectedDates.checkIn) return false;
    if (selectedDates.checkIn.toDateString() === date.toDateString())
      return true;
    if (
      selectedDates.checkOut &&
      selectedDates.checkOut.toDateString() === date.toDateString()
    )
      return true;
    if (
      selectedDates.checkIn &&
      selectedDates.checkOut &&
      date >= selectedDates.checkIn &&
      date <= selectedDates.checkOut
    ) {
      return true;
    }
    return false;
  };

  const getPrecioParaFecha = (date) => {
    const precioInfo = getPrecioPorNoche(date, preciosConfig);
    return precioInfo.precio;
  };

  const handleDateClick = (date) => {
    // No permitir seleccionar fechas reservadas
    if (isDateBooked(date)) return;

    // Si no hay check-in seleccionado, o si ya hay check-in y check-out, empezar nueva selección
    if (
      !selectedDates.checkIn ||
      (selectedDates.checkIn && selectedDates.checkOut)
    ) {
      setSelectedDates({ checkIn: date, checkOut: null });
    }
    // Si hay check-in pero no check-out, y la fecha es después del check-in
    else if (
      selectedDates.checkIn &&
      !selectedDates.checkOut &&
      date > selectedDates.checkIn
    ) {
      setSelectedDates({ ...selectedDates, checkOut: date });
    }
    // Si se hace click en una fecha anterior al check-in, resetear
    else if (date < selectedDates.checkIn) {
      setSelectedDates({ checkIn: date, checkOut: null });
    }
  };

  const handleReservation = async () => {
    if (!cabana?.id) {
      // ✅ Verificar que cabana existe
      alert("Error: Información de cabaña no disponible");
      return;
    }

    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      alert("Por favor selecciona las fechas de tu estadía");
      return;
    }

    if (!reservationInfo.guestName || !reservationInfo.guestEmail) {
      alert("Por favor completa tus datos de contacto");
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        cabanaId: cabana.id,
        cabanaName: cabana.nombre,
        checkIn: Timestamp.fromDate(selectedDates.checkIn),
        checkOut: Timestamp.fromDate(selectedDates.checkOut),
        nights: desglosePrecios.noches,
        total: desglosePrecios.total,
        precioBase: preciosConfig.base,
        desglosePrecios: desglosePrecios.desglose.map((item) => ({
          fecha: Timestamp.fromDate(item.fecha),
          precio: item.precio,
          temporada: item.temporada,
        })),
        status: "pending",
        guestName: reservationInfo.guestName,
        guestEmail: reservationInfo.guestEmail,
        guestPhone: reservationInfo.guestPhone,
        guests: reservationInfo.guests,
        specialRequests: reservationInfo.specialRequests,
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        userEmail: user?.email || null,
      };

      await addDoc(collection(db, "reservations"), reservationData);

      alert(
        "¡Reserva enviada correctamente! Te contactaremos pronto para confirmar."
      );
      onClose();
    } catch (error) {
      console.error("Error creando reserva:", error);
      alert("Error al procesar la reserva. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

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
          days.push(<td key={j} className="text-muted bg-light p-2"></td>);
        } else {
          const currentDate = new Date(year, month, day);
          const isBooked = isDateBooked(currentDate);
          const isSelected = isDateSelected(currentDate);
          const isToday =
            currentDate.toDateString() === new Date().toDateString();
          const precio = getPrecioParaFecha(currentDate);
          const precioBase = preciosConfig.base || 100;
          const esPrecioEspecial = precio !== precioBase;

          let className = "calendar-day p-2 text-center ";
          if (isBooked) {
            className += "bg-danger text-white";
          } else if (isSelected) {
            className += "bg-primary text-white";
          } else if (isToday) {
            className += "bg-warning";
          } else if (currentDate < new Date().setHours(0, 0, 0, 0)) {
            className += "text-muted bg-light";
          } else if (esPrecioEspecial) {
            className += "bg-info text-white";
          } else {
            className += "bg-white";
          }

          days.push(
            <td
              key={j}
              className={className}
              style={{
                cursor: isBooked ? "not-allowed" : "pointer",
                height: "60px",
                position: "relative",
              }}
              onClick={() => !isBooked && handleDateClick(currentDate)}
              title={isBooked ? "Ocupado" : `$${precio} por noche`}
            >
              <div>{day}</div>
              {!isBooked && (
                <small className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white">
                  ${precio}
                </small>
              )}
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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  // ✅ CORRECCIÓN: Verificar si cabana existe antes de renderizar
  if (!cabana) {
    return (
      <div className="alert alert-danger text-center">
        <h4>❌ Error</h4>
        <p>No se pudo cargar la información de la cabaña.</p>
        <button className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-system">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📅 Selecciona tus fechas</h5>
            </div>
            <div className="card-body">
              {/* Controles del calendario */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigateMonth(-1)}
                >
                  ‹
                </button>
                <h6 className="mb-0">
                  {currentMonth
                    .toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </h6>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigateMonth(1)}
                >
                  ›
                </button>
              </div>

              {/* Calendario */}
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <thead>
                    <tr>
                      {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                        (day) => (
                          <th key={day} className="text-center small">
                            {day}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>{renderCalendar()}</tbody>
                </table>
              </div>

              {/* Leyenda mejorada */}
              <div className="mt-3 small">
                <div className="d-flex flex-wrap gap-2">
                  <span>
                    <span className="badge bg-primary">■</span> Seleccionado
                  </span>
                  <span>
                    <span className="badge bg-danger">■</span> Ocupado
                  </span>
                  <span>
                    <span className="badge bg-warning">■</span> Hoy
                  </span>
                  <span>
                    <span className="badge bg-info">■</span> Precio especial
                  </span>
                </div>
                <div className="mt-2 text-muted">
                  <small>
                    Precio base: ${preciosConfig.base || 100} por noche
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📝 Detalles de la Reserva</h5>
            </div>
            <div className="card-body">
              {/* Información de la cabaña */}
              <div className="mb-3">
                <h6>{cabana.nombre}</h6>
                <p className="small text-muted mb-2">
                  Capacidad: {cabana.capacidad} • {cabana.dormitorios}{" "}
                  dormitorios
                </p>
                <div className="bg-light p-2 rounded">
                  <small>
                    <strong>Precio base:</strong> ${preciosConfig.base || 100}{" "}
                    por noche
                    {preciosConfig.temporadas &&
                      preciosConfig.temporadas.length > 0 && (
                        <span className="text-info">
                          {" "}
                          • Precios variables aplicados
                        </span>
                      )}
                  </small>
                </div>
              </div>

              {/* Fechas seleccionadas */}
              {selectedDates.checkIn && (
                <div className="alert alert-info py-2">
                  <strong>Check-in:</strong>{" "}
                  {selectedDates.checkIn.toLocaleDateString()}
                  {selectedDates.checkOut && (
                    <>
                      <br />
                      <strong>Check-out:</strong>{" "}
                      {selectedDates.checkOut.toLocaleDateString()}
                      <br />
                      <strong>Noches:</strong> {desglosePrecios.noches}
                    </>
                  )}
                </div>
              )}

              {/* Desglose de precios */}
              {desglosePrecios.noches > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">💰 Desglose de Precios</h6>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setMostrarDesglose(!mostrarDesglose)}
                    >
                      {mostrarDesglose ? "Ocultar" : "Ver detalle"}
                    </button>
                  </div>

                  {mostrarDesglose && (
                    <div className="bg-light p-2 rounded small">
                      {desglosePrecios.desglose.map((noche, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-between py-1 border-bottom"
                        >
                          <span>
                            {noche.fecha.toLocaleDateString()}
                            {noche.esTemporadaEspecial && (
                              <span className="badge bg-info ms-1">
                                ${noche.precio}
                              </span>
                            )}
                          </span>
                          <span>${noche.precio}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 p-3 bg-success bg-opacity-10 rounded">
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total ({desglosePrecios.noches} noches):</span>
                      <span>${desglosePrecios.total}</span>
                    </div>
                    {preciosConfig.temporadas &&
                      preciosConfig.temporadas.length > 0 && (
                        <small className="text-muted">
                          Incluye tarifas de temporada aplicadas
                        </small>
                      )}
                  </div>
                </div>
              )}

              {/* Formulario de reserva */}
              <div className="mb-3">
                <label className="form-label">Nombre completo *</label>
                <input
                  type="text"
                  className="form-control"
                  value={reservationInfo.guestName}
                  onChange={(e) =>
                    setReservationInfo({
                      ...reservationInfo,
                      guestName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={reservationInfo.guestEmail}
                    onChange={(e) =>
                      setReservationInfo({
                        ...reservationInfo,
                        guestEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={reservationInfo.guestPhone}
                    onChange={(e) =>
                      setReservationInfo({
                        ...reservationInfo,
                        guestPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-6">
                  <label className="form-label">Huéspedes</label>
                  <select
                    className="form-select"
                    value={reservationInfo.guests}
                    onChange={(e) =>
                      setReservationInfo({
                        ...reservationInfo,
                        guests: parseInt(e.target.value),
                      })
                    }
                  >
                    {[...Array(cabana.capacidad || 6)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "huésped" : "huéspedes"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label">Solicitudes especiales</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Comentarios adicionales..."
                  value={reservationInfo.specialRequests}
                  onChange={(e) =>
                    setReservationInfo({
                      ...reservationInfo,
                      specialRequests: e.target.value,
                    })
                  }
                />
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleReservation}
                disabled={
                  loading || !selectedDates.checkIn || !selectedDates.checkOut
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Procesando...
                  </>
                ) : (
                  `📅 SOLICITAR RESERVA - $${desglosePrecios.total}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationSystem;
