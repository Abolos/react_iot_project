import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <div id="navbar">
      <div id="button-sidebar">
        <p>
          <NavLink to={'/'}>
            <i className="fa-solid fa-house"></i> Dashboard
          </NavLink>
        </p>
        <p>
          <NavLink to={'/users/admin'}>
            <i className="fa-solid fa-users"></i> User
          </NavLink>
        </p>
        <p>
          <NavLink to={'/templetes/admin'}>
            <i className="fa-solid fa-tree"></i> Templete
          </NavLink>
        </p>
        <p>
          <NavLink to={'/datas/admin'}>
            <i className="fa-solid fa-database"></i> Data
          </NavLink>
        </p>
        <p>
          <NavLink to={'/reports/admin'}>
            <i className="fa-solid fa-book"></i> Report
          </NavLink>
        </p>
        {/* <p>
          <NavLink to={'/automatic/admin'}>
            <i className="fa-solid fa-robot"></i> Automatic
          </NavLink>
        </p> */}
      </div>
    </div>
  );
}

export default Navbar;