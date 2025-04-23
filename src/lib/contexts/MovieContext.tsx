import React, { createContext, useContext, useEffect, useState } from 'react';
import { Movie, MovieFilters, WatchlistMovie } from '@/types/movie';

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

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<MovieFilters | null>(null);

  // Load watchlist from localStorage on initial render
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('feelingFlicksWatchlist');
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error('Error loading watchlist from localStorage:', error);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('feelingFlicksWatchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving watchlist to localStorage:', error);
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
      return [...prev, watchlistMovie];
    });
  };

  const removeFromWatchlist = (movieId: number) => {
    setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
  };

  const clearMovies = () => {
    setMovies([]);
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