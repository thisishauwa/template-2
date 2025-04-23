"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

// Types for mood journal entries
export interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  note: string;
  films?: {
    id: number;
    title: string;
    posterPath: string;
  }[];
}

interface MoodJournalContextType {
  entries: MoodEntry[];
  loading: boolean;
  error: string | null;
  addEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<Omit<MoodEntry, 'id'>>) => void;
  deleteEntry: (id: string) => void;
}

const MoodJournalContext = createContext<MoodJournalContextType | undefined>(undefined);

// Use a consistent key for localStorage
const MOOD_JOURNAL_STORAGE_KEY = 'moodJournalEntries';

export const MoodJournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAnonymous } = useAuth();

  // Load entries from Firestore (if logged in) or localStorage on initial render
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timed out, using fallback data');
        setLoading(false);
        
        // Try to load from localStorage as fallback
        try {
          const savedEntries = localStorage.getItem(MOOD_JOURNAL_STORAGE_KEY);
          if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
          }
        } catch (error) {
          console.error('Failed to load fallback data:', error);
        }
      }
    }, 5000); // 5 second timeout
    
    const loadEntries = async () => {
      setLoading(true);
      try {
        // Force simplification for development - always use localStorage for now
        // This helps prevent the infinite loading issue
        console.log('Using localStorage for development');
        const savedEntries = localStorage.getItem(MOOD_JOURNAL_STORAGE_KEY);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
        setLoading(false);
        
        /* Temporarily disabled Firestore loading while debugging
        if (user && !isAnonymous) {
          // User is authenticated, set up real-time listener for Firestore
          console.log('Setting up Firestore listener for mood journal');
          
          const userJournalRef = doc(db, 'moodJournals', user.uid);
          unsubscribeFirestore = onSnapshot(userJournalRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              console.log(`Loaded ${data.entries?.length || 0} journal entries from Firestore`);
              if (data.entries && Array.isArray(data.entries)) {
                setEntries(data.entries);
                // Also update localStorage as a backup
                localStorage.setItem(MOOD_JOURNAL_STORAGE_KEY, JSON.stringify(data.entries));
              }
            } else {
              // New user, check if we have local entries to migrate
              const savedEntries = localStorage.getItem(MOOD_JOURNAL_STORAGE_KEY);
              if (savedEntries) {
                const parsedEntries = JSON.parse(savedEntries);
                console.log(`Migrating ${parsedEntries.length} journal entries from localStorage to Firestore`);
                setEntries(parsedEntries);
                
                // Save to Firestore
                setDoc(userJournalRef, { entries: parsedEntries }).catch(err => {
                  console.error('Error migrating journal entries to Firestore:', err);
                });
              }
            }
            setLoading(false);
          });
        } else {
          // Not authenticated or anonymous user, use localStorage
          console.log('Loading journal entries from localStorage');
          const savedEntries = localStorage.getItem(MOOD_JOURNAL_STORAGE_KEY);
          if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
          }
          setLoading(false);
        }
        */
      } catch (error) {
        console.error('Error loading journal entries:', error);
        // Fallback to localStorage if Firebase fails
        const savedEntries = localStorage.getItem(MOOD_JOURNAL_STORAGE_KEY);
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
        setError('Failed to load journal entries');
        setLoading(false);
      }
    };
    
    // Load the entries when the component mounts or auth state changes
    loadEntries();
    
    // Clean up subscriptions when unmounting or auth state changes
    return () => {
      clearTimeout(loadingTimeout);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user, isAnonymous]);

  // Save entries to localStorage whenever they change (as a backup)
  useEffect(() => {
    if (entries.length > 0) {
      try {
        localStorage.setItem(MOOD_JOURNAL_STORAGE_KEY, JSON.stringify(entries));
        console.log(`Saved ${entries.length} journal entries to localStorage`);
      } catch (error) {
        console.error('Error saving journal entries to localStorage:', error);
      }
    }
  }, [entries]);

  // Add a new entry
  const addEntry = (entryData: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: Date.now().toString(),
    };
    
    setEntries(prev => {
      const newEntries = [newEntry, ...prev];
      
      // Save to Firestore if user is authenticated (temporarily disabled)
      /*
      if (user && !isAnonymous) {
        const userJournalRef = doc(db, 'moodJournals', user.uid);
        setDoc(userJournalRef, { entries: newEntries }).catch(err => {
          console.error('Error saving journal entries to Firestore:', err);
        });
      }
      */
      
      // Always save to localStorage
      localStorage.setItem(MOOD_JOURNAL_STORAGE_KEY, JSON.stringify(newEntries));
      
      return newEntries;
    });
  };

  // Update an existing entry
  const updateEntry = (id: string, updates: Partial<Omit<MoodEntry, 'id'>>) => {
    setEntries(prev => {
      const updatedEntries = prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      );
      
      // Save to Firestore if user is authenticated (temporarily disabled)
      /*
      if (user && !isAnonymous) {
        const userJournalRef = doc(db, 'moodJournals', user.uid);
        setDoc(userJournalRef, { entries: updatedEntries }).catch(err => {
          console.error('Error saving journal entries to Firestore:', err);
        });
      }
      */
      
      // Always save to localStorage
      localStorage.setItem(MOOD_JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
      
      return updatedEntries;
    });
  };

  // Delete an entry
  const deleteEntry = (id: string) => {
    setEntries(prev => {
      const filteredEntries = prev.filter(entry => entry.id !== id);
      
      // Save to Firestore if user is authenticated (temporarily disabled)
      /*
      if (user && !isAnonymous) {
        const userJournalRef = doc(db, 'moodJournals', user.uid);
        setDoc(userJournalRef, { entries: filteredEntries }).catch(err => {
          console.error('Error saving journal entries to Firestore:', err);
        });
      }
      */
      
      // Always save to localStorage
      localStorage.setItem(MOOD_JOURNAL_STORAGE_KEY, JSON.stringify(filteredEntries));
      
      return filteredEntries;
    });
  };

  return (
    <MoodJournalContext.Provider
      value={{
        entries,
        loading,
        error,
        addEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </MoodJournalContext.Provider>
  );
};

export const useMoodJournal = () => {
  const context = useContext(MoodJournalContext);
  if (context === undefined) {
    throw new Error('useMoodJournal must be used within a MoodJournalProvider');
  }
  return context;
}; 