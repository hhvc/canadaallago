import React from "react";

const Header = () => {
  return (
    <header
      style={{
        backgroundImage: "url('src/assets/img/bg-header.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div className="intro-content">
        <img
          src="src/assets/img/profile@2x.png"
          className="img-fluid"
          alt="Cañada al Lago"
          style={{
            maxWidth: "300px",
            height: "auto",
          }}
        />
      </div>
    </header>
  );
};

export default Header;
