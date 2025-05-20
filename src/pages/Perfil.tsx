// src/pages/Perfil.tsx
// This is an illustrative example of where the error might occur and how to fix it.
// You need to adapt this to your existing Perfil.tsx file.

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig';
import { getUserProfile, updateUserProfile } from '../services/database';
import type { UserProfile } from '../types/User';
import formStyles from '../styles/AuthForm.module.css';

const Perfil: React.FC = () => {
  const [user, loadingUser, errorAuth] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    nick: '',
    email: '',
    lane: '',
    // CORRECTED: Ensure 'status' is one of 'Online', 'Offline', or 'Ativo'
    status: 'Online', // Or 'Offline', or 'Ativo' if that's your default
    fotoPerfil: null,
    role: 'member' // Default role for state, though it comes from DB
  });
  const [message, setMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          // If no profile exists, initialize with basic user data
          setUserProfile({
            uid: user.uid,
            nick: user.displayName || '',
            email: user.email || '',
            lane: 'N/A',
            fotoPerfil: user.photoURL || null,
            // CORRECTED: Use a valid status from the UserProfile type
            status: 'Online', // Default to 'Online' if not found
            role: 'member' // Default role for display if not found
          });
        }
      }
    };

    if (!loadingUser && user) {
      fetchProfile();
    }
  }, [user, loadingUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && userProfile.uid) {
      try {
        await updateUserProfile(userProfile.uid, userProfile);
        setMessage('Perfil atualizado com sucesso!');
        setEditMode(false);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        setMessage('Erro ao atualizar perfil.');
      }
    }
  };

  if (loadingUser) {
    return <p>Carregando perfil...</p>;
  }

  if (errorAuth) {
    return <p>Erro ao carregar o usuário: {errorAuth.message}</p>;
  }

  if (!user) {
    return <p>Por favor, faça login para ver seu perfil.</p>;
  }

  return (
    <div className={formStyles.container}>
      <h2>Meu Perfil</h2>
      {message && <p className={message.includes('Erro') ? formStyles.errorMessage : formStyles.successMessage}>{message}</p>}

      {!editMode ? (
        <div className={formStyles.profileDisplay}>
          <p><strong>Nickname:</strong> {userProfile.nick}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Lane Preferida:</strong> {userProfile.lane}</p>
          <p><strong>Status:</strong> {userProfile.status}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          {userProfile.fotoPerfil && (
            <img src={userProfile.fotoPerfil} alt="Foto de Perfil" className={formStyles.profileImage} />
          )}
          <button onClick={() => setEditMode(true)} className={formStyles.button}>Editar Perfil</button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className={formStyles.form}>
          <div className={formStyles.formGroup}>
            <label htmlFor="nick" className={formStyles.label}>Nickname:</label>
            <input
              type="text"
              id="nick"
              name="nick"
              value={userProfile.nick || ''}
              onChange={handleChange}
              required
              className={formStyles.input}
            />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="lane" className={formStyles.label}>Lane Preferida:</label>
            <input
              type="text"
              id="lane"
              name="lane"
              value={userProfile.lane || ''}
              onChange={handleChange}
              className={formStyles.input}
            />
          </div>
          <div className={formStyles.formGroup}>
            <label htmlFor="fotoPerfil" className={formStyles.label}>URL da Foto de Perfil:</label>
            <input
              type="url"
              id="fotoPerfil"
              name="fotoPerfil"
              value={userProfile.fotoPerfil || ''}
              onChange={handleChange}
              className={formStyles.input}
            />
          </div>
          {/* Status and Role are typically not editable by the user directly */}
          <button type="submit" className={formStyles.button}>Salvar Alterações</button>
          <button type="button" onClick={() => setEditMode(false)} className={`${formStyles.button} ${formStyles.secondaryButton}`}>Cancelar</button>
        </form>
      )}
    </div>
  );
};

export default Perfil;