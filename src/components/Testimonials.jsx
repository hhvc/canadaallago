import React, { useState, useEffect } from "react";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: `"Pasamos nuestra luna de miel en Siquiman, fueron dos semanas inolvidables. El lugar es precioso y fueron muy cariñosos con nosotros. Esperamos volver a verlos este verano. ¡Gracias por todo!"`,
      author: "Gastón y Marian M.",
    },
    {
      id: 2,
      text: `Gracias chicos por su buena onda, la pasamos genial. Cariños.`,
      author: "Familia Bustos Argañaraz",
    },
    {
      id: 3,
      text: `Veníamos buscando hace tiempo un lugar para escaparnos un finde y recargar las pilas, y lo encontramos. Pasamos un finde hermoso, muchas gracias.`,
      author: "dr Pepe Carena y familia",
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  return (
    <section id="press" className="testimonials bg-light py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center mb-4">
            <h2>Los saludos de los huéspedes</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="testimonials-carousel text-center">
              <div className="testimonial-item">
                <p className="quote">
                  <strong>{testimonials[currentTestimonial].text}</strong>
                </p>
                <div className="testimonial-info mt-3">
                  <span className="name">
                    {testimonials[currentTestimonial].author}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles del carrusel */}
            <div className="mt-4 text-center">
              {/* Indicadores */}
              <div className="mb-3 d-flex justify-content-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`btn btn-sm rounded-circle ${
                      currentTestimonial === index ? "bg-dark" : "bg-secondary"
                    }`}
                    style={{
                      width: "12px",
                      height: "12px",
                      margin: "0 5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label={`Ir al testimonio ${index + 1}`}
                  />
                ))}
              </div>

              {/* Botones de navegación */}
              <div className="d-flex justify-content-center">
                <button
                  onClick={prevTestimonial}
                  className="btn btn-outline-dark me-2"
                >
                  Anterior
                </button>
                <button
                  onClick={nextTestimonial}
                  className="btn btn-outline-dark"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
