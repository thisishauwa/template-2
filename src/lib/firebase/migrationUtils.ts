import { auth, db } from "./firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, where } from "firebase/firestore";
import { User } from "firebase/auth";

// MoodJournal types
interface MoodEntry {
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

// Watchlist types
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date?: string;
  vote_average: number;
  genre_ids: number[];
  mood?: string;
}

/**
 * Migrates mood journal entries from localStorage to Firestore
 * @param user The current Firebase user
 * @returns Array of migrated mood entries
 */
export const migrateMoodJournalToFirestore = async (user: User): Promise<MoodEntry[]> => {
  if (!user) {
    console.error("No authenticated user found");
    return [];
  }

  try {
    const savedEntries = localStorage.getItem('moodJournalEntries');
    if (!savedEntries) return [];

    const entries: MoodEntry[] = JSON.parse(savedEntries);
    
    // Check if user already has entries in Firestore to avoid duplication
    const userEntriesRef = collection(db, "users", user.uid, "moodEntries");
    const snapshot = await getDocs(userEntriesRef);
    
    // If user already has entries in Firestore, don't migrate
    if (!snapshot.empty) {
      console.log("User already has mood entries in Firestore, skipping migration");
      return entries;
    }
    
    // Migrate each entry to Firestore
    for (const entry of entries) {
      const entryRef = doc(userEntriesRef, entry.id);
      await setDoc(entryRef, entry);
    }
    
    console.log(`Successfully migrated ${entries.length} mood entries to Firestore`);
    return entries;
  } catch (error) {
    console.error("Error migrating mood journal to Firestore:", error);
    return [];
  }
};

/**
 * Migrates watchlist movies from localStorage to Firestore
 * @param user The current Firebase user
 * @returns Array of migrated movies
 */
export const migrateWatchlistToFirestore = async (user: User): Promise<Movie[]> => {
  if (!user) {
    console.error("No authenticated user found");
    return [];
  }

  try {
    const savedWatchlist = localStorage.getItem('feelingFlicks_watchlist');
    if (!savedWatchlist) return [];

    const movies: Movie[] = JSON.parse(savedWatchlist);
    
    // Check if user already has watchlist in Firestore to avoid duplication
    const userWatchlistRef = collection(db, "users", user.uid, "watchlist");
    const snapshot = await getDocs(userWatchlistRef);
    
    // If user already has watchlist in Firestore, don't migrate
    if (!snapshot.empty) {
      console.log("User already has watchlist in Firestore, skipping migration");
      return movies;
    }
    
    // Migrate each movie to Firestore
    for (const movie of movies) {
      const movieRef = doc(userWatchlistRef, movie.id.toString());
      await setDoc(movieRef, movie);
    }
    
    console.log(`Successfully migrated ${movies.length} movies to Firestore`);
    return movies;
  } catch (error) {
    console.error("Error migrating watchlist to Firestore:", error);
    return [];
  }
};

/**
 * Attempts migration of both mood journal and watchlist data
 * @param user The current Firebase user
 * @returns Object with results of both migrations
 */
export const migrateUserData = async (user: User) => {
  if (!user) {
    console.error("No authenticated user found for migration");
    return { moodEntries: [], watchlist: [] };
  }
  
  const moodEntries = await migrateMoodJournalToFirestore(user);
  const watchlist = await migrateWatchlistToFirestore(user);
  
  return { moodEntries, watchlist };
}; 