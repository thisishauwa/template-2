import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Share2, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

// Define the Movie type for the component
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date?: string;
  vote_average: number;
  genre_ids: number[];
  mood?: string; // Added for filtering
}

interface WatchlistProps {
  onClose: () => void;
  initialMovies?: Movie[]; // For backward compatibility
}

const Watchlist: React.FC<WatchlistProps> = ({ 
  onClose,
  initialMovies = []
}) => {
  // State for the watchlist
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Load watchlist from localStorage on mount
  useEffect(() => {
    const loadWatchlist = () => {
      try {
        const savedWatchlist = localStorage.getItem('feelingFlicks_watchlist');
        if (savedWatchlist) {
          const parsedWatchlist = JSON.parse(savedWatchlist);
          setWatchlistMovies(parsedWatchlist);
        } else if (initialMovies.length > 0) {
          // Use initialMovies if no localStorage data
          setWatchlistMovies(initialMovies);
          // Save to localStorage for future use
          localStorage.setItem('feelingFlicks_watchlist', JSON.stringify(initialMovies));
        }
      } catch (error) {
        console.error('Error loading watchlist:', error);
      }
    };
    
    loadWatchlist();
  }, [initialMovies]);
  
  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (watchlistMovies.length > 0) {
      localStorage.setItem('feelingFlicks_watchlist', JSON.stringify(watchlistMovies));
    }
  }, [watchlistMovies]);
  
  // Remove a movie from the watchlist
  const removeFromWatchlist = (movieId: number) => {
    setWatchlistMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId));
    if (selectedMovie?.id === movieId) {
      setSelectedMovie(null);
    }
    
    // Also update localStorage
    try {
      const savedWatchlist = localStorage.getItem('feelingFlicks_watchlist');
      if (savedWatchlist) {
        const parsedWatchlist = JSON.parse(savedWatchlist);
        const updatedWatchlist = parsedWatchlist.filter((movie: Movie) => movie.id !== movieId);
        localStorage.setItem('feelingFlicks_watchlist', JSON.stringify(updatedWatchlist));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };
  
  // Share a movie
  const shareMovie = (movie: Movie) => {
    const shareText = `Check out "${movie.title}"! ${movie.overview.substring(0, 100)}${movie.overview.length > 100 ? '...' : ''}`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setCopiedId(movie.id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };
  
  // Format release date
  const formatReleaseDate = (releaseDate?: string) => {
    if (!releaseDate) return 'Release date unknown';
    try {
      return format(new Date(releaseDate), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get unique moods for filtering
  const uniqueMoods = Array.from(new Set(watchlistMovies.map(movie => movie.mood).filter(Boolean)));
  
  // Toggle filter menu
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };
  
  // Apply filter
  const applyFilter = (mood: string | null) => {
    setSelectedFilter(mood);
    setShowFilterMenu(false);
  };
  
  // Filter movies based on selected mood
  const filteredMovies = selectedFilter 
    ? watchlistMovies.filter(movie => movie.mood === selectedFilter)
    : watchlistMovies;
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900/80 backdrop-blur-md z-10">
        <h2 className="text-xl font-bold text-white">My Watchlist</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
          aria-label="Close watchlist"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Filter bar */}
      {uniqueMoods.length > 0 && (
        <div className="p-4 border-b border-white/10 bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={toggleFilterMenu}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white"
              >
                <Filter size={16} />
                <span>{selectedFilter || 'Filter by mood'}</span>
                <ChevronDown size={16} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-lg bg-gray-800 shadow-lg z-20 py-1">
                  <button 
                    className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${!selectedFilter ? 'text-purple-400' : 'text-white'}`}
                    onClick={() => applyFilter(null)}
                  >
                    All moods
                  </button>
                  {uniqueMoods.map(mood => (
                    <button 
                      key={mood}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${selectedFilter === mood ? 'text-purple-400' : 'text-white'}`}
                      onClick={() => applyFilter(mood as string)}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedFilter && (
              <button 
                onClick={() => applyFilter(null)}
                className="px-3 py-1 text-sm rounded-full bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {(watchlistMovies.length === 0 || (selectedFilter && filteredMovies.length === 0)) && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-2xl">🍿</span>
          </div>
          {watchlistMovies.length === 0 ? (
            <>
              <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
              <p className="text-gray-400 mb-6">Save movies while browsing to add them here</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-2">No movies with this mood</h3>
              <p className="text-gray-400 mb-6">Try selecting a different mood filter</p>
            </>
          )}
        </div>
      )}
      
      {/* Two-column layout */}
      {filteredMovies.length > 0 && (
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Movie grid */}
          <div className={`flex-1 overflow-y-auto p-4 ${selectedMovie ? 'hidden md:block' : ''}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMovies.map(movie => (
                <div 
                  key={movie.id}
                  className={`relative rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${selectedMovie?.id === movie.id ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedMovie(movie)}
                >
                  <div className="aspect-[2/3] relative">
                    <Image 
                      src={movie.poster_path || '/placeholder-poster.jpg'} 
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 150px, 200px"
                      className="object-cover"
                    />
                    {movie.mood && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500/80 text-white text-xs rounded">
                        {movie.mood}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                    <h3 className="text-white text-sm font-semibold line-clamp-1">{movie.title}</h3>
                    <p className="text-gray-300 text-xs">
                      {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'} • ⭐ {movie.vote_average.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Selected movie details */}
          {selectedMovie && (
            <div className={`md:w-96 bg-gray-900 p-0 flex flex-col overflow-y-auto ${selectedMovie ? 'flex' : 'hidden md:flex'}`}>
              <div className="relative aspect-video w-full">
                <Image 
                  src={selectedMovie.backdrop_path ? `https://image.tmdb.org/t/p/w780${selectedMovie.backdrop_path}` : selectedMovie.poster_path} 
                  alt={selectedMovie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
                
                {/* Back button on mobile */}
                <button 
                  className="absolute top-4 left-4 md:hidden p-2 rounded-full bg-black/50 text-white"
                  onClick={() => setSelectedMovie(null)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                <p className="text-gray-400 text-sm mb-4">{formatReleaseDate(selectedMovie.release_date)}</p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">Overview</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedMovie.overview}</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full py-3 px-4 bg-red-600/20 text-red-300 rounded-lg font-medium border border-red-600/30 hover:bg-red-600/30 transition-colors"
                    onClick={() => removeFromWatchlist(selectedMovie.id)}
                  >
                    Remove from Watchlist
                  </button>
                  
                  <button
                    className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => shareMovie(selectedMovie)}
                  >
                    <Share2 size={16} />
                    {copiedId === selectedMovie.id ? 'Copied!' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Watchlist; 