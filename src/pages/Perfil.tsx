// src/pages/Perfil.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig';
import { getUserProfile, updateUserProfile } from '../services/database';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

// Importe os tipos que você definiu em src/types/User.ts
import type { UserProfile, MatchHistoryItem } from '../types/User';

// ************ ADICIONE ESTA LINHA ************
// Importa o módulo CSS para estilização
import formStyles from '../styles/AuthForm.module.css'; // <-- ESSA É A LINHA QUE FALTAVA!

const Perfil: React.FC = () => {
    const [user, loadingUser, errorAuth] = useAuthState(auth);
    const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
        nick: '',
        email: '',
        lane: '',
        status: 'Online',
        fotoPerfil: null,
        role: 'member',
        matchHistory: []
    });
    const [message, setMessage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
    const [isUploadingMatchPic, setIsUploadingMatchPic] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (user) {
            try {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setUserProfile(profile);
                } else {
                    setUserProfile({
                        uid: user.uid,
                        nick: user.displayName || '',
                        email: user.email || '',
                        lane: 'N/A',
                        fotoPerfil: user.photoURL || null,
                        status: 'Online',
                        role: 'member',
                        matchHistory: []
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
                setMessage('Erro ao carregar o perfil. Tente novamente.');
            }
        }
    }, [user]);

    useEffect(() => {
        if (!loadingUser && user) {
            fetchProfile();
        }
        if (!user && !loadingUser) {
            setUserProfile({});
            setMessage(null);
            setEditMode(false);
        }
    }, [user, loadingUser, fetchProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user && userProfile.uid) {
            setMessage(null);
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setMessage('Você foi desconectado.');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            setMessage('Erro ao desconectar.');
        }
    };

    const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log("Arquivo de foto de perfil selecionado:", file.name);
            setMessage('Preparando para enviar foto de perfil...');
            setIsUploadingProfilePic(true);

            setTimeout(() => {
                setMessage('Lógica de upload de foto de perfil concluída (simulado).');
                setIsUploadingProfilePic(false);
            }, 2000);
        }
    };

    const handleMatchScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>, matchId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log(`Arquivo de screenshot para partida ${matchId} selecionado:`, file.name);
            setMessage(`Preparando para enviar screenshot da partida ${matchId}...`);
            setIsUploadingMatchPic(true);

            setTimeout(() => {
                setMessage(`Lógica de upload de screenshot da partida ${matchId} concluída (simulado).`);
                setIsUploadingMatchPic(false);
            }, 2000);
        }
    };

    if (loadingUser) {
        return (
            <div className={formStyles.container}>
                <p className={formStyles.loading}>Carregando perfil...</p>
            </div>
        );
    }

    if (errorAuth) {
        return (
            <div className={formStyles.container}>
                <p className={formStyles.errorMessage}>Erro ao carregar o usuário: {errorAuth.message}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={formStyles.container}>
                <p className={formStyles.noChampions}>Por favor, faça login para ver seu perfil.</p>
                <Link to="/login" className={formStyles.link}>Ir para Login</Link>
            </div>
        );
    }

    return (
        <div className={formStyles.container}>
            <h2>Meu Perfil</h2>
            {message && (
                <p className={message.includes('Erro') ? formStyles.errorMessage : formStyles.successMessage}>
                    {message}
                </p>
            )}

            {!editMode ? (
                <div className={formStyles.profileDisplay}>
                    {userProfile.fotoPerfil ? (
                        <img src={userProfile.fotoPerfil} alt="Foto de Perfil" className={formStyles.profileImage} />
                    ) : (
                        <div className={formStyles.placeholderImage}>
                            <span>Sem Foto</span>
                        </div>
                    )}
                    <p><strong>Nickname:</strong> {userProfile.nick || 'N/A'}</p>
                    <p><strong>Email:</strong> {userProfile.email || 'N/A'}</p>
                    <p><strong>Lane Preferida:</strong> {userProfile.lane || 'N/A'}</p>
                    <p><strong>Status:</strong> {userProfile.status || 'N/A'}</p>
                    <p><strong>Role:</strong> {userProfile.role || 'N/A'}</p>

                    <div className={formStyles.actionButtons}>
                        <button onClick={() => setEditMode(true)} className={formStyles.button}>Editar Perfil</button>
                        <button onClick={handleLogout} className={`${formStyles.button} ${formStyles.logoutButton}`}>Sair</button>
                    </div>

                    <h3 className={formStyles.sectionHeading}>Histórico de Partidas</h3>
                    {userProfile.matchHistory && userProfile.matchHistory.length > 0 ? (
                        <div className={formStyles.matchHistoryGrid}>
                            {userProfile.matchHistory.map((match: MatchHistoryItem) => (
                                <div key={match.id} className={formStyles.matchCard}>
                                    <p><strong>Data:</strong> {match.date}</p>
                                    <p><strong>Campeão:</strong> {match.champion}</p>
                                    <p><strong>Resultado:</strong> {match.outcome}</p>
                                    <p><strong>Score:</strong> {match.score}</p>
                                    {match.screenshotUrl && (
                                        <img src={match.screenshotUrl} alt={`Screenshot da partida de ${match.champion}`} className={formStyles.matchScreenshot} />
                                    )}
                                    <label className={formStyles.uploadButton}>
                                        {isUploadingMatchPic ? 'Enviando...' : 'Carregar Screenshot'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleMatchScreenshotUpload(e, match.id)}
                                            style={{ display: 'none' }}
                                            disabled={isUploadingMatchPic}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={formStyles.noChampions}>Nenhum histórico de partida registrado.</p>
                    )}
                    <button className={formStyles.button}>Adicionar Nova Partida</button>

                </div>
            ) : (
                <form onSubmit={handleUpdateProfile} className={formStyles.form}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="profilePicUpload" className={formStyles.label}>Alterar Foto de Perfil:</label>
                        {userProfile.fotoPerfil && (
                            <img src={userProfile.fotoPerfil} alt="Foto de Perfil Atual" className={formStyles.currentProfileImage} />
                        )}
                        <label className={formStyles.uploadButton}>
                            {isUploadingProfilePic ? 'Enviando...' : 'Escolher Nova Foto'}
                            <input
                                type="file"
                                id="profilePicUpload"
                                accept="image/*"
                                onChange={handleProfilePicUpload}
                                style={{ display: 'none' }}
                                disabled={isUploadingProfilePic}
                            />
                        </label>
                    </div>

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
                        <select
                            id="lane"
                            name="lane"
                            value={userProfile.lane || ''}
                            onChange={handleChange}
                            className={formStyles.select}
                        >
                            <option value="">Selecione sua Lane</option>
                            <option value="Top">Top</option>
                            <option value="Jungle">Jungle</option>
                            <option value="Mid">Mid</option>
                            <option value="Adc">ADC</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="status" className={formStyles.label}>Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={userProfile.status || ''}
                            onChange={handleChange}
                            className={formStyles.select}
                        >
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                            <option value="In-Game">Em Jogo</option>
                            <option value="Away">Ausente</option>
                        </select>
                    </div>

                    <button type="submit" className={formStyles.button}>Salvar Alterações</button>
                    <button type="button" onClick={() => setEditMode(false)} className={`${formStyles.button} ${formStyles.secondaryButton}`}>Cancelar</button>
                </form>
            )}
        </div>
    );
};

export default Perfil;