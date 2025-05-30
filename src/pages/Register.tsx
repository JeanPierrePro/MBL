// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth'; // Certifique-se que 'registerUser' é importado e que aceita 'foto'
import formStyles from '../styles/AuthForm.module.css';

const Register: React.FC = () => {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // O estado 'lane' deve ser uma string vazia por padrão
  const [lane, setLane] = useState<string>('');
  // A role padrão é 'member'
  const [role, setRole] = useState<'member' | 'coach'>('member');
  const [foto, setFoto] = useState<File | null>(null); // Estado para a foto
  const [error, setError] = useState<string | null>(null); // Estado para mensagens de erro ou sucesso
  const navigate = useNavigate();

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFoto(event.target.files[0]);
    } else {
      setFoto(null); // Limpa a foto se nada for selecionado
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Previne o comportamento padrão de recarregar a página
    setError(null); // Limpa qualquer erro anterior

    // VALIDAÇÃO CONDICIONAL DA LANE:
    // Se a role for 'member' E a 'lane' ainda não foi selecionada (estiver vazia),
    // define um erro e impede o envio do formulário.
    if (role === 'member' && !lane) {
      setError('Por favor, selecione sua Lane Preferida para se registar como Membro.');
      return; // Interrompe a execução da função
    }

    try {
      // **AQUI ESTÁ A CORREÇÃO:** Passe a variável 'foto' como o último argumento.
      await registerUser(nick, email, password, lane, role, foto);

      setError('Registro bem-sucedido! Por favor, faça login.'); // Usar o estado de erro/sucesso
      setTimeout(() => navigate('/login'), 2000); // Navega para login após 2 segundos
    } catch (err: unknown) {
      console.error("Erro ao registar:", err);
      // Captura a mensagem de erro e define no estado 'error'
      setError(err instanceof Error ? err.message : 'Erro ao registar. Tente novamente.');
    }
  };

  return (
    <div className={formStyles.container}>
      <h2>Registar</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.formGroup}>
          <label htmlFor="nick" className={formStyles.label}>Nickname</label>
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
          <label htmlFor="email" className={formStyles.label}>Email</label>
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
          <label htmlFor="password" className={formStyles.label}>Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={formStyles.input}
          />
        </div>

        {/* CAMPO DE FOTO - OPCIONAL */}
        <div className={formStyles.formGroup}>
          <label htmlFor="foto" className={formStyles.label}>Foto de Perfil (Opcional):</label>
          <input
            type="file"
            id="foto"
            name="foto"
            onChange={handleFotoChange}
            className={formStyles.input} // Aplica o estilo de input
            accept="image/*" // Limita a seleção a ficheiros de imagem
          />
        </div>

        {/* CAMPO DE SELEÇÃO DE ROLE - SEMPRE VISÍVEL */}
        <div className={formStyles.formGroup}>
          <label htmlFor="role" className={formStyles.label}>Você é...</label>
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
            <label htmlFor="lane" className={formStyles.label}>Escolha a sua Lane</label>
            <select
              id="lane"
              value={lane}
              onChange={(e) => setLane(e.target.value)}
              // O atributo 'required' no HTML só é adicionado se a role for 'member'
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

        {/* Exibe mensagens de erro ou sucesso */}
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        <button type="submit" className={formStyles.button}>Registar</button>
      </form>
      <p className={formStyles.linkText}>
        Já tem uma conta? <span onClick={() => navigate('/login')} className={formStyles.link}>Faça Login</span>
      </p>
    </div>
  );
};

export default Register;