import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/AuthArea.module.css'; // Importa o CSS Module

const AuthArea: React.FC = () => {
  return (
    <div className={styles.authArea}>
      <Link to="/login" className={styles.loginLink}>Login</Link>
      <Link to="/register" className={styles.registerLink}>Registar</Link>
    </div>
  );
};

export default AuthArea;