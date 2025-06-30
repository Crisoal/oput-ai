import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceSettingsProps {
  autoPlay: boolean;
  onAutoPlayChange: (autoPlay: boolean) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  autoPlay,
  onAutoPlayChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/70 text-sm">Auto-play voice:</span>
      <button
        onClick={() => onAutoPlayChange(!autoPlay)}
        className={`
          flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
          ${autoPlay 
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
            : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
          }
        `}
      >
        {autoPlay ? (
          <>
            <Volume2 className="w-4 h-4" />
            <span>On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4" />
            <span>Off</span>
          </>
        )}
      </button>
    </div>
  );
};