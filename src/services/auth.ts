// src/services/auth.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { UserProfile } from '../types/User';

/**
 * Registra um novo usuário no Firebase Authentication e cria seu perfil no Firestore.
 */
export const registerUser = async (
  nick: string,
  email: string,
  password: string,
  lane: 'Top' | 'Jungle' | 'Mid' | 'Adc' | 'Support' | null,
  role: 'coach' | 'member',
  foto: File | null
): Promise<void> => {
  try {
    // 1. Criar utilizador na autenticação
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Lidar com o upload da foto de perfil
    let fotoURL: string | null = null;
    if (foto) {
      const fotoRef = ref(storage, `profile_pictures/${user.uid}/${foto.name}`);
      await uploadBytes(fotoRef, foto);
      fotoURL = await getDownloadURL(fotoRef);
    }

    // 3. Atualizar o perfil do Firebase Auth (para nome e foto)
    await updateProfile(user, {
      displayName: nick,
      photoURL: fotoURL
    });

    // ===== CORREÇÃO PRINCIPAL AQUI =====
    // Construímos o objeto de perfil de forma segura
    const userProfileData: Partial<UserProfile> = {
      uid: user.uid,
      nick,
      email,
      role,
      fotoURL,
      status: 'Offline',
      matchHistory: [], // Iniciar com histórico vazio
      // Não adicionamos 'lane' ou 'teamId' aqui ainda
    };

    // Adicionamos 'lane' APENAS se o 'role' for 'member' e a lane for fornecida
    if (role === 'member' && lane) {
      userProfileData.lane = lane;
    }
    
    // Se o role for 'coach', a lane nunca será adicionada ao objeto,
    // o que evita o erro de 'undefined' no Firestore.

    // 4. Salvar o documento de perfil no Firestore
    await setDoc(doc(db, 'users', user.uid), userProfileData);

  } catch (error: any) {
    // A sua ótima gestão de erros continua aqui
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('O email já está em uso. Por favor, use outro email.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('A senha é muito fraca. Por favor, use uma senha com pelo menos 6 caracteres.');
    } else {
      console.error("Erro desconhecido no registro do usuário:", error);
      throw new Error(error.message || 'Erro desconhecido ao registar. Por favor, tente novamente.');
    }
  }
};


/**
 * Realiza o login de um usuário usando email e senha.
 */
export const login = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const userProfile: UserProfile = {
                uid: user.uid,
                nick: userData.nick || '',
                email: userData.email || '',
                role: userData.role || 'member',
                lane: userData.lane || null, // Garante que seja null em vez de undefined
                inGameName: userData.inGameName || '', // Adicionado para consistência
                fotoURL: userData.fotoURL || null,
                teamId: userData.teamId || null,
                status: userData.status || 'Offline',
                matchHistory: userData.matchHistory || [],
            };
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            return userProfile;
        } else {
            // Se o utilizador existe na Auth mas não no Firestore, é um estado inconsistente.
            await signOut(auth); // Desloga o utilizador para segurança
            throw new Error("Perfil de usuário não encontrado. Por favor, contacte o suporte.");
        }
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            throw new Error('Credenciais inválidas. Verifique seu email e senha.');
        } else {
            console.error("Erro desconhecido no login:", error);
            throw new Error(error.message || 'Erro desconhecido ao fazer login.');
        }
    }
};


/**
 * Realiza o login de um membro da equipe usando seu nickname e senha.
 */
export const loginMemberWithNickname = async (nickname: string, password: string): Promise<UserProfile> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('nick', '==', nickname), where('role', '==', 'member'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Nickname não encontrado ou não associado a um membro da equipa.');
        }

        const memberData = querySnapshot.docs[0].data();
        if (!memberData.email) {
            throw new Error('Email associado ao nickname não encontrado. Não é possível fazer login.');
        }

        // Primeiro, faz o login na Auth para verificar a senha
        await signInWithEmailAndPassword(auth, memberData.email, password);

        // Se o login for bem-sucedido, retorna os dados do perfil
        const userProfile: UserProfile = {
            uid: querySnapshot.docs[0].id,
            nick: memberData.nick,
            email: memberData.email,
            role: memberData.role,
            lane: memberData.lane || null,
            inGameName: memberData.inGameName || '',
            fotoURL: memberData.fotoURL || null,
            teamId: memberData.teamId || null,
            status: memberData.status || 'Offline',
            matchHistory: memberData.matchHistory || [],
        };

        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        return userProfile;

    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            throw new Error('Nickname ou senha inválidos.');
        } else {
            console.error("Erro desconhecido no login de membro:", error);
            throw new Error(error.message || 'Erro desconhecido ao fazer login como membro.');
        }
    }
};

/**
 * Realiza o logout do usuário do Firebase Authentication.
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    localStorage.removeItem('userProfile');
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error);
    throw new Error(error.message || 'Erro desconhecido ao fazer logout.');
  }
};