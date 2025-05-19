// src/pages/Equipe.tsx
import React, { useState, useEffect } from 'react';
import { getAllTeams } from '../services/database';
import type { Team } from '../types/Team';
import styles from '../styles/Equipe.module.css'; // Ajuste o caminho conforme necessário
const Equipe: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div>A carregar as equipas...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.equipePage}>
      <h2>Equipas Registadas</h2>
      {teams.length > 0 ? (
        <ul className={styles.teamsList}>
          {teams.map((team) => (
            <li key={team.id} className={styles.teamItem}>
              <h3>{team.name}</h3>
              {team.tag && <p className={styles.teamTag}>[{team.tag}]</p>}
              {team.logoURL && <img src={team.logoURL} alt={team.name} className={styles.teamLogo} />}
              <p>Líder: {team.leaderNickname}</p>
              <p>Email de Contacto: {team.contactEmail}</p>
              {team.description && <p>Descrição: {team.description}</p>}
              <p>Região: {team.region || 'Não especificada'}</p>
              <h4>Membros:</h4>
              <ul className={styles.membersList}>
                {team.members.map((member, index) => (
                  <li key={index} className={styles.memberItem}>
                    {member.nickname} {member.lane && `(${member.lane})`}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Ainda não há equipas registadas.</p>
      )}
    </div>
  );
};

export default Equipe;