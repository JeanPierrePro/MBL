// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

const Register: React.FC = () => {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lane, setLane] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const userCredential = await register(nick, email, password, lane);
    if (userCredential) {
      navigate('/perfil');
    } else {
      alert('Erro ao registar. Por favor, verifique os dados.');
    }
  };

  return (
    <div className="register-page">
      <h2>Registar (Limitado a emails da equipa)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nick">Nick de Jogo:</label>
          <input type="text" id="nick" name="nick" value={nick} onChange={(e) => setNick(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="lane">Lane:</label>
          <input type="text" id="lane" name="lane" value={lane} onChange={(e) => setLane(e.target.value)} required />
        </div>
        <button type="submit">Registar</button>
      </form>
    </div>
  );
};

export default Register;
