import { NextResponse } from 'next/server';

// TMDB API base URL
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

// Define types for our mood and watch context mappings
interface MoodParameters {
  genres?: number[];
  keywords?: number[];
  sort_by?: string;
  vote_average_gte?: number;
  vote_count_gte?: number;
  runtime_gte?: number;
  runtime_lte?: number;
  vibe_description?: string;
}

interface WatchContextParameters {
  genres?: number[];
  include_adult?: boolean;
  certification_country?: string;
  certification?: string;
  vote_average_gte?: number;
  vote_count_gte?: number;
  runtime_gte?: number;
  runtime_lte?: number;
  sort_by?: string;
  description?: string;
}

// Individual genre mappings to keyword IDs
// These are TMDB keyword IDs for improving genre accuracy
const GENRE_KEYWORD_MAPPINGS: Record<string, number[]> = {
  // Genre ID to keyword IDs
  "10749": [9799, 2010, 818, 9673, 10635], // Romance: romantic, love, relationship, passion
  "35": [4565, 9748, 186383, 10937], // Comedy: funny, humor, laugh, sitcom
  "28": [9725, 9663, 15060, 9748], // Action: hero, journey, quest, action-packed
  "12": [9663, 10683, 15060, 9748, 9725], // Adventure: adventure, journey, quest, exploration
  "16": [9882, 10559, 9985, 177887], // Animation: kids, animation, cartoon, family-friendly
  "80": [10602, 9702, 10463, 167147], // Crime: crime, detective, police, heist
  "99": [818, 9672, 15060, 10683], // Documentary: true story, historical, informative
  "18": [9712, 10683, 1416, 6910], // Drama: emotional, character-driven, realistic
  "10751": [9882, 10559, 9985, 177887], // Family: kids, wholesome, all-ages, family-friendly
  "14": [4344, 779, 12554, 209714], // Fantasy: magical, mythical, supernatural, wizards
  "36": [818, 9672, 15060, 10683], // History: period piece, historical, based on true events
  "27": [6125, 9951, 163037, 10714], // Horror: scary, suspense, terror, supernatural
  "10402": [1701, 155205, 2626, 34056], // Music: music, dancing, performance, band
  "9648": [11003, 9742, 244838, 170064], // Mystery: clues, detective, secret, investigation
  "878": [11014, 9882, 9951, 10235], // Sci-Fi: future, space, dystopia, aliens
  "53": [6125, 9951, 163037, 10944], // Thriller: suspense, tension, psychological, twist
  "10752": [233566, 9783, 233544, 10455], // War: battle, soldier, military, combat
  "37": [223872, 258206, 156830, 14198], // Western: cowboy, frontier, wild west, desert
};

