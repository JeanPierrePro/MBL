import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';  // usa o nome correto

import type { News } from '../types/News';
import type { TeamMember } from '../types/TeamMember';
import type { UserProfile } from '../types/User';

export async function getNews(id: string): Promise<News | null> {
  const docRef = doc(db, 'news', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as News;

  const news: News = {
    ...data,
    id: snapshot.id,
  };

  return news;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as UserProfile;

  const userProfile: UserProfile = {
    ...data,
    uid: snapshot.id,
  };

  return userProfile;
}

export async function getTeamMember(id: string): Promise<TeamMember | null> {
  const docRef = doc(db, 'teamMembers', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as TeamMember;

  // Se quiser, adicione id opcional no TeamMember e coloque aqui
  const teamMember: TeamMember = {
    ...data,
  };

  return teamMember;
}
