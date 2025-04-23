import { useState, useEffect, useRef } from 'react';
import { Heart, Film, Trash2, X, Clock, Share2, Bookmark, Info, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  mood_match?: number;
  mood?: string; // For mood filtering
}

interface WatchlistProps {
  onClose: () => void;
  // Allow passing in movies directly (for backward compatibility)
  initialMovies?: Movie[];
}

const Watchlist: React.FC<WatchlistProps> = ({ onClose, initialMovies = [] }) => {
  const [watchlist, setWatchlist] = useState<Movie[]>(initialMovies);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  
  // Load watchlist from localStorage ONLY on initial mount
  useEffect(() => {
    if (initialMovies.length === 0) {
      const savedWatchlist = localStorage.getItem('watchlist');
      if (savedWatchlist) {
        try {
          setWatchlist(JSON.parse(savedWatchlist));
        } catch (e) {
          console.error('Error parsing watchlist:', e);
        }
      }
    }
  }, []); // Empty dependency array = only run once on mount

  // Save watchlist changes to localStorage
  useEffect(() => {
    // Skip the initial render to avoid the circular update
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);
  
  // Remove a movie from watchlist
  const handleRemoveMovie = (id: number) => {
    setWatchlist(watchlist.filter(movie => movie.id !== id));
    if (selectedMovie?.id === id) {
      setSelectedMovie(null);
    }
  };
  
  // Handle sharing a movie
  const handleShareMovie = (movie: Movie) => {
    const shareText = `Check out ${movie.title}! ${movie.overview.substring(0, 100)}...`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        setCopiedId(movie.id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Format release date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Release date unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get unique moods from watchlist
  const uniqueMoods = Array.from(new Set(watchlist.map(movie => movie.mood).filter(Boolean)));
  
  // Filter movies by selected mood
  const filteredMovies = selectedMoodFilter
    ? watchlist.filter(movie => movie.mood === selectedMoodFilter)
    : watchlist;
  
  return (
    <div className="fixed inset-0 bg-gray-900/95 z-50 overflow-y-auto font-britti-sans">
      <div className="max-w-4xl mx-auto p-4 pt-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Bookmark className="mr-2 text-primary" size={28} />
            Your Watchlist
          </h1>
          <div className="flex items-center gap-3">
            <button
              className={`p-2 rounded-full ${filterMenuOpen ? 'bg-primary' : 'bg-gray-800/80'} text-white transition-colors`}
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              title="Filter movies"
            >
              <Filter size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Filter bar */}
        {filterMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg">
              <h3 className="text-lg font-medium mb-3 text-white">Filter by mood</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedMoodFilter === null
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                  onClick={() => setSelectedMoodFilter(null)}
                >
                  All Moods
                </button>
                
                {uniqueMoods.map(mood => (
                  <button
                    key={mood}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedMoodFilter === mood
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                    onClick={() => mood && setSelectedMoodFilter(mood)}
                  >
                    {mood && mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Empty state */}
        {filteredMovies.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Film size={64} className="mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-medium mb-2">
              {watchlist.length === 0 
                ? "Your watchlist is empty" 
                : "No movies match your filter"
              }
            </h2>
            <p className="max-w-md mx-auto">
              {watchlist.length === 0 
                ? "Save movies you want to watch later by clicking the bookmark icon on any movie card" 
                : "Try selecting a different mood filter"
              }
            </p>
          </div>
        )}
        
        {/* Movie grid and details layout */}
        {filteredMovies.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Movies grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${selectedMovie ? 'lg:w-1/2' : 'w-full'}`}>
              {filteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className={`relative rounded-lg overflow-hidden bg-gray-800 hover:ring-2 transition-all cursor-pointer ${
                    selectedMovie?.id === movie.id ? 'ring-2 ring-primary' : 'hover:ring-gray-600'
                  }`}
                  onClick={() => setSelectedMovie(movie)}
                >
                  {/* Poster */}
                  <div className="aspect-[2/3] bg-gray-900">
                    {movie.poster_path ? (
                      <img 
                        src={movie.poster_path} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Film size={40} />
                      </div>
                    )}
                  </div>
                  
                  {/* Title */}
                  <div className="p-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-white text-sm font-medium line-clamp-1">{movie.title}</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMovie(movie.id);
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors ml-1 -mt-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {/* Year and Mood */}
                    <div className="flex items-center justify-between text-gray-400 text-xs mt-1">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown'}
                      </div>
                      
                      {movie.mood && (
                        <div className="px-1.5 py-0.5 rounded bg-gray-700/50 capitalize">
                          {movie.mood}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Selected movie details */}
            {selectedMovie && (
              <div className="lg:w-1/2 bg-gray-800/50 rounded-xl overflow-hidden">
                {/* Cover image/backdrop */}
                <div className="relative h-48 bg-gray-900 overflow-hidden">
                  {selectedMovie.poster_path && (
                    <img 
                      src={selectedMovie.poster_path}
                      alt={selectedMovie.title}
                      className="w-full h-full object-cover object-top opacity-30"
                    />
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent flex flex-col justify-end p-4">
                    <h2 className="text-2xl font-bold text-white">{selectedMovie.title}</h2>
                    <div className="flex items-center mt-2">
                      {/* Release date */}
                      <div className="flex items-center mr-4 text-gray-300 text-sm">
                        <Clock size={14} className="mr-1" />
                        {formatDate(selectedMovie.release_date)}
                      </div>
                      
                      {/* Rating */}
                      {selectedMovie.vote_average && (
                        <div className="flex items-center text-gray-300 text-sm">
                          <Heart size={14} className="mr-1 text-red-500" />
                          {(selectedMovie.vote_average * 10).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  {/* Overview */}
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {selectedMovie.overview || 'No description available.'}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleRemoveMovie(selectedMovie.id)}
                      className="flex items-center px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remove
                    </button>
                    
                    <button 
                      onClick={() => handleShareMovie(selectedMovie)}
                      className="flex items-center px-4 py-2 bg-primary/20 text-primary-light rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      {copiedId === selectedMovie.id ? (
                        <>
                          <Info size={16} className="mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={16} className="mr-2" />
                          Share
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist; 