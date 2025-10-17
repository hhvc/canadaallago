import { useEffect } from 'react'
import { AuthProvider } from './context/auth/AuthProvider'
import Navbar from './components/Navbar'
import Header from './components/Header'
import About from './components/About'
import Cabanas from './components/Cabanas'
import Gallery from './components/Gallery'
import Activities from './components/Activities'
import Contact from './components/Contact'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Login from './components/auth/Login'

function App() {
  useEffect(() => {
    // Mover el componente Login al modal cuando esté disponible
    const loginContainer = document.getElementById('login-container');
    const loginElement = document.getElementById('login-section');
    
    if (loginContainer && loginElement) {
      loginContainer.appendChild(loginElement);
    }
  }, []);

  return (
    <AuthProvider>
      <div className="modern">
        <Navbar />
        <Header />
        <About />
        <Cabanas />
        <Gallery />
        <Activities />
        <Contact />
        <Testimonials />
        
        {/* Login oculto que se moverá al modal */}
        <div id="login-section" style={{ display: 'none' }}>
          <Login />
        </div>
        
        <Footer />
        <WhatsAppButton />
      </div>
    </AuthProvider>
  )
}

export default App