// Sustainable mood mappings with TMDB parameters
const MOOD_MAPPINGS: Record<string, MoodParameters> = {
  wistful: { 
    genres: [18, 10749], // Drama, Romance
    keywords: [10056, 171819, 5799, 6054, 9715], // melancholy, nostalgia, reflective, memories
    sort_by: 'vote_average.desc',
    vote_average_gte: 6.5,
    vote_count_gte: 100,
    vibe_description: "Films that evoke gentle nostalgia and contemplation"
  },
  chaotic: { 
    genres: [28, 53, 27], // Action, Thriller, Horror
    keywords: [925, 9882, 3654, 9673, 4565], // unpredictable, wild, hectic, energy
    sort_by: 'popularity.desc',
    vote_count_gte: 200,
    vibe_description: "High-energy films with unpredictable twists and turns"
  },
  heartbroken: { 
    genres: [18, 10749], // Drama, Romance
    keywords: [9712, 10683, 1416, 10714, 6910], // emotional, tragedy, loss, grief
    sort_by: 'vote_average.desc',
    vote_average_gte: 7.0,
    vote_count_gte: 100,
    vibe_description: "Emotional stories about love, loss, and healing"
  },
  hopeful: { 
    genres: [18, 35, 10751], // Drama, Comedy, Family
    keywords: [9715, 4565, 15060, 155675, 14944], // uplifting, inspirational, feel-good, hope
    sort_by: 'vote_average.desc',
    vote_average_gte: 6.8,
    vote_count_gte: 150,
    vibe_description: "Inspiring stories that leave you feeling optimistic"
  },
  nostalgic: {
    genres: [16, 10751, 12], // Animation, Family, Adventure
    keywords: [171819, 261346, 818, 9715, 10683], // nostalgia, retro, classic, memorabilia
    sort_by: 'vote_average.desc',
    vote_average_gte: 6.5,
    vote_count_gte: 200,
    vibe_description: "Films that transport you back to cherished times"
  },
  chill: {
    genres: [35, 10751, 16], // Comedy, Family, Animation
    keywords: [9882, 261346, 9748, 10683, 155675], // relaxing, light, easygoing
    sort_by: 'vote_average.desc',
    vote_count_gte: 100,
    runtime_lte: 120, // Keep runtime moderate
    vibe_description: "Easy-watching films that don't demand too much emotional energy"
  },
  romantic: {
    genres: [10749, 35], // Romance, Comedy
    keywords: [9715, 9799, 155675, 9673, 2010], // romance, love, relationship, passion
    sort_by: 'vote_average.desc',
    vote_average_gte: 6.5,
    vote_count_gte: 150,
    vibe_description: "Love stories that make your heart flutter"
  },
  adventurous: {
    genres: [12, 28, 14], // Adventure, Action, Fantasy
    keywords: [9663, 10683, 15060, 9748, 9725], // adventure, journey, quest, exploration
    sort_by: 'popularity.desc',
    vote_count_gte: 200,
    vibe_description: "Thrilling journeys and quests to faraway places"
  },
  inspired: {
    genres: [18, 36, 99], // Drama, History, Documentary
    keywords: [15060, 9715, 10683, 9664, 818], // motivation, true story, achievement
    sort_by: 'vote_average.desc',
    vote_average_gte: 7.2,
    vote_count_gte: 80,
    vibe_description: "True stories of achievement and perseverance"
  },
  reflective: {
    genres: [18, 9648, 878], // Drama, Mystery, Science Fiction
    keywords: [10683, 9673, 818, 4565, 6054], // philosophical, thought-provoking, existential
    sort_by: 'vote_average.desc',
    vote_average_gte: 7.0,
    vote_count_gte: 100,
    vibe_description: "Thought-provoking films that stay with you long after watching"
  }
};

// Watch context mappings
const WATCH_CONTEXT_MAPPINGS: Record<string, WatchContextParameters> = {
  date: {
    genres: [10749, 35], // Romance, Comedy
    vote_average_gte: 6.8, // Higher quality for dates
    runtime_gte: 90,
    runtime_lte: 130, // Not too long
    description: "Perfect for a special movie night together"
  },
  family: {
    genres: [10751, 16, 12, 35], // Family, Animation, Adventure, Comedy
    include_adult: false,
    certification_country: 'US',
    certification: 'G|PG', // Family friendly ratings
    runtime_lte: 140, // Not too long for kids
    description: "Family-friendly entertainment everyone can enjoy"
  },
  friends: {
    genres: [35, 28, 12, 27], // Comedy, Action, Adventure, Horror
    sort_by: 'popularity.desc', // Crowd-pleasers
    runtime_lte: 150,
    vote_count_gte: 200, // Well-known movies
    description: "Fun films that are great to watch in a group"
  },
  solo: {
    // Solo watching can include more challenging/niche content
    vote_count_gte: 50, // Can include lesser-known films
    description: "Perfect for your personal movie time"
  }
};

