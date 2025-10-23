import React, { useState, useEffect, useRef } from "react";
import { serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CabanaForm = ({
  cabanaExistente = null,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    metrosCuadrados: "",
    dormitorios: "",
    caracteristicas: [""],
    imagenes: [""],
    // Campos de precios con switches individuales
    precioTemporada: "",
    mostrarPrecioTemporada: false,
    precioQuincena: "",
    mostrarPrecioQuincena: false,
    precioNoche: "",
    mostrarPrecioNoche: false,
    adicionalPorPersona: "",
    mostrarAdicionalPorPersona: false,
    disponible: true,
    destacada: false,
    orden: 0,
  });

  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState([]);
  const fileInputRef = useRef(null);
  const storage = getStorage();

  // Cargar datos si estamos editando
  useEffect(() => {
    if (cabanaExistente) {
      setFormData({
        nombre: cabanaExistente.nombre || "",
        descripcion: cabanaExistente.descripcion || "",
        capacidad: cabanaExistente.capacidad || "",
        metrosCuadrados: cabanaExistente.metrosCuadrados?.toString() || "",
        dormitorios: cabanaExistente.dormitorios?.toString() || "",
        caracteristicas:
          cabanaExistente.caracteristicas?.length > 0
            ? [...cabanaExistente.caracteristicas, ""]
            : [""],
        imagenes:
          cabanaExistente.imagenes?.length > 0
            ? [...cabanaExistente.imagenes, ""]
            : [""],
        // Cargar precios existentes con sus switches
        precioTemporada: cabanaExistente.precioTemporada?.toString() || "",
        mostrarPrecioTemporada: cabanaExistente.mostrarPrecioTemporada || false,
        precioQuincena: cabanaExistente.precioQuincena?.toString() || "",
        mostrarPrecioQuincena: cabanaExistente.mostrarPrecioQuincena || false,
        precioNoche: cabanaExistente.precioNoche?.toString() || "",
        mostrarPrecioNoche: cabanaExistente.mostrarPrecioNoche || false,
        adicionalPorPersona:
          cabanaExistente.adicionalPorPersona?.toString() || "",
        mostrarAdicionalPorPersona:
          cabanaExistente.mostrarAdicionalPorPersona || false,
        disponible: cabanaExistente.disponible ?? true,
        destacada: cabanaExistente.destacada || false,
        orden: cabanaExistente.orden || 0,
      });
    }
  }, [cabanaExistente]);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.capacidad.trim()) {
      newErrors.capacidad = "La capacidad es requerida";
    }

    if (!formData.metrosCuadrados || parseInt(formData.metrosCuadrados) <= 0) {
      newErrors.metrosCuadrados = "Los metros cuadrados deben ser mayores a 0";
    }

    if (!formData.dormitorios || parseInt(formData.dormitorios) <= 0) {
      newErrors.dormitorios = "Debe tener al menos 1 dormitorio";
    }

    // Validar precios solo si tienen valor y el switch está activado
    if (formData.precioTemporada && parseFloat(formData.precioTemporada) < 0) {
      newErrors.precioTemporada = "El precio debe ser mayor o igual a 0";
    }
    if (formData.precioQuincena && parseFloat(formData.precioQuincena) < 0) {
      newErrors.precioQuincena = "El precio debe ser mayor o igual a 0";
    }
    if (formData.precioNoche && parseFloat(formData.precioNoche) < 0) {
      newErrors.precioNoche = "El precio debe ser mayor o igual a 0";
    }
    if (
      formData.adicionalPorPersona &&
      parseFloat(formData.adicionalPorPersona) < 0
    ) {
      newErrors.adicionalPorPersona = "El adicional debe ser mayor o igual a 0";
    }

    const imagenesValidas = formData.imagenes.filter(
      (img) => img.trim() !== ""
    );
    if (imagenesValidas.length === 0) {
      newErrors.imagenes = "Al menos una imagen es requerida";
    }

    if (formData.orden === "" || parseInt(formData.orden) < 0) {
      newErrors.orden = "El orden debe ser un número positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para redimensionar imagen
  const resizeImage = (file, maxWidth = 800, maxHeight = 600) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, file.type, 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Subir imagen a Firebase Storage
  const uploadImage = async (file) => {
    try {
      // Redimensionar imagen antes de subir
      const resizedBlob = await resizeImage(file);
      const timestamp = Date.now();
      const fileName = `cabanas/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, resizedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      throw new Error("Error al subir la imagen");
    }
  };

  // Manejar subida de archivos
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(files.map((file) => file.name));

    try {
      const uploadPromises = files.map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);

      // Agregar las nuevas URLs al array de imágenes
      setFormData((prev) => ({
        ...prev,
        imagenes: [
          ...prev.imagenes.filter((img) => img.trim() !== ""),
          ...urls,
        ],
      }));

      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error en la subida de imágenes:", error);
      alert("Error al subir algunas imágenes. Por favor, inténtalo de nuevo.");
    } finally {
      setUploadingImages([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar datos para guardar
    const cabanaData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      capacidad: formData.capacidad.trim(),
      metrosCuadrados: parseInt(formData.metrosCuadrados),
      dormitorios: parseInt(formData.dormitorios),
      caracteristicas: formData.caracteristicas
        .filter((c) => c.trim() !== "")
        .map((c) => c.trim()),
      imagenes: formData.imagenes
        .filter((img) => img.trim() !== "")
        .map((img) => img.trim()),
      // Campos de precios con sus switches
      precioTemporada: formData.precioTemporada
        ? parseFloat(formData.precioTemporada)
        : null,
      mostrarPrecioTemporada: formData.mostrarPrecioTemporada,
      precioQuincena: formData.precioQuincena
        ? parseFloat(formData.precioQuincena)
        : null,
      mostrarPrecioQuincena: formData.mostrarPrecioQuincena,
      precioNoche: formData.precioNoche
        ? parseFloat(formData.precioNoche)
        : null,
      mostrarPrecioNoche: formData.mostrarPrecioNoche,
      adicionalPorPersona: formData.adicionalPorPersona
        ? parseFloat(formData.adicionalPorPersona)
        : null,
      mostrarAdicionalPorPersona: formData.mostrarAdicionalPorPersona,
      disponible: formData.disponible,
      destacada: formData.destacada,
      orden: parseInt(formData.orden),
      updatedAt: serverTimestamp(),
    };

    // Si es nueva, agregar createdAt
    if (!cabanaExistente) {
      cabanaData.createdAt = serverTimestamp();
    }

    onSave(cabanaData);
  };

  // Manejo de arrays dinámicos
  const addCampoArray = (campo) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: [...prev[campo], ""],
    }));
  };

  const removeCampoArray = (campo, index) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: prev[campo].filter((_, i) => i !== index),
    }));
  };

  const updateCampoArray = (campo, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: prev[campo].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const removeImagen = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="card mt-5">
      {" "}
      {/* ✅ Agregado mt-5 para separar del navbar */}
      <div
        className={`card-header ${
          cabanaExistente ? "bg-warning" : "bg-primary"
        } text-white`}
      >
        <h5 className="mb-0">
          {cabanaExistente ? "✏️ Editar Cabaña" : "🏡 Nueva Cabaña"}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Información Básica */}
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">
                  Nombre de la cabaña <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.nombre ? "is-invalid" : ""
                  }`}
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Casa Aromillo"
                  required
                />
                {errors.nombre && (
                  <div className="invalid-feedback">{errors.nombre}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={formData.descripcion}
                  onChange={(e) =>
                    handleInputChange("descripcion", e.target.value)
                  }
                  rows="3"
                  placeholder="Describe las características especiales de la cabaña..."
                />
                <small className="form-text text-muted">
                  Esta descripción aparecerá en la página principal
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Capacidad <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.capacidad ? "is-invalid" : ""
                  }`}
                  value={formData.capacidad}
                  onChange={(e) =>
                    handleInputChange("capacidad", e.target.value)
                  }
                  placeholder="Ej: 2 a 5 personas"
                  required
                />
                {errors.capacidad && (
                  <div className="invalid-feedback">{errors.capacidad}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Metros Cuadrados <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.metrosCuadrados ? "is-invalid" : ""
                      }`}
                      value={formData.metrosCuadrados}
                      onChange={(e) =>
                        handleInputChange("metrosCuadrados", e.target.value)
                      }
                      min="1"
                      required
                    />
                    {errors.metrosCuadrados && (
                      <div className="invalid-feedback">
                        {errors.metrosCuadrados}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Dormitorios <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.dormitorios ? "is-invalid" : ""
                      }`}
                      value={formData.dormitorios}
                      onChange={(e) =>
                        handleInputChange("dormitorios", e.target.value)
                      }
                      min="1"
                      required
                    />
                    {errors.dormitorios && (
                      <div className="invalid-feedback">
                        {errors.dormitorios}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Orden de visualización <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.orden ? "is-invalid" : ""}`}
                  value={formData.orden}
                  onChange={(e) => handleInputChange("orden", e.target.value)}
                  min="0"
                  required
                />
                {errors.orden && (
                  <div className="invalid-feedback">{errors.orden}</div>
                )}
                <small className="form-text text-muted">
                  Menor número = se muestra primero
                </small>
              </div>
            </div>
          </div>

          {/* Sección de Precios - SIEMPRE VISIBLE con switches individuales */}
          <div className="mb-4">
            <div className="card bg-light">
              <div className="card-header bg-secondary text-white">
                <h6 className="mb-0">💰 Configuración de Precios</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    {/* Precio por temporada */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-bold">
                          Precio base por temporada
                        </label>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.mostrarPrecioTemporada}
                            onChange={(e) =>
                              handleInputChange(
                                "mostrarPrecioTemporada",
                                e.target.checked
                              )
                            }
                            id="mostrarPrecioTemporadaSwitch"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="mostrarPrecioTemporadaSwitch"
                          >
                            Mostrar
                          </label>
                        </div>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${
                            errors.precioTemporada ? "is-invalid" : ""
                          }`}
                          value={formData.precioTemporada}
                          onChange={(e) =>
                            handleInputChange("precioTemporada", e.target.value)
                          }
                          min="0"
                          placeholder="Opcional"
                        />
                      </div>
                      {errors.precioTemporada && (
                        <div className="invalid-feedback d-block">
                          {errors.precioTemporada}
                        </div>
                      )}
                    </div>

                    {/* Precio por quincena */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-bold">
                          Precio base por quincena
                        </label>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.mostrarPrecioQuincena}
                            onChange={(e) =>
                              handleInputChange(
                                "mostrarPrecioQuincena",
                                e.target.checked
                              )
                            }
                            id="mostrarPrecioQuincenaSwitch"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="mostrarPrecioQuincenaSwitch"
                          >
                            Mostrar
                          </label>
                        </div>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${
                            errors.precioQuincena ? "is-invalid" : ""
                          }`}
                          value={formData.precioQuincena}
                          onChange={(e) =>
                            handleInputChange("precioQuincena", e.target.value)
                          }
                          min="0"
                          placeholder="Opcional"
                        />
                      </div>
                      {errors.precioQuincena && (
                        <div className="invalid-feedback d-block">
                          {errors.precioQuincena}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    {/* Precio por noche */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-bold">
                          Precio base por noche
                        </label>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.mostrarPrecioNoche}
                            onChange={(e) =>
                              handleInputChange(
                                "mostrarPrecioNoche",
                                e.target.checked
                              )
                            }
                            id="mostrarPrecioNocheSwitch"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="mostrarPrecioNocheSwitch"
                          >
                            Mostrar
                          </label>
                        </div>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${
                            errors.precioNoche ? "is-invalid" : ""
                          }`}
                          value={formData.precioNoche}
                          onChange={(e) =>
                            handleInputChange("precioNoche", e.target.value)
                          }
                          min="0"
                          placeholder="Opcional"
                        />
                      </div>
                      {errors.precioNoche && (
                        <div className="invalid-feedback d-block">
                          {errors.precioNoche}
                        </div>
                      )}
                    </div>

                    {/* Adicional por persona */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-bold">
                          Adicional diario por persona
                        </label>
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={formData.mostrarAdicionalPorPersona}
                            onChange={(e) =>
                              handleInputChange(
                                "mostrarAdicionalPorPersona",
                                e.target.checked
                              )
                            }
                            id="mostrarAdicionalPorPersonaSwitch"
                          />
                          <label
                            className="form-check-label small"
                            htmlFor="mostrarAdicionalPorPersonaSwitch"
                          >
                            Mostrar
                          </label>
                        </div>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${
                            errors.adicionalPorPersona ? "is-invalid" : ""
                          }`}
                          value={formData.adicionalPorPersona}
                          onChange={(e) =>
                            handleInputChange(
                              "adicionalPorPersona",
                              e.target.value
                            )
                          }
                          min="0"
                          placeholder="Opcional"
                        />
                      </div>
                      {errors.adicionalPorPersona && (
                        <div className="invalid-feedback d-block">
                          {errors.adicionalPorPersona}
                        </div>
                      )}
                      <small className="form-text text-muted">
                        Precio adicional por persona más allá de la capacidad
                        base
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="mb-3">
            <label className="form-label">Características</label>
            {formData.caracteristicas.map((caracteristica, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  value={caracteristica}
                  onChange={(e) =>
                    updateCampoArray("caracteristicas", index, e.target.value)
                  }
                  placeholder="Ej: Vista al lago, Pileta, Cocina equipada, WiFi gratuito, etc."
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeCampoArray("caracteristicas", index)}
                  disabled={formData.caracteristicas.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => addCampoArray("caracteristicas")}
            >
              ➕ Agregar Característica
            </button>
          </div>

          {/* Imágenes - Ahora con subida de archivos */}
          <div className="mb-3">
            <label className="form-label">
              Imágenes <span className="text-danger">*</span>
            </label>

            {/* Subida de archivos */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Subir imágenes desde tu computadora:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="form-control"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImages.length > 0}
              />
              <small className="form-text text-muted">
                Puedes seleccionar múltiples imágenes. Se redimensionarán
                automáticamente.
              </small>

              {uploadingImages.length > 0 && (
                <div className="mt-2">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></div>
                  <small>Subiendo {uploadingImages.length} imagen(es)...</small>
                </div>
              )}
            </div>

            {/* URLs de imágenes existentes */}
            <label className="form-label">O ingresar URLs de imágenes:</label>
            {errors.imagenes && (
              <div className="alert alert-danger small">{errors.imagenes}</div>
            )}

            {formData.imagenes.map((imagen, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="url"
                  className="form-control"
                  value={imagen}
                  onChange={(e) =>
                    updateCampoArray("imagenes", index, e.target.value)
                  }
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeImagen(index)}
                  disabled={formData.imagenes.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => addCampoArray("imagenes")}
            >
              ➕ Agregar URL de Imagen
            </button>

            {/* Vista previa de imágenes */}
            {formData.imagenes.filter((img) => img.trim() !== "").length >
              0 && (
              <div className="mt-3">
                <label className="form-label">Vista previa de imágenes:</label>
                <div className="row">
                  {formData.imagenes
                    .filter((img) => img.trim() !== "")
                    .map((imagen, index) => (
                      <div key={index} className="col-md-3 mb-2">
                        <div className="card">
                          <img
                            src={imagen}
                            className="card-img-top"
                            alt={`Vista previa ${index + 1}`}
                            style={{ height: "100px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/150x100?text=Error+Imagen";
                            }}
                          />
                          <div className="card-body p-2">
                            <small className="text-muted">
                              Imagen {index + 1}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Opciones */}
          <div className="mb-4">
            <div className="row">
              <div className="col-md-6">
                <div className="form-check form-switch mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.disponible}
                    onChange={(e) =>
                      handleInputChange("disponible", e.target.checked)
                    }
                    id="disponibleSwitch"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="disponibleSwitch"
                  >
                    ✅ Disponible para reservas
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check form-switch mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.destacada}
                    onChange={(e) =>
                      handleInputChange("destacada", e.target.checked)
                    }
                    id="destacadaSwitch"
                  />
                  <label className="form-check-label" htmlFor="destacadaSwitch">
                    ⭐ Cabaña destacada
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || uploadingImages.length > 0}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Guardando...
                </>
              ) : cabanaExistente ? (
                "💾 Actualizar Cabaña"
              ) : (
                "🏡 Crear Cabaña"
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading || uploadingImages.length > 0}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CabanaForm;
