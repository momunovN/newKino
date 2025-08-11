import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./header.css";
import "../App.css";
import AuthModal from "./AuthModal";

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { email: localStorage.getItem("email") } : null;
  });
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header-items">
      <div className="logo-logIn">
        <div className="logo_nav">
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="nav_header" ref={menuRef}>
            <div className={`nav-links ${isMenuOpen ? "show" : ""}`}>
              <Link to="/Главная" className="catalog" onClick={closeMenu}>
                Главная
              </Link>
              <Link to="/Фильмы" className="catalog" onClick={closeMenu}>
                Фильмы
              </Link>
              <Link to="/Сериалы" className="catalog" onClick={closeMenu}>
                Сериалы
              </Link>
            </div>
          </div>
          <div className="logoS">K I N O</div>
        </div>

        <div className="history_login">
          {user && (
            <nav>
              <button className="btn-history">
                <Link className="link-btn" to="/history">
                  История бронирований
                </Link>
              </button>
            </nav>
          )}
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