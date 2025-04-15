import React, { useState } from "react";
import "./header.scss";
import "../App.css";
import AuthModal from "./AuthModal";

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? { email: localStorage.getItem('email') } : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <div className="header-items">
      <div className="logo-logIn">
        <div>
          <img src="" alt="" />
          KINO
        </div>

        {user ? (
          <div className="user-info">
            <span>{user.email}</span>
            <button className="btn-login" onClick={handleLogout}>Выйти</button>
          </div>
        ) : (
          <button className="btn-login" onClick={() => setShowAuthModal(true)}>Войти</button>
        )}
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          setUser={(userData) => {
            setUser({ email: userData.email });
            localStorage.setItem('email', userData.email);
          }}
        />
      )}
    </div>
  );
};

export default Header;