import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css'; // Importa o CSS Module

const Navbar: React.FC = () => {
  return (
    <nav className={styles.mainNavbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/noticias" className={styles.navLink}>Notícias</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/equipe" className={styles.navLink}>Equipe</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/treinos" className={styles.navLink}>Treinos</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/perfil" className={styles.navLink}>Perfil</Link>
        </li>
      </ul>
      <div className={styles.authArea}>
        <Link to="/login" className={styles.loginLink}>Login</Link>
        <Link to="/register" className={styles.registerLink}>Registar</Link>
      </div>
    </nav>
  );
};

export default Navbar;