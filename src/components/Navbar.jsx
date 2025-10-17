import { useState } from "react";
import { useAuth } from "../context/auth/useAuth";
import Login from "./auth/Login";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    closeMenus();

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenus();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    closeMenus();
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <a
            className="navbar-brand"
            href="#page-top"
            onClick={(e) => handleScroll(e, "page-top")}
          >
            <img
              src="/assets/img/logo.png"
              className="img-fluid"
              alt="Cañada al Lago"
              style={{ maxHeight: "50px" }}
            />
          </a>
          
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#about"
                  onClick={(e) => handleScroll(e, "about")}
                >
                  Inicio
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#cabañas"
                  onClick={(e) => handleScroll(e, "cabañas")}
                >
                  Cabañas
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#fotos"
                  onClick={(e) => handleScroll(e, "fotos")}
                >
                  Fotos
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#actividades"
                  onClick={(e) => handleScroll(e, "actividades")}
                >
                  Actividades
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#contact"
                  onClick={(e) => handleScroll(e, "contact")}
                >
                  Contacto
                </a>
              </li>

              {/* Menú de usuario simplificado */}
              <li className={`nav-item dropdown ${isUserMenuOpen ? "show" : ""}`}>
                {user ? (
                  <>
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      onClick={toggleUserMenu}
                      aria-expanded={isUserMenuOpen}
                      style={{ cursor: "pointer" }}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Perfil"
                          className="rounded-circle me-2"
                          style={{ width: "32px", height: "32px" }}
                        />
                      ) : (
                        <i className="fa fa-user me-2"></i>
                      )}
                      {user.displayName || "Usuario"}
                    </a>
                    <ul className={`dropdown-menu ${isUserMenuOpen ? "show" : ""}`}>
                      <li>
                        <div className="dropdown-item-text">
                          <small>Conectado como</small><br />
                          <strong>{user.displayName || user.email}</strong>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleLogout}
                        >
                          <i className="fa fa-sign-out me-2"></i>
                          Cerrar Sesión
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <button
                    className="nav-link btn btn-link"
                    onClick={openLoginModal}
                    style={{ 
                      border: 'none', 
                      background: 'none', 
                      color: 'rgba(255,255,255,0.85)',
                      textDecoration: 'none'
                    }}
                  >
                    <i className="fa fa-user me-2"></i>
                    Iniciar Sesión
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modal de Login Mejorado */}
      {showLoginModal && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeLoginModal}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Iniciar Sesión</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeLoginModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <Login />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;