import React, { useState } from "react";

const Cabana = ({ cabana }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % cabana.imagenes.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + cabana.imagenes.length) % cabana.imagenes.length
    );
  };

  return (
    <>
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card h-100 shadow-sm">
          <img
            src={cabana.imagenes[0]}
            className="card-img-top"
            alt={cabana.nombre}
            style={{ height: "250px", objectFit: "cover" }}
          />
          <div className="card-body d-flex flex-column">
            <h3 className="card-title h5">{cabana.nombre}</h3>
            <ul className="list-unstyled flex-grow-1">
              <li>🏠 {cabana.capacidad}</li>
              <li>📐 {cabana.metrosCuadrados} m² cubiertos</li>
              <li>🛏️ {cabana.dormitorios} dormitorios</li>
              {cabana.caracteristicas.map((caracteristica, index) => (
                <li key={index}>✅ {caracteristica}</li>
              ))}
            </ul>
            <div className="mt-auto">
              <div className="d-flex gap-2 flex-wrap">
                {cabana.imagenes.length > 0 && (
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => setShowModal(true)}
                  >
                    📸 VER FOTOS
                  </button>
                )}
                <a href="#contact" className="btn btn-outline-dark btn-sm">
                  💰 Consultar precio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de imágenes */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark">
              <div className="modal-header border-0">
                <h5 className="modal-title text-white">{cabana.nombre}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={cabana.imagenes[currentImage]}
                  alt={`${cabana.nombre} ${currentImage + 1}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: "70vh", objectFit: "contain" }}
                />
                {cabana.imagenes.length > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                      className="btn btn-outline-light"
                      onClick={prevImage}
                    >
                      ◀ Anterior
                    </button>
                    <span className="text-white">
                      {currentImage + 1} / {cabana.imagenes.length}
                    </span>
                    <button
                      className="btn btn-outline-light"
                      onClick={nextImage}
                    >
                      Siguiente ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cabana;
