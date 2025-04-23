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
import { Film } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
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
  const [hasNewItems, setHasNewItems] = useState<boolean>(false);
  const [lastWatchlistCount, setLastWatchlistCount] = useState<number>(0);
  
  // Determine active screen for bottom nav
  const getActiveScreen = () => {
    if (showWatchlist) return 'watchlist';
    if (showHome) return 'home';
    return 'discovery';
  };
  
  // Load recommended movies based on watchlist
  useEffect(() => {
    if (watchlist.length > 0 && showHome) {
      // Extract genres and decades from watchlist movies
      const genres = watchlist.flatMap(movie => movie.genre_ids || []);
      const uniqueGenres = Array.from(new Set(genres)).slice(0, 3); // Use top 3 genres max
      
      // Extract years from release dates
      const years = watchlist
        .map(movie => movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : null)
        .filter(Boolean) as number[];
      
      // Convert years to decades
      const decades = years.map(year => {
        const decade = Math.floor(year / 10) * 10;
        return `${decade}s`;
      });
      const uniqueDecades = Array.from(new Set(decades));
      
      // Fetch recommendations based on watchlist - using AND logic for filters
      if (uniqueGenres.length > 0 || uniqueDecades.length > 0) {
        if (typeof fetchMovies === 'function') {
          fetchMovies({
            mood: 'any', // Default mood
            genres: uniqueGenres,
            decades: uniqueDecades,
            useAndLogic: true // Important: Use AND logic for filtering
          });
        }
      }
    }
  }, [watchlist.length, showHome, fetchMovies]);
  
  // Monitor watchlist for changes
  useEffect(() => {
    // If watchlist count has increased since last check, set notification flag
    if (watchlist.length > lastWatchlistCount) {
      setHasNewItems(true);
    }
    
    // Update the last known count
    setLastWatchlistCount(watchlist.length);
  }, [watchlist.length, lastWatchlistCount]);
  
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
    
    // Clear new items notification when opening the watchlist
    if (!showWatchlist) {
      setHasNewItems(false);
    }
    
    // Don't reset other states when toggling watchlist
    // This ensures we preserve location in the swipe stack
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
      {/* Only show Navbar on home and watchlist screens, not on discovery screen */}
      {(showHome || showWatchlist) && (
        <Navbar 
          onWatchlistOpen={toggleWatchlist}
          onHomeClick={handleReturnToHome}
          hasNewItems={hasNewItems}
        />
      )}
      
      {/* Content container with padding for fixed navbar and bottom nav on mobile */}
      <div className={`${(showHome || showWatchlist) ? 'pt-16' : 'pt-4'} pb-16 md:pb-0 flex-1 flex flex-col`}>
        {/* Home Screen */}
        {showHome && (
          <HomeScreen 
            onStartSwipe={handleStartMoodSelection}
            watchlist={watchlist as WatchlistMovie[]} 
            onMovieSelect={setSelectedMovie}
          />
        )}
        
        {/* Movie Discovery Screen */}
        {!showOnboarding && !showHome && !showWatchlist && (
          <main className="flex-1 relative flex flex-col items-center justify-center p-4">
            {/* Discovery Screen Controls */}
            <div className="absolute top-4 right-4 z-10 flex space-x-3">
              <button
                onClick={handleReturnToHome}
                className="p-3 rounded-full bg-gray-800/70 hover:bg-gray-700 transition-colors"
                aria-label="Return to home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </button>
              <button
                onClick={toggleWatchlist}
                className="p-3 rounded-full bg-gray-800/70 hover:bg-gray-700 transition-colors relative"
                aria-label="View watchlist"
              >
                {hasNewItems && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
                <Film size={20} />
              </button>
              <button
                onClick={handleStartMoodSelection}
                className="p-3 rounded-full bg-gray-800/70 hover:bg-gray-700 transition-colors"
                aria-label="Reset preferences"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>
            </div>
            
            <MovieCardStack
              movies={movies}
              loading={loading}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onCardTap={setSelectedMovie}
              onStackEmpty={handleStackEmpty}
              onRefresh={handleRefresh}
              noDecadeResults={error === null && movies.length === 0 && currentFilters?.decades && currentFilters.decades.length > 0}
            />
          </main>
        )}
      </div>
      
      {/* Onboarding - rendered on top with fixed positioning */}
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onCancel={handleReturnToHome}
        />
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
      
      {/* Bottom Navigation - only visible on mobile, home and watchlist screens (not during discovery or onboarding) */}
      {!showOnboarding && (showHome || showWatchlist) && (
        <BottomNav
          onHomeClick={handleReturnToHome}
          onWatchlistClick={toggleWatchlist}
          hasNewItems={hasNewItems}
          activeScreen={getActiveScreen()}
        />
      )}
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
