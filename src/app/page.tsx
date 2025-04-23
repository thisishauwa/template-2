'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MovieProvider, useMovies } from '@/lib/contexts/MovieContext';
import Onboarding from '@/components/Onboarding';
import MovieCardStack from '@/components/MovieCardStack';
import MovieDetailModal from '@/components/MovieDetailModal';
import Watchlist from '@/components/Watchlist';
import HomeScreen from '@/components/HomeScreen';
import { Movie, MovieFilters, WatchlistMovie } from '@/types/movie';
import { Film, BookmarkIcon, Home as HomeIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HomeSection from '@/components/HomeSection';
import { useRouter } from 'next/navigation';

// Main app component
const FeelingFlicksApp: React.FC = () => {
  const { 
    movies,
    loading,
    error,
    watchlist,
    currentFilters,
    fetchMovies,
    addToWatchlist,
    removeFromWatchlist,
    clearMovies 
  } = useMovies();
  
  // View states
  const [showHome, setShowHome] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showWatchlist, setShowWatchlist] = useState<boolean>(false);
  
  // Handle starting the mood selection flow
  const handleStartMoodSelection = () => {
    setShowHome(false);
    setShowOnboarding(true);
  };
  
  // Handle returning to home screen
  const handleReturnToHome = () => {
    setShowOnboarding(false);
    setShowWatchlist(false);
    setShowHome(true);
  };
  
  // Handle onboarding completion
  const handleOnboardingComplete = (filters: MovieFilters) => {
    fetchMovies(filters);
    setShowOnboarding(false);
  };
  
  // Check if a movie is in the watchlist
  const isInWatchlist = (movieId: number) => {
    return watchlist.some(movie => movie.id === movieId);
  };
  
  // Handle left swipe
  const handleSwipeLeft = (movie: Movie) => {
    // Just skip the movie
  };
  
  // Handle right swipe
  const handleSwipeRight = (movie: Movie) => {
    // Add to watchlist with current mood
    if (!isInWatchlist(movie.id) && currentFilters) {
      addToWatchlist(movie, currentFilters.mood);
    }
  };
  
  // Handle stack empty
  const handleStackEmpty = () => {
    // This could show a message or automatically fetch more movies
  };
  
  // Handle refresh - fetch more movies with the same filters
  const handleRefresh = () => {
    if (currentFilters) {
      fetchMovies(currentFilters);
    } else {
      setShowOnboarding(true);
    }
  };
  
  // Reset the app to start over
  const handleReset = () => {
    clearMovies();
    handleReturnToHome();
    setSelectedMovie(null);
  };
  
  // Toggle watchlist visibility
  const toggleWatchlist = () => {
    setShowWatchlist(!showWatchlist);
  };
  
  // Show error if fetching movies fails
  if (error && !showOnboarding && !showHome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-md p-6 bg-gray-800/80 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl font-medium"
            onClick={handleReset}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar onWatchlistOpen={toggleWatchlist} />
      
      {/* Home Screen */}
      {showHome && (
        <HomeScreen 
          onStartSwipe={handleStartMoodSelection}
          watchlist={watchlist as WatchlistMovie[]} 
          onMovieSelect={setSelectedMovie}
        />
      )}
      
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            onCancel={handleReturnToHome}
          />
        )}
      </AnimatePresence>
      
      {/* Movie Discovery Screen */}
      {!showOnboarding && !showHome && !showWatchlist && (
        <>
          {/* Header */}
          <header className="p-4 flex items-center justify-between">
            <button
              className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700/70 transition-colors"
              onClick={handleReturnToHome}
            >
              <HomeIcon size={20} />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Feeling Flicks
            </h1>
            <button
              className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700/70 transition-colors relative"
              onClick={toggleWatchlist}
            >
              <BookmarkIcon size={20} />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-xs flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </button>
          </header>
          
          {/* Movie cards */}
          <main className="flex-1 relative flex flex-col items-center justify-center p-4">
            <MovieCardStack
              movies={movies}
              loading={loading}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onCardTap={setSelectedMovie}
              onStackEmpty={handleStackEmpty}
              onRefresh={handleRefresh}
            />
          </main>
        </>
      )}
      
      {/* Watchlist view */}
      {showWatchlist && (
        <Watchlist
          onClose={toggleWatchlist}
          initialMovies={watchlist as any[]}
        />
      )}
      
      {/* Movie detail modal */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onAddToWatchlist={(movie) => {
              if (currentFilters) {
                addToWatchlist(movie, currentFilters.mood);
              } else {
                // If adding from home screen, use a default mood
                addToWatchlist(movie, 'chill');
              }
            }}
            onRemoveFromWatchlist={removeFromWatchlist}
            isInWatchlist={isInWatchlist(selectedMovie.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Wrap the app with providers
export default function Home() {
  return (
    <MovieProvider>
      <FeelingFlicksApp />
    </MovieProvider>
  );
}
