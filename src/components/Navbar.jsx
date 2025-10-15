import React, { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    closeMenu();

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container">
        <a
          className="navbar-brand"
          href="#page-top"
          onClick={(e) => handleScroll(e, "page-top")}
        >
          <img
            src="src/assets/img/logo.png"
            className="img-fluid"
            alt="Cañada al Lago"
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
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
