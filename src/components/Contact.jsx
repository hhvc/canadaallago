import React, { useState, useRef } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Por favor ingrese su nombre.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Por favor ingrese su email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Por favor ingrese un email válido.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Por favor ingrese su teléfono.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Por favor escriba un mensaje.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const result = await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log("Email enviado exitosamente:", result);
      setSubmitMessage(
        "¡Mensaje enviado correctamente! Te responderemos a la brevedad."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error al enviar el email:", error);
      setSubmitMessage(
        "Error al enviar el mensaje. Por favor, intente nuevamente o contáctenos directamente por teléfono."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center mb-4">
            <h1>Contacto</h1>
            <p>
              Escribinos con el siguiente formulario y te responderemos a la
              brevedad.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <form ref={form} onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nombre
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  id="name"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  id="phone"
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label">
                  Mensaje
                </label>
                <textarea
                  className={`form-control ${
                    errors.message ? "is-invalid" : ""
                  }`}
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Mensaje"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
                {errors.message && (
                  <div className="invalid-feedback">{errors.message}</div>
                )}
              </div>

              {submitMessage && (
                <div
                  className={`alert ${
                    submitMessage.includes("Error")
                      ? "alert-danger"
                      : "alert-success"
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-outline-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </button>
            </form>
          </div>

          <div className="col-md-1"></div>

          <div className="col-md-5">
            <div className="text-center">
              <h4>
                <i className="fa fa-envelope"></i> Email
              </h4>
              <p>
                <a href="mailto:canadaallago@gmail.com">
                  canadaallago@gmail.com
                </a>
              </p>

              <h4>
                <i className="fa fa-phone"></i> Teléfono
              </h4>
              <p>(+54 9) 351 252-5252</p>

              <h4>
                <i className="fa fa-map-marker"></i> Dirección
              </h4>
              <p>
                Villa Parque Siquiman, <br />
                Córdoba, Argentina.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
