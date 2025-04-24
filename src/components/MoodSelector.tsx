import React from 'react';
import { motion } from 'framer-motion';

interface MoodOption {
  id: string;
  label: string;
  icon?: string;
}

interface MoodSelectorProps {
  moods: MoodOption[];
  selectedMood: string | null;
  onMoodSelect: (moodId: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  moods,
  selectedMood,
  onMoodSelect,
}) => {
  return (
    <div className="w-full py-4 font-britti-sans">
      <h2 className="text-xl font-semibold mb-4 text-white">How are you feeling today?</h2>
      
      {/* Scrollable container for mood options */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex flex-wrap gap-3 min-w-max">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              className={`px-4 py-3 rounded-xl text-base flex items-center transition-colors ${
                selectedMood === mood.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/80'
              }`}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {mood.icon && <span className="mr-2 text-lg">{mood.icon}</span>}
              <span className="font-medium capitalize">{String(mood.label).replace(/&/g, '&').replace(/</g, '<')}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Selected mood description */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-gray-800/50 rounded-lg text-gray-300"
        >
          <div className="text-sm">
            {selectedMood === 'wistful' && (
              <p>Movies that evoke gentle nostalgia and contemplation</p>
            )}
            {selectedMood === 'chaotic' && (
              <p>High-energy films with unpredictable twists and turns</p>
            )}
            {selectedMood === 'heartbroken' && (
              <p>Emotional stories about love, loss, and healing</p>
            )}
            {selectedMood === 'hopeful' && (
              <p>Inspiring stories that leave you feeling optimistic</p>
            )}
            {selectedMood === 'nostalgic' && (
              <p>Films that transport you back to cherished times</p>
            )}
            {selectedMood === 'chill' && (
              <p>Easy-watching films that don&apos;t demand too much emotional energy</p>
            )}
            {selectedMood === 'romantic' && (
              <p>Love stories that make your heart flutter</p>
            )}
            {selectedMood === 'adventurous' && (
              <p>Thrilling journeys and quests to faraway places</p>
            )}
            {selectedMood === 'inspired' && (
              <p>True stories of achievement and perseverance</p>
            )}
            {selectedMood === 'reflective' && (
              <p>Thought-provoking films that stay with you long after watching</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MoodSelector; 