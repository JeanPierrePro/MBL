import React, { useState } from 'react';
import type { Team, TeamMember } from '../types/Team';
import { registerTeam } from '../services/database';
import formStyles from '../styles/AuthForm.module.css';

// Define props for the RegisterTeam component when used in a modal
interface RegisterTeamFormProps {
  onRegisterSuccess?: () => void; // Callback para notificar o pai de sucesso no registo (OPCIONAL)
  onClose?: () => void; // Callback para fechar o modal (OPCIONAL)
}

const RegisterTeam: React.FC<RegisterTeamFormProps> = ({ onRegisterSuccess, onClose }) => {
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleMemberInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    } else {
      setErrorMessage("Uma equipa deve ter pelo menos um membro.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!teamDetails.leaderNickname) {
        setErrorMessage("O Nickname do Líder é obrigatório.");
        return;
    }
    if (members.length === 0 || members[0].nickname === '') {
        setErrorMessage("A equipa deve ter pelo menos um membro (o líder, por exemplo).");
        return;
    }

    const teamData: Omit<Team, 'id' | 'registrationDate'> = { ...teamDetails, members };
    try {
      const teamId = await registerTeam(teamData);
      if (teamId) {
        console.log('Equipa registada com sucesso. ID:', teamId);
        setSuccessMessage('Equipa registada com sucesso! O formulário será fechado em breve.');
        
        // Chamada segura para onRegisterSuccess, apenas se a prop existir
        onRegisterSuccess && onRegisterSuccess();

        setTeamDetails({
            name: '', tag: '', logoURL: null, contactEmail: '',
            leaderNickname: '', description: '', region: '',
        });
        setMembers([{ nickname: '', lane: '' }]);

        // Chamada segura para onClose, apenas se a prop existir
        setTimeout(() => {
            onClose && onClose();
        }, 2000);

      } else {
        setErrorMessage('Falha ao registar a equipa. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao registar a equipa:', error);
      setErrorMessage(error.message || 'Erro inesperado ao registar a equipa.');
    }
  };

  return (
    <div className={formStyles.container}>
      <h2>Registar Nova Equipa</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        {/* Team Details */}
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

        {/* Team Members */}
        <h3 className={formStyles.centeredHeading}>Membros da Equipa</h3>
        {members.map((member, index) => (
          <div key={index} className={formStyles.memberFormGroup}>
            <div className={formStyles.formGroup}>
              <label htmlFor={`nickname-${index}`} className={formStyles.label}>Nickname do Membro {index + 1}*</label>
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
              <select
                id={`lane-${index}`}
                name="lane"
                value={member.lane || ''}
                onChange={(event) => handleMemberInputChange(index, event)}
                className={formStyles.select}
              >
                <option value="">N/A</option>
                <option value="Top">Top</option>
                <option value="Jungle">Jungle</option>
                <option value="Mid">Mid</option>
                <option value="Adc">ADC</option>
                <option value="Support">Support</option>
              </select>
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

        {errorMessage && <p className={formStyles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p className={formStyles.successMessage}>{successMessage}</p>}

        <button type="submit" className={formStyles.button} disabled={!!successMessage}>Registar Equipa</button>
        {/* Chamada segura para onClose, apenas se a prop existir */}
        {onClose && <button type="button" onClick={onClose} className={formStyles.buttonSecondary}>Cancelar</button>}
      </form>
    </div>
  );
};

export default RegisterTeam;