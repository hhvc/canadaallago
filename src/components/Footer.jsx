import React from "react";

const Footer = () => {
  return (
    <footer
      className="footer"
      style={{ backgroundImage: "url('src/assets/img/bg-header.jpg')" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <p className="small mb-0">
              powered by
              <br />
              <a
                href="http://www.ono.ar/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar sitio web de ONO"
              >
                <img
                  src="src/assets/img/LogoTiendaOno1.png"
                  width="50"
                  alt="Logo ONO"
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
