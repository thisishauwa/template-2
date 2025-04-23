import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import { GENRES } from '@/types/movie';
import { format } from 'date-fns';
import { X, Share2 } from 'lucide-react';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist: (movieId: number) => void;
  isInWatchlist: boolean;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
}) => {
  if (!movie) return null;
  
  // Map genre IDs to names
  const genreNames = movie.genre_ids
    .map(id => GENRES.find(genre => genre.id === id)?.name)
    .filter(Boolean);
    
  // Format release date
  const releaseDate = movie.release_date 
    ? format(new Date(movie.release_date), 'MMMM d, yyyy') 
    : 'N/A';
    
  // Get backdrop URL
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;
    
  // Use the movie's mood_match if available, otherwise calculate a credible match
  // This will be used only when the movie comes from outside the discovery flow
  const calculateMoodMatch = () => {
    if (movie.mood_match) return movie.mood_match;
    
    // Use deterministic factors for a more credible score when no mood_match exists
    const voteContribution = Math.min(3, (movie.vote_average - 5) / 2); // Up to 3 points for rating
    
    // Use vote_count as a proxy for popularity if popularity is not available
    const popularity = (movie as any).popularity || Math.min(movie.vote_count, 1000);
    const popularityNormalized = Math.min(1, popularity / 400); // Normalize popularity
    const popularityContribution = popularityNormalized * 2; // Up to 2 points
    
    // Give more contemporary movies a slight edge for most viewers
    let recencyBonus = 0;
    if (movie.release_date) {
      const year = parseInt(movie.release_date.substring(0, 4));
      const currentYear = new Date().getFullYear();
      recencyBonus = Math.max(0, 1 - (currentYear - year) / 50); // Gradual falloff
    }
    
    // Base score is 6, add contributions up to a max of 10
    const calculatedScore = Math.min(10, Math.max(6, 
      6 + voteContribution + popularityContribution + recencyBonus
    ));
    
    return Math.round(calculatedScore);
  };
  
  const moodMatchScore = calculateMoodMatch();
    
  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out this movie: ${movie.title}`,
          url: `https://www.themoviedb.org/movie/${movie.id}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Fallback for browsers that don't support navigator.share
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      copyToClipboard();
    }
  };
  
  // Fallback copy to clipboard function
  const copyToClipboard = () => {
    const shareText = `Check out this movie: ${movie.title}\nhttps://www.themoviedb.org/movie/${movie.id}`;
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-3xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        
        {/* Backdrop image */}
        {backdropUrl && (
          <div className="relative h-72 w-full">
            <Image 
              src={backdropUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover rounded-t-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
          </div>
        )}
        
        {/* Poster and details */}
        <div className="relative px-6 pt-6 pb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="relative w-32 h-48 md:w-40 md:h-60 flex-shrink-0 -mt-20 mx-auto md:mx-0 z-10">
              <Image 
                src={movie.poster_path || '/placeholder-poster.jpg'}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover rounded-lg shadow-xl"
              />
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {genreNames.map((genre, index) => (
                  <span 
                    key={index} 
                    className="text-xs py-1 px-3 rounded-full bg-purple-900/50 text-purple-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300 mb-4">
                <div>
                  <span className="text-gray-400">Release Date:</span> {releaseDate}
                </div>
                <div>
                  <span className="text-gray-400">Rating:</span> {movie.vote_average.toFixed(1)}/10
                </div>
              </div>
              
              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
              
              {/* Mood match - Only show if the movie has a mood_match property */}
              {movie.mood_match && (
                <div className="p-3 mb-6 bg-purple-900/20 rounded-lg border-l-2 border-purple-500 flex justify-between items-center">
                  <p className="text-purple-200">
                    <span className="font-medium">Mood Match</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 font-bold">{moodMatchScore}</span>
                    <span className="text-purple-200">/10</span>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isInWatchlist
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  onClick={() => isInWatchlist 
                    ? onRemoveFromWatchlist(movie.id) 
                    : onAddToWatchlist(movie)
                  }
                >
                  {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                
                {/* Share button */}
                <button
                  className="py-3 px-4 rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MovieDetailModal; 