import React from 'react';

type IconName = 'clear' | 'undo' | 'submit' | 'next' | 'loader' | 'error' | 'check' | 'cross';

interface IconProps {
  name: IconName;
  className?: string;
}

// FIX: Replaced JSX.Element with React.ReactNode to fix "Cannot find namespace 'JSX'" error.
const iconPaths: Record<IconName, React.ReactNode> = {
  clear: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75L19.25 12L12 19.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.5 12H4.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.25 19.25L4.75 4.75" /></>,
  undo: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.25 4.75L4.75 10L10.25 15.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10H19.25C19.25 10 19.25 15.25 13.75 15.25" /></>,
  submit: <path strokeLinecap="round" strokeLinejoin="round" d="M5.75 12.75L10.25 17.25L18.25 9.25" />,
  next: <><path strokeLinecap="round" strokeLinejoin="round" d="M13.75 6.75L18.25 12L13.75 17.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.5 12H5.75" /></>,
  loader: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75V6.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.1266 6.87347L16.0659 7.93413" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.25 12H17.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.1266 17.1265L16.0659 16.0659" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.25V17.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.87341 17.1265L7.93407 16.0659" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.75 12H6.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.87341 6.87347L7.93407 7.93413" /></>,
  error: <><circle cx="12" cy="12" r="7.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12V9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.01V15" /></>,
  check: <path strokeLinecap="round" strokeLinejoin="round" d="M5.75 12.75L10.25 17.25L18.25 9.25" />,
  cross: <><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L6.75 17.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75L17.25 17.25" /></>,
};

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {iconPaths[name]}
    </svg>
  );
};