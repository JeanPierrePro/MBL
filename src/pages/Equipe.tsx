import React, { useState, useEffect } from 'react';
import { getAllTeams } from '../services/database';
import type { Team } from '../types/Team';
import styles from '../styles/Equipe.module.css'; // Your existing page CSS
import RegisterTeam from './RegisterTeam'; // IMPORT THIS ONE instead of Register
import Modal from '../components/Modal'; // Import the Modal component
import formStyles from '../styles/AuthForm.module.css'; // Import form styles for the button

const Equipe: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterTeamModalOpen, setIsRegisterTeamModalOpen] = useState(false); // State for team registration modal

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const data = await getAllTeams();
        setTeams(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao carregar as equipas:', err);
        setError('Erro ao carregar as equipas.');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamRegisterSuccess = () => {
    // Logic to run after a team is successfully registered
    console.log("Nova equipa registada com sucesso!");
    // You might want to re-fetch teams here to update the list immediately
    setLoading(true); // Show loading while refetching
    getAllTeams()
      .then(data => {
        setTeams(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao recarregar equipas:', err);
        setError('Erro ao recarregar as equipas após registo.');
        setLoading(false);
      });
    // The modal will close itself after 2 seconds due to the RegisterTeam component's internal logic
    // setIsRegisterTeamModalOpen(false); // Can also be controlled here if preferred
  };

  if (loading) {
    return <div className={styles.equipePage}>A carregar as equipas...</div>;
  }

  if (error) {
    return <div className={styles.equipePage}><p>{error}</p></div>;
  }

  return (
    <div className={styles.equipePage}>
      <h2 className={styles.pageTitle}>Equipas Registadas</h2>

      {/* Button to open the team registration form */}
      <div className={styles.registerPrompt}>
        <p>Não encontrou a sua equipa? Seja o líder e **crie a sua própria equipa agora!**</p>
        <button
          className={formStyles.button} // Using a button style from formStyles
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
                    {team.members.map((member, index) => (
                      <li key={index} className={styles.memberItem}>
                        {member.nickname} {member.lane && `(${member.lane})`}
                      </li>
                    ))}
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