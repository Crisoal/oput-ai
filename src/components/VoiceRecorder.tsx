import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscript, 
  disabled = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsProcessing(true);
    }
  };

  return (
    <motion.button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      className={`
        relative flex items-center justify-center w-12 h-12 rounded-full
        transition-all duration-200 hover:scale-105 disabled:opacity-50
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
        }
      `}
      whileTap={{ scale: 0.95 }}
      animate={isRecording ? { 
        boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.2)' 
      } : {}}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-white" />
      )}
      
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-300"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  );
};