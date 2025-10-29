import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthProvider";
import ProtectedRoute from "./components/components/ProtectedRoute";
//components
import Navbar from "./components/components/Navbar";
import Header from "./components/components/Header";
import About from "./components/components/About";
import Gallery from "./components/components/Gallery";
import Activities from "./components/components/Activities";
import Contact from "./components/components/Contact";
import Testimonials from "./components/components/Testimonials";
import Footer from "./components/components/Footer";
import WhatsAppButton from "./components/components/WhatsAppButton";
import Login from "./components/auth/Login";
import CabanasList from "./components/components/cabanas/CabanasList";
import AdminCabanas from "./components/components/cabanas/AdminCabanas";
import AdminDashboard from "./components/admin/AdminDashboard";
import CabanaForm from "./components/components/cabanas/CabanaForm";
import GalleryManager from "./components/admin/GalleryManager";
import DynamicGallery from "./components/components/DynamicGallery";
import ContactMessages from "./components/admin/ContactMessages";
import Calendar from "./components/admin/calendar/Calendar";
import ReservationManagement from "./components/admin/ReservationManagement";

import AccessDenied from "./components/components/AccessDenied";
import TestimonialManagement from "./components/admin/TestimonialManagement";

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
            <Route path="/galeria" element={<DynamicGallery />} />

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
            <Route
              path="/admin/listadocabanas"
              element={
                <ProtectedRoute role="admin">
                  <CabanasList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cabanas"
              element={
                <ProtectedRoute role="admin">
                  <AdminCabanas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cabanasform"
              element={
                <ProtectedRoute role="admin">
                  <CabanaForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contactos"
              element={
                <ProtectedRoute role="admin">
                  <ContactMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute role="admin">
                  <Calendar /> {/* ✅ Ahora usa la ruta correcta */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservas"
              element={
                <ProtectedRoute role="admin">
                  <ReservationManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/testimonios"
              element={
                <ProtectedRoute role="admin">
                  <TestimonialManagement />
                </ProtectedRoute>
              }
            />
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
