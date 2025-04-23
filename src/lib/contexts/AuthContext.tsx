"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInAnonymously } from "firebase/auth";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  signInAnonymously: async () => {},
  isAnonymous: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Initialize anonymous authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we already have a user
        if (!auth.currentUser) {
          // If no user is logged in, attempt to create an anonymous account
          console.log("No user found, attempting to create anonymous account");
          try {
            await signInAnonymously(auth);
            console.log("Successfully created anonymous account");
          } catch (anonError: any) {
            // If anonymous auth fails, just log the error but don't throw
            console.error("Anonymous authentication failed:", anonError.code, anonError.message);
            console.log("User will remain unauthenticated, but app will still function");
          }
        }
      } catch (error) {
        console.error("Error initializing authentication:", error);
      }
    };

    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? `User: ${user.uid} (${user.isAnonymous ? 'anonymous' : 'authenticated'})` : 'No user');
      setUser(user);
      setIsAnonymous(user?.isAnonymous || false);
      setLoading(false);
      
      // If no user, initialize anonymous auth (but don't block UI if it fails)
      if (!user) {
        initAuth();
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      console.log("Attempting to sign in with Google...");
      // When signing in, allow popup redirects
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      console.log("Successfully signed in with Google:", result.user.uid);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      // Provide more specific error information
      if (error.code === 'auth/popup-blocked') {
        console.error("Popup was blocked by the browser. Please allow popups for this site.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.error("Sign-in popup was closed before completing the sign-in.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.error("Multiple popup requests were triggered. Only the latest will be processed.");
      } else if (error.code === 'auth/network-request-failed') {
        console.error("Network error occurred during sign-in. Please check your connection.");
      }
    }
  };

  const signInAnonymouslyFn = async () => {
    try {
      // Only sign in anonymously if no current user
      if (!auth.currentUser) {
        console.log("Signing in anonymously...");
        await signInAnonymously(auth);
        console.log("Successfully signed in anonymously");
      }
    } catch (error) {
      console.error("Error signing in anonymously", error);
    }
  };

  const signOutUser = async () => {
    try {
      console.log("Signing out user...");
      await firebaseSignOut(auth);
      console.log("Successfully signed out");
      
      // After signing out, try to create a new anonymous account but don't fail if it doesn't work
      try {
        console.log("Attempting to create new anonymous account after sign out");
        await signInAnonymously(auth);
        console.log("Successfully created anonymous account after sign out");
      } catch (anonError: any) {
        console.error("Anonymous authentication failed after sign out:", anonError.code);
        console.log("User will remain unauthenticated, but app will still function");
      }
    } catch (error) {
      console.error("Error during sign out process", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signInWithGoogle, 
        signOut: signOutUser,
        signInAnonymously: signInAnonymouslyFn,
        isAnonymous 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
