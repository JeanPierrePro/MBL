// src/pages/RegisterTeam.tsx
import React, { useState } from 'react';
import type { Team, TeamMember } from '../types/Team';
import { registerTeam } from '../services/database';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/RegisterTeam.module.css';

const RegisterTeam: React.FC = () => {
  const [teamDetails, setTeamDetails] = useState<Omit<Team, 'id' | 'members' | 'registrationDate'>>({
    name: '',
    tag: '',
    logoURL: null,
    contactEmail: '',
    leaderNickname: '',
    description: '',
    region: '',
  });

  const [members, setMembers] = useState<TeamMember[]>([{ nickname: '', lane: '' }]);
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setTeamDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAddMember = () => {
    setMembers(prevMembers => [...prevMembers, { nickname: '', lane: '' }]);
  };

  const handleMemberInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const teamData: Omit<Team, 'id' | 'registrationDate'> = { ...teamDetails, members };
    const teamId = await registerTeam(teamData);
    if (teamId) {
      console.log('Equipe registada com sucesso. ID:', teamId);
      navigate(`/team/${teamId}`);
    } else {
      console.error('Falha ao registar a equipa.');
      // Aqui você pode adicionar uma mensagem de erro visual para o usuário
    }
  };

  return (
    <div className={styles.registerTeamPage}>
      <h2>Registar Equipa</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome da Equipa:</label>
          <input type="text" id="name" name="name" value={teamDetails.name} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tag">Tag da Equipa (Opcional):</label>
          <input type="text" id="tag" name="tag" value={teamDetails.tag || ''} onChange={handleInputChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="logoURL">URL da Logo (Opcional):</label>
          <input type="url" id="logoURL" name="logoURL" value={teamDetails.logoURL || ''} onChange={handleInputChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="contactEmail">Email de Contacto:</label>
          <input type="email" id="contactEmail" name="contactEmail" value={teamDetails.contactEmail} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="leaderNickname">Nickname do Líder:</label>
          <input type="text" id="leaderNickname" name="leaderNickname" value={teamDetails.leaderNickname} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Descrição (Opcional):</label>
          <textarea id="description" name="description" value={teamDetails.description || ''} onChange={handleInputChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="region">Região (Opcional):</label>
          <input type="text" id="region" name="region" value={teamDetails.region || ''} onChange={handleInputChange} />
        </div>

        <h3>Membros da Equipa</h3>
        {members.map((member, index) => (
          <div key={index} className={styles.memberInput}>
            <div className={styles.memberInputGroup}>
              <label htmlFor={`nickname-${index}`}>Nickname:</label>
              <input
                type="text"
                id={`nickname-${index}`}
                name="nickname"
                value={member.nickname}
                onChange={(event) => handleMemberInputChange(index, event)}
                required
              />
            </div>
            <div className={styles.memberInputGroup}>
              <label htmlFor={`lane-${index}`}>Lane (Opcional):</label>
              <input
                type="text"
                id={`lane-${index}`}
                name="lane"
                value={member.lane || ''}
                onChange={(event) => handleMemberInputChange(index, event)}
              />
            </div>
            {members.length > 1 && (
              <button type="button" onClick={() => handleRemoveMember(index)} className={styles.removeButton}>Remover</button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddMember} className={styles.addButton}>Adicionar Membro</button>

        <button type="submit" className={styles.submitButton}>Registar Equipa</button>
      </form>
    </div>
  );
};

export default RegisterTeam;