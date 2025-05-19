// Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import formStyles from '../styles/AuthForm.module.css'; // Estilos comuns do formulário

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
    <div className={formStyles.container}>
      <h2>Login (Exclusivo a Membros)</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.formGroup}>
          <label htmlFor="email" className={formStyles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className={formStyles.input}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="password" className={formStyles.label}>Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={formStyles.input}
          />
        </div>
        <button type="submit" className={formStyles.button}>Entrar</button>
      </form>
    </div>
  );
};

export default Login;