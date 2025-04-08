import React from "react";
import "./header.scss";
import "../App.css";

const Header = () => {
  return (
    <div className="header-items">
      <div className="logo-logIn">
        <div>
          <img src="" alt="" />
          KINO
        </div>

        <button className="btn-login">Войти</button>
      </div>
    </div>
  );
};

export default Header;