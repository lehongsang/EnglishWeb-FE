import React from "react";
import Login from "../components/login/Login";
import backgroundImage from "../assets/image/login-background.png";

const LoginPage = () => {
  const pageStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={pageStyle}>
      <Login />
    </div>
  );
};

export default LoginPage;
