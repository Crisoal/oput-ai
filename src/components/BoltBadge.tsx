import React from 'react';

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'text';
  className?: string;
}

// Option 1: Try different Google Drive URL formats
export const BoltBadgeOption1: React.FC<BoltBadgeProps> = ({ 
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

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 ${
        variant === 'white' 
          ? 'bg-white hover:bg-gray-100' 
          : 'bg-black hover:bg-gray-900'
      } ${className}`}
      title="Built with Bolt.new"
    >
      <img
        src="https://lh3.googleusercontent.com/d/1NSb2PlpCwxZCwewmSqpIvmAiu4ZAHB55"
        alt="Bolt.new"
        className="w-6 h-6 object-contain"
        onError={(e) => {
          // Try the uc format if this fails
          const img = e.target as HTMLImageElement;
          if (img.src.includes('lh3.googleusercontent.com')) {
            img.src = 'https://drive.google.com/uc?export=view&id=1NSb2PlpCwxZCwewmSqpIvmAiu4ZAHB55';
          }
        }}
      />
    </button>
  );
};

// Option 2: Simple version with just SVG (guaranteed to work)
export const BoltBadgeSimple: React.FC<BoltBadgeProps> = ({ 
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

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 ${
        variant === 'white' 
          ? 'bg-white hover:bg-gray-100' 
          : 'bg-black hover:bg-gray-900'
      } ${className}`}
      title="Built with Bolt.new"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          fill={variant === 'white' ? '#000' : '#fff'}
        />
      </svg>
    </button>
  );
};

// Option 3: Base64 encoded image (if you can convert your image)
export const BoltBadgeBase64: React.FC<BoltBadgeProps> = ({ 
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

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-105 ${
        variant === 'white' 
          ? 'bg-white hover:bg-gray-100' 
          : 'bg-black hover:bg-gray-900'
      } ${className}`}
      title="Built with Bolt.new"
    >
      {/* Replace this with your base64 encoded image */}
      <img
        src="data:image/png;base64,YOUR_BASE64_STRING_HERE"
        alt="Bolt.new"
        className="w-6 h-6 object-contain"
      />
    </button>
  );
};