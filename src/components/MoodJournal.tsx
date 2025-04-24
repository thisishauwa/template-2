import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { Calendar, Heart, Film, Edit3, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../lib/hooks/useAuth';
import DOMPurify from 'dompurify';
import { useMoodJournal, MoodEntry } from '../lib/contexts/MoodJournalContext';

// Types for mood journal entries
// interface MoodEntry {
//   id: string;
//   date: string;
//   mood: string;
//   note: string;
//   films?: {
//     id: number;
//     title: string;
//     posterPath: string;
//   }[];
// }

interface MoodJournalProps {
  onViewMoodRecommendations: (mood: string) => void;
}

const ENTRIES_PER_PAGE = 5;

// Colors for different moods
const MOOD_COLORS: Record<string, string> = {
  wistful: '#8b5cf6',
  chaotic: '#ef4444',
  heartbroken: '#ec4899',
  hopeful: '#3b82f6',
  nostalgic: '#f59e0b',
  chill: '#10b981',
  romantic: '#f472b6', 
  adventurous: '#f97316',
  inspired: '#6366f1',
  reflective: '#8b5cf6',
};

const MoodJournal: React.FC<MoodJournalProps> = ({ onViewMoodRecommendations }) => {
  const { user } = useAuth();
  const { entries, loading: entriesLoading, addEntry, deleteEntry } = useMoodJournal();
  const [newEntry, setNewEntry] = useState<{ mood: string; note: string }>({
    mood: '',
    note: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoodEntries, setShowMoodEntries] = useState<string | null>(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'date' | 'mood'>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  // Chart related state
  const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, selectedMonth, selectedMoodFilter]);
  
  // Handle adding a new entry
  const handleAddEntry = () => {
    if (newEntry.mood) {
      addEntry({
        date: new Date().toISOString(),
        mood: newEntry.mood,
        note: newEntry.note,
        films: [],
      });
      
      setNewEntry({ mood: '', note: '' });
      setIsModalOpen(false);
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
  };

  // Get recommended films based on a specific mood
  const handleGetRecommendations = (mood: string) => {
    onViewMoodRecommendations(mood);
  };

  // Filter entries based on current filters
  const getFilteredEntries = () => {
    let filtered = [...entries];
    
    if (filterType === 'date' && selectedMonth) {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return !isBefore(entryDate, monthStart) && !isAfter(entryDate, monthEnd);
      });
    }
    
    if (filterType === 'mood' && selectedMoodFilter) {
      filtered = filtered.filter(entry => entry.mood === selectedMoodFilter);
    }
    
    return filtered;
  };
  
  // Group entries by mood (for the mood sections)
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
  
  // Pagination
  const filteredEntries = getFilteredEntries();
  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE, 
    currentPage * ENTRIES_PER_PAGE
  );
  
  // Get unique moods for filtering
  const uniqueMoods = Array.from(new Set(entries.map(entry => entry.mood)));
  
  // Prepare chart data
  const prepareChartData = () => {
    if (entries.length === 0) return [];
    
    let timeframeEntries = [...entries];
    const now = new Date();
    
    // Filter entries based on the selected timeframe
    if (chartTimeframe === 'week') {
      const weekAgo = subDays(now, 7);
      timeframeEntries = entries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return !isBefore(entryDate, weekAgo);
      });
    } else if (chartTimeframe === 'month') {
      const monthStart = startOfMonth(now);
      timeframeEntries = entries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return !isBefore(entryDate, monthStart);
      });
    }
    
    // Group by mood and count
    const moodCounts = timeframeEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array and sort
    return Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count, color: MOOD_COLORS[mood] || '#8b5cf6' }))
      .sort((a, b) => b.count - a.count);
  };
  
  const chartData = prepareChartData();
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 0;

  // Loading state
  if (entriesLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-4 font-britti-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your mood journal...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 font-britti-sans">
      <div className="max-w-3xl mx-auto">
        {/* Responsive header - Remove the button from here */}
        
        
        {/* Mood insights with chart */}
        <div className="mb-8 bg-gray-800/50 rounded-lg p-4 mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
            <h2 className="text-xl font-semibold">Your Mood Patterns</h2>
            
            {/* Optimized timeframe selector */}
            <div className="grid grid-cols-3 w-full sm:w-auto rounded-lg overflow-hidden border border-gray-700 text-sm">
              <button 
                className={`px-2 py-1.5 text-center ${chartTimeframe === 'week' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                onClick={() => setChartTimeframe('week')}
              >
                Week
              </button>
              <button 
                className={`px-2 py-1.5 text-center ${chartTimeframe === 'month' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                onClick={() => setChartTimeframe('month')}
              >
                Month
              </button>
              <button 
                className={`px-2 py-1.5 text-center ${chartTimeframe === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400'}`}
                onClick={() => setChartTimeframe('all')}
              >
                All
              </button>
            </div>
          </div>
          
          {entries.length === 0 ? (
            <p className="text-gray-400">Start logging your moods to see patterns emerge</p>
          ) : chartData.length === 0 ? (
            <p className="text-gray-400">No mood data available for the selected time period</p>
          ) : (
            <div>
              {/* Visual chart */}
              <div className="mb-4" ref={chartRef}>
                <div className="h-56 my-4 flex items-end gap-2 sm:gap-3">
                  {chartData.map(({ mood, count, color }) => (
                    <div key={mood} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className="w-full rounded-t-lg transition-all duration-500 flex flex-col-reverse"
                        style={{ 
                          height: `${(count / maxCount) * 100}%`, 
                          backgroundColor: color,
                          minHeight: '24px'
                        }}
                      >
                        <span className="text-xs text-center text-white font-bold py-1">
                          {count}
                        </span>
                      </div>
                      <div className="w-full text-center">
                        <span className="text-xs capitalize truncate block">
  {String(mood).replace(/&/g, '&').replace(/</g, '<')}
</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Removed mood chips here */}
              
              <p className="text-sm text-gray-400">
                Based on your journal, you&apos;ve most frequently felt{' '}
                <button 
                  onClick={() => moodFrequency[0]?.mood && handleGetRecommendations(moodFrequency[0].mood)}
                  className="text-primary-light font-medium hover:underline focus:outline-none"
                >
                  {moodFrequency[0]?.mood || 'n/a'}
                </button>{' '}
                lately. We can recommend films that match or help shift this mood.
              </p>
            </div>
          )}
        </div>
        
        {/* Journal entries with filtering and pagination */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Mood History</h2>
            
            {entries.length > 0 && (
              <button 
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors bg-gray-800/50 px-3 py-1.5 rounded-lg"
              >
                <Filter size={16} />
                <span>Filter</span>
              </button>
            )}
          </div>
          
          {/* Filter options */}
          {showFilterOptions && (
            <div className="mb-4 p-4 bg-gray-800/80 rounded-lg">
              <div className="flex flex-wrap gap-3 mb-3">
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm ${filterType === 'all' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setFilterType('all')}
                >
                  All Entries
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm ${filterType === 'date' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setFilterType('date')}
                >
                  By Month
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm ${filterType === 'mood' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setFilterType('mood')}
                >
                  By Mood
                </button>
              </div>
              
              {filterType === 'date' && (
                <div className="flex items-center gap-2">
                  <button 
                    className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="font-medium">
                      {format(selectedMonth, 'MMMM yyyy')}
                    </span>
                  </div>
                  <button 
                    className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              
              {filterType === 'mood' && (
                <div className="flex flex-wrap gap-2">
                  {uniqueMoods.map(mood => (
                    <button
                      key={mood}
                      className={`px-3 py-1 rounded-md text-sm ${
                        selectedMoodFilter === mood 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedMoodFilter(mood === selectedMoodFilter ? null : mood)}
                    >
                   {String(mood).replace(/&/g, '&').replace(/</g, '<')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {entries.length === 0 ? (
            <p className="text-gray-400">No entries yet. Start by recording todays mood!</p>
          ) : currentEntries.length === 0 ? (
            <div className="p-8 text-center bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">No entries match your current filters.</p>
              <button
                className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                onClick={() => {
                  setFilterType('all');
                  setSelectedMoodFilter(null);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* List view of filtered entries */}
              {filterType !== 'all' && (
                <div className="space-y-3">
                  {currentEntries.map(entry => (
                    <div key={entry.id} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-primary/20 text-primary-light rounded capitalize text-sm">
  {String(entry.mood).replace(/&/g, '&').replace(/</g, '<')}
</span>
                          <span className="text-gray-400 text-sm flex items-center">
                            <CalendarIcon size={14} className="mr-1" />
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <button
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          onClick={() => handleDeleteEntry(entry.id)}
                          aria-label="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {entry.note && <p className="text-gray-300 mt-2">{String(entry.note).replace(/&/g, '&').replace(/</g, '<')}</p>}
                      
                      {entry.films && entry.films.length > 0 && (
                        <div className="mt-3 border-t border-gray-700 pt-3">
                          <div className="text-sm text-gray-400 flex items-center mb-2">
                            <Film size={14} className="mr-1" />
                            <span>Films watched</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {entry.films.map(film => (
                              <div key={film.id} className="bg-gray-700/50 px-2 py-1 rounded text-xs">
                                {String(film.title).replace(/&/g, '&').replace(/</g, '<')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Traditional grouped by mood view */}
              {filterType === 'all' && (
                Object.entries(entriesByMood).map(([mood, moodEntries]) => (
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
                            
                            {entry.note && <p className="text-gray-300 mb-3">{String(entry.note).replace(/&/g, '&').replace(/</g, '<')}</p>}
                            
                            {entry.films && entry.films.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm text-gray-400 flex items-center mb-2">
                                  <Film size={14} className="mr-1" />
                                  <span>Films watched</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {entry.films.map(film => (
                                    <div key={film.id} className="bg-gray-700/50 px-2 py-1 rounded text-xs">
                                      {String(film.title).replace(/&/g, '&').replace(/</g, '<')}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1 
                        ? 'bg-gray-800 text-gray-600' 
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages 
                        ? 'bg-gray-800 text-gray-600' 
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Mood Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">How are you feeling today?</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2 text-sm">Mood</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                    {['wistful', 'chaotic', 'heartbroken', 'hopeful', 'nostalgic', 'chill', 'romantic', 'adventurous', 'inspired', 'reflective'].map(mood => (
                      <button
                        key={mood}
                        className={`py-2 px-3 rounded-lg capitalize transition-colors text-sm whitespace-normal h-auto min-h-[40px] ${
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
                
                <div className="mb-5">
                  <label className="block text-gray-400 mb-2 text-sm">Note (optional)</label>
                  <textarea
                    className="w-full bg-gray-700/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    value={newEntry.note}
                    onChange={e => setNewEntry({ ...newEntry, note: e.target.value })}
                    placeholder="What&apos;s on your mind today?"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    className="flex-1 bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={handleAddEntry}
                    disabled={!newEntry.mood}
                  >
                    Save Entry
                  </button>
                  <button
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewEntry({ mood: '', note: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Record today&apos;s mood"
      >
        <Edit3 size={24} />
      </button>
    </div>
  );
};

export default MoodJournal; 