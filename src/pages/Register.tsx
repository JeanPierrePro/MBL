// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import styles from '../styles/AuthForms.module.css'; // Importa o CSS Module comum

const Register: React.FC = () => {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lane, setLane] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const userCredential = await register(nick, email, password, lane, foto);
    if (userCredential) {
      navigate('/perfil');
    } else {
      alert('Erro ao registar. Por favor, verifique os dados.');
    }
  };

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFoto(event.target.files[0]);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Registar</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nick" className={styles.label}>Nick de Jogo:</label>
          <input type="text" id="nick" name="nick" value={nick} onChange={(e) => setNick(e.target.value)} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="foto" className={styles.label}>Foto:</label>
          <input type="file" id="foto" name="foto" onChange={handleFotoChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lane" className={styles.label}>Lane:</label>
          <input type="text" id="lane" name="lane" value={lane} onChange={(e) => setLane(e.target.value)} required className={styles.input} />
        </div>
        <button type="submit" className={styles.submitButton}>Registar</button>
      </form>
    </div>
  );
};

export default Register;