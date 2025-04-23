"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Movie, MovieFilters, WatchlistMovie } from '@/types/movie';
import { useAuth } from '@/lib/hooks/useAuth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface MovieContextType {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  watchlist: WatchlistMovie[];
  currentFilters: MovieFilters | null;
  fetchMovies: (filters: MovieFilters) => Promise<void>;
  addToWatchlist: (movie: Movie, mood: string) => void;
  removeFromWatchlist: (movieId: number) => void;
  clearMovies: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

// Use a consistent key for localStorage
const WATCHLIST_STORAGE_KEY = 'feelingFlicks_watchlist';

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<MovieFilters | null>(null);
  const { user, isAnonymous } = useAuth();

  // Load watchlist from Firestore (if logged in) or localStorage on initial render
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading watchlist timed out, using fallback data');
        setLoading(false);
        
        // Try to load from localStorage as fallback
        try {
          const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
          if (savedWatchlist) {
            setWatchlist(JSON.parse(savedWatchlist));
          }
        } catch (error) {
          console.error('Failed to load fallback watchlist data:', error);
        }
      }
    }, 5000); // 5 second timeout
    
    const loadWatchlist = async () => {
      try {
        // Force simplification for development - always use localStorage for now
        // This helps prevent the infinite loading issue
        console.log('Using localStorage for watchlist in development');
        const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        }
        
        /* Temporarily disabled Firestore loading while debugging
        if (user && !isAnonymous) {
          // User is authenticated, set up real-time listener for Firestore
          console.log('Setting up Firestore listener for watchlist');
          
          const userWatchlistRef = doc(db, 'watchlists', user.uid);
          unsubscribeFirestore = onSnapshot(userWatchlistRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              console.log(`Loaded ${data.movies?.length || 0} movies from Firestore`);
              if (data.movies && Array.isArray(data.movies)) {
                setWatchlist(data.movies);
                // Also update localStorage as a backup
                localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(data.movies));
              }
            } else {
              // New user, check if we have local watchlist to migrate
              const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
              if (savedWatchlist) {
                const parsedWatchlist = JSON.parse(savedWatchlist);
                console.log(`Migrating ${parsedWatchlist.length} movies from localStorage to Firestore`);
                setWatchlist(parsedWatchlist);
                
                // Save to Firestore
                setDoc(userWatchlistRef, { movies: parsedWatchlist }).catch(err => {
                  console.error('Error migrating watchlist to Firestore:', err);
                });
              }
            }
          });
        } else {
          // Not authenticated or anonymous user, use localStorage
          console.log('Loading watchlist from localStorage');
          const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
          if (savedWatchlist) {
            setWatchlist(JSON.parse(savedWatchlist));
          }
        }
        */
      } catch (error) {
        console.error('Error loading watchlist:', error);
        // Fallback to localStorage if Firebase fails
        const savedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        }
      }
    };
    
    // Load the watchlist when the component mounts or auth state changes
    loadWatchlist();
    
    // Clean up subscriptions when unmounting or auth state changes
    return () => {
      clearTimeout(loadingTimeout);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user, isAnonymous]);

  // Save watchlist to localStorage whenever it changes (as a backup)
  useEffect(() => {
    // Skip if watchlist is empty to avoid clearing localStorage during initialization
    if (watchlist.length > 0) {
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
        console.log(`Saved ${watchlist.length} movies to localStorage`);
      } catch (error) {
        console.error('Error saving watchlist to localStorage:', error);
      }
    }
  }, [watchlist]);

  const fetchMovies = async (filters: MovieFilters) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    
    try {
      const response = await fetch('/api/tmdb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch movies');
      }
      
      setMovies(data.movies);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = (movie: Movie, mood: string) => {
    const watchlistMovie: WatchlistMovie = {
      ...movie,
      addedAt: new Date().toISOString(),
      mood,
    };
    
    setWatchlist(prev => {
      // Don't add if already in watchlist
      if (prev.some(m => m.id === movie.id)) {
        return prev;
      }
      
      // Add new movie to watchlist
      const newWatchlist = [...prev, watchlistMovie];
      
      // Save to Firestore if user is authenticated (temporarily disabled)
      /*
      if (user && !isAnonymous) {
        const userWatchlistRef = doc(db, 'watchlists', user.uid);
        setDoc(userWatchlistRef, { movies: newWatchlist }).catch(err => {
          console.error('Error saving watchlist to Firestore:', err);
        });
      }
      */
      
      // Save directly to localStorage for now
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlist));
      } catch (error) {
        console.error('Error directly saving to localStorage:', error);
      }
      
      return newWatchlist;
    });
  };

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist(prev => {
      const newWatchlist = prev.filter(movie => movie.id !== movieId);
      
      // Save to Firestore if user is authenticated (temporarily disabled)
      /*
      if (user && !isAnonymous) {
        const userWatchlistRef = doc(db, 'watchlists', user.uid);
        setDoc(userWatchlistRef, { movies: newWatchlist }).catch(err => {
          console.error('Error saving watchlist to Firestore:', err);
        });
      }
      */
      
      // Save directly to localStorage for now
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(newWatchlist));
      } catch (error) {
        console.error('Error directly saving to localStorage:', error);
      }
      
      return newWatchlist;
    });
  };

  const clearMovies = () => {
    setMovies([]);
    setCurrentFilters(null);
    setError(null);
    console.log('MovieContext: Cleared movies and filters');
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        watchlist,
        currentFilters,
        fetchMovies,
        addToWatchlist,
        removeFromWatchlist,
        clearMovies,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
}; 