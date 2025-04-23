import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { GENRES, DECADES, MOODS, WATCHING_WITH, MovieFilters } from '@/types/movie';

interface OnboardingProps {
  onComplete: (filters: MovieFilters) => void;
  onCancel: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<number>(0);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);
  const [selectedWatchingWith, setSelectedWatchingWith] = useState<string>('');
  
  const goNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      onComplete({
        mood: selectedMood,
        genres: selectedGenres,
        decades: selectedDecades,
        watchingWith: selectedWatchingWith,
      });
    }
  };
  
  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedMood;
      case 1: return selectedGenres.length > 0;
      case 2: return selectedDecades.length > 0;
      case 3: return !!selectedWatchingWith;
      default: return false;
    }
  };
  
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };
  
  // Store the direction we're moving in
  const [[page, direction], setPage] = useState([0, 0]);
  
  const setStepWithDirection = (newStep: number) => {
    const newDirection = newStep > step ? 1 : -1;
    setPage([newStep, newDirection]);
    setStep(newStep);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start pt-16 px-4 overflow-hidden">
        <div className="w-full max-w-md flex flex-col h-full">
          {/* Home button */}
          <div className="absolute top-4 left-4">
            <button
              className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700/70 transition-colors"
              onClick={onCancel}
              aria-label="Go back to home"
            >
              <Home size={20} />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {['Mood', 'Genres', 'Era', 'Company'].map((label, i) => (
                <span 
                  key={i}
                  className={`text-sm ${i === step ? 'text-purple-400 font-medium' : 'text-gray-400'}`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${(step + 1) * 25}%` }}
              />
            </div>
          </div>
          
          {/* Step content */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
                className="absolute inset-0"
              >
                {step === 0 && (
                  <div className="h-full flex flex-col">
                    <h2 className="text-2xl font-bold mb-6">How are you feeling today?</h2>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto hide-scrollbar">
                      {MOODS.map(mood => (
                        <button
                          key={mood.id}
                          className={`p-4 rounded-xl flex items-center gap-2 transition-colors ${
                            selectedMood === mood.id
                              ? 'bg-purple-700 border border-purple-400'
                              : 'bg-gray-800/60 hover:bg-gray-800/90 border border-gray-700'
                          }`}
                          onClick={() => setSelectedMood(mood.id)}
                        >
                          <span className="text-xl">{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {step === 1 && (
                  <div className="h-full flex flex-col">
                    <h2 className="text-2xl font-bold mb-6">What genres do you enjoy?</h2>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto hide-scrollbar">
                      {GENRES.map(genre => (
                        <button
                          key={genre.id}
                          className={`p-3 rounded-xl transition-colors ${
                            selectedGenres.includes(genre.id)
                              ? 'bg-purple-700 border border-purple-400'
                              : 'bg-gray-800/60 hover:bg-gray-800/90 border border-gray-700'
                          }`}
                          onClick={() => {
                            setSelectedGenres(prev => 
                              prev.includes(genre.id)
                                ? prev.filter(id => id !== genre.id)
                                : [...prev, genre.id]
                            );
                          }}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="h-full flex flex-col">
                    <h2 className="text-2xl font-bold mb-6">Which era are you in the mood for?</h2>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto hide-scrollbar">
                      {DECADES.map(decade => (
                        <button
                          key={decade}
                          className={`p-3 rounded-xl transition-colors ${
                            selectedDecades.includes(decade)
                              ? 'bg-purple-700 border border-purple-400'
                              : 'bg-gray-800/60 hover:bg-gray-800/90 border border-gray-700'
                          }`}
                          onClick={() => {
                            setSelectedDecades(prev => 
                              prev.includes(decade)
                                ? prev.filter(d => d !== decade)
                                : [...prev, decade]
                            );
                          }}
                        >
                          {decade}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="h-full flex flex-col">
                    <h2 className="text-2xl font-bold mb-6">Who are you watching with?</h2>
                    <div className="grid grid-cols-1 gap-3 overflow-y-auto hide-scrollbar">
                      {WATCHING_WITH.map(option => (
                        <button
                          key={option.id}
                          className={`p-4 rounded-xl flex items-center gap-3 transition-colors ${
                            selectedWatchingWith === option.id
                              ? 'bg-purple-700 border border-purple-400'
                              : 'bg-gray-800/60 hover:bg-gray-800/90 border border-gray-700'
                          }`}
                          onClick={() => setSelectedWatchingWith(option.id)}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-lg">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Fixed Navigation at the bottom */}
      <div className="bg-black/80 backdrop-blur-md border-t border-gray-800 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <button
            className={`p-3 rounded-full ${
              step === 0 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            onClick={goBack}
            disabled={step === 0}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              canProceed()
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 text-gray-300 cursor-not-allowed'
            }`}
            onClick={goNext}
            disabled={!canProceed()}
          >
            {step === 3 ? 'Find Movies' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 