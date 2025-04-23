import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Movie } from '@/types/movie';
import MovieCard from './MovieCard';
import { Loader2, RefreshCw } from 'lucide-react';

interface MovieCardStackProps {
  movies: Movie[];
  loading: boolean;
  onSwipeLeft: (movie: Movie) => void;
  onSwipeRight: (movie: Movie) => void;
  onCardTap: (movie: Movie) => void;
  onStackEmpty: () => void;
  onRefresh: () => void;
}

const MovieCardStack: React.FC<MovieCardStackProps> = ({
  movies,
  loading,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
  onStackEmpty,
  onRefresh,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Handle left swipe (skip)
  const handleSwipeLeft = (movie: Movie) => {
    onSwipeLeft(movie);
    moveToNextCard();
  };
  
  // Handle right swipe (add to watchlist)
  const handleSwipeRight = (movie: Movie) => {
    onSwipeRight(movie);
    moveToNextCard();
  };
  
  // Move to the next card in the stack
  const moveToNextCard = () => {
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      // If we've reached the end of the stack, call onStackEmpty
      if (nextIndex >= movies.length) {
        onStackEmpty();
      }
      return nextIndex;
    });
  };
  
  // Check if there are still cards in the stack
  const hasCardsLeft = currentIndex < movies.length;
  
  // Get the current movie
  const currentMovie = hasCardsLeft ? movies[currentIndex] : null;
  
  return (
    <div className="relative flex-1 w-full flex items-center justify-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          <p className="text-white opacity-80">Finding the perfect movies for your mood...</p>
        </div>
      ) : !hasCardsLeft ? (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-purple-800/30">
            <RefreshCw className="text-purple-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No more movies to show</h3>
          <p className="text-gray-400 mb-6 max-w-xs">We've run out of recommendations. Try adjusting your preferences or refreshing.</p>
          <button
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl font-medium text-white"
            onClick={onRefresh}
          >
            Load More Movies
          </button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm h-[600px] mx-auto">
          <AnimatePresence>
            {/* Display top 3 cards from the stack */}
            {movies
              .slice(currentIndex, currentIndex + 3)
              .map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onCardTap={onCardTap}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MovieCardStack; 