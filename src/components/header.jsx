import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./header.scss";
import "../App.css";
import AuthModal from "./AuthModal";

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { email: localStorage.getItem("email") } : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  return (
    <div className="header-items">
      <div className="logo-logIn">
        <div className="logo_nav">
          <div className="logoS">
            <img src="" alt="" />
            K I N O
          </div>
          <div className="nav_header">
            <Link to="/main" className="catalog">
              Главная
            </Link>
            <Link to="/films" className="catalog">
              Фильмы
            </Link>

            <a href="" className="catalog">
              Сериалы
            </a>
          </div>
        </div>

        <div className="history_login">
          <nav>
            <button className="btn-history">
              <Link className="link-btn" to="/history">
                История бронирований
              </Link>
            </button>
          </nav>
          {user ? (
            <div className="user-info">
              <span>{user.email}</span>
              <button className="btn-login" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <button
              className="btn-login"
              onClick={() => setShowAuthModal(true)}
            >
              Войти
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          setUser={(userData) => {
            setUser({ email: userData.email });
            localStorage.setItem("email", userData.email);
          }}
        />
      )}
    </div>
  );
};

export default Header;
