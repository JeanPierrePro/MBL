import { doc, getDoc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
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

// ---------------------------------------------------
// Novas funções para manipular treinos (trainings)
// ---------------------------------------------------

type Bookings = Record<string, string[]>; // ex: { Monday: ["15:00", "20:00"], Tuesday: ["17:00"] }

// Buscar os treinos do usuário
export async function getUserTrainings(uid: string): Promise<Bookings | null> {
  const docRef = doc(db, "trainings", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return data.bookings || null;
}

// Adicionar um treino no dia e horário especificados
export async function addTrainingBooking(uid: string, day: string, time: string) {
  const docRef = doc(db, "trainings", uid);

  const userTrainings = await getUserTrainings(uid);

  if (!userTrainings) {
    // Cria documento se não existir
    await setDoc(docRef, {
      bookings: {
        [day]: [time],
      },
    });
  } else {
    // Atualiza adicionando novo horário no dia (evita duplicados)
    const dayTimes = userTrainings[day] || [];
    if (dayTimes.includes(time)) {
      throw new Error("Horário já marcado para este dia.");
    }
    dayTimes.push(time);

    await updateDoc(docRef, {
      [`bookings.${day}`]: dayTimes,
    });
  }
}
