import React from "react";
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

function App() {
  return (
    <div className="modern">
      <Navbar />
      <Header />
      <About />
      <Cabanas />
      <Gallery />
      <Activities />
      <Contact />
      <Testimonials />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
