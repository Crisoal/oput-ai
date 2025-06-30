import React from 'react';

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'text';
  className?: string;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({
  variant = 'white',
  className = '',
}) => {
  const handleClick = () => {
    window.open('https://bolt.new/', '_blank');
  };

  const imageSrc = {
    white: 'https://drive.google.com/uc?id=1NSb2PlpCwxZCwewmSqpIvmAiu4ZAHB55',
    black: 'https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/bolt-black-circle.png', // Replace with your own if needed
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
      className={`transition-all duration-200 hover:scale-105 ${className}`}
      title="Built with Bolt.new"
    >
      <img
        src={imageSrc[variant]}
        alt="Bolt.new Badge"
        className="w-10 h-10 object-contain"
      />
    </button>
  );
};
