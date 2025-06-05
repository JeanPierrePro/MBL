import React, { useState } from 'react';
import type { Team, TeamMember } from '../types/Team';
import { registerTeam } from '../services/database';
// import { useNavigate } from 'react-router-dom'; // REMOVED - navigation handled by parent/modal closure
import formStyles from '../styles/AuthForm.module.css';

// Define props for the RegisterTeam component when used in a modal
interface RegisterTeamFormProps {
  onRegisterSuccess: () => void; // Callback to notify parent of successful registration
  onClose: () => void; // Callback to close the modal
}

const RegisterTeam: React.FC<RegisterTeamFormProps> = ({ onRegisterSuccess, onClose }) => {
  const [teamDetails, setTeamDetails] = useState<Omit<Team, 'id' | 'members' | 'registrationDate'>>({
    name: '',
    tag: '',
    logoURL: null, // Ensure this is explicitly null or empty string
    contactEmail: '',
    leaderNickname: '',
    description: '',
    region: '',
  });

  const [members, setMembers] = useState<TeamMember[]>([{ nickname: '', lane: '' }]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success messages

  // useNavigate is no longer needed here as the modal handles closure/parent navigation
  // const navigate = useNavigate();

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

  const handleMemberInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // Changed event type for select
    const { name, value } = event.target;
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) { // Ensure at least one member remains (the leader perhaps, or force minimum)
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    } else {
      // Optional: Prevent removing the last member or show a message
      setErrorMessage("Uma equipa deve ter pelo menos um membro.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    // Basic validation: leader must be present as a member (or assumed)
    // For simplicity, we'll just check teamDetails.leaderNickname is not empty
    if (!teamDetails.leaderNickname) {
        setErrorMessage("O Nickname do Líder é obrigatório.");
        return;
    }
    // Also, ensure at least one member (which could be the leader themselves)
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
        onRegisterSuccess(); // Notify parent of success

        // Optionally clear the form after successful submission
        setTeamDetails({
            name: '', tag: '', logoURL: null, contactEmail: '',
            leaderNickname: '', description: '', region: '',
        });
        setMembers([{ nickname: '', lane: '' }]);

        // Automatically close modal after a short delay
        setTimeout(() => {
            onClose();
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
                className={formStyles.select} // Use a classe de select se existir
              >
                <option value="">N/A</option>
                <option value="Top">Top</option>
                <option value="Jungle">Jungle</option>
                <option value="Mid">Mid</option>
                <option value="Adc">ADC</option>
                <option value="Support">Support</option>
              </select>
            </div>
            {members.length > 1 && ( // Only show remove button if there's more than 1 member
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
        <button type="button" onClick={onClose} className={formStyles.buttonSecondary}>Cancelar</button> {/* Button to close modal */}
      </form>
    </div>
  );
};

export default RegisterTeam;