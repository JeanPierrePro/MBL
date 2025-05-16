import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut,
} from 'firebase/auth';

import type { UserCredential } from 'firebase/auth';

import { auth, db } from './firebaseConfig';
import { doc, setDoc } from "firebase/firestore";

export const login = async (email: string, password: string): Promise<UserCredential | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login realizado com sucesso:', userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
  }
};

export const register = async (
  nick: string,
  email: string,
  password: string,
  lane: string
): Promise<UserCredential | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuário registrado:', userCredential.user.uid);

    // Atualiza displayName do usuário no Firebase Auth
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: nick,
      });

      // Cria documento no Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        nick,
        email,
        lane,
        photoURL: null,  // deixamos null ou remove, se quiser
      });
    }

    return userCredential;
  } catch (error) {
    console.error('Erro ao registrar:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('Logout realizado com sucesso');
  } catch (error) {
    console.error('Erro ao deslogar:', error);
  }
};
