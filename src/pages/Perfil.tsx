// src/pages/Perfil.tsx
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/database';
import { UserProfile } from '../types/User';

const Perfil: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  // Simulação do ID do utilizador logado
  const loggedInUserId = 'some-uid';

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userProfile = await getUserProfile(loggedInUserId);
      setProfile(userProfile);
      setEditedProfile(userProfile || {});
    };

    fetchUserProfile();
  }, [loggedInUserId]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setEditedProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (profile?.uid) {
      await updateUserProfile(profile.uid, editedProfile);
      const updatedProfile = await getUserProfile(profile.uid);
      setProfile(updatedProfile);
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  if (!profile) {
    return <p>A carregar perfil...</p>;
  }

  return (
    <div className="perfil-page">
      <h2>Perfil</h2>
      {isEditing ? (
        <div className="profile-edit-form">
          <div>
            <label htmlFor="nickName">Nick:</label>
            <input type="text" id="nickName" name="nickName" value={editedProfile.nickName || ''} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor="line">Line:</label>
            <input type="text" id="line" name="line" value={editedProfile.line || ''} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor="status">Status:</label>
            <select id="status" name="status" value={editedProfile.status || ''} onChange={handleInputChange}>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          {/* Adicionar mais campos de edição conforme necessário */}
          <button onClick={handleSaveClick}>Guardar</button>
          <button onClick={handleCancelClick}>Cancelar</button>
        </div>
      ) : (
        <div className="profile-info">
          <img
            src={profile.fotoPerfil}
            alt={profile.nickName}
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
          />
          <p><strong>Nick:</strong> {profile.nickName}</p>
          <p><strong>Line:</strong> {profile.line}</p>
          <p><strong>Status:</strong> {profile.status}</p>
          {/* Outras informações do perfil */}
          <button onClick={handleEditClick}>Editar Perfil</button>
        </div>
      )}
      <h3>Estatísticas de Jogo</h3>
      {/* Área para estatísticas de jogo (a ser implementada com dados do backend) */}
      <p>Estatísticas de jogo serão mostradas aqui.</p>
    </div>
  );
};

export default Perfil;