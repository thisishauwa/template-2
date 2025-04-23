'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MovieProvider, useMovies } from '@/lib/contexts/MovieContext';
import Onboarding from '@/components/Onboarding';
import MovieCardStack from '@/components/MovieCardStack';
import MovieDetailModal from '@/components/MovieDetailModal';
import Watchlist from '@/components/Watchlist';
import MoodJournal from '@/components/MoodJournal';
import HomeScreen from '@/components/HomeScreen';
import { Movie, MovieFilters, WatchlistMovie } from '@/types/movie';
import { Film, ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/lib/contexts/AuthContext';

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
  const [showMoodJournal, setShowMoodJournal] = useState<boolean>(false);
  const [hasNewItems, setHasNewItems] = useState<boolean>(false);
  const [lastWatchlistCount, setLastWatchlistCount] = useState<number>(0);
  const [fromMoodJournal, setFromMoodJournal] = useState<boolean>(false);
  const [watchlistFromDiscovery, setWatchlistFromDiscovery] = useState<boolean>(false);
  
  // Determine active screen for bottom nav
  const getActiveScreen = () => {
    if (showWatchlist) return 'watchlist';
    if (showMoodJournal) return 'journal';
    if (showHome) return 'home';
    return 'discovery';
  };
  
  // Load recommended movies based on watchlist
  useEffect(() => {
    // Only run this effect when we have a watchlist and are on the home screen
    if (watchlist.length === 0 || !showHome) {
      return;
    }
    
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
    
    // Only fetch recommendations if we have genres or decades to filter by
    if (uniqueGenres.length > 0 || uniqueDecades.length > 0) {
      console.log('Fetching watchlist-based recommendations');
      fetchMovies({
        mood: 'any', // Default mood
        genres: uniqueGenres,
        decades: uniqueDecades,
        useAndLogic: true // Important: Use AND logic for filtering
      });
    }
  // Remove fetchMovies from the dependency array to avoid repeated calls
  }, [watchlist, showHome]);
  
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
    // Clear any previous movies and filters first
    clearMovies();
    
    // Reset navigation state
    setFromMoodJournal(false);
    
    // Show onboarding and hide home screen
    setShowHome(false);
    setShowOnboarding(true);
    
    console.log('Starting mood selection: Previous filters cleared');
  };
  
  // Handle returning to home screen
  const handleReturnToHome = () => {
    // Clear filters and movie data to prevent stale API requests
    clearMovies();
    
    // Reset all view states
    setShowOnboarding(false);
    setShowWatchlist(false);
    setWatchlistFromDiscovery(false);
    setShowMoodJournal(false);
    setShowHome(true);
    
    // Reset navigation state
    setFromMoodJournal(false);
    
    // Clear any selected movie
    setSelectedMovie(null);
    
    console.log('Home navigation: All states reset, filters cleared');
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
    // If we're already on the watchlist, do nothing
    if (showWatchlist && !watchlistFromDiscovery) {
      return;
    }
    
    // If we're in discovery mode, track that to show the close button
    setWatchlistFromDiscovery(!showHome && !showMoodJournal);
    
    setShowWatchlist(!showWatchlist);
    if (showWatchlist) return; // If we're closing it, just return
    
    // If we're opening it, close other views
    setShowHome(false);
    setShowMoodJournal(false);
    
    // Clear new items notification when opening the watchlist
    if (!showWatchlist) {
      setHasNewItems(false);
    }
  };
  
  // Handle closing watchlist from discovery
  const handleCloseWatchlist = () => {
    if (watchlistFromDiscovery) {
      setShowWatchlist(false);
      setWatchlistFromDiscovery(false);
    } else {
      // If not from discovery, just toggle (this shouldn't happen with the UI changes)
      toggleWatchlist();
    }
  };
  
  // Toggle mood journal visibility
  const toggleMoodJournal = () => {
    setShowMoodJournal(!showMoodJournal);
    if (showMoodJournal) return; // If we're closing it, just return
    
    // If we're opening it, close other views
    setShowHome(false);
    setShowWatchlist(false);
  };
  
  // Handle mood recommendations from journal
  const handleMoodRecommendations = (mood: string) => {
    // Close mood journal and start discovery with the selected mood
    setShowMoodJournal(false);
    setFromMoodJournal(true); // Track that we came from the mood journal
    fetchMovies({
      mood,
      genres: [],
      decades: [],
    });
  };
  
  // Handle returning to mood journal from discovery
  const handleReturnToMoodJournal = () => {
    setFromMoodJournal(false);
    setShowMoodJournal(true);
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
      {/* Navbar - shown on all screens except discovery or when watchlist is shown as an overlay */}
      {(showHome || showWatchlist || showMoodJournal) && !watchlistFromDiscovery && (
        <Navbar 
          onWatchlistOpen={toggleWatchlist}
          onHomeClick={handleReturnToHome}
          onMoodJournalOpen={toggleMoodJournal}
          hasNewItems={hasNewItems}
          activeScreen={getActiveScreen()}
        />
      )}
      
      {/* Content container with padding for fixed navbar and bottom nav on mobile */}
      <div className={`${(showHome || showWatchlist || showMoodJournal) && !watchlistFromDiscovery ? 'pt-16' : 'pt-4'} pb-16 md:pb-0 flex-1 flex flex-col`}>
        {/* Home Screen */}
        {showHome && (
          <HomeScreen 
            onStartSwipe={handleStartMoodSelection}
            watchlist={watchlist as WatchlistMovie[]} 
            onMovieSelect={setSelectedMovie}
          />
        )}
        
        {/* Movie Discovery Screen */}
        {!showOnboarding && !showHome && !showWatchlist && !showMoodJournal && (
          <main className="flex-1 relative flex flex-col items-center justify-center p-4">
            {/* Discovery Screen Controls */}
            <div className="absolute top-4 right-4 z-10 flex space-x-3">
              {fromMoodJournal ? (
                <button
                  onClick={handleReturnToMoodJournal}
                  className="p-3 rounded-full bg-gray-800/70 hover:bg-gray-700 transition-colors"
                  aria-label="Return to mood journal"
                >
                  <ChevronLeft size={20} />
                  <span className="sr-only">Back to Journal</span>
                </button>
              ) : (
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
              )}
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
            
            {fromMoodJournal && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-gray-800/70">
                <span className="text-sm font-medium text-gray-300">Mood Journal Films</span>
              </div>
            )}
            
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
        
        {/* Mood Journal Screen */}
        {showMoodJournal && (
          <MoodJournal onViewMoodRecommendations={handleMoodRecommendations} />
        )}
        
        {/* Watchlist Screen (when accessed from nav) */}
        {showWatchlist && !watchlistFromDiscovery && (
          <div className="flex-1 overflow-auto">
            <Watchlist
              onClose={handleCloseWatchlist}
              initialMovies={watchlist as any[]}
              showHeader={false} // Don't show the header with close button when accessed from nav
            />
          </div>
        )}
      </div>
      
      {/* Onboarding - rendered on top with fixed positioning */}
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onCancel={handleReturnToHome}
        />
      )}
      
      {/* Watchlist overlay (only when accessed from discovery screen) */}
      {showWatchlist && watchlistFromDiscovery && (
        <Watchlist
          onClose={handleCloseWatchlist}
          initialMovies={watchlist as any[]}
          showHeader={true} // Show header with close button when accessed as overlay
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
      
      {/* Bottom Navigation - only visible on mobile */}
      {(showHome || showWatchlist || showMoodJournal) && (
        <BottomNav
          onHomeClick={handleReturnToHome}
          onWatchlistClick={toggleWatchlist}
          onMoodJournalClick={toggleMoodJournal}
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
      <AuthProvider>
        <FeelingFlicksApp />
      </AuthProvider>
    </MovieProvider>
  );
}
