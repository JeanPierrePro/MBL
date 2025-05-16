import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut
} from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';  // import type para UserCredential

import { auth } from './firebaseConfig';

// Login real com Firebase Auth
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

// Registro real com Firebase Auth + updateProfile para nick e foto (simplificado)
export const register = async (
  nick: string, 
  email: string, 
  password: string, 
  // Removi lane porque não é usado
  foto: File | null
): Promise<UserCredential | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuário registrado:', userCredential.user.uid);

    // Atualiza perfil com displayName e photoURL (foto simplificada)
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: nick,
        photoURL: foto ? URL.createObjectURL(foto) : null,
      });
      console.log('Perfil atualizado com nick e foto');
    }

    // Aqui você pode adicionar salvar a lane no Firestore, se quiser

    return userCredential;
  } catch (error) {
    console.error('Erro ao registar:', error);
    return null;
  }
};

// Logout real
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('Logout realizado com sucesso');
  } catch (error) {
    console.error('Erro ao deslogar:', error);
  }
};
