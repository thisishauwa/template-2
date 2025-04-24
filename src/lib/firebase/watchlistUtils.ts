import { auth, db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";

// Watchlist types
export interface Movie {
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
 * Fetches all watchlist movies for the current user
 * @returns Promise with array of movies
 */
export const getUserWatchlist = async (): Promise<Movie[]> => {
  // Check if Firebase is properly initialized
  if (!auth || !db) {
    console.warn("Firebase not initialized, cannot get watchlist");
    return [];
  }

  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user found");
    return [];
  }

  try {
    const watchlistRef = collection(db, "users", user.uid, "watchlist");
    const snapshot = await getDocs(watchlistRef);
    
    const movies: Movie[] = [];
    snapshot.forEach(doc => {
      movies.push(doc.data() as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

/**
 * Adds a movie to the user's watchlist
 * @param movie The movie to add
 */
export const addMovieToWatchlist = async (movie: Movie): Promise<void> => {
  // Check if Firebase is properly initialized
  if (!auth || !db) {
    console.warn("Firebase not initialized, cannot add movie to watchlist");
    throw new Error("Firebase not initialized");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  try {
    const movieRef = doc(db, "users", user.uid, "watchlist", movie.id.toString());
    await setDoc(movieRef, movie);
  } catch (error) {
    console.error("Error adding movie to watchlist:", error);
    throw error;
  }
};

/**
 * Checks if a movie is in the user's watchlist
 * @param movieId The ID of the movie to check
 * @returns Whether the movie is in the watchlist
 */
export const isMovieInWatchlist = async (movieId: number): Promise<boolean> => {
  // Check if Firebase is properly initialized
  if (!auth || !db) {
    console.warn("Firebase not initialized, cannot check watchlist");
    return false;
  }

  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user found");
    return false;
  }

  try {
    const movieRef = doc(db, "users", user.uid, "watchlist", movieId.toString());
    const movieDoc = await getDoc(movieRef);
    return movieDoc.exists();
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
};

/**
 * Removes a movie from the user's watchlist
 * @param movieId The ID of the movie to remove
 */
export const removeMovieFromWatchlist = async (movieId: number): Promise<void> => {
  // Check if Firebase is properly initialized
  if (!auth || !db) {
    console.warn("Firebase not initialized, cannot remove movie from watchlist");
    throw new Error("Firebase not initialized");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  try {
    const movieRef = doc(db, "users", user.uid, "watchlist", movieId.toString());
    await deleteDoc(movieRef);
  } catch (error) {
    console.error("Error removing movie from watchlist:", error);
    throw error;
  }
};

/**
 * Gets watchlist movies filtered by mood
 * @param mood The mood to filter by
 * @returns Promise with array of filtered movies
 */
export const getWatchlistByMood = async (mood: string): Promise<Movie[]> => {
  // Check if Firebase is properly initialized
  if (!auth || !db) {
    console.warn("Firebase not initialized, cannot get watchlist by mood");
    return [];
  }

  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user found");
    return [];
  }

  try {
    const watchlistRef = collection(db, "users", user.uid, "watchlist");
    const watchlistQuery = query(watchlistRef, where("mood", "==", mood));
    
    const snapshot = await getDocs(watchlistQuery);
    
    const movies: Movie[] = [];
    snapshot.forEach(doc => {
      movies.push(doc.data() as Movie);
    });
    
    return movies;
  } catch (error) {
    console.error("Error fetching watchlist by mood:", error);
    return [];
  }
}; 