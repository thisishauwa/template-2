import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Heart, Film, Edit3, Trash2 } from 'lucide-react';

// Types for mood journal entries
interface MoodEntry {
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

interface MoodJournalProps {
  onViewMoodRecommendations: (mood: string) => void;
}

const MoodJournal: React.FC<MoodJournalProps> = ({ onViewMoodRecommendations }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [newEntry, setNewEntry] = useState<{ mood: string; note: string }>({
    mood: '',
    note: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [showMoodEntries, setShowMoodEntries] = useState<string | null>(null);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodJournalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage when they change
  useEffect(() => {
    localStorage.setItem('moodJournalEntries', JSON.stringify(entries));
  }, [entries]);

  // Handle adding a new entry
  const handleAddEntry = () => {
    if (newEntry.mood) {
      const entry: MoodEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mood: newEntry.mood,
        note: newEntry.note,
        films: [],
      };
      
      setEntries([entry, ...entries]);
      setNewEntry({ mood: '', note: '' });
      setIsAdding(false);
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Get recommended films based on a specific mood
  const handleGetRecommendations = (mood: string) => {
    onViewMoodRecommendations(mood);
  };

  // Group entries by mood
  const entriesByMood = entries.reduce((acc, entry) => {
    if (!acc[entry.mood]) {
      acc[entry.mood] = [];
    }
    acc[entry.mood].push(entry);
    return acc;
  }, {} as Record<string, MoodEntry[]>);

  // Calculate most frequent moods
  const moodFrequency = Object.entries(entriesByMood).map(([mood, entries]) => ({
    mood,
    count: entries.length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 font-britti-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Heart className="mr-2 text-accent" size={28} />
          Mood Journal
        </h1>
        
        {/* Mood insights */}
        <div className="mb-8 bg-gray-800/50 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Your Mood Patterns</h2>
          
          {entries.length === 0 ? (
            <p className="text-gray-400">Start logging your moods to see patterns emerge</p>
          ) : (
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {moodFrequency.slice(0, 3).map(({ mood, count }) => (
                  <div key={mood} className="bg-gray-700/50 px-3 py-2 rounded-lg flex items-center">
                    <span className="font-medium text-primary-light">{mood}</span>
                    <span className="text-sm text-gray-400 ml-2">({count})</span>
                    <button 
                      className="ml-3 text-xs bg-primary/20 text-primary-light px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                      onClick={() => handleGetRecommendations(mood)}
                    >
                      Get Films
                    </button>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-400">
                Based on your journal, you've most frequently felt{' '}
                <span className="text-primary-light font-medium">
                  {moodFrequency[0]?.mood || 'n/a'}
                </span>{' '}
                lately. We can recommend films that match or help shift this mood.
              </p>
            </div>
          )}
        </div>
        
        {/* Add new entry button */}
        {!isAdding ? (
          <button
            className="mb-6 bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            onClick={() => setIsAdding(true)}
          >
            <Edit3 size={18} className="mr-2" />
            Record Today's Mood
          </button>
        ) : (
          <div className="mb-6 bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">How are you feeling today?</h3>
            
            <div className="mb-3">
              <label className="block text-gray-400 mb-1 text-sm">Mood</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['wistful', 'chaotic', 'heartbroken', 'hopeful', 'nostalgic', 'chill', 'romantic', 'adventurous', 'inspired', 'reflective'].map(mood => (
                  <button
                    key={mood}
                    className={`py-2 px-3 rounded-lg capitalize transition-colors ${
                      newEntry.mood === mood 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setNewEntry({ ...newEntry, mood })}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-1 text-sm">Note (optional)</label>
              <textarea
                className="w-full bg-gray-700/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={newEntry.note}
                onChange={e => setNewEntry({ ...newEntry, note: e.target.value })}
                placeholder="What's on your mind today?"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                className="flex-1 bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={handleAddEntry}
              >
                Save Entry
              </button>
              <button
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                onClick={() => {
                  setIsAdding(false);
                  setNewEntry({ mood: '', note: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Journal entries by mood */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Your Mood History</h2>
          
          {entries.length === 0 ? (
            <p className="text-gray-400">No entries yet. Start by recording today's mood!</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(entriesByMood).map(([mood, moodEntries]) => (
                <div key={mood} className="bg-gray-800/50 rounded-lg overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center justify-between"
                    onClick={() => setShowMoodEntries(showMoodEntries === mood ? null : mood)}
                  >
                    <div className="flex items-center">
                      <span className="text-lg font-medium capitalize">{mood}</span>
                      <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">
                        {moodEntries.length}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        showMoodEntries === mood ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {showMoodEntries === mood && (
                    <div className="border-t border-gray-700 divide-y divide-gray-700">
                      {moodEntries.map(entry => (
                        <div key={entry.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-gray-400 text-sm">
                              <Calendar size={14} className="mr-1" />
                              {format(new Date(entry.date), 'MMM d, yyyy')}
                            </div>
                            <button
                              className="text-gray-500 hover:text-red-400 transition-colors"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {entry.note && <p className="text-gray-300 mb-3">{entry.note}</p>}
                          
                          {entry.films && entry.films.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-400 flex items-center mb-2">
                                <Film size={14} className="mr-1" />
                                Films watched:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {entry.films.map(film => (
                                  <div key={film.id} className="bg-gray-700/50 rounded px-2 py-1 text-sm">
                                    {film.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <button
                            className="mt-3 text-xs bg-primary/20 text-primary-light px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                            onClick={() => handleGetRecommendations(entry.mood)}
                          >
                            Find similar films
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodJournal; 