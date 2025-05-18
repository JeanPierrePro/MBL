import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/AuthArea.module.css';

const AuthArea: React.FC = () => {
  return (
    <div className={styles.authArea}>
      <Link className={styles.link} to="/login">Login</Link>
      <Link className={styles.link} to="/register">Registrar</Link>
    </div>
  );
};

export default AuthArea;
