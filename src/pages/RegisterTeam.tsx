// src/pages/RegisterTeam.tsx

import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { Team, NewTeamMemberFormData, TeamMemberInTeamDoc } from '../types/Team';
import { auth, db, functions } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import formStyles from '../styles/AuthForm.module.css';
import teamStyles from '../styles/RegisterTeam.module.css';

interface RegisterTeamFormProps {
    onRegisterSuccess?: () => void;
    onClose?: () => void;
}

interface CreateMembersAccountsResponse {
    success: boolean;
    createdMembers: { email: string; nickname: string; uid: string }[];
    failedMembers: { email: string; nickname?: string; error: string }[];
}

const createMembersAccounts = httpsCallable<
    { teamId: string; membersData: NewTeamMemberFormData[] },
    CreateMembersAccountsResponse
>(functions, 'createTeamMembersAccounts');


const RegisterTeam: React.FC<RegisterTeamFormProps> = ({ onRegisterSuccess, onClose }) => {
    const [teamDetails, setTeamDetails] = useState<Omit<Team, 'id' | 'members' | 'registrationDate' | 'coachId'>>({
        name: '',
        tag: null,
        logoURL: null,
        contactEmail: '',
        leaderNickname: '',
        description: null,
        region: null,
    });

    // CORRIGIDO: lane padrão para null e password pode ser undefined
    const [members, setMembers] = useState<NewTeamMemberFormData[]>([{ nickname: '', lane: null, email: '', password: undefined }]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (!user) {
                setErrorMessage('Você precisa estar logado para registrar uma equipe.');
            } else {
                setErrorMessage(null);
            }
        });
        return () => unsubscribe();
    }, []);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setTeamDetails(prevDetails => ({
            ...prevDetails,
            [name]: value,
        }));
        setErrorMessage(null);
    };

    const handleAddMember = () => {
        setMembers(prevMembers => [...prevMembers, { nickname: '', lane: null, email: '', password: undefined }]); // CORRIGIDO: password para undefined
        setErrorMessage(null);
    };

    const handleMemberInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        const updatedMembers = [...members];
        updatedMembers[index] = { ...updatedMembers[index], [name]: value };
        setMembers(updatedMembers);
        setErrorMessage(null);
    };

    const handleRemoveMember = (index: number) => {
        if (members.length > 1) {
            const updatedMembers = members.filter((_, i) => i !== index);
            setMembers(updatedMembers);
            setErrorMessage(null);
        } else {
            setErrorMessage("Uma equipa deve ter pelo menos um membro.");
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!teamDetails.name.trim()) {
            setErrorMessage("O Nome da Equipa é obrigatório.");
            return;
        }
        if (!teamDetails.contactEmail.trim()) {
            setErrorMessage("O Email de Contacto é obrigatório.");
            return;
        }
        if (!teamDetails.leaderNickname.trim()) {
            setErrorMessage("O Nickname do Líder é obrigatório.");
            return;
        }

        if (members.length === 0) {
            setErrorMessage("A equipa deve ter pelo menos um membro.");
            return;
            }
        for (let i = 0; i < members.length; i++) {
            if (!members[i].nickname.trim()) {
                setErrorMessage(`O Nickname do Membro ${i + 1} é obrigatório.`);
                return;
            }
            if (!members[i].email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(members[i].email.trim())) {
                setErrorMessage(`O Email do Membro ${i + 1} é obrigatório e deve ser válido.`);
                return;
            }
            // CORRIGIDO: Validação da Senha do Membro
            const memberPassword = members[i].password;
            if (typeof memberPassword !== 'string' || memberPassword.trim().length < 6) {
                setErrorMessage(`A Senha do Membro ${i + 1} é obrigatória e deve ter pelo menos 6 caracteres.`);
                return;
            }
        }

        if (!currentUser || !currentUser.uid) {
            setErrorMessage("Nenhum utilizador logado. Por favor, faça login para registar a equipa.");
            return;
        }

        try {
            await currentUser.getIdToken(true);
            console.log("Frontend Debug: ID Token atualizado com sucesso.");
        } catch (tokenError) {
            console.error("Frontend Debug: Erro ao forçar atualização do ID Token:", tokenError);
            setErrorMessage("Não foi possível obter o token de autenticação. Tente fazer login novamente.");
            return;
        }

        console.log("---------- Frontend Debug: Antes da Cloud Function ----------");
        console.log("auth object:", auth);
        console.log("auth.currentUser:", auth.currentUser);
        if (auth.currentUser) {
            console.log("auth.currentUser.uid:", auth.currentUser.uid);
            console.log("auth.currentUser.email:", auth.currentUser.email);
        } else {
            console.warn("Frontend Debug: auth.currentUser é nulo/undefined antes da chamada da função!");
        }
        console.log("--------------------------------------------------");

        const newTeamRef = doc(db, 'teams', new Date().getTime().toString() + Math.random().toString(36).substring(2, 10));
        const teamId = newTeamRef.id;

        const teamDataToSave: Omit<Team, 'id' | 'registrationDate'> = {
            ...teamDetails,
            // Certifique-se de que 'lane' em TeamMemberInTeamDoc é 'string | null'
            members: members.map(m => ({ nickname: m.nickname, lane: m.lane, email: m.email })) as TeamMemberInTeamDoc[],
            coachId: currentUser.uid,
        };

        try {
            await setDoc(newTeamRef, {
                ...teamDataToSave,
                registrationDate: new Date(),
                id: teamId
            });
            console.log('Frontend: Detalhes da equipa salvos com sucesso no Firestore. ID:', teamId);

            const membersDataForCloudFunction = members.map(m => ({
                email: m.email,
                nickname: m.nickname,
                lane: m.lane || null, // Garante que a lane é string ou null para a CF
                password: m.password, // Inclui a senha para a CF
                teamId: teamId,
            }));

            console.log("Frontend: Chamando Cloud Function 'createTeamMembersAccounts' com:", { teamId, membersData: membersDataForCloudFunction.map(({ password, ...rest }) => rest) });

            const result = await createMembersAccounts({ teamId: teamId, membersData: membersDataForCloudFunction });
            const { success, createdMembers, failedMembers } = result.data;

            if (success) {
                console.log('Frontend: Contas de membros criadas/atualizadas com sucesso (via Cloud Function):', createdMembers);
                let msg = 'Equipa registada com sucesso! ';
                if (createdMembers.length > 0) {
                    msg += `Membros criados/atualizados: ${createdMembers.map(m => m.nickname).join(', ')}.`;
                }
                if (failedMembers && failedMembers.length > 0) {
                    msg += ` Atenção: Alguns membros falharam ao ser criados/atualizados: ${failedMembers.map(fm => `${fm.nickname || fm.email} (${fm.error})`).join(', ')}. Verifique o console para detalhes.`;
                    setErrorMessage(msg);
                } else {
                    setSuccessMessage(msg);
                }
            } else {
                console.error('Frontend: Erro retornado pela Cloud Function para criar contas de membros:', result.data);
                setErrorMessage('Equipa registada, mas houve um erro ao criar as contas dos membros. Contacte o suporte.');
            }

            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, {
                teamId: teamId,
                nick: teamDetails.leaderNickname,
                role: 'coach'
            }, { merge: true });
            console.log(`Frontend: Utilizador ${currentUser.uid} associado à equipa ${teamId} com role 'coach'.`);

            onRegisterSuccess && onRegisterSuccess();

            setTeamDetails({
                name: '', tag: null, logoURL: null, contactEmail: '',
                leaderNickname: '', description: null, region: null,
            });
            setMembers([{ nickname: '', lane: null, email: '', password: undefined }]); // CORRIGIDO: password para undefined

            setTimeout(() => {
                onClose && onClose();
            }, 2000);

        } catch (error: any) {
            console.error('Frontend: Erro ao registar a equipa ou criar contas de membros:', error);
            if (error.code) {
                switch (error.code) {
                    case 'unauthenticated':
                        setErrorMessage('Erro de autenticação: Você precisa estar logado. Por favor, faça login novamente.');
                        break;
                    case 'permission-denied':
                        setErrorMessage('Erro de permissão: Apenas treinadores podem registrar equipes.');
                        break;
                    case 'invalid-argument':
                        setErrorMessage(`Erro de dados: ${error.message}`);
                        break;
                    case 'internal':
                        setErrorMessage(`Erro interno do servidor: ${error.message}. Por favor, tente novamente.`);
                        break;
                    default:
                        setErrorMessage(`Erro desconhecido: ${error.message}`);
                }
            } else {
                setErrorMessage(`Erro inesperado: ${error.message || 'Verifique o console para mais detalhes.'}`);
            }
        }
    };

    if (!currentUser) {
        return (
            <div className={formStyles.container}>
                <h2 className={formStyles.centeredHeading}>Registar Equipa</h2>
                <p>{errorMessage || 'Carregando status de autenticação...'}</p>
                <p>Por favor, faça login para acessar esta funcionalidade.</p>
            </div>
        );
    }

    return (
        <div className={formStyles.container}>
            <h2 className={formStyles.centeredHeading}>Registar Nova Equipa</h2>
            <form onSubmit={handleSubmit} className={formStyles.form}>
                {/* Detalhes da Equipa */}
                <div className={formStyles.formSection}>
                    <h3 className={formStyles.sectionTitle}>Detalhes da Equipa</h3>
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
                        <label htmlFor="leaderNickname" className={formStyles.label}>Nickname do Líder (Seu Nickname na Equipe)*</label>
                        <input type="text" id="leaderNickname" name="leaderNickname" value={teamDetails.leaderNickname} onChange={handleInputChange} required className={formStyles.input} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="description" className={formStyles.label}>Descrição</label>
                        <textarea id="description" name="description" value={teamDetails.description || ''} onChange={handleInputChange} className={formStyles.textarea} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="region" className={formStyles.label}>Região</label>
                        <input type="text" id="region" name="region" value={teamDetails.region || ''} onChange={handleInputChange} className={formStyles.input} />
                    </div>
                </div>

                {/* Membros da Equipa - COM CAMPO DE SENHA */}
                <div className={formStyles.formSection}>
                    <h3 className={formStyles.sectionTitle}>Membros da Equipa</h3>
                    {members.map((member, index) => (
                        <div key={index} className={teamStyles.memberCard}>
                            <h4 className={teamStyles.memberCardTitle}>Membro {index + 1}</h4>
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
                                <label htmlFor={`email-${index}`} className={formStyles.label}>Email*</label>
                                <input
                                    type="email"
                                    id={`email-${index}`}
                                    name="email"
                                    value={member.email}
                                    onChange={(event) => handleMemberInputChange(index, event)}
                                    required
                                    className={formStyles.input}
                                />
                            </div>
                            {/* CAMPO: SENHA DO MEMBRO (AGORA OBRIGATÓRIO NO FRONTEND TAMBÉM) */}
                            <div className={formStyles.formGroup}>
                                <label htmlFor={`password-${index}`} className={formStyles.label}>Senha* (Mín. 6 caracteres)</label>
                                <input
                                    type="password"
                                    id={`password-${index}`}
                                    name="password"
                                    value={member.password || ''} // Usar '' para evitar 'null' no input
                                    onChange={(event) => handleMemberInputChange(index, event)}
                                    required
                                    minLength={6} // HTML5 validation
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
                                    className={`${formStyles.button} ${formStyles.removeButton} ${teamStyles.removeMemberButton}`}
                                >
                                    Remover Membro {index + 1}
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddMember} className={`${formStyles.button} ${teamStyles.addMemberButton}`}>
                        Adicionar Membro
                    </button>
                </div>

                {/* Mensagens de Erro/Sucesso e Botões de Ação */}
                {errorMessage && <p className={formStyles.errorMessage}>{errorMessage}</p>}
                {successMessage && <p className={formStyles.successMessage}>{successMessage}</p>}

                <div className={formStyles.buttonGroup}>
                    <button type="submit" className={formStyles.button} disabled={!!successMessage}>Registar Equipa</button>
                    {onClose && <button type="button" onClick={onClose} className={formStyles.buttonSecondary}>Cancelar</button>}
                </div>
            </form>
        </div>
    );
};

export default RegisterTeam;