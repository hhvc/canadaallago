import { useState, useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";
import { uploadMultipleImages } from "../utils/imageUtils";

export const useCabanaForm = (cabanaExistente, onSave) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    metrosCuadrados: "",
    dormitorios: "",
    caracteristicas: [""],
    imagenes: [""],
    // NUEVA ESTRUCTURA DE PRECIOS
    precios: {
      base: "",
      temporadas: [],
    },
    disponible: true,
    destacada: false,
    orden: 0,
  });

  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (cabanaExistente) {
      // Manejar la migración de la estructura antigua de precios a la nueva
      let preciosData = {
        base: "",
        temporadas: [],
      };

      // Si existe la estructura nueva, usarla
      if (cabanaExistente.precios) {
        preciosData = {
          base: cabanaExistente.precios.base?.toString() || "",
          temporadas: cabanaExistente.precios.temporadas || [],
        };
      }
      // Si no, migrar desde la estructura antigua
      else if (cabanaExistente.precioNoche) {
        preciosData = {
          base: cabanaExistente.precioNoche.toString() || "",
          temporadas: [],
        };
      }

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
        // NUEVA ESTRUCTURA
        precios: preciosData,
        disponible: cabanaExistente.disponible ?? true,
        destacada: cabanaExistente.destacada || false,
        orden: cabanaExistente.orden || 0,
      });
    }
  }, [cabanaExistente]);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.capacidad.trim())
      newErrors.capacidad = "La capacidad es requerida";
    if (!formData.metrosCuadrados || parseInt(formData.metrosCuadrados) <= 0) {
      newErrors.metrosCuadrados = "Los metros cuadrados deben ser mayores a 0";
    }
    if (!formData.dormitorios || parseInt(formData.dormitorios) <= 0) {
      newErrors.dormitorios = "Debe tener al menos 1 dormitorio";
    }

    // ✅ NUEVA VALIDACIÓN: Precio base
    if (!formData.precios.base || parseFloat(formData.precios.base) <= 0) {
      newErrors.precioBase = "El precio base debe ser mayor a 0";
    }

    // ✅ NUEVA VALIDACIÓN: Temporadas
    if (formData.precios.temporadas && formData.precios.temporadas.length > 0) {
      formData.precios.temporadas.forEach((temporada, index) => {
        if (!temporada.nombre?.trim()) {
          newErrors[`temporada_${index}_nombre`] =
            "El nombre de la temporada es requerido";
        }
        if (!temporada.multiplicador || temporada.multiplicador < 1) {
          newErrors[`temporada_${index}_multiplicador`] =
            "El multiplicador debe ser al menos 1";
        }
        if (temporada.tipo === "fechas") {
          if (!temporada.fechaInicio) {
            newErrors[`temporada_${index}_fechaInicio`] =
              "La fecha de inicio es requerida";
          }
          if (!temporada.fechaFin) {
            newErrors[`temporada_${index}_fechaFin`] =
              "La fecha de fin es requerida";
          }
          if (
            temporada.fechaInicio &&
            temporada.fechaFin &&
            new Date(temporada.fechaInicio) > new Date(temporada.fechaFin)
          ) {
            newErrors[`temporada_${index}_fechas`] =
              "La fecha de inicio debe ser anterior a la fecha de fin";
          }
        }
        if (
          temporada.tipo === "diasSemana" &&
          (!temporada.diasSemana || temporada.diasSemana.length === 0)
        ) {
          newErrors[`temporada_${index}_diasSemana`] =
            "Debe seleccionar al menos un día de la semana";
        }
      });
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

  // Manejar subida de archivos
  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    setUploadingImages(files.map((file) => file.name));

    try {
      const urls = await uploadMultipleImages(files, "cabanas");

      setFormData((prev) => ({
        ...prev,
        imagenes: [
          ...prev.imagenes.filter((img) => img.trim() !== ""),
          ...urls,
        ],
      }));

      return true;
    } catch (error) {
      console.error("Error en la subida de imágenes:", error);
      alert(
        error.message ||
          "Error al subir algunas imágenes. Por favor, inténtalo de nuevo."
      );
      return false;
    } finally {
      setUploadingImages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
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
      // ✅ NUEVA ESTRUCTURA DE PRECIOS
      precios: {
        base: parseFloat(formData.precios.base),
        temporadas: formData.precios.temporadas.map((temporada) => ({
          nombre: temporada.nombre.trim(),
          tipo: temporada.tipo,
          multiplicador: parseFloat(temporada.multiplicador),
          ...(temporada.tipo === "fechas" && {
            fechaInicio: temporada.fechaInicio,
            fechaFin: temporada.fechaFin,
          }),
          ...(temporada.tipo === "diasSemana" && {
            diasSemana: temporada.diasSemana,
          }),
        })),
      },
      disponible: formData.disponible,
      destacada: formData.destacada,
      orden: parseInt(formData.orden),
      updatedAt: serverTimestamp(),
    };

    if (!cabanaExistente) {
      cabanaData.createdAt = serverTimestamp();
    }

    await onSave(cabanaData);
    setLoading(false);
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

  // ✅ NUEVAS FUNCIONES PARA MANEJAR TEMPORADAS
  const addTemporada = () => {
    setFormData((prev) => ({
      ...prev,
      precios: {
        ...prev.precios,
        temporadas: [
          ...(prev.precios?.temporadas || []),
          {
            nombre: "",
            tipo: "fechas",
            multiplicador: 1.5,
            fechaInicio: "",
            fechaFin: "",
            diasSemana: [],
          },
        ],
      },
    }));
  };

  const removeTemporada = (index) => {
    setFormData((prev) => ({
      ...prev,
      precios: {
        ...prev.precios,
        temporadas:
          prev.precios?.temporadas?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const updateTemporada = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      precios: {
        ...prev.precios,
        temporadas:
          prev.precios?.temporadas?.map((temporada, i) =>
            i === index ? { ...temporada, [field]: value } : temporada
          ) || [],
      },
    }));

    // Limpiar errores específicos de esta temporada cuando se modifica
    if (errors[`temporada_${index}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`temporada_${index}_${field}`]: "",
      }));
    }
  };

  const handleInputChange = (field, value) => {
    // Manejar campos anidados como "precios.base"
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    const errorField = field.includes(".") ? field.split(".")[1] : field;
    if (errors[errorField]) {
      setErrors((prev) => ({
        ...prev,
        [errorField]: "",
      }));
    }
  };

  const removeImagen = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  return {
    formData,
    errors,
    uploadingImages,
    loading,
    handleInputChange,
    handleFileUpload,
    handleSubmit,
    addCampoArray,
    removeCampoArray,
    updateCampoArray,
    removeImagen,
    // ✅ EXPORTAR NUEVAS FUNCIONES
    addTemporada,
    removeTemporada,
    updateTemporada,
  };
};
