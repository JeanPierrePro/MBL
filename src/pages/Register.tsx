// Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css'; // Estilos específicos do Register
import authFormStyles from '../styles/AuthForm.module.css'; // Estilos comuns de autenticação
import { register } from '../services/auth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nick: '',
    email: '',
    password: '',
    lane: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { nick, email, password, lane } = formData;

    if (!nick || !email || !password || !lane) {
      setError('Preencha todos os campos.');
      return;
    }

    const result = await register(nick, email, password, lane);

    if (result) {
      navigate('/login');
    } else {
      setError('Erro ao registrar usuário.');
    }
  };

  return (
    <div className={authFormStyles.container}>
      <h2>Registo (Exclusivo a Membros)</h2>
      <form onSubmit={handleSubmit} className={authFormStyles.form}>
        <input
          type="text"
          name="nick"
          placeholder="Nick"
          value={formData.nick}
          onChange={handleChange}
          className={authFormStyles.input}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={authFormStyles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          className={authFormStyles.input}
          required
        />
        <select
          name="lane"
          value={formData.lane}
          onChange={handleChange}
          className={`${authFormStyles.input} ${authFormStyles['select.input']}`}
          required
        >
          <option value="">Selecione sua lane</option>
          <option value="Top">Top</option>
          <option value="Mid">Mid</option>
          <option value="Jungle">Jungle</option>
          <option value="Gold">Gold</option>
          <option value="Exp">Exp</option>
          <option value="Suporte">Suporte</option>
        </select>

        <button type="submit" className={authFormStyles.button}>
          Registrar
        </button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Register;