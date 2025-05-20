// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import formStyles from '../styles/AuthForm.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const loginResult = await login(email, password); // Esta função já retorna o perfil completo, incluindo a role

    if (loginResult) {
      const { nick, role } = loginResult; // Pega o nick E a role do resultado do login

      if (nick) {
        alert(`Bem-vindo, ${nick}!`);
      } else {
        alert('Bem-vindo!');
      }

      // Redireciona com base na role REAL do usuário (Membro ou Treinador)
      if (role === 'coach') {
        navigate('/noticias'); // Ou outra página inicial para treinadores
      } else { // Role 'member'
        navigate('/noticias'); // Página inicial para membros
      }
      // Se você tiver uma página inicial diferente para treinadores e membros, ajuste os 'navigate' acima.
      // Por enquanto, ambos vão para /noticias, onde as permissões serão controladas.

    } else {
      alert('Credenciais inválidas. Por favor, tente novamente.');
    }
  };

  return (
    <div className={formStyles.container}>
      <h2>Login</h2>
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
      <p className={formStyles.linkText}>
        Não tem uma conta? <span onClick={() => navigate('/register')} className={formStyles.link}>Cadastre-se</span>
      </p>
    </div>
  );
};

export default Login;