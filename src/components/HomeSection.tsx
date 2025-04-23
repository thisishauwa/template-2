import React from 'react';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date?: string;
  genre_ids: number[];
  vote_average: number;
  overview: string;
  mood_match?: number;
}

interface HomeSectionProps {
  title: string;
  movies: Movie[];
  seeAllAction?: () => void;
  onMovieSelect: (movie: Movie) => void;
  onAddToWatchlist: (movie: Movie) => void;
  watchlist: Movie[];
}

const HomeSection: React.FC<HomeSectionProps> = ({
  title,
  movies,
  seeAllAction,
  onMovieSelect,
  onAddToWatchlist,
  watchlist,
}) => {
  // Check if a movie is in watchlist
  const isInWatchlist = (movieId: number) => {
    return watchlist.some(movie => movie.id === movieId);
  };
  
  return (
    <section className="mb-10 font-britti-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        
        {seeAllAction && (
          <button 
            onClick={seeAllAction}
            className="flex items-center text-primary-light hover:text-primary transition-colors"
          >
            <span className="mr-1">See All</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.slice(0, 10).map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={onMovieSelect}
            onAddToWatchlist={onAddToWatchlist}
            isInWatchlist={isInWatchlist(movie.id)}
          />
        ))}
      </div>
      
      {movies.length === 0 && (
        <div className="h-64 rounded-xl bg-gray-800/30 flex items-center justify-center text-gray-500">
          <p>No movies available</p>
        </div>
      )}
    </section>
  );
};

export default HomeSection; 