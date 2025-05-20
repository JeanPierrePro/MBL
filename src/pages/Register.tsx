// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth';
import formStyles from '../styles/AuthForm.module.css';

const Register: React.FC = () => {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // O estado 'lane' deve ser uma string vazia por padrão
  const [lane, setLane] = useState<string>('');
  // A role padrão é 'member'
  const [role, setRole] = useState<'member' | 'coach'>('member');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    // VALIDAÇÃO CONDICIONAL DA LANE:
    // Se a role for 'member' E a 'lane' ainda não foi selecionada (estiver vazia),
    // define um erro e impede o envio do formulário.
    if (role === 'member' && !lane) {
      setError('Por favor, selecione sua Lane Preferida para se registrar como Membro.');
      return; // Interrompe a execução da função
    }

    try {
      // Chama a função registerUser passando a lane (que será vazia se for 'coach') e a role
      await registerUser(nick, email, password, lane, role);
      alert('Registro bem-sucedido! Por favor, faça login.');
      navigate('/login');
    } catch (err: unknown) {
      console.error("Erro ao registrar:", err);
      setError(err instanceof Error ? err.message : 'Erro ao registrar. Tente novamente.');
    }
  };

  return (
    <div className={formStyles.container}>
      <h2>Registrar</h2>
      <form onSubmit={handleRegister} className={formStyles.form}>
        <div className={formStyles.formGroup}>
          <label htmlFor="nick" className={formStyles.label}>Nickname:</label>
          <input
            type="text"
            id="nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            required
            className={formStyles.input}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="email" className={formStyles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={formStyles.input}
          />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="password" className={formStyles.label}>Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={formStyles.input}
          />
        </div>

        {/* CAMPO DE SELEÇÃO DE ROLE - SEMPRE VISÍVEL */}
        <div className={formStyles.formGroup}>
          <label htmlFor="role" className={formStyles.label}>Você é:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              const newRole = e.target.value as 'member' | 'coach';
              setRole(newRole); // Atualiza o estado da role
              // IMPORTANTE: Se a nova role for 'coach', garante que o campo 'lane' seja limpo
              if (newRole === 'coach') {
                setLane(''); // Define a lane como vazia quando muda para treinador
              }
            }}
            required
            className={formStyles.select}
          >
            <option value="member">Membro (Jogador)</option>
            <option value="coach">Treinador</option>
          </select>
        </div>

        {/* CAMPO DE LANE PREFERIDA - RENDERIZAÇÃO CONDICIONAL */}
        {/* Este bloco DIV INTEIRO só será renderizado se 'role' for 'member' */}
        {role === 'member' && (
          <div className={formStyles.formGroup}>
            <label htmlFor="lane" className={formStyles.label}>Lane Preferida:</label>
            <select
              id="lane"
              value={lane}
              onChange={(e) => setLane(e.target.value)}
              // O atributo 'required' no HTML só é adicionado se a role for 'member'
              // Como o campo só é renderizado se for 'member', ele SEMPRE será requerido aqui.
              required={true}
              className={formStyles.select}
            >
              <option value="">Selecione sua Lane</option>
              <option value="Top">Top</option>
              <option value="Jungle">Jungle</option>
              <option value="Mid">Mid</option>
              <option value="Adc">ADC</option>
              <option value="Support">Support</option>
            </select>
          </div>
        )}

        {error && <p className={formStyles.errorMessage}>{error}</p>}
        <button type="submit" className={formStyles.button}>Registrar</button>
      </form>
      <p className={formStyles.linkText}>
        Já tem uma conta? <span onClick={() => navigate('/login')} className={formStyles.link}>Faça Login</span>
      </p>
    </div>
  );
};

export default Register;