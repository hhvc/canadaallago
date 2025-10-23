import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth";
import { useDashboardStats } from "../../hooks/useDashboardStats";

const AdminDashboard = () => {
  const { user, hasRole } = useAuth();
  const { stats, loading, error } = useDashboardStats();

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

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>🛠️ Panel de Administración</h1>
              <p className="text-muted mb-0">
                Bienvenido, <strong>{user?.displayName || user?.email}</strong>
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted">
                Rol: <strong>{user?.role}</strong>
              </small>
            </div>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div
              className="alert alert-warning alert-dismissible fade show"
              role="alert"
            >
              <strong>Advertencia:</strong> {error}
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
            </div>
          )}

          {/* Tarjetas de estadísticas rápidas */}
          <div className="row mb-5">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <i className="fa fa-home fa-2x mb-2"></i>
                  {loading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <h4 className="mb-0">{stats.totalCabanas}</h4>
                      <small>Total Cabañas</small>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <i className="fa fa-check-circle fa-2x mb-2"></i>
                  {loading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <h4 className="mb-0">{stats.cabanasDisponibles}</h4>
                      <small>Disponibles</small>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <i className="fa fa-star fa-2x mb-2"></i>
                  {loading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <h4 className="mb-0">{stats.cabanasDestacadas}</h4>
                      <small>Destacadas</small>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <i className="fa fa-users fa-2x mb-2"></i>
                  {loading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  ) : (
                    <>
                      <h4 className="mb-0">{stats.totalUsuarios}</h4>
                      <small>Usuarios</small>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Módulos de administración */}
          <div className="row">
            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fa fa-home fa-3x text-primary mb-3"></i>
                  <h5 className="card-title">🏠 Gestión de Cabañas</h5>
                  <p className="card-text">
                    Administra todas las cabañas: crear, editar, eliminar y
                    configurar disponibilidad.
                  </p>
                  <Link to="/admin/cabanas" className="btn btn-primary">
                    Gestionar Cabañas
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fa fa-image fa-3x text-success mb-3"></i>
                  <h5 className="card-title">🖼️ Gestión de Galería</h5>
                  <p className="card-text">
                    Administra las imágenes de la galería del sitio web.
                  </p>
                  <button className="btn btn-outline-secondary" disabled>
                    Próximamente
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fa fa-calendar fa-3x text-warning mb-3"></i>
                  <h5 className="card-title">📅 Reservas</h5>
                  <p className="card-text">
                    Gestiona las reservas y calendario de disponibilidad.
                  </p>
                  <button className="btn btn-outline-secondary" disabled>
                    Próximamente
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fa fa-users fa-3x text-info mb-3"></i>
                  <h5 className="card-title">👥 Gestión de Usuarios</h5>
                  <p className="card-text">
                    Administra usuarios y roles del sistema.
                  </p>
                  <button className="btn btn-outline-secondary" disabled>
                    Próximamente
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fa fa-cog fa-3x text-secondary mb-3"></i>
                  <h5 className="card-title">⚙️ Configuración</h5>
                  <p className="card-text">
                    Configuración general del sitio web y preferencias.
                  </p>
                  <button className="btn btn-outline-secondary" disabled>
                    Próximamente
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <i className="fa fa-chart-bar fa-3x text-danger mb-3"></i>
                  <h5 className="card-title">📊 Reportes</h5>
                  <p className="card-text">
                    Reportes y estadísticas del negocio.
                  </p>
                  <button className="btn btn-outline-secondary" disabled>
                    Próximamente
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="card mt-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">🚀 Acciones Rápidas</h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/admin/cabanasform" className="btn btn-primary">
                  ➕ Agregar Nueva Cabaña
                </Link>
                <button className="btn btn-outline-secondary" disabled>
                  📧 Ver Mensajes
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  🔔 Notificaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
