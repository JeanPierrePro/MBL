import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={isHomePage ? styles.nav : styles.navFullWidth} ref={navbarRef}>
      {/* Usar um div para o ícone de hambúrguer CSS */}
      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        <div className={styles.hamburgerLine}></div>
        <div className={styles.hamburgerLine}></div>
        <div className={styles.hamburgerLine}></div>
      </div>

      <ul className={`${isHomePage ? styles.navList : styles.navListFullWidthLeft} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <li className={styles.navItem}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/noticias" onClick={() => setIsMenuOpen(false)}>Notícias</Link>
        </li>
        {/* NOVO: Link para a página Meta */}
        <li className={styles.navItem}>
          <Link to="/meta" onClick={() => setIsMenuOpen(false)}>Meta</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/equipe" onClick={() => setIsMenuOpen(false)}>Equipe</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/treinos" onClick={() => setIsMenuOpen(false)}>Treinos</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/perfil" onClick={() => setIsMenuOpen(false)}>Perfil</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/register-team" onClick={() => setIsMenuOpen(false)}>Registar Equipa</Link>
        </li>
        {!isHomePage && (
          <>
            <li className={styles.navItem}>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Registar</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;