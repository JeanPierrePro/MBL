// src/components/Navbar.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/components/Navbar.module.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fecha o menu ao clicar fora do menu ou da navbar (se a navbar estiver integrada no slide)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Se clicou fora do menu deslizante E fora do botão do hamburger (se houver)
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Bloqueia o scroll do body
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset'; // Restaura o scroll do body
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset'; // Garante que o scroll é restaurado ao desmontar o componente
    };
  }, [isMenuOpen]);

  // Fecha o menu quando a rota muda
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={isHomePage ? styles.navHome : styles.navOtherPages} ref={navbarRef}>
      <div className={styles.navbarBrand}>
        {/* Aqui pode ir o seu logo ou título */}
      </div>

      {/* Botão de hambúrguer para mobile/tablet */}
      <div className={styles.mobileMenuIcon} onClick={toggleMenu}>
        <div className={styles.hamburgerLine}></div>
        <div className={styles.hamburgerLine}></div>
        <div className={styles.hamburgerLine}></div>
      </div>

      {/* Menu principal - será a sidebar em mobile, e inline no desktop */}
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
        {/* Os links de autenticação no fundo do menu mobile */}
        {isMenuOpen && (
          <li className={styles.navItemAuthBottom}>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className={styles.authLinkBottom}>Login</Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)} className={styles.authLinkBottom}>Registar</Link>
          </li>
        )}
      </ul>
      
      {/* Links de Login/Registar no desktop (sempre visíveis no desktop) */}
      <div className={styles.desktopAuthButtons}>
        <Link to="/login" className={isHomePage ? styles.authButtonHome : styles.authButtonOther}>Login</Link>
        <Link to="/register" className={isHomePage ? styles.authButtonHome : styles.authButtonOther}>Registar</Link>
      </div>

      {/* Overlay para fechar o menu ao clicar fora no mobile */}
      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)}></div>}
    </nav>
  );
};

export default Navbar;