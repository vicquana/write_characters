import React from 'react';

interface CharacterSelectorProps {
  characters: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  canSelectOtherCharacter: boolean;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  characters,
  selectedIndex,
  onSelect,
  canSelectOtherCharacter,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 overflow-y-auto">
      {characters.map((char, index) => {
        const isSelected = index === selectedIndex;
        const isDisabled = !canSelectOtherCharacter && !isSelected;
        return (
          <button
            key={`${char}-${index}`}
            onClick={() => onSelect(index)}
            disabled={isDisabled}
            title={isDisabled ? '需要獲得 70 分以上才能選擇其他字' : undefined}
            className={`
              aspect-square flex items-center justify-center
              text-3xl font-serif rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isSelected
                ? 'bg-cyan-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
            `}
          >
            {char}
          </button>
        );
      })}
    </div>
  );
};
