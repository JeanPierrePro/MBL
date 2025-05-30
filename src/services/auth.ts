// src/services/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // <-- ESSENCIAL: Adicione esta importação
import { auth, db, storage } from './firebaseConfig'; // <-- ESSENCIAL: Garanta que 'storage' é importado daqui
import { FirebaseError } from 'firebase/app';
import type { UserProfile } from '../types/User';

export const login = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);
      let userProfile: UserProfile | null = null;

      if (userSnapshot.exists()) {
        userProfile = { ...userSnapshot.data(), uid: user.uid } as UserProfile;
        await updateDoc(userDocRef, { status: 'Online' });
        console.log(`Status de ${user.email} atualizado para Online.`);
      } else {
        console.warn(`Perfil não encontrado para UID: ${user.uid} após login. Criando um perfil básico.`);
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          nick: user.displayName || 'Novo Usuário',
          lane: 'N/A', // Padrão se o perfil não existir e for criado no login
          fotoPerfil: user.photoURL || null,
          status: 'Online',
          role: 'member',
        };
        await setDoc(userDocRef, newProfile);
        userProfile = newProfile;
      }
      return userProfile;
    }
    return null;
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error('Erro ao fazer login:', error.message);
      throw new Error('Erro ao fazer login: ' + error.message);
    } else {
      console.error('Erro desconhecido ao fazer login:', error);
      throw new Error('Erro desconhecido ao fazer login.');
    }
  }
};

export const registerUser = async (
  nick: string,
  email: string,
  password: string,
  lane: string, // Pode vir vazia se for coach
  role: 'member' | 'coach',
  foto: File | null // <-- ESTE É O SEXTO ARGUMENTO!
): Promise<UserProfile | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let photoURL: string | null = null;

    // Lógica para upload da foto
    if (foto && user) { // Certifique-se que o 'user' existe antes de tentar carregar a foto
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${foto.name}`);
      const snapshot = await uploadBytes(storageRef, foto);
      photoURL = await getDownloadURL(snapshot.ref);
      console.log('Foto de perfil carregada:', photoURL);
    }

    const userDocRef = doc(db, 'users', user.uid);
    const newProfile: UserProfile = {
      uid: user.uid,
      nick: nick,
      email: email,
      lane: role === 'coach' ? '' : lane,
      fotoPerfil: photoURL, // Use a URL obtida do Storage
      status: 'Online',
      role: role,
    };
    await setDoc(userDocRef, newProfile);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: nick,
        photoURL: photoURL, // Atualiza também a foto de perfil no Firebase Auth
      });
    }

    console.log('Usuário registrado e perfil criado:', nick);
    return newProfile;
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error('Erro ao registrar:', error.message);
      throw new Error('Erro ao registrar: ' + error.message);
    } else {
      console.error('Erro desconhecido ao registrar:', error);
      throw new Error('Erro desconhecido ao registrar.');
    }
  }
};

export const logout = async (): Promise<void> => {
  try {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { status: 'Offline' });
      console.log(`Status de ${auth.currentUser.email} atualizado para Offline.`);
    }
    await signOut(auth);
    console.log('Logout realizado com sucesso');
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error('Erro ao deslogar:', error.message);
      throw new Error('Erro ao deslogar: ' + error.message);
    } else {
      console.error('Erro desconhecido ao deslogar:', error);
      throw new Error('Erro desconhecido ao deslogar.');
    }
  }
};