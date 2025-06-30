import React from 'react';

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'text';
  className?: string;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  variant = 'white', 
  className = '' 
}) => {
  const handleClick = () => {
    window.open('https://bolt.new/', '_blank');
  };

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        className={`text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 ${className}`}
      >
        Built with Bolt.new
      </button>
    );
  }

  // For white variant, use the actual image
  if (variant === 'white') {
    return (
      <button
        onClick={handleClick}
        className={`transition-all duration-200 hover:scale-105 ${className}`}
        title="Built with Bolt.new"
      >
        <img
          src="/white_circle_360x360.png"
          alt="Built with Bolt.new"
          className="w-10 h-10 rounded-full"
        />
      </button>
    );
  }

  // Keep the SVG for black variant (fallback)
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 bg-black text-white hover:bg-gray-900 ${className}`}
      title="Built with Bolt.new"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};