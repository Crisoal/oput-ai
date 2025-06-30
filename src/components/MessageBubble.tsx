import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { ElevenLabsService } from '../lib/elevenlabs';

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLatest = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const isUser = message.role === 'user';

  const playAudio = async () => {
    if (isUser || audioError) return;

    try {
      setIsPlaying(true);
      const elevenlabs = new ElevenLabsService();
      const audioBuffer = await elevenlabs.textToSpeech(message.content);
      
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[80%] px-4 py-3 rounded-2xl backdrop-blur-sm
          ${isUser 
            ? 'bg-blue-500 text-white ml-4' 
            : 'bg-white/10 text-white mr-4 border border-white/20'
          }
        `}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown 
                className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          {!isUser && !audioError && (
            <button
              onClick={playAudio}
              disabled={isPlaying}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
              title="Play audio"
            >
              {isPlaying ? (
                <VolumeX className="w-4 h-4 text-white/70" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/70" />
              )}
            </button>
          )}
        </div>
        
        <div className="flex justify-end mt-1">
          <span className="text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};