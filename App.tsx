import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CharacterCanvas, CharacterCanvasRef } from './components/CharacterCanvas';
import { Controls } from './components/Controls';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { CharacterSelector } from './components/CharacterSelector';
import { evaluateCharacter } from './services/localEvaluationService';
import { PRACTICE_CHARACTERS } from './constants';
import { FeedbackResponse } from './types';
import { Icon } from './components/Icon';
import { extractChineseCharactersFromImage } from './services/ocrService';

const App: React.FC = () => {
  const [characters, setCharacters] = useState<string[]>(PRACTICE_CHARACTERS);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const canvasRef = useRef<CharacterCanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pronunciationAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentCharacter = characters[currentCharacterIndex] ?? '';

  useEffect(() => {
    if (characters.length === 0) {
      setCurrentCharacterIndex(0);
      return;
    }

    if (currentCharacterIndex >= characters.length) {
      setCurrentCharacterIndex(characters.length - 1);
    }
  }, [characters, currentCharacterIndex]);

  const resetStateForNewCharacter = useCallback(() => {
    setFeedback(null);
    setError(null);
    setStatusMessage(null);
    canvasRef.current?.clear();
  }, []);

  const handleSelectCharacter = (index: number) => {
    setCurrentCharacterIndex(index);
    resetStateForNewCharacter();
  };

  const handleNextCharacter = useCallback(() => {
    if (characters.length === 0) return;
    setCurrentCharacterIndex((prevIndex) => (prevIndex + 1) % characters.length);
    resetStateForNewCharacter();
  }, [characters.length, resetStateForNewCharacter]);

  const handleSubmit = async () => {
    if (!canvasRef.current) return;

    const characterToEvaluate = currentCharacter;
    if (!characterToEvaluate) {
      setError('請先選擇要練習的字。');
      return;
    }

    const imageData = canvasRef.current.getImageData();
    if (!imageData) {
      setError('請先書寫漢字再提交。');
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    setError(null);
    setStatusMessage(null);

    try {
      const result = await evaluateCharacter(imageData, characterToEvaluate);
      setFeedback(result);
    } catch (err) {
      setError('評分時發生錯誤，請稍後再試。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setFeedback(null);
    setError(null);
    setStatusMessage(null);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handlePronounce = async () => {
    if (!currentCharacter) {
      return;
    }

    setError(null);

    try {
      if (pronunciationAudioRef.current) {
        pronunciationAudioRef.current.pause();
        pronunciationAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(
        `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(currentCharacter)}`
      );

      audio.onended = () => {
        if (pronunciationAudioRef.current === audio) {
          setStatusMessage(null);
        }
      };

      audio.onerror = () => {
        if (pronunciationAudioRef.current === audio) {
          setStatusMessage(null);
          setError('無法播放發音，請稍後再試。');
        }
      };

      pronunciationAudioRef.current = audio;
      setStatusMessage(`正在播放「${currentCharacter}」的發音。`);
      await audio.play();
    } catch (err) {
      console.error(err);
      pronunciationAudioRef.current = null;
      setStatusMessage(null);
      setError('無法播放發音，請稍後再試。');
    }
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsProcessingPhoto(true);
    setError(null);
    setStatusMessage(null);

    try {
      const extractedCharacters = await extractChineseCharactersFromImage(file);

      if (extractedCharacters.length === 0) {
        setStatusMessage(null);
        setError('未能識別任何漢字，請再試一次。');
        return;
      }

      let addedCount = 0;
      setCharacters((previous) => {
        const combined = Array.from(new Set([...previous, ...extractedCharacters]));
        addedCount = combined.length - previous.length;
        return combined;
      });

      if (addedCount > 0) {
        setStatusMessage(`已新增 ${addedCount} 個字到練習列表。`);
      } else {
        setStatusMessage('辨識完成，但沒有發現新的漢字。');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(null);
      setError('無法分析照片，請確認光線充足後重試。');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <header className="w-full max-w-2xl text-center mb-4 md:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">我愛寫國字</h1>
        <p className="text-lg sm:text-xl text-gray-300">Chinese Character Practice</p>
      </header>

      <main className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8 flex-grow">
        <div className="w-full max-w-md lg:max-w-xs bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-3 text-cyan-400 border-b border-gray-700 pb-2">練習字庫</h2>
          <CharacterSelector
            characters={characters}
            selectedIndex={currentCharacterIndex}
            onSelect={handleSelectCharacter}
          />
        </div>

        <div className="flex flex-col items-center w-full max-w-md">
          <div className="relative w-full aspect-square bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-4 border-2 border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[18rem] text-gray-700 font-serif opacity-50">{currentCharacter}</span>
            </div>
            <CharacterCanvas ref={canvasRef} key={`${currentCharacter}-${currentCharacterIndex}`} />
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              <button
                type="button"
                onClick={handlePronounce}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-sm font-semibold shadow"
              >
                <Icon name="sound" />
                發音
              </button>
              <button
                type="button"
                onClick={handlePhotoButtonClick}
                disabled={isProcessingPhoto}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 disabled:bg-indigo-800/60 disabled:text-indigo-200 text-white text-sm font-semibold shadow"
              >
                {isProcessingPhoto ? (
                  <>
                    <Icon name="loader" className="animate-spin" />
                    辨識中...
                  </>
                ) : (
                  <>
                    <Icon name="camera" />
                    拍照取字
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelected}
              />
            </div>
          </div>

          <Controls
            onClear={handleClear}
            onUndo={handleUndo}
            onSubmit={handleSubmit}
            onNext={handleNextCharacter}
            isLoading={isLoading}
          />

          <div className="w-full mt-4 min-h-[120px] space-y-3">
            {statusMessage && (
              <div className="flex items-center p-4 bg-emerald-900/40 border border-emerald-600 text-emerald-200 rounded-lg">
                <Icon name="check" className="mr-3" />
                <span>{statusMessage}</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
                <Icon name="loader" className="animate-spin mr-3" />
                <span className="text-gray-300">正在評分您的書寫...</span>
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
