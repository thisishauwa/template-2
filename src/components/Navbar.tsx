import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, User, BookOpen, Home } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Profile from './Profile';

interface NavbarProps {
  onWatchlistOpen?: () => void;
  onHomeClick?: () => void;
  onMoodJournalOpen?: () => void;
  hasNewItems?: boolean;
  activeScreen?: 'home' | 'watchlist' | 'journal' | 'discovery';
}

const Navbar: React.FC<NavbarProps> = ({ 
  onWatchlistOpen, 
  onHomeClick,
  onMoodJournalOpen,
  hasNewItems = false,
  activeScreen = 'home'
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  const handleLogoClick = (e: React.MouseEvent) => {
    if (onHomeClick) {
      e.preventDefault(); // Prevent default Link behavior
      onHomeClick();
    }
    // If no onHomeClick provided, let the Link navigate normally
  };
  
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/80 border-b border-white/10 font-britti-sans">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-white text-2xl font-bold"
            onClick={handleLogoClick}
          >
            FeelingFlicks
          </Link>
          
          {/* Menu buttons for desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Home button */}
            <button 
              onClick={onHomeClick}
              className={`flex items-center transition-colors ${
                activeScreen === 'home' 
                  ? 'text-white font-medium' 
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Go to home"
            >
              <Home className="w-5 h-5 mr-1.5" />
              <span>Home</span>
            </button>
            
            {/* Mood Journal Button */}
            {onMoodJournalOpen && (
              <button 
                onClick={onMoodJournalOpen}
                className={`flex items-center transition-colors ${
                  activeScreen === 'journal' 
                    ? 'text-white font-medium' 
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Open mood journal"
              >
                <BookOpen className="w-5 h-5 mr-1.5" />
                <span>Mood Journal</span>
              </button>
            )}
            
            {/* Watchlist Button */}
            {onWatchlistOpen && (
              <button 
                onClick={onWatchlistOpen}
                className={`flex items-center transition-colors relative ${
                  activeScreen === 'watchlist' 
                    ? 'text-white font-medium' 
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Open watchlist"
              >
                <Bookmark className="w-5 h-5 mr-1.5" />
                <span>Watchlist</span>
                
                {/* Notification dot */}
                {hasNewItems && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            )}
            
            {/* Profile */}
            <button 
              onClick={toggleProfile}
              className="flex items-center transition-colors text-gray-400 hover:text-white"
              aria-label="Open profile"
            >
              {user && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                  <User size={18} />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Profile Modal */}
      {showProfile && <Profile onClose={toggleProfile} />}
    </>
  );
};

// Desktop navigation link
const NavLink: React.FC<{
  href: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}> = ({ href, isActive, onClick, children }) => (
  <Link 
    href={href} 
    className={`${
      isActive 
        ? 'text-white font-medium' 
        : 'text-gray-400 hover:text-white'
    } transition-colors`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar; 