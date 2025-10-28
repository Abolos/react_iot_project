import React from "react";
import imageAvatar from "../../assets/images/imageAvatar.png";
import { Link } from "react-router-dom";
import "./Header.css";
function Header() {
  return (
    <header className="container-fluid pb-3">
      <div id="header" className="row">
        <div className="col-lg-2 col-md-2 avatar-user">
          <div>
            <p>
              <img src={imageAvatar} alt="" />
            </p>
            <h3><Link className="text-light" to={'/login'}>Admin Iot</Link></h3>
          </div>
        </div>
        <div className="col-lg-10 col-md-10 header-banner">
          <div>
            <h2>Dashboard</h2>
            <p>Welcom to Manager Page</p>
          </div>
          <div className="header-inform mr-4">
            <p>
              <a href="#">
                <i className="fa-solid fa-bell"></i>
                <span>2</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
