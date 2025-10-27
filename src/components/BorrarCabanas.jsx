import React, { useState } from "react";

const Cabanas = () => {
  const [showAromillo, setShowAromillo] = useState(false);
  const [showTalaEspinillo, setShowTalaEspinillo] = useState(false);

  const aromilloImages = [
    "/assets/img/fotos/casas/aromillo_1.jpg",
    "/assets/img/fotos/casas/aromillo_2.jpg",
    "/assets/img/fotos/casas/aromillo_3.jpg",
    "/assets/img/fotos/casas/aromillo_4.jpg",
    "/assets/img/fotos/casas/aromillo_5.jpg",
    "/assets/img/fotos/casas/aromillo_6.jpg",
    "/assets/img/fotos/casas/aromillo_7.jpg",
  ];

  const talaEspinilloImages = [
    "/assets/img/fotos/casas/tala_espinillo_01.jpg",
    "/assets/img/fotos/casas/tala_espinillo_02.jpg",
    "/assets/img/fotos/casas/tala_espinillo_03.jpg",
    "/assets/img/fotos/casas/tala_espinillo_04.jpg",
  ];

  const [currentAromilloImage, setCurrentAromilloImage] = useState(0);
  const [currentTalaImage, setCurrentTalaImage] = useState(0);

  const nextAromilloImage = () => {
    setCurrentAromilloImage((prev) => (prev + 1) % aromilloImages.length);
  };

  const prevAromilloImage = () => {
    setCurrentAromilloImage(
      (prev) => (prev - 1 + aromilloImages.length) % aromilloImages.length
    );
  };

  const nextTalaImage = () => {
    setCurrentTalaImage((prev) => (prev + 1) % talaEspinilloImages.length);
  };

  const prevTalaImage = () => {
    setCurrentTalaImage(
      (prev) =>
        (prev - 1 + talaEspinilloImages.length) % talaEspinilloImages.length
    );
  };

  return (
    <>
      <section
        id="cabañas"
        className="pricing py-5"
        style={{ backgroundImage: "url('/assets/img/bgTop2.jpg')" }}
      >
        <div className="container">
          <div className="row text-center mb-4">
            <div className="col-lg-12">
              <h1 className="text-white">Cabañas disponibles</h1>
            </div>
          </div>
          <div className="row">
            {/* Casa Aromillo */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src="/assets/img/fotos/Caba3.jpg"
                  className="card-img-top"
                  alt="Casa Aromillo"
                />
                <div className="card-body text-center">
                  <h3 className="card-title">Casa Aromillo</h3>
                  <ul className="list-unstyled">
                    <li>Capacidad para 2 a 5 personas</li>
                    <li>80 m2 cubiertos</li>
                    <li>2 dormitorios</li>
                    <li>Vista al lago</li>
                    <li>2 asadores</li>
                  </ul>
                  <button
                    className="btn btn-info"
                    onClick={() => setShowAromillo(true)}
                  >
                    VER FOTOS
                  </button>
                </div>
              </div>
            </div>

            {/* Cabañas Tala y Espinillo */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src="/assets/img/fotos/Caba1y2.jpg"
                  className="card-img-top"
                  alt="Cabañas Tala y Espinillo"
                />
                <div className="card-body text-center">
                  <h3 className="card-title">Cabañas Tala y Espinillo</h3>
                  <ul className="list-unstyled">
                    <li>Capacidad para 2 a 4 personas c/u</li>
                    <li>70 m2 cubiertos c/u</li>
                    <li>2 dormitorios c/u</li>
                    <li>Pileta</li>
                    <li>Vista al lago</li>
                  </ul>
                  <button
                    className="btn btn-info"
                    onClick={() => setShowTalaEspinillo(true)}
                  >
                    VER FOTOS
                  </button>
                </div>
              </div>
            </div>

            {/* Casa El Aromo */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src="/assets/img/fotos/Casa2.jpg"
                  className="card-img-top"
                  alt="Casa El Aromo"
                />
                <div className="card-body text-center">
                  <h3 className="card-title">Casa El Aromo</h3>
                  <ul className="list-unstyled">
                    <li>Capacidad para 4 a 6 personas</li>
                    <li>90 m2 cubiertos</li>
                    <li>3 dormitorios</li>
                    <li>Pileta y cochera</li>
                    <li>Vista al lago</li>
                  </ul>
                  <a href="#contact" className="btn btn-outline-dark">
                    ¡Reservala ahora!
                  </a>
                </div>
              </div>
            </div>

            {/* Casa de Piedra */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src="/assets/img/fotos/Casa1.jpg"
                  className="card-img-top"
                  alt="Casa de Piedra"
                />
                <div className="card-body text-center">
                  <h3 className="card-title">Casa de Piedra</h3>
                  <ul className="list-unstyled">
                    <li>Capacidad para 6 a 12 personas</li>
                    <li>300 m2 cubiertos</li>
                    <li>5 dormitorios, 4 baños</li>
                    <li>Quincho con pileta</li>
                    <li>Gym, basquet y juegos</li>
                  </ul>
                  <a href="#contact" className="btn btn-outline-dark">
                    ¡Reservala ahora!
                  </a>
                </div>
              </div>
            </div>

            {/* Casa Piquillín */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src="/assets/img/fotos/Casa2.jpg"
                  className="card-img-top"
                  alt="Casa Piquillín"
                />
                <div className="card-body text-center">
                  <h3 className="card-title">Casa Piquillín</h3>
                  <ul className="list-unstyled">
                    <li>Capacidad para 4 a 6 personas</li>
                    <li>90 m2 cubiertos</li>
                    <li>3 dormitorios</li>
                    <li>Pileta y cochera</li>
                    <li>Vista al lago</li>
                  </ul>
                  <a href="#contact" className="btn btn-outline-dark">
                    ¡Reservala ahora!
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Casa Aromillo */}
      {showAromillo && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <img
                  src={aromilloImages[currentAromilloImage]}
                  alt={`Casa Aromillo ${currentAromilloImage + 1}`}
                  className="img-fluid"
                />
                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={prevAromilloImage}
                  >
                    Anterior
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={nextAromilloImage}
                  >
                    Siguiente
                  </button>
                </div>
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => setShowAromillo(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cabañas Tala y Espinillo */}
      {showTalaEspinillo && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <img
                  src={talaEspinilloImages[currentTalaImage]}
                  alt={`Cabañas Tala y Espinillo ${currentTalaImage + 1}`}
                  className="img-fluid"
                />
                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-secondary" onClick={prevTalaImage}>
                    Anterior
                  </button>
                  <button className="btn btn-secondary" onClick={nextTalaImage}>
                    Siguiente
                  </button>
                </div>
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => setShowTalaEspinillo(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cabanas;
