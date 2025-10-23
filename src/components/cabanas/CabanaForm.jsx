import { useRef } from "react";
import { useCabanaForm } from "../../hooks/useCabanaForm";

const CabanaForm = ({
  cabanaExistente = null,
  onSave,
  onCancel,
  loading = false,
}) => {
  const fileInputRef = useRef();

  const {
    formData,
    errors,
    uploadingImages,
    loading: internalLoading,
    handleInputChange,
    handleFileUpload,
    handleSubmit,
    addCampoArray,
    removeCampoArray,
    updateCampoArray,
    removeImagen,
  } = useCabanaForm(cabanaExistente, onSave);

  const isSubmitting = loading || internalLoading;

  const handleFileInputChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    await handleFileUpload(files);

    // Limpiar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card mt-5">
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

          {/* Configuración de Precios */}
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

          {/* Imágenes */}
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
                onChange={handleFileInputChange}
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
              disabled={isSubmitting || uploadingImages.length > 0}
            >
              {isSubmitting ? (
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
              disabled={isSubmitting || uploadingImages.length > 0}
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
