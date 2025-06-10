import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes } from "firebase/storage";
// CORREÇÃO: 'Link' foi removido porque não estava a ser usado.
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { listenToUserProfile, updateUserProfile } from '../services/database';
import type { UserProfile, MatchHistoryItem } from '../types/User';
import formStyles from '../styles/AuthForm.module.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// Importações para a função de teste
import { getFunctions, httpsCallable } from "firebase/functions";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const storage = getStorage();

const StatsSummary: React.FC<{ matches: MatchHistoryItem[] }> = ({ matches }) => {
    const totalMatches = matches.length;
    if (totalMatches === 0) {
        return <p>Nenhuma partida para analisar.</p>;
    }

    const wins = matches.filter(m => m.outcome === 'Vitória').length;
    const winRate = ((wins / totalMatches) * 100).toFixed(0);
    
    const totalKills = matches.reduce((sum, m) => sum + parseInt(m.score?.split('/')[0] || '0', 10), 0);
    const totalDeaths = matches.reduce((sum, m) => sum + parseInt(m.score?.split('/')[1] || '0', 10), 1); // Evita divisão por zero
    const totalAssists = matches.reduce((sum, m) => sum + parseInt(m.score?.split('/')[2] || '0', 10), 0);
    const averageKDA = ((totalKills + totalAssists) / totalDeaths).toFixed(2);

    return (
        <div className={formStyles.summaryContainer}>
            <div className={formStyles.summaryCard}>
                <h3>Total de Partidas</h3>
                <p>{totalMatches}</p>
            </div>
            <div className={formStyles.summaryCard}>
                <h3>Taxa de Vitória</h3>
                <p>{winRate}%</p>
            </div>
            <div className={formStyles.summaryCard}>
                <h3>KDA Médio</h3>
                <p>{averageKDA}</p>
            </div>
        </div>
    );
};

