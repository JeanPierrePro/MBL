import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
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
    </nav>
  );
};

export default Navbar;
