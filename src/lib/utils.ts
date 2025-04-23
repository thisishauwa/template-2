/**
 * Utility functions for the application
 */

/**
 * Get a properly formatted TMDB image URL
 * @param path The image path from TMDB API
 * @param size The desired size (w500, w780, original, etc.)
 * @returns The full image URL or a placeholder
 */
export const getTMDBImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/placeholder-poster.jpg';
  
  // Handle cases where the path might already be a full URL
  if (path.startsWith('http')) return path;
  
  // Ensure the path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `https://image.tmdb.org/t/p/${size}${formattedPath}`;
};

/**
 * Format a date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
}; 