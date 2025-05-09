import React, { useState } from 'react';
import { Home, Bookmark, User, BookOpen } from 'lucide-react';
import Profile from './Profile';
import { useAuth } from '@/lib/hooks/useAuth';

interface BottomNavProps {
  onHomeClick: () => void;
  onWatchlistClick: () => void;
  onMoodJournalClick?: () => void;
  hasNewItems?: boolean;
  activeScreen: 'home' | 'discovery' | 'watchlist' | 'journal';
}

const BottomNav: React.FC<BottomNavProps> = ({
  onHomeClick,
  onWatchlistClick,
  onMoodJournalClick,
  hasNewItems = false,
  activeScreen
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();
  
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gray-800 z-50">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={onHomeClick}
            className={`flex flex-col items-center justify-center p-2 ${
              activeScreen === 'home' || activeScreen === 'discovery' 
                ? 'text-white' 
                : 'text-gray-500'
            }`}
            aria-label="Home"
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          {onMoodJournalClick && (
            <button 
              onClick={onMoodJournalClick}
              className={`flex flex-col items-center justify-center p-2 ${
                activeScreen === 'journal' 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}
              aria-label="Mood Journal"
            >
              <BookOpen size={20} />
              <span className="text-xs mt-1">Journal</span>
            </button>
          )}
          
          <button 
            onClick={onWatchlistClick}
            className={`flex flex-col items-center justify-center p-2 relative ${
              activeScreen === 'watchlist' 
                ? 'text-white' 
                : 'text-gray-500'
            }`}
            aria-label="Watchlist"
          >
            <Bookmark size={20} />
            <span className="text-xs mt-1">Watchlist</span>
            {hasNewItems && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
          
          <button 
            onClick={toggleProfile}
            className="flex flex-col items-center justify-center p-2 text-gray-500"
            aria-label="Profile"
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
      
      {/* Profile Modal */}
      {showProfile && <Profile onClose={toggleProfile} />}
    </>
  );
};

export default BottomNav; 