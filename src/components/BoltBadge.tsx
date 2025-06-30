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

  const imageSrcs = {
    white: 'https://drive.google.com/uc?export=view&id=1jhrXZgOTIVq9g1xNTibuQmJwe5QTqmqO',
    black: 'https://github.com/kickiniteasy/bolt-hackathon-badge/raw/main/bolt-black-circle.png',
    text: '' // will not use image for text variant
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
      className={`w-12 h-12 p-1 rounded-full transition-transform duration-200 hover:scale-105 ${className}`}
      title="Built with Bolt.new"
    >
      <img
        src={imageSrcs[variant]}
        alt="Bolt.new Badge"
        className="w-full h-full object-contain"
      />
    </button>
  );
};
