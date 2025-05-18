import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth'; // removido getUserData
import styles from '../styles/Login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const loginResult = await login(email, password);

    if (loginResult) {
      const { nick } = loginResult;

      if (nick) {
        alert(`Bem-vindo, ${nick}!`);
      } else {
        alert('Bem-vindo!');
      }

      navigate('/');
    } else {
      alert('Credenciais inválidas. Por favor, tente novamente.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login (Exclusivo a Membros)</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
