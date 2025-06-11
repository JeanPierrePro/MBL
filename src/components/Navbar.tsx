// src/components/Navbar.tsx (Mantenha como está)

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/components/Navbar.module.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  // Esta variável 'isHomePage' agora será usada apenas para estilos,
  // não para determinar se a Navbar é renderizada.
  const isHomePage = location.pathname === '/'; 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset'; 
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset'; 
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={isHomePage ? styles.navHome : styles.navOtherPages} ref={navbarRef}>
      <div className={styles.navbarBrand}>
        {/* Aqui pode ir o seu logo ou título */}
      </div>

      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        <div className={styles.hamburgerLine}></div>
        <div className={styles.hamburgerLine}></div>
        <div className={styles.hamburgerLine}></div>
      </div>

      <ul ref={menuRef} className={`${styles.navList} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <li className={styles.navItem}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/noticias" onClick={() => setIsMenuOpen(false)}>Notícias</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/meta" onClick={() => setIsMenuOpen(false)}>Meta</Link>
        </li>
        
        {/* --- ESTE LINK JÁ ESTÁ CORRETO --- */}
        <li className={styles.navItem}>
          <Link to="/items" onClick={() => setIsMenuOpen(false)}>Equipamentos</Link>
        </li>
        {/* -------------------------------------------------- */}

        <li className={styles.navItem}>
          <Link to="/MapPage" onClick={() => setIsMenuOpen(false)}>Mapa</Link>
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
        {isMenuOpen && (
          <li className={styles.navItemAuthBottom}>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className={styles.authLinkBottom}>Login</Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)} className={styles.authLinkBottom}>Registar</Link>
          </li>
        )}
      </ul>
      
      <div className={styles.desktopAuthButtons}>
        <Link to="/login" className={isHomePage ? styles.authButtonHome : styles.authButtonOther}>Login</Link>
        <Link to="/register" className={isHomePage ? styles.authButtonHome : styles.authButtonOther}>Registar</Link>
      </div>

      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;