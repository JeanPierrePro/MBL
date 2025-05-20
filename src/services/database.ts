// src/services/database.ts
import { doc, getDoc, getDocs, collection, updateDoc, setDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebaseConfig";

import type { News } from "../types/News";
import type { TeamMember } from "../types/TeamMember";
import type { UserProfile } from "../types/User";
import type { Team } from "../types/Team";

// Function to fetch user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  try {
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      console.warn(`No user profile found for UID: ${uid}`);
      return null;
    }

    const data = snapshot.data();
    return { ...data, uid: snapshot.id } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, "users", uid);
  try {
    await updateDoc(docRef, data);
    console.log("Profile updated successfully in Firestore.");
  } catch (error) {
    console.error("Error updating profile in Firestore:", error);
    throw error;
  }
}

// Latest news (e.g., last 3) - Improved to use Firestore query
export async function getLatestNews(limitCount = 3): Promise<News[]> {
  const q = query(collection(db, "news"), orderBy("publicationDate", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, publicationDate: doc.data().publicationDate.toDate() } as News));
}

// All news - Improved to use Firestore query
export async function getAllNews(): Promise<News[]> {
  const q = query(collection(db, "news"), orderBy("publicationDate", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, publicationDate: doc.data().publicationDate.toDate() } as News));
}

// NEW: Add a new news/event (for admins only)
export async function addNews(newsData: Omit<News, 'id' | 'publicationDate'>): Promise<string | null> {
  try {
    const newsCollectionRef = collection(db, 'news');
    const docRef = await addDoc(newsCollectionRef, {
      ...newsData,
      publicationDate: new Date(),
    });
    console.log('News/Event added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding news/event:', error);
    return null;
  }
}

// Team members
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const snapshot = await getDocs(collection(db, "teamMembers"));
    return snapshot.docs.map(doc => doc.data() as TeamMember);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

// Register new team
export const registerTeam = async (teamData: Omit<Team, 'id' | 'registrationDate'>): Promise<string | null> => {
  try {
    const teamsCollectionRef = collection(db, 'teams');
    const docRef = await addDoc(teamsCollectionRef, {
      ...teamData,
      registrationDate: new Date(),
    });
    console.log('Team registered with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error registering team:', error);
    return null;
  }
};

// Fetch all teams
export const getAllTeams = async (): Promise<Team[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'teams'));
    const teams: Team[] = [];
    querySnapshot.forEach((doc) => {
      teams.push({ id: doc.id, ...doc.data() } as Team);
    });
    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

// ---------------------------------------------------
// Functions to manipulate trainings
// ---------------------------------------------------

type Bookings = Record<string, string[]>; // e.g., { Monday: ["15:00", "20:00"], Tuesday: ["17:00"] }

// Fetch user trainings
export async function getUserTrainings(uid: string): Promise<Bookings | null> {
  const docRef = doc(db, "trainings", uid);
  try {
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return data.bookings || null;
  } catch (error) {
    console.error("Error fetching user trainings:", error);
    return null;
  }
}

// Add a training booking on the specified day and time
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
      console.log(`Training for ${day} at ${time} added for ${uid}.`);
    } else {
      const dayTimes = userTrainings[day] || [];
      if (dayTimes.includes(time)) {
        throw new Error("Time already booked for this day.");
      }
      dayTimes.push(time);

      await updateDoc(docRef, {
        [`bookings.${day}`]: dayTimes,
      });
      console.log(`Training for ${day} at ${time} updated for ${uid}.`);
    }
  } catch (error) {
    console.error("Error adding training booking:", error);
    throw error;
  }
}