// Function to get movies based on genre, year, and other filters
export async function POST(request: Request) {
  try {
    const { mood, genres, decades, watchingWith, useAndLogic = false } = await request.json();
    console.log('Received filters:', { mood, genres, decades, watchingWith, useAndLogic });
    
    // Create URL parameters for TMDB API
    const params = new URLSearchParams();
    
    // Basic parameters
    params.append('api_key', process.env.TMDB_API_KEY || '');
    params.append('language', 'en-US');
    params.append('include_adult', 'false');
    params.append('vote_count.gte', '50'); // Some minimum vote count for quality
    params.append('sort_by', 'vote_average.desc'); // Sort by highest rated

    // Handle filtering logic - AND vs OR
    if (useAndLogic) {
      // Use AND logic - all conditions must match
      
      // For AND logic with genres, we need to add all genre IDs as separate parameters
      if (genres && genres.length > 0) {
        // When using AND logic, we need to append each genre_id individually
        genres.forEach((genreId: number) => {
          params.append('with_genres', genreId.toString());
        });
      }
      
      // For decades in AND logic, we can only use a single date range
      if (decades && decades.length > 0) {
        // With AND logic, we have to use the broadest date range 
        // (earliest start to latest end)
        const yearRanges = decades.map((decade: string) => {
          const startYear = parseInt(decade.replace('s', ''));
          return { 
            start: startYear, 
            end: startYear + 9 
          };
        });
        
        if (yearRanges.length > 0) {
          // Find minimum start year and maximum end year
          const minStartYear = Math.min(...yearRanges.map((range: {start: number, end: number}) => range.start));
          const maxEndYear = Math.max(...yearRanges.map((range: {start: number, end: number}) => range.end));
          
          // Add primary release date filters
          params.append('primary_release_date.gte', `${minStartYear}-01-01`);
          params.append('primary_release_date.lte', `${maxEndYear}-12-31`);
        }
      }
      
      // Apply mood filtering with keywords
      if (mood && mood !== 'any') {
        const moodKeywords = MOOD_MAPPINGS[mood]?.keywords || [];
        if (moodKeywords.length > 0) {
          moodKeywords.forEach((keywordId: number) => {
            params.append('with_keywords', keywordId.toString());
          });
        }
      }
    } else {
      // Use OR logic (original implementation)
      
      // Add genre filtering if provided
      if (genres && genres.length > 0) {
        // For OR logic, we can use comma-separated genre IDs
        params.append('with_genres', genres.join(','));
      }
      
      // Add decade filtering if provided
      if (decades && decades.length > 0) {
        // Convert decades to release years (e.g., "1990s" -> 1990-1999)
        const yearRanges = decades.map((decade: string) => {
          const startYear = parseInt(decade.replace('s', ''));
          return { 
            start: startYear, 
            end: startYear + 9 
          };
        });
        
        // Consider multiple decades by expanding the date range
        if (yearRanges.length > 0) {
          // Find minimum start year and maximum end year
          const minStartYear = Math.min(...yearRanges.map((range: {start: number, end: number}) => range.start));
          const maxEndYear = Math.max(...yearRanges.map((range: {start: number, end: number}) => range.end));
          
          // Add primary release date filters - use exact date format required by TMDB
          params.append('primary_release_date.gte', `${minStartYear}-01-01`);
          params.append('primary_release_date.lte', `${maxEndYear}-12-31`);
          
          // Make decade filtering stricter by increasing the minimum vote count
          // This helps prioritize more well-known films from the selected decades
          if (yearRanges.length === 1) {
            // For a single decade, increase vote count requirement to ensure more accurate results
            const currentVoteCount = parseInt(params.get('vote_count.gte') || '50');
            params.set('vote_count.gte', Math.max(currentVoteCount, 100).toString());
            
            // Add a boost to sort by release date within that decade for better relevance
            if (!params.has('sort_by') || params.get('sort_by') === 'popularity.desc') {
              params.set('sort_by', 'vote_average.desc');
            }
          } else if (yearRanges.length > 1) {
            // For multiple decades, we can be a bit more lenient to get enough results
            const currentVoteCount = parseInt(params.get('vote_count.gte') || '50');
            params.set('vote_count.gte', Math.max(currentVoteCount - 20, 30).toString());
          }
        }
      }
      
      // Apply mood filtering with keywords
      if (mood && mood !== 'any') {
        // Collect keyword IDs for the selected mood
        let keywordIds: number[] = [];
        
        // Add direct mood keywords
        const moodKeywords = MOOD_MAPPINGS[mood]?.keywords || [];
        keywordIds = [...keywordIds, ...moodKeywords];
        
        // Add genre combination keywords if applicable
        if (genres && genres.length > 0 && GENRE_KEYWORD_MAPPINGS) {
          // Convert genre IDs to names for lookup
          const genreNames = genres.map((id: number) => {
            const genre = GENRE_KEYWORD_MAPPINGS[id.toString()];
            return genre ? genre.join(' + ') : '';
          }).filter(Boolean).sort().join(' + ');
          
          if (GENRE_KEYWORD_MAPPINGS[genreNames]) {
            keywordIds = [...keywordIds, ...GENRE_KEYWORD_MAPPINGS[genreNames]];
          }
        }
        
        // Add keywords to query
        if (keywordIds.length > 0) {
          params.append('with_keywords', keywordIds.join('|')); // Use | for OR logic
        }
      }
    }

    // Get the mapped mood parameters or use defaults
    const moodParams: MoodParameters = 
      (mood && MOOD_MAPPINGS[mood]) ? 
      MOOD_MAPPINGS[mood] : 
      { 
        sort_by: 'popularity.desc',
        vote_count_gte: 100,
        vibe_description: "Films that match your current mood"
      };
    
    // Get watch context parameters
    const watchContext: WatchContextParameters = 
      (watchingWith && WATCH_CONTEXT_MAPPINGS[watchingWith]) ? 
      WATCH_CONTEXT_MAPPINGS[watchingWith] : 
      {};
    
    // Decide on genres - preference order:
    // 1. User explicitly selected genres
    // 2. Watch context genres if no user selection
    // 3. Mood-suggested genres as fallback
    let finalGenres = genres && genres.length > 0 
      ? genres 
      : (watchContext.genres && !genres ? watchContext.genres : moodParams.genres || []);
    
    // Collect keyword IDs based on genres and mood
    let keywordIds: number[] = [];
    
    // Add genre-specific keywords first
    if (finalGenres.length > 0) {
      finalGenres.forEach((genre: number) => {
        const genreKey = genre.toString();
        if (GENRE_KEYWORD_MAPPINGS[genreKey]) {
          keywordIds = [...keywordIds, ...GENRE_KEYWORD_MAPPINGS[genreKey]];
        }
      });
    }

    // Add mood-based keywords
    if (moodParams.keywords && Array.isArray(moodParams.keywords)) {
      keywordIds = [...keywordIds, ...moodParams.keywords];
    }
    
    // Remove duplicates
    keywordIds = Array.from(new Set(keywordIds));
    
    // Build query parameters, merging from mood and watch context
    const paramsMerged = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY || '',
      language: 'en-US',
      sort_by: moodParams.sort_by || 'popularity.desc',
      include_adult: (watchContext.include_adult === false ? 'false' : 'false'),
      with_genres: finalGenres.join(','),
    });
    
    // Add vote parameters from mood
    if (moodParams.vote_average_gte) {
      paramsMerged.append('vote_average.gte', moodParams.vote_average_gte.toString());
    }
    
    // Use higher vote count requirement between mood and watch context
    const voteCountGte = Math.max(
      moodParams.vote_count_gte || 50, 
      watchContext.vote_count_gte || 50
    );
    paramsMerged.append('vote_count.gte', voteCountGte.toString());
    
    // Add runtime parameters if available
    if (moodParams.runtime_gte || watchContext.runtime_gte) {
      const runtimeGte = moodParams.runtime_gte || watchContext.runtime_gte;
      if (runtimeGte) paramsMerged.append('with_runtime.gte', runtimeGte.toString());
    }
    
    if (moodParams.runtime_lte || watchContext.runtime_lte) {
      const runtimeLte = moodParams.runtime_lte || watchContext.runtime_lte;
      if (runtimeLte) paramsMerged.append('with_runtime.lte', runtimeLte.toString());
    }
    
    // Add certification if watching with family
    if (watchContext.certification_country && watchContext.certification) {
      paramsMerged.append('certification_country', watchContext.certification_country);
      paramsMerged.append('certification', watchContext.certification);
    }
    
    // Add keywords if available - use OR operator to match any of the keywords
    if (keywordIds.length > 0) {
      paramsMerged.append('with_keywords', keywordIds.slice(0, 8).join('|')); // Use OR operator for keywords
    }
    
    // Add decade filtering if provided
    if (decades && decades.length > 0) {
      // Convert decades to release years (e.g., "1990s" -> 1990-1999)
      const yearRanges = decades.map((decade: string) => {
        const startYear = parseInt(decade.replace('s', ''));
        return { 
          start: startYear, 
          end: startYear + 9 
        };
      });
      
      // Consider multiple decades by expanding the date range
      if (yearRanges.length > 0) {
        // Find minimum start year and maximum end year
        const minStartYear = Math.min(...yearRanges.map((range: {start: number, end: number}) => range.start));
        const maxEndYear = Math.max(...yearRanges.map((range: {start: number, end: number}) => range.end));
        
        // Add primary release date filters - use exact date format required by TMDB
        paramsMerged.append('primary_release_date.gte', `${minStartYear}-01-01`);
        paramsMerged.append('primary_release_date.lte', `${maxEndYear}-12-31`);
        
        // Make decade filtering stricter by increasing the minimum vote count
        // This helps prioritize more well-known films from the selected decades
        if (yearRanges.length === 1) {
          // For a single decade, increase vote count requirement to ensure more accurate results
          const currentVoteCount = parseInt(paramsMerged.get('vote_count.gte') || '50');
          paramsMerged.set('vote_count.gte', Math.max(currentVoteCount, 100).toString());
          
          // Add a boost to sort by release date within that decade for better relevance
          if (!paramsMerged.has('sort_by') || paramsMerged.get('sort_by') === 'popularity.desc') {
            paramsMerged.set('sort_by', 'vote_average.desc');
          }
        } else if (yearRanges.length > 1) {
          // For multiple decades, we can be a bit more lenient to get enough results
          const currentVoteCount = parseInt(paramsMerged.get('vote_count.gte') || '50');
          paramsMerged.set('vote_count.gte', Math.max(currentVoteCount - 20, 30).toString());
        }
      }
    }
    
    // Make request to TMDB discover endpoint
    const response = await fetch(`${TMDB_API_BASE_URL}/discover/movie?${paramsMerged.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies from TMDB');
    }
    
    // FALLBACK LOGIC: If we didn't get enough results, try a more general search
    if (data.results.length < 5) {
      // Step 1: Try removing keywords but keeping genres and decade filters
      const fallback1Params = new URLSearchParams({
        api_key: process.env.TMDB_API_KEY || '',
        language: 'en-US',
        sort_by: 'popularity.desc',
        include_adult: 'false',
        with_genres: finalGenres.join(','),
        'vote_count.gte': '30' // Lower vote count threshold for better chances with older films
      });
      
      // Preserve decade filtering in fallback
      if (decades && decades.length > 0) {
        const yearRanges = decades.map((decade: string) => {
          const startYear = parseInt(decade.replace('s', ''));
          return { 
            start: startYear, 
            end: startYear + 9 
          };
        });
        
        if (yearRanges.length > 0) {
          const minStartYear = Math.min(...yearRanges.map((range: {start: number, end: number}) => range.start));
          const maxEndYear = Math.max(...yearRanges.map((range: {start: number, end: number}) => range.end));
          
          fallback1Params.append('primary_release_date.gte', `${minStartYear}-01-01`);
          fallback1Params.append('primary_release_date.lte', `${maxEndYear}-12-31`);
        }
      }
      
      const fallback1Response = await fetch(`${TMDB_API_BASE_URL}/discover/movie?${fallback1Params.toString()}`);
      const fallback1Data = await fallback1Response.json();
      
      if (fallback1Response.ok && fallback1Data.results.length >= 3) {
        data.results = fallback1Data.results;
      } else {
        // Step 2: Try with just the genre and decade, no other filters
        const fallback2Params = new URLSearchParams({
          api_key: process.env.TMDB_API_KEY || '',
          language: 'en-US',
          sort_by: 'vote_average.desc', // Try by rating instead of popularity for old movies
          include_adult: 'false',
          with_genres: finalGenres.length > 0 ? finalGenres[0].toString() : '',
          'vote_count.gte': '10' // Very low threshold for old films
        });
        
        // Still preserve decade filtering
        if (decades && decades.length > 0) {
          const yearRanges = decades.map((decade: string) => {
            const startYear = parseInt(decade.replace('s', ''));
            return { 
              start: startYear, 
              end: startYear + 9 
            };
          });
          
          if (yearRanges.length > 0) {
            const minStartYear = Math.min(...yearRanges.map((range: {start: number, end: number}) => range.start));
            const maxEndYear = Math.max(...yearRanges.map((range: {start: number, end: number}) => range.end));
            
            fallback2Params.append('primary_release_date.gte', `${minStartYear}-01-01`);
            fallback2Params.append('primary_release_date.lte', `${maxEndYear}-12-31`);
          }
        }
        
        const fallback2Response = await fetch(`${TMDB_API_BASE_URL}/discover/movie?${fallback2Params.toString()}`);
        const fallback2Data = await fallback2Response.json();
        
        if (fallback2Response.ok && fallback2Data.results.length > 0) {
          data.results = fallback2Data.results;
        }
      }
    }
    
    // Add calculated vibe match score and description to each movie
    let moviesWithMatch = data.results.map((movie: any) => {
      // Calculate mood match score based on multiple factors
      
      // 1. Genre match: How well the movie's genres match the requested genres
      const genreOverlap = movie.genre_ids.filter((id: number) => finalGenres.includes(id)).length;
      const genreScore = Math.min(5, (genreOverlap / Math.max(1, finalGenres.length)) * 5);
      
      // 2. Keyword match: Check for the presence of mood-specific keywords
      const keywordBonus = mood && mood !== 'any' && MOOD_MAPPINGS[mood] ? 2 : 0;
      
      // 3. Popularity factor: More popular movies get a slight boost
      // Normalize popularity which ranges from 0 to ~2000 on TMDB
      const normalizedPopularity = Math.min(1, movie.popularity / 500);
      const popularityBonus = normalizedPopularity * 0.5;
      
      // 4. Rating factor: Higher rated movies get a boost
      const ratingBonus = Math.min(1.5, (movie.vote_average - 5) / 2);
      
      // 5. Recency factor: For certain moods, newer films get a slight boost
      const recencyMoods = ['chaotic', 'hopeful', 'chill'];
      let recencyBonus = 0;
      
      if (mood && recencyMoods.includes(mood) && movie.release_date) {
        const releaseYear = parseInt(movie.release_date.substring(0, 4));
        const currentYear = new Date().getFullYear();
        // Calculate a recency bonus that maxes out at 1 for movies from the last 5 years
        recencyBonus = Math.min(1, Math.max(0, (currentYear - releaseYear < 5) ? 1 : 0));
      }
      
      // 6. Decade match factor: Movies from the requested decades get a bonus
      let decadeBonus = 0;
      if (decades && decades.length > 0 && movie.release_date) {
        const releaseYear = parseInt(movie.release_date.substring(0, 4));
        const decade = Math.floor(releaseYear / 10) * 10;
        const decadeString = `${decade}s`;
        
        if (decades.includes(decadeString)) {
          decadeBonus = 1.5;
        }
      }
      
      // Calculate the final score (base of 5 plus all the factors)
      // Scale is 1-10 with 6-10 being the display range
      let rawScore = 5 + genreScore + keywordBonus + popularityBonus + ratingBonus + recencyBonus + decadeBonus;
      
      // Normalize to our 6-10 range for display
      const vibeMatchScore = Math.min(10, Math.max(6, Math.round(rawScore)));
      
      return {
        ...movie,
        mood_match: vibeMatchScore,
        vibe_description: moodParams.vibe_description || "A good match for your mood",
        poster_path: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
          : null,
      };
    });
    
    // Additional post-processing to enforce decade filtering (double-check release dates)
    if (decades && decades.length > 0) {
      // Convert decades to year ranges
      const yearRanges = decades.map((decade: string) => {
        const startYear = parseInt(decade.replace('s', ''));
        return { start: startYear, end: startYear + 9 };
      });
      
      // Filter movies to only include those with release dates in the selected decades
      moviesWithMatch = moviesWithMatch.filter((movie: any) => {
        if (!movie.release_date) return false;
        
        const releaseYear = parseInt(movie.release_date.substring(0, 4));
        return yearRanges.some((range: {start: number, end: number}) => 
          releaseYear >= range.start && releaseYear <= range.end
        );
      });
      
      // If we still have no results after filtering, add a special message
      if (moviesWithMatch.length === 0) {
        // Returning an empty array with a special flag for the UI to handle
        return NextResponse.json({
          movies: [],
          total_results: 0,
          total_pages: 0,
          vibe_description: "Movies from this era are hard to find. Try a different decade or genre combination.",
          no_decade_results: true,
          applied_filters: {
            mood,
            genres: finalGenres,
            decades,
            watchingWith
          }
        });
      }
    }
    
    // Return results with additional metadata for UI adaptation
    return NextResponse.json({ 
      movies: moviesWithMatch,
      total_results: data.total_results,
      total_pages: data.total_pages,
      vibe_description: moodParams.vibe_description,
      watch_context_description: watchContext.description,
      has_fallback: data.results.length < 5,
      applied_filters: {
        mood,
        genres: finalGenres,
        decades,
        watchingWith
      }
    });
    
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

// Curated paths - predefined experiences
const CURATED_PATHS = [
  {
    id: 'crush-texted',
    title: 'For When Your Crush Texts Back',
    description: 'Giddy, hopeful films that capture that flutter in your chest',
    mood: 'romantic',
    genres: [10749, 35], // Romance, Comedy
    decades: ['2000s', '2010s'],
    watchingWith: 'solo',
    keywords: [9799, 2010, 818, 9673, 10635], // romantic comedy, love
  },
  {
    id: 'black-white-catharsis',
    title: 'Catharsis via 1950s Black & White',
    description: 'Classic cinema from the Golden Age to process life\'s complexities',
    mood: 'reflective',
    genres: [18], // Drama
    decades: ['1950s'],
    watchingWith: 'solo',
    keywords: [171819, 10683, 818], // classic, nostalgic
  },
  {
    id: 'rainy-afternoon',
    title: 'Rainy Afternoon Comfort',
    description: 'Cozy, gentle stories for when the sky is gray and time feels slow',
    mood: 'chill',
    genres: [18, 10751], // Drama, Family
    decades: ['1990s', '2000s'],
    watchingWith: 'solo',
    keywords: [9882, 10683, 9748], // cozy, comfort
  },
  {
    id: 'existential-crisis',
    title: 'When You\'re Having an Existential Crisis',
    description: 'Philosophical films that ask the big questions so you don\'t have to',
    mood: 'reflective',
    genres: [18, 878], // Drama, Science Fiction
    watchingWith: 'solo',
    keywords: [10683, 4565, 6054], // philosophical, existential
  }
];

// Function to fetch movies for a curated path
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listType = searchParams.get('list') || 'trending';
    const pathId = searchParams.get('path');
    
    // If a curated path is requested
    if (pathId) {
      const path = CURATED_PATHS.find(p => p.id === pathId);
      if (!path) {
        return NextResponse.json({ error: 'Curated path not found' }, { status: 404 });
      }
      
      // Build parameters for curated path
      const params = new URLSearchParams({
        api_key: process.env.TMDB_API_KEY || '',
        language: 'en-US',
        sort_by: 'vote_average.desc',
        include_adult: 'false',
        with_genres: path.genres.join(','),
        'vote_count.gte': '50'
      });
      
      // Add keywords if available
      if (path.keywords && path.keywords.length > 0) {
        params.append('with_keywords', path.keywords.join('|'));
      }
      
      // Add decade filtering if provided
      if (path.decades && path.decades.length > 0) {
        const decade = path.decades[0];
        const startYear = parseInt(decade.replace('s', ''));
        params.append('primary_release_date.gte', `${startYear}-01-01`);
        params.append('primary_release_date.lte', `${startYear + 9}-12-31`);
      }
      
      const response = await fetch(`${TMDB_API_BASE_URL}/discover/movie?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch curated path movies');
      }
      
      // Transform movie data for the curated path
      const processedMovies = data.results.map((movie: any) => ({
        ...movie,
        poster_path: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
          : null,
        mood_match: 9, // Curated paths have high match scores
        vibe_description: path.description
      }));
      
      return NextResponse.json({ 
        movies: processedMovies,
        total_results: data.total_results,
        total_pages: data.total_pages,
        path: path
      });
    }
    
    // Regular lists (trending, popular, top-rated)
    let endpoint = '';
    switch(listType) {
      case 'trending':
        endpoint = `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`;
        break;
      case 'popular':
        endpoint = `${TMDB_API_BASE_URL}/movie/popular?api_key=${process.env.TMDB_API_KEY}`;
        break;
      case 'top_rated':
        endpoint = `${TMDB_API_BASE_URL}/movie/top_rated?api_key=${process.env.TMDB_API_KEY}`;
        break;
      default:
        endpoint = `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`;
    }
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to fetch movies from TMDB');
    }
    
    // Transform movie data
    const processedMovies = data.results.map((movie: any) => ({
      ...movie,
      poster_path: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : null,
    }));
    
    return NextResponse.json({ 
      movies: processedMovies,
      total_results: data.total_results,
      total_pages: data.total_pages,
      paths: CURATED_PATHS
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
} 