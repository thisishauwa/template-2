import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Flame, TrendingUp, Star, ListFilter } from 'lucide-react';
import { Movie } from '@/types/movie';

interface HomeScreenProps {
  onStartSwipe: () => void;
  watchlist: Movie[];
  onMovieSelect: (movie: Movie) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onStartSwipe, 
  watchlist,
  onMovieSelect
}) => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch trending, popular, and top-rated movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch trending movies
        const trendingResponse = await fetch('/api/tmdb?list=trending');
        const trendingData = await trendingResponse.json();
        
        if (!trendingResponse.ok) {
          throw new Error('Failed to fetch trending movies');
        }
        
        setTrendingMovies(trendingData.movies);
        
        // Fetch popular movies
        const popularResponse = await fetch('/api/tmdb?list=popular');
        const popularData = await popularResponse.json();
        
        if (!popularResponse.ok) {
          throw new Error('Failed to fetch popular movies');
        }
        
        setPopularMovies(popularData.movies);
        
        // Fetch top-rated movies
        const topRatedResponse = await fetch('/api/tmdb?list=top_rated');
        const topRatedData = await topRatedResponse.json();
        
        if (!topRatedResponse.ok) {
          throw new Error('Failed to fetch top-rated movies');
        }
        
        setTopRatedMovies(topRatedData.movies);
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        console.error('Error fetching movies for homepage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);
  
  // Get similar genres from watchlist to suggest movies
  const getRecommendedMovies = () => {
    if (!watchlist || watchlist.length === 0) {
      return [];
    }
    
    // Extract all genre IDs from watchlist
    const watchlistGenres = watchlist.flatMap(movie => movie.genre_ids);
    
    // Count genre frequency
    const genreCounts: Record<number, number> = {};
    watchlistGenres.forEach(genreId => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(entry => Number(entry[0]));
    
    // Filter the top-rated movies by favorite genres
    if (sortedGenres.length > 0) {
      const favoriteGenre = sortedGenres[0];
      return topRatedMovies.filter(movie => 
        movie.genre_ids.includes(favoriteGenre) && 
        !watchlist.some(wm => wm.id === movie.id)
      ).slice(0, 10);
    }
    
    return [];
  };
  
  const recommendedMovies = getRecommendedMovies();
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-lg text-gray-300">Loading movies...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-800/70 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Hero section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Feeling Flicks
          </h1>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Discover movies based on your mood and taste. Find the perfect film for any occasion.
          </p>
          <button
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl font-medium flex items-center gap-2 mx-auto"
            onClick={onStartSwipe}
          >
            <ListFilter size={20} />
            <span>Find Movies by Mood</span>
          </button>
        </div>
        
        {/* Trending movies */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Flame className="text-yellow-500 mr-2" size={24} />
              Trending This Week
            </h2>
            <button className="text-purple-400 flex items-center hover:text-purple-300 transition-colors">
              <span className="mr-1">See all</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <motion.div 
              className="flex gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {trendingMovies.slice(0, 10).map(movie => (
                <motion.div 
                  key={movie.id}
                  className="flex-shrink-0 w-36 md:w-44 rounded-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
                  variants={item}
                  onClick={() => onMovieSelect(movie)}
                >
                  <div className="relative aspect-[2/3] mb-2">
                    <Image 
                      src={movie.poster_path || '/placeholder-poster.jpg'} 
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 144px, 176px"
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Popular movies */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <TrendingUp className="text-purple-500 mr-2" size={24} />
              Popular Right Now
            </h2>
            <button className="text-purple-400 flex items-center hover:text-purple-300 transition-colors">
              <span className="mr-1">See all</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <motion.div 
              className="flex gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {popularMovies.slice(0, 10).map(movie => (
                <motion.div 
                  key={movie.id}
                  className="flex-shrink-0 w-36 md:w-44 rounded-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
                  variants={item}
                  onClick={() => onMovieSelect(movie)}
                >
                  <div className="relative aspect-[2/3] mb-2">
                    <Image 
                      src={movie.poster_path || '/placeholder-poster.jpg'} 
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 144px, 176px"
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* Based on your watchlist */}
        {recommendedMovies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <Star className="text-yellow-400 mr-2" size={24} />
                Based on Your Watchlist
              </h2>
            </div>
            
            <div className="overflow-x-auto pb-4">
              <motion.div 
                className="flex gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {recommendedMovies.map(movie => (
                  <motion.div 
                    key={movie.id}
                    className="flex-shrink-0 w-36 md:w-44 rounded-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
                    variants={item}
                    onClick={() => onMovieSelect(movie)}
                  >
                    <div className="relative aspect-[2/3] mb-2">
                      <Image 
                        src={movie.poster_path || '/placeholder-poster.jpg'} 
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 144px, 176px"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomeScreen; 