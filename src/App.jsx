import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
//components
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Activities from "./components/Activities";
import Contact from "./components/Contact";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Login from "./components/auth/Login";
import CabanasList from "./components/cabanas/CabanasList";
import AdminCabanas from "./components/cabanas/AdminCabanas";
import AdminDashboard from "./components/admin/AdminDashboard";
import CabanaForm from "./components/cabanas/CabanaForm";
import GalleryManager from "./components/GalleryManager";
import DynamicGallery from "./components/DynamicGallery";
import ContactMessages from './components/ContactMessages';

import AccessDenied from "./components/AccessDenied";

function App() {
  useEffect(() => {
    // Mover el componente Login al modal cuando esté disponible
    const loginContainer = document.getElementById("login-container");
    const loginElement = document.getElementById("login-section");

    if (loginContainer && loginElement) {
      loginContainer.appendChild(loginElement);
    }
  }, []);

  // Componente para la página principal
  const HomePage = () => (
    <>
      <Header />
      <About />
      <CabanasList />
      {/* <Cabanas /> */}
      {/* <DynamicGallery/> */}
      <Gallery />
      <Activities />
      <Contact />
      <Testimonials />
    </>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="modern">
          <Navbar />

          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            {/* Rutas protegidas para administradores */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute role="admin">
                  <GalleryManager />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/listadocabanas" element={<CabanasList />} />
            <Route path="/admin/cabanas" element={<AdminCabanas />} />
            <Route path="/admin/cabanasform" element={<CabanaForm />} />
            <Route path="/galeria" element={<DynamicGallery />} />
            <Route path="/admin/contactos" element={<ContactMessages />} />

            {/* Puedes agregar más rutas aquí en el futuro */}
            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="container mt-4">
                  <h1>
                    Error 404 - Estás intentando ingresar a una página
                    inexistente.
                  </h1>
                  <h3>
                    Por favor, revisa la dirección o toca el logo de Cañada Al
                    Lago para navegar desde el inicio
                  </h3>
                </div>
              }
            />
          </Routes>

          {/* Login oculto que se moverá al modal */}
          <div id="login-section" style={{ display: "none" }}>
            <Login />
          </div>

          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