const DamageChart: React.FC<{ matches: MatchHistoryItem[] }> = ({ matches }) => {
    const last10Matches = matches.slice(0, 10);
    const labels = last10Matches.map(m => new Date(m.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })).reverse();
    
    const data = {
        labels,
        datasets: [
            {
                label: 'Dano Causado',
                data: last10Matches.map(m => parseInt(m.damageDealt || '0', 10)).reverse(),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Dano Recebido',
                data: last10Matches.map(m => parseInt(m.damageTaken || '0', 10)).reverse(),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: { legend: { labels: { color: '#FFFFFF' } } },
        scales: {
            y: { ticks: { color: '#FFFFFF' } },
            x: { ticks: { color: '#FFFFFF' } }
        }
    };

    return <Bar options={options} data={data} />;
};


const Perfil: React.FC = () => {
    const [user, loadingUser] = useAuthState(auth);
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
    const [editProfile, setEditProfile] = useState<Partial<UserProfile>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            const unsubscribe = listenToUserProfile(user.uid, (profile) => {
                setUserProfile(profile);
                setEditProfile(profile);
            });
            return () => unsubscribe();
        } else if (!loadingUser) {
            navigate('/login');
        }
    }, [user, loadingUser, navigate]);
    
    const sortedMatches = useMemo(() => {
        return userProfile.matchHistory ? [...userProfile.matchHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    }, [userProfile.matchHistory]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const profileUpdates = {
                nick: editProfile.nick,
                inGameName: editProfile.inGameName,
            };
            await updateUserProfile(user.uid, profileUpdates);
            if(editProfile.nick && editProfile.nick !== user.displayName) {
                await updateProfile(user, { displayName: editProfile.nick });
            }
            setMessage('Perfil atualizado com sucesso!');
            setEditMode(false);
        } catch (error) {
            setMessage('Erro ao atualizar o perfil.');
        }
    };

    const handleAddMatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const newMatchId = `match_${Date.now()}`;
        setUploading(true);
        setMessage('A enviar screenshot...');
        try {
            const storageRef = ref(storage, `match_screenshots_raw/${user.uid}/${newMatchId}/${file.name}`);
            await uploadBytes(storageRef, file);
            setMessage('Screenshot enviado! A processar dados...');
        } catch (error) {
            setMessage('Erro ao enviar screenshot.');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    if (loadingUser) {
        return <div className={formStyles.container}><p>Carregando...</p></div>;
    }

    return (
        <div className={formStyles.container}>
            {message && <p className={formStyles.successMessage}>{message}</p>}

            {!editMode ? (
                <>
                    <div className={formStyles.profileHeader}>
                        <img src={userProfile.fotoURL || 'https://via.placeholder.com/100'} alt="Foto de Perfil" className={formStyles.profileImage} />
                        <div className={formStyles.profileInfo}>
                            <h2>{userProfile.nick || 'N/A'}</h2>
                            <p>{userProfile.email}</p>
                            <p><strong>Nome no Jogo:</strong> {userProfile.inGameName || 'Não definido'}</p>
                            <div className={formStyles.buttonGroupRow}>
                                <button onClick={() => setEditMode(true)} className={formStyles.button}>Editar Perfil</button>
                                <button onClick={handleLogout} className={formStyles.buttonSecondary}>Sair</button>
                            </div>
                        </div>
                    </div>

                    <button
                        style={{ backgroundColor: 'orange', color: 'black', padding: '15px', border: 'none', borderRadius: '5px', cursor: 'pointer', margin: '20px 0', width: '100%', maxWidth: '800px' }}
                        onClick={async () => {
                            try {
                                const functions = getFunctions();
                                const getIdentity = httpsCallable(functions, 'getFunctionIdentity');
                                console.log("A chamar a função de teste de identidade...");
                                const result = await getIdentity();

                                // CORREÇÃO para o erro de 'unknown'
                                const data = result.data as { serviceAccount: string };

                                console.log("Resposta da função de identidade:", data);
                                alert(`A identidade da função é: ${data.serviceAccount}`);
                            } catch (error) {
                                console.error("Erro ao chamar a função de identidade:", error);
                                alert("Erro ao chamar a função de identidade. Verifique a consola do browser.");
                            }
                        }}
                    >
                        Verificar Identidade Real da Função
                    </button>
                    
                    <h3 className={formStyles.sectionTitle}>Resumo da Carreira</h3>
                    <StatsSummary matches={sortedMatches} />

                    <h3 className={formStyles.sectionTitle}>Desempenho Recente (Últimas 10 Partidas)</h3>
                    <div className={formStyles.chartContainer}>
                        <DamageChart matches={sortedMatches} />
                    </div>

                    <h3 className={formStyles.sectionTitle}>Histórico de Partidas</h3>
                    <div className={formStyles.matchHistoryGrid}>
                        {sortedMatches.length > 0 ? (
                            sortedMatches.map((match) => (
                                <div key={match.id} className={`${formStyles.matchCard} ${match.outcome === 'Vitória' ? formStyles.victory : formStyles.defeat}`}>
                                    <div className={formStyles.matchHeader}>
                                        <span>{new Date(match.date).toLocaleDateString()}</span>
                                        <span className={formStyles.outcomeText}>{match.outcome}</span>
                                    </div>
                                    <div className={formStyles.matchBody}>
                                        <p><strong>KDA:</strong> {match.score}</p>
                                        <p><strong>Dano Causado:</strong> {match.damageDealt}</p>
                                        <p><strong>Dano Recebido:</strong> {match.damageTaken}</p>
                                        <p><strong>Dano em Torres:</strong> {match.towerDamage}</p>
                                        <p><strong>Participação:</strong> {match.killParticipation}</p>
                                        <p><strong>Ouro:</strong> {match.gold}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum histórico de partida registrado.</p>
                        )}
                    </div>

                    <button className={formStyles.button} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? 'Enviando...' : 'Adicionar Nova Partida'}
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAddMatch} style={{ display: 'none' }} />
                </>
            ) : (
                <form onSubmit={handleUpdateProfile} className={formStyles.form}>
                    <h3 className={formStyles.sectionTitle}>Editar Perfil</h3>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="nick" className={formStyles.label}>Nickname (no site)</label>
                        <input type="text" name="nick" id="nick" value={editProfile.nick || ''} onChange={handleFormChange} className={formStyles.input} />
                    </div>
                    
                    <div className={formStyles.formGroup}>
                        <label htmlFor="inGameName" className={formStyles.label}>Nome no Jogo (Exato)</label>
                        <input type="text" name="inGameName" id="inGameName" value={editProfile.inGameName || ''} onChange={handleFormChange} className={formStyles.input} placeholder="O seu nome exato no jogo"/>
                    </div>

                    <button type="submit" className={formStyles.button}>Salvar Alterações</button>
                    <button type="button" onClick={() => setEditMode(false)} className={formStyles.buttonSecondary}>Cancelar</button>
                </form>
            )}
        </div>
    );
};

export default Perfil;