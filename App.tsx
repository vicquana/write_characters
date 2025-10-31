
import React, { useState, useRef, useCallback } from 'react';
import { CharacterCanvas, CharacterCanvasRef } from './components/CharacterCanvas';
import { Controls } from './components/Controls';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { CharacterSelector } from './components/CharacterSelector';
import { evaluateCharacter } from './services/localEvaluationService';
import { PRACTICE_CHARACTERS } from './constants';
import { FeedbackResponse } from './types';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<CharacterCanvasRef>(null);

  const currentCharacter = PRACTICE_CHARACTERS[currentCharacterIndex];

  const resetStateForNewCharacter = useCallback(() => {
    setFeedback(null);
    setError(null);
    canvasRef.current?.clear();
  }, []);

  const handleSelectCharacter = (index: number) => {
    setCurrentCharacterIndex(index);
    resetStateForNewCharacter();
  };

  const handleNextCharacter = useCallback(() => {
    setCurrentCharacterIndex((prevIndex) => (prevIndex + 1) % PRACTICE_CHARACTERS.length);
    resetStateForNewCharacter();
  }, [resetStateForNewCharacter]);

  const handleSubmit = async () => {
    if (!canvasRef.current) return;

    const imageData = canvasRef.current.getImageData();
    if (!imageData) {
      setError("Please write the character before submitting.");
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const result = await evaluateCharacter(imageData, currentCharacter);
      setFeedback(result);
    } catch (err) {
      setError("Sorry, something went wrong while evaluating your character. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setFeedback(null);
    setError(null);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <header className="w-full max-w-2xl text-center mb-4 md:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">汉字练习</h1>
        <p className="text-lg sm:text-xl text-gray-300">Chinese Character Practice</p>
      </header>

      <main className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8 flex-grow">
        <div className="w-full max-w-md lg:max-w-xs bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-3 text-cyan-400 border-b border-gray-700 pb-2">Characters</h2>
            <CharacterSelector
              characters={PRACTICE_CHARACTERS}
              selectedIndex={currentCharacterIndex}
              onSelect={handleSelectCharacter}
            />
        </div>

        <div className="flex flex-col items-center w-full max-w-md">
          <div className="relative w-full aspect-square bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-4 border-2 border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[18rem] text-gray-700 font-serif opacity-50">{currentCharacter}</span>
            </div>
            <CharacterCanvas ref={canvasRef} key={currentCharacterIndex} />
          </div>

          <Controls
            onClear={handleClear}
            onUndo={handleUndo}
            onSubmit={handleSubmit}
            onNext={handleNextCharacter}
            isLoading={isLoading}
          />

          <div className="w-full mt-4 min-h-[100px]">
             {isLoading && (
              <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
                <Icon name="loader" className="animate-spin mr-3" />
                <span className="text-gray-300">Evaluating your writing...</span>
              </div>
            )}
            {error && (
               <div className="flex items-center p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                <Icon name="error" className="mr-3" />
                <span>{error}</span>
               </div>
            )}
            {feedback && <FeedbackDisplay feedback={feedback} targetCharacter={currentCharacter} />}
          </div>
        </div>
      </main>
      
      <footer className="w-full max-w-2xl text-center mt-6 text-gray-500 text-sm">
        <p>Powered by on-device handwriting heuristics</p>
      </footer>
    </div>
  );
};

export default App;
