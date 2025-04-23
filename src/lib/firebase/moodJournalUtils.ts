import { auth, db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";

// MoodJournal types
export interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  note: string;
  films?: {
    id: number;
    title: string;
    posterPath: string;
  }[];
}

/**
 * Fetches all mood entries for the current user
 * @returns Promise with array of mood entries
 */
export const getUserMoodEntries = async (): Promise<MoodEntry[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user found");
    return [];
  }

  try {
    const entriesRef = collection(db, "users", user.uid, "moodEntries");
    const entriesQuery = query(entriesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(entriesQuery);
    
    const entries: MoodEntry[] = [];
    snapshot.forEach(doc => {
      entries.push(doc.data() as MoodEntry);
    });
    
    return entries;
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return [];
  }
};

/**
 * Adds a new mood entry for the current user
 * @param entry The mood entry to add
 * @returns The ID of the new entry
 */
export const addMoodEntry = async (entry: Omit<MoodEntry, "id">): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  try {
    const entryId = Date.now().toString();
    const newEntry = { ...entry, id: entryId };
    
    const entryRef = doc(db, "users", user.uid, "moodEntries", entryId);
    await setDoc(entryRef, newEntry);
    
    return entryId;
  } catch (error) {
    console.error("Error adding mood entry:", error);
    throw error;
  }
};

/**
 * Updates an existing mood entry
 * @param entryId The ID of the entry to update
 * @param updates The updates to apply
 */
export const updateMoodEntry = async (entryId: string, updates: Partial<MoodEntry>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  try {
    const entryRef = doc(db, "users", user.uid, "moodEntries", entryId);
    await updateDoc(entryRef, updates);
  } catch (error) {
    console.error("Error updating mood entry:", error);
    throw error;
  }
};

/**
 * Deletes a mood entry
 * @param entryId The ID of the entry to delete
 */
export const deleteMoodEntry = async (entryId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  try {
    const entryRef = doc(db, "users", user.uid, "moodEntries", entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    throw error;
  }
};

/**
 * Gets mood entries filtered by mood
 * @param mood The mood to filter by
 * @returns Promise with array of filtered mood entries
 */
export const getMoodEntriesByMood = async (mood: string): Promise<MoodEntry[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user found");
    return [];
  }

  try {
    const entriesRef = collection(db, "users", user.uid, "moodEntries");
    const entriesQuery = query(
      entriesRef, 
      where("mood", "==", mood),
      orderBy("date", "desc")
    );
    
    const snapshot = await getDocs(entriesQuery);
    
    const entries: MoodEntry[] = [];
    snapshot.forEach(doc => {
      entries.push(doc.data() as MoodEntry);
    });
    
    return entries;
  } catch (error) {
    console.error("Error fetching mood entries by mood:", error);
    return [];
  }
}; 