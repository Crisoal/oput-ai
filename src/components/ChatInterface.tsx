import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { VoiceRecorder } from './VoiceRecorder';
import { Message, ConversationContext } from '../types';
import { GeminiService } from '../lib/gemini';

interface ChatInterfaceProps {
  onOpportunitiesFound: (opportunities: any[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpportunitiesFound }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Oput, your AI assistant for discovering educational opportunities. I'll help you find scholarships, grants, and fellowships that match your profile perfectly.\n\nTo get started, could you tell me about your current academic level and field of study?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    current_stage: 'greeting',
    collected_info: {},
    last_query: '',
    opportunities_shown: []
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = new GeminiService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Update context based on user input
      const updatedContext = { ...context, last_query: content.trim() };
      
      // Generate AI response
      const response = await geminiService.generateResponse(
        [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
        updatedContext
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setContext(updatedContext);

      // Mock opportunity matching logic
      if (content.toLowerCase().includes('phd') || 
          content.toLowerCase().includes('scholarship') || 
          content.toLowerCase().includes('funding')) {
        // Simulate finding opportunities
        setTimeout(() => {
          const mockOpportunities = [
            {
              id: '1',
              title: 'NSF Graduate Research Fellowship',
              institution: 'National Science Foundation',
              type: 'fellowship',
              field: 'Computer Science',
              level: 'graduate',
              country: 'United States',
              deadline: '2024-12-15',
              funding_amount: 37000,
              description: 'The NSF Graduate Research Fellowship Program supports outstanding graduate students in NSF-supported STEM disciplines.',
              application_url: 'https://www.nsfgrfp.org/',
              requirements: ['US Citizen', 'GPA 3.5+', 'STEM Field'],
              eligibility_criteria: ['Graduate student', 'Research proposal'],
              created_at: '2024-01-01'
            },
            {
              id: '2',
              title: 'Fulbright Student Program',
              institution: 'U.S. Department of State',
              type: 'scholarship',
              field: 'Various',
              level: 'graduate',
              country: 'Various',
              deadline: '2024-10-10',
              funding_amount: 25000,
              description: 'The Fulbright Student Program provides grants for U.S. graduating seniors, graduate students, and young professionals.',
              application_url: 'https://us.fulbrightonline.org/',
              requirements: ['US Citizen', 'Bachelor\'s degree', 'Language skills'],
              eligibility_criteria: ['Study abroad', 'Cultural exchange'],
              created_at: '2024-01-01'
            }
          ];
          onOpportunitiesFound(mockOpportunities);
        }, 1500);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or check your API configuration.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={message.id === messages[messages.length - 1]?.id}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 mr-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-white/60 text-sm">Oput is typing...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about scholarships, grants, or fellowships..."
              className="w-full bg-transparent text-white placeholder-white/50 resize-none outline-none text-sm leading-relaxed"
              rows={1}
              style={{ minHeight: '20px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />
          
          <motion.button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};