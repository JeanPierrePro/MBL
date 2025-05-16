import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

import type { News } from "../types/News";
import type { TeamMember } from "../types/TeamMember";
import type { UserProfile } from "../types/User";

// ✔ Função para buscar perfil de usuário
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as UserProfile;
  return { ...data, uid: snapshot.id };
}

// ✔ Atualizar perfil de usuário
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}

// ✔ Últimas notícias (ex: 3 últimas)
export async function getLatestNews(limitCount = 3): Promise<News[]> {
  const snapshot = await getDocs(collection(db, "news"));
  const all = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as News));
  return all.slice(0, limitCount); // Exemplo simples — substitua por query + limit se quiser
}

// ✔ Todas as notícias
export async function getAllNews(): Promise<News[]> {
  const snapshot = await getDocs(collection(db, "news"));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as News));
}

// ✔ Membros da equipe
export async function getTeamMembers(): Promise<TeamMember[]> {
  const snapshot = await getDocs(collection(db, "teamMembers"));
  return snapshot.docs.map(doc => doc.data() as TeamMember);
}
