import React, { useState } from 'react';

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'text';
  className?: string;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  variant = 'white', 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    window.open('https://bolt.new/', '_blank');
  };

  const handleImageError = () => {
    console.log('Bolt badge image failed to load, using SVG fallback');
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Bolt badge image loaded successfully');
    setImageLoaded(true);
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
      style={{ minWidth: '40px', minHeight: '40px' }} // Ensure visibility
    >
      {!imageError ? (
        <img
          src="https://drive.google.com/uc?export=view&id=1NSb2PlpCwxZCwewmSqpIvmAiu4ZAHB55"
          alt="Bolt.new"
          className="w-6 h-6 object-contain"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      ) : null}
      
      {/* SVG Fallback */}
      {(imageError || !imageLoaded) && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            fill={variant === 'white' ? '#000' : '#fff'}
          />
        </svg>
      )}
    </button>
  );
};