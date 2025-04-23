import React, { useState } from 'react';
import Image from 'next/image';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Movie } from '@/types/movie';
import { GENRES } from '@/types/movie';
import { format } from 'date-fns';
import { Heart, Share2, Bookmark, BookmarkCheck, Info } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onSwipeLeft: (movie: Movie) => void;
  onSwipeRight: (movie: Movie) => void;
  onCardTap: (movie: Movie) => void;
  onSelect: (movie: Movie) => void;
  onAddToWatchlist: (movie: Movie) => void;
  isInWatchlist: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
  onSelect,
  onAddToWatchlist,
  isInWatchlist
}) => {
  const [exitX, setExitX] = useState<number>(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Transform values for the swipe indicators
  const leftOpacity = useTransform(x, [0, -50, -100], [0, 0.5, 1]);
  const rightOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  
  // Handle swipe
  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipeRight(movie);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipeLeft(movie);
    }
  };
  
  // Get release year from date
  const releaseYear = movie.release_date 
    ? format(new Date(movie.release_date), 'yyyy') 
    : 'N/A';
    
  // Map genre IDs to names
  const genreNames = movie.genre_ids
    .map(id => GENRES.find(genre => genre.id === id)?.name)
    .filter(Boolean);
    
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;
    
  // Format mood match score (from 1-10 instead of descriptive text)
  const moodMatchScore = Math.floor(Math.random() * 5) + 6; // Random score between 6-10
  
  const [copied, setCopied] = useState(false);
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    
    // Create share text with movie title and first part of overview
    const shareText = `Check out "${movie.title}"! ${movie.overview?.substring(0, 100)}${movie.overview?.length > 100 ? '...' : ''}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    onAddToWatchlist(movie);
  };
  
  // Calculate vibe match display - if not provided, use vote average
  const matchScore = movie.mood_match 
    ? movie.mood_match 
    : Math.round(movie.vote_average * 10) / 10;
  
  return (
    <motion.div
      className="absolute w-full max-w-sm mx-auto bg-black/80 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      exit={{ x: exitX }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onCardTap(movie)}
    >
      {/* Movie poster */}
      <div className="relative h-[500px] w-full">
        <Image 
          src={movie.poster_path || '/placeholder-poster.jpg'} 
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90" />
      </div>
      
      {/* Movie info */}
      <div className="p-6 relative z-10 -mt-24">
        <h2 className="text-2xl font-bold text-white mb-1">{movie.title}</h2>
        <p className="text-gray-300 text-sm mb-3">{releaseYear} • {genreNames.slice(0, 2).join(', ')}</p>
        
        {/* Mood match */}
        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg mb-4 border border-white/10 flex items-center justify-between">
          <p className="text-white/90">Mood Match</p>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-bold">{matchScore}</span>
            <span className="text-white/70">/10</span>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white">{movie.vote_average.toFixed(1)}</span>
          </div>
          <div className="flex gap-2">
            {movie.genre_ids.slice(0, 2).map(id => {
              const genre = GENRES.find(g => g.id === id);
              return genre ? (
                <span 
                  key={id} 
                  className="text-xs py-1 px-2 rounded-full bg-white/10 text-white"
                >
                  {genre.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>
      
      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-1/2 left-6 -translate-y-1/2 bg-red-500/80 rounded-full p-3 rotate-12 backdrop-blur-sm"
        style={{ opacity: leftOpacity }}
      >
        <span className="text-white font-bold">SKIP</span>
      </motion.div>
      <motion.div 
        className="absolute top-1/2 right-6 -translate-y-1/2 bg-green-500/80 rounded-full p-3 -rotate-12 backdrop-blur-sm"
        style={{ opacity: rightOpacity }}
      >
        <span className="text-white font-bold">SAVE</span>
      </motion.div>
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Share button */}
        <button
          className="p-2 bg-gray-900/80 backdrop-blur-sm rounded-full text-white hover:bg-primary/80 transition-colors"
          onClick={handleShare}
          aria-label="Share movie"
        >
          {copied ? <Info size={18} /> : <Share2 size={18} />}
        </button>
        
        {/* Watchlist button */}
        <button
          className={`p-2 backdrop-blur-sm rounded-full transition-colors ${
            isInWatchlist 
              ? 'bg-primary text-white' 
              : 'bg-gray-900/80 text-white hover:bg-gray-800'
          }`}
          onClick={handleWatchlistToggle}
          aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isInWatchlist ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
      
      {/* Vibe match indicator for mood-matched movies */}
      {movie.mood_match && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary/80 backdrop-blur-sm text-white text-xs font-medium rounded">
          {movie.mood_match}0% Match
        </div>
      )}
    </motion.div>
  );
};

export default MovieCard; 