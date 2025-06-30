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

  // Use the white circle badge image from your Google Drive link
  const badgeImage = 'https://drive.google.com/uc?export=download&id=1NSb2PlpCwxZCwewmSqpIvmAiu4ZAHB55';

  return (
    <a
      href="https://bolt.new/"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-all duration-200 hover:scale-105 ${className}`}
      title="Built with Bolt.new"
    >
      <img
        src={badgeImage}
        alt="Built with Bolt.new"
        className={`w-10 h-10 object-contain ${
          variant === 'white' ? 'bg-transparent' : 'bg-transparent'
        }`}
      />
    </a>
  );
};