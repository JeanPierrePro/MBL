import { db, storage } from './firebaseConfig';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    where,
    updateDoc,
    arrayUnion,
    onSnapshot,
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { News } from '../types/News';
import type { Team } from '../types/Team';
import type { UserProfile, MatchHistoryItem } from '../types/User';

// --- Funções de Notícias ---

/**
 * Cria um listener em tempo real para a coleção de notícias,
 * ordenando-as da mais recente para a mais antiga.
 */
export const listenToAllNews = (callback: (news: News[]) => void) => {
  const newsQuery = query(collection(db, 'news'), orderBy('publicationDate', 'desc'));

  const unsubscribe = onSnapshot(newsQuery, (querySnapshot) => {
    const newsList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        summary: data.summary || '',
        imageUrl: data.imageUrl || '',
        publicationDate: data.publicationDate?.toDate() || new Date(),
        description: data.description || '',
        content: data.content || '',
      } as News;
    });
    callback(newsList);
  }, (error) => {
    console.error("Erro ao ouvir as notícias:", error);
    callback([]);
  });
  return unsubscribe;
};

/**
 * Cria um novo artigo de notícia, faz o upload da imagem e salva no Firestore.
 */
export const addNews = async (
  newsData: { title: string, summary: string, description: string, content: string },
  imageFile: File
): Promise<string> => {
  try {
    const imageRef = ref(storage, `news_images/${Date.now()}_${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);
    const completeNewsData = {
      ...newsData,
      imageUrl: imageUrl,
      publicationDate: new Date(),
    };
    const docRef = await addDoc(collection(db, 'news'), completeNewsData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o artigo de notícia:", error);
    throw new Error("Falha ao criar a notícia. Verifique a consola para mais detalhes.");
  }
};


// --- Funções de Perfil de Utilizador ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            return {
                uid: userDocSnap.id,
                nick: data.nick || '',
                email: data.email || '',
                role: data.role || 'member',
                lane: data.lane || null,
                inGameName: data.inGameName || '',
                status: data.status || 'Offline',
                fotoURL: data.fotoURL || null,
                teamId: data.teamId || null,
                matchHistory: (data.matchHistory || []),
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Erro ao obter perfil do usuário:', error);
        return null;
    }
};

export const listenToUserProfile = (
    uid: string,
    callback: (profile: UserProfile) => void
) => {
    const docRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const profileData: UserProfile = {
                uid: docSnap.id,
                nick: data.nick || '',
                email: data.email || '',
                role: data.role || 'member',
                lane: data.lane || null,
                inGameName: data.inGameName || '',
                status: data.status || 'Offline',
                fotoURL: data.fotoURL || null,
                teamId: data.teamId || null,
                matchHistory: data.matchHistory || [],
            };
            callback(profileData);
        } else {
            console.warn("Listener: Nenhum perfil encontrado para o UID:", uid);
        }
    });
    return unsubscribe;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, updates, { merge: true });
        console.log('Perfil do usuário atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário:', error);
        throw error;
    }
};


// --- Funções de Partidas (Match) ---

export const addMatchToUserProfile = async (uid: string, matchData: Omit<MatchHistoryItem, 'id'>): Promise<string> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const newMatchId = doc(collection(db, 'temp')).id;
        const matchWithId: MatchHistoryItem = { id: newMatchId, ...matchData };
        await updateDoc(userDocRef, {
            matchHistory: arrayUnion(matchWithId)
        });
        return newMatchId;
    } catch (error) {
        console.error('Erro ao adicionar partida ao perfil:', error);
        throw error;
    }
};

export const updateMatchHistoryScreenshot = async (uid: string, matchId: string, screenshotUrl: string): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const currentMatchHistory: MatchHistoryItem[] = userDocSnap.data().matchHistory || [];
            const updatedMatchHistory = currentMatchHistory.map(match =>
                match.id === matchId ? { ...match, screenshotUrl } : match
            );
            await updateDoc(userDocRef, { matchHistory: updatedMatchHistory });
        }
    } catch (error) {
        console.error('Erro ao atualizar screenshot:', error);
        throw error;
    }
};


// --- Funções de Equipa (Team) ---

export const getAllTeams = async (): Promise<Team[]> => {
   try {
        const teamsCollection = collection(db, 'teams');
        const teamSnapshot = await getDocs(teamsCollection);
        const teamsList = teamSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                registrationDate: data.registrationDate ? data.registrationDate.toDate() : new Date(),
                tag: data.tag || null,
                logoURL: data.logoURL || null,
                description: data.description || null,
                region: data.region || null,
                members: (data.members || []),
            } as Team;
        });
        return teamsList;
    } catch (error) {
        console.error("Erro ao obter todas as equipes:", error);
        throw error;
    }
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
    try {
        const teamDocRef = doc(db, 'teams', teamId);
        const teamDocSnap = await getDoc(teamDocRef);
        if (teamDocSnap.exists()) {
            const data = teamDocSnap.data();
            return {
                ...data,
                id: teamDocSnap.id,
                registrationDate: data.registrationDate ? data.registrationDate.toDate() : new Date(),
                tag: data.tag || null,
                logoURL: data.logoURL || null,
                description: data.description || null,
                region: data.region || null,
                members: (data.members || []),
            } as Team;
        }
        return null;
    } catch (error) {
        console.error("Erro ao obter equipe por ID:", error);
        throw error;
    }
};

export const getTeamMembers = async (teamId: string): Promise<UserProfile[]> => {
    const membersCollection = collection(db, 'users');
    const q = query(membersCollection, where('teamId', '==', teamId));
    const membersSnapshot = await getDocs(q);
    const membersList = membersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            nick: data.nick || '',
            email: data.email || '',
            role: data.role || 'member',
            lane: data.lane || null,
            inGameName: data.inGameName || '',
            status: data.status || 'Offline',
            fotoURL: data.fotoURL || null,
            teamId: data.teamId || null,
            matchHistory: data.matchHistory || [],
        } as UserProfile;
    });
    return membersList;
};

export const getTeamTrainings = async (teamId: string): Promise<Record<string, string[]>> => {
  try {
    console.warn(`[database.ts] getTeamTrainings para teamId ${teamId} chamada, mas não implementada. Retornando vazio.`);
    return {};
  } catch (error) {
    console.error(`[database.ts] Erro em getTeamTrainings para teamId ${teamId}:`, error);
    throw error;
  }
};