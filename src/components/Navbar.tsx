// Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <nav className={isHomePage ? styles.nav : styles.navFullWidth}>
      <ul className={isHomePage ? styles.navList : styles.navListFullWidthLeft}>
        <li className={styles.navItem}>
          <Link to="/">Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/noticias">Notícias</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/equipe">Equipe</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/treinos">Treinos</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/perfil">Perfil</Link>
        </li>
      </ul>
      {!isHomePage && (
        <div className={styles.authLinks}>
          <Link to="/login">Login</Link>
          <Link to="/register">Registar</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;