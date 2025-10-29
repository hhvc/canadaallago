import Header from "../components/components/Header";
import About from "../components/components/About";
import CabanasList from "../components/components/cabanas/CabanasList";
import Gallery from "../components/components/Gallery";
import Activities from "../components/components/Activities";
import Contact from "../components/components/Contact";
import Testimonials from "../components/components/Testimonials";

const HomePage = () => {
  return (
    <>
      <Header />
      <About />
      <CabanasList />
      <Gallery />
      <Activities />
      <Contact />
      <Testimonials />
    </>
  );
};

export default HomePage;
