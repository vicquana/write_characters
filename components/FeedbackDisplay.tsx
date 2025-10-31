
import React from 'react';
import { FeedbackResponse } from '../types';
import { Icon } from './Icon';

interface FeedbackDisplayProps {
  feedback: FeedbackResponse;
  targetCharacter: string;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, targetCharacter }) => {
  const isCorrectCharacter = feedback.isCorrect && feedback.identifiedCharacter === targetCharacter;
  const scoreColor = feedback.score >= 80 ? 'text-green-400' : feedback.score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const bgColor = isCorrectCharacter ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700';
  const textColor = isCorrectCharacter ? 'text-green-300' : 'text-red-300';

  return (
    <div className={`w-full p-4 rounded-lg border transition-all duration-300 ${bgColor}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left">
          <div className={`flex items-center gap-2 ${textColor}`}>
            {isCorrectCharacter ? <Icon name="check" /> : <Icon name="cross" />}
            <h3 className="text-lg font-bold">
              {isCorrectCharacter ? "Correct!" : "Needs Improvement"}
            </h3>
          </div>
          <p className="text-gray-300 mt-1">{feedback.feedback}</p>
          {!isCorrectCharacter && (
            <p className="text-sm text-gray-400 mt-1">
              You were practicing "{targetCharacter}", but it looks like you wrote "{feedback.identifiedCharacter}".
            </p>
          )}
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-gray-900/50">
          <span className="text-sm font-medium text-gray-400">Score</span>
          <span className={`text-4xl font-bold ${scoreColor}`}>{feedback.score}</span>
        </div>
      </div>
    </div>
  );
};
