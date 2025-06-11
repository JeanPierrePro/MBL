// src/pages/Equipe.tsx
import React, { useState, useEffect } from 'react';
import { getAllTeams } from '../services/database';
import type { Team } from '../types/Team'; // Team está correto aqui
import styles from '../styles/Equipe.module.css';
import RegisterTeam from './RegisterTeam';
import Modal from '../components/Modal';
import formStyles from '../styles/AuthForm.module.css';

const Equipe: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterTeamModalOpen, setIsRegisterTeamModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const data = await getAllTeams();
        setTeams(data);
        setLoading(false);
      } catch (err: any) { // Manter 'any' aqui por robustez na captura de erros gerais
        console.error('Erro ao carregar as equipas:', err);
        setError('Erro ao carregar as equipas.');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []); // Dependência vazia para executar apenas uma vez ao montar o componente

  const handleTeamRegisterSuccess = () => {
    console.log("Nova equipa registada com sucesso!");
    // Re-fetch teams to update the list immediately
    setLoading(true);
    getAllTeams()
      .then((data: Team[]) => { // CORRIGIDO: Tipagem explícita para 'data'
        setTeams(data);
        setLoading(false);
        setIsRegisterTeamModalOpen(false); // Fecha o modal após o sucesso e recarregamento
      })
      .catch((err: Error) => { // CORRIGIDO: Tipagem explícita para 'err'
        console.error('Erro ao recarregar equipas:', err);
        setError('Erro ao recarregar as equipas após registo.');
        setLoading(false);
      });
  };

  if (loading) {
    return <div className={styles.equipePage}>A carregar as equipas...</div>;
  }

  if (error) {
    return <div className={styles.equipePage}><p className={styles.errorMessage}>{error}</p></div>;
  }

  return (
    <div className={styles.equipePage}>
      <h2 className={styles.pageTitle}>Equipas Registadas</h2>

      {/* Button to open the team registration form */}
      <div className={styles.registerPrompt}>
        <p>Não encontrou a sua equipa? Seja o líder e **crie a sua própria equipa agora!**</p>
        <button
          className={formStyles.button}
          onClick={() => setIsRegisterTeamModalOpen(true)}
        >
          Registar Nova Equipa
        </button>
      </div>

      {teams.length > 0 ? (
        <ul className={styles.teamsList}>
          {teams.map((team) => (
            <li key={team.id} className={styles.teamItem}>
              <div className={styles.teamContent}>
                {team.logoURL && <img src={team.logoURL} alt={team.name} className={styles.teamLogo} />}
                <div className={styles.teamInfo}>
                  <h3>{team.name}</h3>
                  {team.tag && <p className={styles.teamTag}>[{team.tag}]</p>}
                  <div className={styles.teamDetails}>
                    <p><strong>Líder:</strong> {team.leaderNickname}</p>
                    <p><strong>Email:</strong> {team.contactEmail}</p>
                    {team.description && <p><strong>Descrição:</strong> {team.description}</p>}
                    <p><strong>Região:</strong> {team.region || 'Não especificada'}</p>
                  </div>
                </div>
                <div className={styles.membersSection}>
                  <h4>Membros da Equipa:</h4>
                  <ul className={styles.membersList}>
                    {/* CORREÇÃO AQUI: Verifica se team.members existe antes de mapear */}
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member, index) => (
                        <li key={index} className={styles.memberItem}>
                          {member.nickname} {member.lane && `(${member.lane})`}
                        </li>
                      ))
                    ) : (
                      <li className={styles.noMemberItem}>Nenhum membro registado.</li>
                    )}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noTeamsMessage}>
          Ainda não há equipas registadas. **Seja o primeiro a registar uma!**
        </p>
      )}

      {/* Modal for the team registration form */}
      <Modal
        isOpen={isRegisterTeamModalOpen}
        onClose={() => setIsRegisterTeamModalOpen(false)}
        title="Registar Nova Equipa"
      >
        <RegisterTeam
          onRegisterSuccess={handleTeamRegisterSuccess}
          onClose={() => setIsRegisterTeamModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Equipe;