import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 importar isso
import styles from '../styles/Register.module.css';
import { register } from '../services/auth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nick: '',
    email: '',
    password: '',
    lane: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate(); // 👈 inicializar aqui

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
      navigate('/login'); // 👈 redireciona para login após sucesso
    } else {
      setError('Erro ao registrar usuário.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="nick"
          placeholder="Nick"
          value={formData.nick}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <select
          name="lane"
          value={formData.lane}
          onChange={handleChange}
          className={styles.input}
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

        <button type="submit" className={styles.button}>
          Registrar
        </button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Register;
