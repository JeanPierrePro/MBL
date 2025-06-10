// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth'; // Importe a função registerUser
import formStyles from '../styles/Register.module.css'; // Importe os estilos do formulário

const Register: React.FC = () => {
  // Estados para os campos do formulário
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [foto, setFoto] = useState<File | null>(null); // Estado para o arquivo de foto
  
  // Estados para feedback do usuário
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Para indicar se o registro está em andamento
  
  const navigate = useNavigate(); // Hook para navegação programática

  // Handler para quando o usuário seleciona um arquivo de foto
  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFoto(event.target.files[0]); // Pega o primeiro arquivo selecionado
    } else {
      setFoto(null); // Limpa o estado da foto se nenhum arquivo for selecionado
    }
    setError(null); // Limpa qualquer erro anterior
  };

  // Handler para o envio do formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Previne o comportamento padrão de recarregar a página
    setError(null); // Limpa qualquer erro anterior
    setLoading(true); // Ativa o estado de loading

    try {
      // Chama a função registerUser do serviço auth.ts
      // Parâmetros: nick, email, password, lane (null para treinadores), role ('coach'), foto
      await registerUser(nick, email, password, null, 'coach', foto);

      // Em caso de sucesso
      setError('Registro de treinador bem-sucedido! Por favor, faça login para cadastrar sua equipe.');
      
      // Redireciona para a página de login após 3 segundos
      setTimeout(() => navigate('/login'), 3000); 

    } catch (err: unknown) {
      // Em caso de erro, exibe a mensagem no console e define o erro para o usuário
      console.error("Erro ao registrar treinador:", err);
      // Verifica se 'err' é uma instância de Error para pegar a mensagem, senão usa uma mensagem genérica
      setError(err instanceof Error ? err.message : 'Erro ao registar treinador. Tente novamente.');
    } finally {
      setLoading(false); // Desativa o loading, independentemente do resultado
    }
  };

  return (
    <div className={formStyles.container}>
      <h2 className={formStyles.centeredHeading}>Registar como Treinador</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        {/* Campo Nickname */}
        <div className={formStyles.formGroup}>
          <label htmlFor="nick" className={formStyles.label}>Nickname</label>
          <input
            type="text"
            id="nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            required
            className={formStyles.input}
            disabled={loading} // Desabilita o campo durante o carregamento
          />
        </div>

        {/* Campo Email */}
        <div className={formStyles.formGroup}>
          <label htmlFor="email" className={formStyles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={formStyles.input}
            disabled={loading}
          />
        </div>

        {/* Campo Senha */}
        <div className={formStyles.formGroup}>
          <label htmlFor="password" className={formStyles.label}>Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={formStyles.input}
            disabled={loading}
          />
        </div>

        {/* Campo de Upload de Foto de Perfil */}
        <div className={formStyles.formGroup}>
          <label htmlFor="foto" className={formStyles.label}>Foto de Perfil (Opcional):</label>
          <input
            type="file"
            id="foto"
            name="foto"
            onChange={handleFotoChange}
            className={formStyles.input}
            accept="image/*" // Garante que apenas arquivos de imagem podem ser selecionados
            disabled={loading}
          />
        </div>

        {/* Exibição de Mensagens de Erro ou Loading */}
        {error && <p className={formStyles.errorMessage}>{error}</p>}
        {loading && <p className={formStyles.loadingMessage}>A registar...</p>}
        
        {/* Botão de Submissão */}
        <button type="submit" className={formStyles.button} disabled={loading}>
          {loading ? 'A Registar...' : 'Registar como Treinador'}
        </button>
      </form>
      
      {/* Link para a página de Login */}
      <p className={formStyles.linkText}>
        Já tem uma conta de Treinador? <span onClick={() => navigate('/login')} className={formStyles.link}>Faça Login</span>
      </p>
    </div>
  );
};

export default Register;