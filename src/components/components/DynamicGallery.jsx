import { useState, useCallback, useEffect } from "react";
import { useGalleryImages } from "../../hooks/useGalleryImages";

const DynamicGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { images, loading, error } = useGalleryImages();

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const nextImage = useCallback(() => {
    if (!selectedImage || images.length === 0) return;

    const currentIndex = images.findIndex(
      (img) => img.url === selectedImage.url
    );
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  }, [images, selectedImage]);

  const prevImage = useCallback(() => {
    if (!selectedImage || images.length === 0) return;

    const currentIndex = images.findIndex(
      (img) => img.url === selectedImage.url
    );
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  }, [images, selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === "Escape") {
          closeImageModal();
        } else if (e.key === "ArrowRight") {
          nextImage();
        } else if (e.key === "ArrowLeft") {
          prevImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, nextImage, prevImage]);

  // Mostrar estados de carga y error
  if (loading) {
    return (
      <section id="fotos" className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-12">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando galería...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="fotos" className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-12">
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="fotos" className="py-5">
        <div className="container">
          <div className="row text-center mb-4">
            <div className="col-lg-12">
              <h1>El lugar y sus momentos</h1>
              <p>¡Algunas fotos de lo que te espera!</p>
            </div>
          </div>

          {images.length === 0 ? (
            <div className="row text-center">
              <div className="col-12">
                <div className="alert alert-info">
                  No hay imágenes en la galería todavía.
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {images.map((image, index) => (
                <div
                  key={image.name}
                  className="col-6 col-md-4 col-lg-3 mb-4"
                  onClick={() => openImageModal(image)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={image.url}
                    alt={`Foto ${index + 1}`}
                    className="img-fluid rounded shadow-sm"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedImage && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.9)",
          }}
          onClick={closeImageModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body position-relative">
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={closeImageModal}
                  aria-label="Cerrar"
                  style={{ zIndex: 1060 }}
                ></button>
                <img
                  src={selectedImage.url}
                  alt="Ampliada"
                  className="img-fluid w-100"
                  style={{ maxHeight: "90vh", objectFit: "contain" }}
                />
                <button
                  className="btn btn-dark position-absolute top-50 start-0 translate-middle-y"
                  onClick={prevImage}
                  style={{
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1060,
                  }}
                >
                  ‹
                </button>
                <button
                  className="btn btn-dark position-absolute top-50 end-0 translate-middle-y"
                  onClick={nextImage}
                  style={{
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1060,
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicGallery;
