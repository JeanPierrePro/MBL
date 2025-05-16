// src/pages/Equipe.tsx
import React, { useState, useEffect } from 'react';
import { getTeamMembers } from '../services/database';
import { TeamMember } from '../types/TeamMember';

const Equipe: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const members = await getTeamMembers();
      setTeamMembers(members);
    };

    fetchTeamMembers();
  }, []);

  // Ordenar por Lane (podes ajustar a lógica de ordenação conforme necessário)
  const sortedMembers = [...teamMembers].sort((a, b) => {
    if (a.lane < b.lane) return -1;
    if (a.lane > b.lane) return 1;
    return 0;
  });

  return (
    <div className="equipe-page">
      <h2>Equipe</h2>
      {teamMembers.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nick</th>
              <th>Lane</th>
              <th>Partidas Ganhas</th>
              <th>Tempo de Jogo</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member, index) => (
              <tr key={index}>
                <td>
                  <img
                    src={member.foto}
                    alt={member.nick}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </td>
                <td>{member.nick}</td>
                <td>{member.lane}</td>
                <td>{member.partidasGanhas}</td>
                <td>{member.tempoDeJogo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>A carregar informações da equipa...</p>
      )}
    </div>
  );
};

export default Equipe;