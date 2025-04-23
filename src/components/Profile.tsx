"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import SignInWithGoogle from './SignInWithGoogle';
import { X, User, LogOut } from 'lucide-react';
import Image from 'next/image';

interface ProfileProps {
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const { user, signInWithGoogle, signOut, isAnonymous } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    onClose();
  };
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-black rounded-3xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Profile</h2>
          
          {!user || isAnonymous ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-10">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-300 text-center mb-4">Sign in to save your watchlist and preferences across devices</p>
              <SignInWithGoogle />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile header with photo */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-4">
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || "Profile picture"}
                      width={96}
                      height={96} 
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white">{user.displayName || "Film Enthusiast"}</h3>
                <p className="text-gray-400 text-sm mt-1">{user.email}</p>
              </div>
              
              {/* Sign out button */}
              <div className="flex justify-center pt-4 border-t border-gray-800">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile; 