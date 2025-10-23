import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthProvider";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import About from "./components/About";
import Cabanas from "./components/Cabanas";
import Gallery from "./components/Gallery";
import Activities from "./components/Activities";
import Contact from "./components/Contact";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Login from "./components/auth/Login";
import CabanasList from "./components/cabanas/CabanasList";
import AdminCabanas from "./components/cabanas/AdminCabanas";
import AdminDashboard from "./components/admin/AdminDashboard"; // Nuevo componente
import CabanaForm from "./components/cabanas/CabanaForm";

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
      {/* <CabanasList /> */}
      <Cabanas />
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
            {/* Ruta principal */}
            <Route path="/" element={<HomePage />} />

            {/* Rutas de administración */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/cabanas" element={<AdminCabanas />} />
            <Route path="/admin/cabanasform" element={<CabanaForm />} />

            {/* Puedes agregar más rutas aquí en el futuro */}
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
