import React from 'react';
import "./footer.css";

const Footer = () => {
  return (
    <>
      <div className="footer">
        <div className="top">
          <div>
            <h1>Học Tiếng Anh đi</h1>
          </div>
          <div>
            <a href="https://fontawesome.com/">
              <i className="fa-brands fa-facebook-square"></i>
            </a>
            <a href="https://fontawesome.com/">
              <i className="fa-brands fa-instagram-square"></i>
            </a>
            <a href="https://fontawesome.com/">
              <i className="fa-brands fa-github"></i>
            </a>
          </div>
        </div>

        <div className="bottom">
          <div>
            <h4>Project</h4>
          </div>
          <div>
            <h4>Community</h4>
          </div>
          <div>
            <h4>Help</h4>
            <a href="https://fontawesome.com/">Support</a>
            <a href="https://fontawesome.com/">Contact Us</a>
          </div>
          <div>
            <h4>Others</h4>
            <a href="https://fontawesome.com/">License</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
