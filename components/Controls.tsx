import React from 'react';
import { Icon } from './Icon';

interface ControlsProps {
  onClear: () => void;
  onUndo: () => void;
  onSubmit: () => void;
  onNext: () => void;
  isLoading: boolean;
}

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export const Controls: React.FC<ControlsProps> = ({ onClear, onUndo, onSubmit, onNext, isLoading }) => {
  return (
    <div className="w-full grid grid-cols-2 grid-rows-2 gap-3">
      <ControlButton
        onClick={onClear}
        disabled={isLoading}
        className="bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500"
      >
        <Icon name="clear" />
        清除
      </ControlButton>
      <ControlButton
        onClick={onUndo}
        disabled={isLoading}
        className="bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500"
      >
        <Icon name="undo" />
        上一步
      </ControlButton>
      <ControlButton
        onClick={onSubmit}
        disabled={isLoading}
        className="col-span-2 bg-cyan-600 hover:bg-cyan-500 text-white focus:ring-cyan-400 text-lg"
      >
        {isLoading ? (
          <>
            <Icon name="loader" className="animate-spin" />
            提交中...
          </>
        ) : (
          <>
            <Icon name="submit" />
            提交
          </>
        )}
      </ControlButton>
      <ControlButton
        onClick={onNext}
        disabled={isLoading}
        className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-400"
      >
        下一個字
        <Icon name="next" />
      </ControlButton>
    </div>
  );
};
