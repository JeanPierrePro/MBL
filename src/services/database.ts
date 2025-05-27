  // src/services/database.ts
  import { doc, getDoc, getDocs, collection, updateDoc, setDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
  import { db } from "./firebaseConfig";

  import type { News } from "../types/News";
  import type { TeamMember } from "../types/TeamMember";
  import type { UserProfile } from "../types/User";
  import type { Team } from "../types/Team";
  import type { Champion } from "../types/Champion"; // IMPORTANTE: Importe o novo tipo Champion

  // Função para buscar o perfil do usuário
  export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    try {
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        console.warn(`Nenhum perfil de usuário encontrado para UID: ${uid}`);
        return null;
      }

      const data = snapshot.data();
      return { ...data, uid: snapshot.id } as UserProfile;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  // Atualizar perfil do usuário
  export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const docRef = doc(db, "users", uid);
    try {
      await updateDoc(docRef, data);
      console.log("Perfil atualizado com sucesso no Firestore.");
    } catch (error) {
      console.error("Erro ao atualizar perfil no Firestore:", error);
      throw error;
    }
  }

  // --- Funções de Notícias ---

  // Converte o Timestamp do Firebase para uma string de data ISO para o tipo News
  // Esta função auxiliar garante consistência na manipulação de datas.
  const mapNewsDocToNewsType = (doc: any): News => {
    const data = doc.data();
    // Se publicationDate for um Timestamp, converte para ISO string
    const publicationDate = data.publicationDate && typeof data.publicationDate.toDate === 'function'
      ? data.publicationDate.toDate().toISOString()
      : data.publicationDate; // Caso já seja uma string, mantém

    return { ...data, id: doc.id, publicationDate } as News;
  };


  // Últimas notícias (ex: as 3 mais recentes)
  export async function getLatestNews(limitCount = 3): Promise<News[]> {
    const q = query(collection(db, "news"), orderBy("publicationDate", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapNewsDocToNewsType);
  }

  // Todas as notícias
  export async function getAllNews(): Promise<News[]> {
    const q = query(collection(db, "news"), orderBy("publicationDate", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapNewsDocToNewsType);
  }

  // Adiciona uma nova notícia/evento
  export async function addNews(newsData: Omit<News, 'id' | 'publicationDate'>): Promise<string | null> {
    try {
      const newsCollectionRef = collection(db, 'news');
      const docRef = await addDoc(newsCollectionRef, {
        ...newsData,
        publicationDate: new Date(), // Salva como Timestamp do Firebase
      });
      console.log('Notícia/Evento adicionado com ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar notícia/evento:', error);
      return null;
    }
  }

  // --- FIM das Funções de Notícias ---

  // --- Funções de Membros da Equipe ---
  export async function getTeamMembers(): Promise<TeamMember[]> {
    try {
      const snapshot = await getDocs(collection(db, "teamMembers"));
      return snapshot.docs.map(doc => doc.data() as TeamMember);
    } catch (error) {
      console.error("Erro ao buscar membros da equipe:", error);
      return [];
    }
  }
  // --- FIM das Funções de Membros da Equipe ---

  // --- Funções de Equipes (Teams) ---
  export const registerTeam = async (teamData: Omit<Team, 'id' | 'registrationDate'>): Promise<string | null> => {
    try {
      const teamsCollectionRef = collection(db, 'teams');
      const docRef = await addDoc(teamsCollectionRef, {
        ...teamData,
        registrationDate: new Date(),
      });
      console.log('Time registrado com ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao registrar time:', error);
      return null;
    }
  };

  export const getAllTeams = async (): Promise<Team[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teams: Team[] = [];
      querySnapshot.forEach((doc) => {
        teams.push({ id: doc.id, ...doc.data() } as Team);
      });
      return teams;
    } catch (error) {
      console.error('Erro ao buscar times:', error);
      return [];
    }
  };
  // --- FIM das Funções de Equipes (Teams) ---

  // --- Funções de Treinos ---
  type Bookings = Record<string, string[]>; // Ex: { Segunda: ["15:00", "20:00"], Terça: ["17:00"] }

  export async function getUserTrainings(uid: string): Promise<Bookings | null> {
    const docRef = doc(db, "trainings", uid);
    try {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return data.bookings || null;
    } catch (error) {
      console.error("Erro ao buscar treinos do usuário:", error);
      return null;
    }
  }

  export async function addTrainingBooking(uid: string, day: string, time: string) {
    const docRef = doc(db, "trainings", uid);
    try {
      const userTrainings = await getUserTrainings(uid);

      if (!userTrainings) {
        await setDoc(docRef, {
          bookings: {
            [day]: [time],
          },
        });
        console.log(`Treino para ${day} às ${time} adicionado para ${uid}.`);
      } else {
        const dayTimes = userTrainings[day] || [];
        if (dayTimes.includes(time)) {
          throw new Error("Horário já agendado para este dia.");
        }
        dayTimes.push(time);

        await updateDoc(docRef, {
          [`bookings.${day}`]: dayTimes,
        });
        console.log(`Treino para ${day} às ${time} atualizado para ${uid}.`);
      }
    } catch (error) {
      console.error("Erro ao adicionar agendamento de treino:", error);
      throw error;
    }
  }
  // --- FIM das Funções de Treinos ---

  // --- NOVAS FUNÇÕES PARA PERSONAGENS (CHAMPIONS) ---

  /**
   * Busca todos os personagens do Firestore.
   * @returns Um array de objetos Champion.
   */
  export const getAllChampions = async (): Promise<Champion[]> => {
    const championsCollectionRef = collection(db, 'champions'); // Nome da coleção: 'champions'
    const championsSnapshot = await getDocs(championsCollectionRef);
    const championsList: Champion[] = championsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Champion));
    return championsList;
  };

  /**
   * Busca um personagem específico pelo seu ID (nome do documento).
   * @param championId O ID do personagem (nome do documento no Firestore).
   * @returns O objeto Champion ou null se não for encontrado.
   */
  export const getChampionById = async (championId: string): Promise<Champion | null> => {
    const championDocRef = doc(db, 'champions', championId);
    const championSnapshot = await getDoc(championDocRef);

    if (championSnapshot.exists()) {
      return { id: championSnapshot.id, ...championSnapshot.data() } as Champion;
    }
    return null;
  };

  // --- FIM das NOVAS FUNÇÕES PARA PERSONAGENS ---