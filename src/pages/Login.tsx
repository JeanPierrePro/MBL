import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import styles from '../styles/AuthForms.module.css'; // Importa o CSS Module comum

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const userCredential = await login(email, password);
    if (userCredential) {
      navigate('/perfil');
    } else {
      alert('Credenciais inválidas. Por favor, tente novamente.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
        </div>
        <button type="submit" className={styles.submitButton}>Entrar</button>
      </form>
    </div>
  );
};

export default Login;