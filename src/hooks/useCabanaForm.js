import { useState, useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";
import { uploadMultipleImages } from "../utils/imageUtils";

export const useCabanaForm = (cabanaExistente, onSave) => {
  // Removido onCancel
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    metrosCuadrados: "",
    dormitorios: "",
    caracteristicas: [""],
    imagenes: [""],
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
  const [loading, setLoading] = useState(false);

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

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.capacidad.trim())
      newErrors.capacidad = "La capacidad es requerida";
    if (!formData.metrosCuadrados || parseInt(formData.metrosCuadrados) <= 0) {
      newErrors.metrosCuadrados = "Los metros cuadrados deben ser mayores a 0";
    }
    if (!formData.dormitorios || parseInt(formData.dormitorios) <= 0) {
      newErrors.dormitorios = "Debe tener al menos 1 dormitorio";
    }

    // Validar precios
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
  };
};
