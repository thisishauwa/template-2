import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  onWatchlistOpen?: () => void;
  onHomeClick?: () => void;
  hasNewItems?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onWatchlistOpen, 
  onHomeClick,
  hasNewItems = false
}) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    if (onHomeClick) {
      e.preventDefault(); // Prevent default Link behavior
      onHomeClick();
    }
    // If no onHomeClick provided, let the Link navigate normally
  };
  
  return (
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
          
          
          {/* Watchlist Button */}
          {onWatchlistOpen && (
            <button 
              onClick={onWatchlistOpen}
              className="flex items-center text-gray-300 hover:text-white transition-colors relative"
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
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
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