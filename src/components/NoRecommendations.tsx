import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';

interface NoRecommendationsProps {
  onAdjustFilters: () => void;
}

const NoRecommendations: React.FC<NoRecommendationsProps> = ({ onAdjustFilters }) => {
  return (
    <div className="text-center py-20 px-4 max-w-lg mx-auto font-britti-sans">
      <SearchX size={64} className="mx-auto mb-6 text-gray-500" />
      
      <h2 className="text-2xl font-bold mb-3 text-white">No matches found</h2>
      
      <p className="text-gray-300 mb-8">
        We couldn't find any movies matching your current combination of mood, genres, and decades.
        Try adjusting your filters for better results.
      </p>
      
      <button
        onClick={onAdjustFilters}
        className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-medium text-white transition-colors flex items-center justify-center mx-auto"
      >
        <RefreshCw size={18} className="mr-2" />
        Adjust Filters
      </button>
    </div>
  );
};

export default NoRecommendations; 