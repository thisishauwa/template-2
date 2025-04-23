import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bookmark, User, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  onWatchlistOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onWatchlistOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/10 font-britti-sans">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-white text-2xl font-bold">
          FeelingFlicks
        </Link>
        
        {/* Menu buttons for desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="/" isActive={pathname === '/'}>
            Discover
          </NavLink>
          <NavLink href="/mood" isActive={pathname === '/mood'}>
            Mood Finder
          </NavLink>
          <NavLink href="/curated" isActive={pathname === '/curated'}>
            Curated
          </NavLink>
          
          {/* Watchlist Button */}
          {onWatchlistOpen && (
            <button 
              onClick={onWatchlistOpen}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Bookmark className="w-5 h-5 mr-1.5" />
              <span>Watchlist</span>
            </button>
          )}
          
          {/* Profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
              <User size={18} />
            </div>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <MobileNavLink href="/" isActive={pathname === '/'} onClick={() => setIsMenuOpen(false)}>
                Discover
              </MobileNavLink>
              <MobileNavLink href="/mood" isActive={pathname === '/mood'} onClick={() => setIsMenuOpen(false)}>
                Mood Finder
              </MobileNavLink>
              <MobileNavLink href="/curated" isActive={pathname === '/curated'} onClick={() => setIsMenuOpen(false)}>
                Curated
              </MobileNavLink>
              
              {/* Mobile Watchlist button */}
              {onWatchlistOpen && (
                <button 
                  onClick={() => {
                    onWatchlistOpen();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
                >
                  <Bookmark className="w-5 h-5 mr-2" />
                  <span>Watchlist</span>
                </button>
              )}
              
              <div className="border-t border-gray-800 my-2 pt-2">
                <button className="flex w-full items-center px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg">
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop navigation link
const NavLink: React.FC<{
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ href, isActive, children }) => (
  <Link 
    href={href} 
    className={`${
      isActive 
        ? 'text-white font-medium' 
        : 'text-gray-400 hover:text-white'
    } transition-colors`}
  >
    {children}
  </Link>
);

// Mobile navigation link
const MobileNavLink: React.FC<{
  href: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ href, isActive, onClick, children }) => (
  <Link 
    href={href} 
    className={`px-4 py-2 rounded-lg ${
      isActive 
        ? 'bg-primary text-white' 
        : 'text-gray-300 hover:bg-gray-800'
    }`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar; 