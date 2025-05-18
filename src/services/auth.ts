import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

import type { UserCredential, User } from 'firebase/auth'; // <-- tipo separado

import { auth, db } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

// LOGIN - retorna o nickname ou null
export const login = async (email: string, password: string): Promise<{ nick: string; user: User } | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Busca os dados do usuário no Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    const nick = user.displayName || (userData && typeof userData.nick === 'string' ? userData.nick : null) || user.uid;

    console.log('Login realizado com sucesso:', nick);

    return { nick, user };
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error('Erro ao fazer login:', error.message);
    } else {
      console.error('Erro desconhecido ao fazer login:', error);
    }
    return null;
  }
};

// REGISTER - cria o usuário, define o displayName e salva no Firestore
export const register = async (
  nick: string,
  email: string,
  password: string,
  lane: string
): Promise<UserCredential | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: nick,
      });

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        nick,
        email,
        lane,
        photoURL: null,
      });
    }

    console.log('Usuário registrado:', nick);

    return userCredential;
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error('Erro ao registrar:', error.message);
    } else {
      console.error('Erro desconhecido ao registrar:', error);
    }
    return null;
  }
};

// LOGOUT
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('Logout realizado com sucesso');
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      console.error('Erro ao deslogar:', error.message);
    } else {
      console.error('Erro desconhecido ao deslogar:', error);
    }
  }
};
