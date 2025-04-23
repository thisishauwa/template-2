export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  runtime?: number;
  mood_match: string;
}

export interface MovieFilters {
  mood: string;
  genres?: number[];
  decades?: string[];
  watchingWith?: string;
}

export interface WatchlistMovie extends Movie {
  addedAt: string;
  mood: string;
}

// Genre mapping based on TMDB
export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

// Available decades
export const DECADES = [
  '1930s', '1940s', '1950s', '1960s', '1970s',
  '1980s', '1990s', '2000s', '2010s', '2020s'
];

// Available moods
export const MOODS = [
  { id: 'wistful', label: 'Wistful', emoji: '🥹' },
  { id: 'chaotic', label: 'Chaotic', emoji: '🌪️' },
  { id: 'heartbroken', label: 'Heartbroken', emoji: '💔' },
  { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🕰️' },
  { id: 'chill', label: 'Chill', emoji: '😌' },
  { id: 'romantic', label: 'Romantic', emoji: '❤️' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🌄' },
  { id: 'inspired', label: 'Inspired', emoji: '💭' },
  { id: 'reflective', label: 'Reflective', emoji: '🤔' }
];

// Watching with options
export const WATCHING_WITH = [
  { id: 'solo', label: 'Solo', emoji: '🧘' },
  { id: 'date', label: 'Date Night', emoji: '💕' },
  { id: 'friends', label: 'Friends', emoji: '👯' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' }
]; 