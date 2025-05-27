// src/pages/RegisterTeam.tsx
import React, { useState } from 'react';
import type { Team, TeamMember } from '../types/Team';
import { registerTeam } from '../services/database';
import { useNavigate } from 'react-router-dom';
import formStyles from '../styles/AuthForm.module.css';

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
    <div className={formStyles.container}>
      {/* O h2 já tem text-align: center no CSS, e agora a cor definida */}
      <h2>Registar Equipa</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.formGroup}>
          <label htmlFor="name" className={formStyles.label}>Nome da Equipa*</label>
          <input type="text" id="name" name="name" value={teamDetails.name} onChange={handleInputChange} required className={formStyles.input} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="tag" className={formStyles.label}>Tag da Equipa</label>
          <input type="text" id="tag" name="tag" value={teamDetails.tag || ''} onChange={handleInputChange} className={formStyles.input} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="logoURL" className={formStyles.label}>URL da Logo</label>
          <input type="url" id="logoURL" name="logoURL" value={teamDetails.logoURL || ''} onChange={handleInputChange} className={formStyles.input} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="contactEmail" className={formStyles.label}>Email de Contacto*</label>
          <input type="email" id="contactEmail" name="contactEmail" value={teamDetails.contactEmail} onChange={handleInputChange} required className={formStyles.input} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="leaderNickname" className={formStyles.label}>Nickname do Líder*</label>
          <input type="text" id="leaderNickname" name="leaderNickname" value={teamDetails.leaderNickname} onChange={handleInputChange} required className={formStyles.input} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="description" className={formStyles.label}>Descrição</label>
          <textarea id="description" name="description" value={teamDetails.description || ''} onChange={handleInputChange} className={formStyles.input} />
        </div>
        <div className={formStyles.formGroup}>
          <label htmlFor="region" className={formStyles.label}>Região</label>
          <input type="text" id="region" name="region" value={teamDetails.region || ''} onChange={handleInputChange} className={formStyles.input} />
        </div>

        {/* Aplicar a nova classe ao h3 */}
        <h3 className={formStyles.centeredHeading}>Membros da Equipa</h3>
        {members.map((member, index) => (
          <div key={index} className={formStyles.memberFormGroup}>
            <div className={formStyles.formGroup}>
              <label htmlFor={`nickname-${index}`} className={formStyles.label}>Nickname*</label>
              <input
                type="text"
                id={`nickname-${index}`}
                name="nickname"
                value={member.nickname}
                onChange={(event) => handleMemberInputChange(index, event)}
                required
                className={formStyles.input}
              />
            </div>
            <div className={formStyles.formGroup}>
              <label htmlFor={`lane-${index}`} className={formStyles.label}>Lane</label>
              <input
                type="text"
                id={`lane-${index}`}
                name="lane"
                value={member.lane || ''}
                onChange={(event) => handleMemberInputChange(index, event)}
                className={formStyles.input}
              />
            </div>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMember(index)}
                className={`${formStyles.button} ${formStyles.removeButton}`}
              >
                Remover Membro
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddMember} className={formStyles.button}>Adicionar Membro</button>

        <button type="submit" className={formStyles.button}>Registar Equipa</button>
      </form>
    </div>
  );
};

export default RegisterTeam;