import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceSettings } from './VoiceSettings';
import { Message, ConversationContext, UserProfile, Opportunity } from '../types';
import { GeminiService } from '../lib/gemini';
import { SupabaseService } from '../lib/supabaseService';
import { ElevenLabsService } from '../lib/elevenlabs';

interface ChatInterfaceProps {
  onOpportunitiesFound: (opportunities: Opportunity[]) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onOpportunitiesFound,
  messages,
  setMessages
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [context, setContext] = useState<ConversationContext>({
    current_stage: 'greeting',
    collected_info: {},
    last_query: '',
    opportunities_shown: []
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = new GeminiService();
  const supabaseService = new SupabaseService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractUserInfo = (conversation: Message[]): Partial<UserProfile> => {
    const info: Partial<UserProfile> = {};
    const conversationText = conversation.map(m => m.content).join(' ').toLowerCase();

    // Extract academic level
    if (conversationText.includes('phd') || conversationText.includes('doctoral')) {
      info.academic_level = 'phd';
    } else if (conversationText.includes('graduate') || conversationText.includes('master')) {
      info.academic_level = 'graduate';
    } else if (conversationText.includes('undergraduate') || conversationText.includes('bachelor')) {
      info.academic_level = 'undergraduate';
    }

    // Extract field of study
    const fields = ['computer science', 'engineering', 'medicine', 'business', 'physics', 'chemistry', 'biology', 'mathematics', 'artificial intelligence', 'machine learning'];
    for (const field of fields) {
      if (conversationText.includes(field)) {
        info.field_of_study = field;
        break;
      }
    }

    // Extract country preferences
    const countries = ['germany', 'united states', 'canada', 'united kingdom', 'australia', 'netherlands', 'sweden', 'france'];
    for (const country of countries) {
      if (conversationText.includes(country)) {
        info.country = country;
        break;
      }
    }

    // Extract GPA if mentioned
    const gpaMatch = conversationText.match(/gpa[:\s]*(\d+\.?\d*)/);
    if (gpaMatch) {
      info.current_gpa = parseFloat(gpaMatch[1]);
    }

    return info;
  };

  const searchOpportunities = async (userInfo: Partial<UserProfile>) => {
    try {
      const searchFilters: any = {};
      
      if (userInfo.academic_level) {
        searchFilters.level = userInfo.academic_level;
      }
      if (userInfo.field_of_study) {
        searchFilters.field = userInfo.field_of_study;
      }
      if (userInfo.country) {
        searchFilters.country = userInfo.country;
      }
      if (userInfo.current_gpa) {
        searchFilters.gpa_requirement = userInfo.current_gpa;
      }

      const opportunities = await supabaseService.searchOpportunities(searchFilters);
      
      // Calculate match scores and create matches
      const opportunitiesWithScores = opportunities.map(opp => {
        const matchScore = supabaseService.calculateMatchScore(userInfo as UserProfile, opp);
        return {
          ...opp,
          matchScore,
          action_items: supabaseService.generateActionItems(opp, userInfo),
        };
      });

      // Sort by match score and take top results
      const topOpportunities = opportunitiesWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 8);

      return topOpportunities;
    } catch (error) {
      console.error('Error searching opportunities:', error);
      return [];
    }
  };

  const shouldSearchForOpportunities = (content: string, userInfo: Partial<UserProfile>) => {
    const searchTriggers = [
      'find', 'search', 'show', 'recommend', 'suggest', 'look for',
      'scholarship', 'fellowship', 'grant', 'opportunity', 'funding'
    ];
    
    const hasSearchTrigger = searchTriggers.some(trigger => 
      content.toLowerCase().includes(trigger)
    );
    
    const hasMinimumInfo = userInfo.academic_level && userInfo.field_of_study;
    
    return hasSearchTrigger && hasMinimumInfo;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Stop all ongoing audio immediately when user sends a new message
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    ElevenLabsService.stopAllAudio();

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
      // Extract user information from conversation
      const updatedMessages = [...messages, userMessage];
      const userInfo = extractUserInfo(updatedMessages);
      
      // Update context
      const updatedContext = { 
        ...context, 
        last_query: content.trim(),
        collected_info: { ...context.collected_info, ...userInfo }
      };
      
      // Check if we should search for opportunities
      const shouldSearch = shouldSearchForOpportunities(content, userInfo);
      let opportunities: any[] = [];
      
      if (shouldSearch) {
        opportunities = await searchOpportunities(userInfo);
        
        if (opportunities.length > 0) {
          // Store opportunities in localStorage for persistence across tabs
          const storedOpportunities = JSON.parse(localStorage.getItem('oput_opportunities') || '[]');
          
          // Merge new opportunities with existing ones, avoiding duplicates
          const existingIds = new Set(storedOpportunities.map((opp: any) => opp.id));
          const newOpportunities = opportunities.filter(opp => !existingIds.has(opp.id));
          const allOpportunities = [...storedOpportunities, ...newOpportunities];
          
          // Store updated opportunities
          localStorage.setItem('oput_opportunities', JSON.stringify(allOpportunities));
          
          // Add opportunities to results immediately
          onOpportunitiesFound(allOpportunities);
          
          // Update context to include found opportunities
          updatedContext.opportunities_shown = opportunities.map(opp => opp.id);
          updatedContext.current_stage = 'results';
        }
      }
      
      // Generate AI response with context about found opportunities
      const contextForAI = {
        ...updatedContext,
        found_opportunities: opportunities.length > 0 ? {
          count: opportunities.length,
          top_matches: opportunities.slice(0, 3).map(opp => ({
            title: opp.title,
            institution: opp.institution,
            match_score: opp.matchScore,
            country: opp.country
          }))
        } : null
      };
      
      const response = await geminiService.generateResponse(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        contextForAI
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        canPlayAudio: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setContext(updatedContext);

    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or check your API configuration.',
        timestamp: new Date(),
        canPlayAudio: true,
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
      {/* Voice Settings */}
      <div className="p-4 border-b border-white/10 flex justify-end">
        <VoiceSettings
          autoPlay={autoPlayVoice}
          onAutoPlayChange={setAutoPlayVoice}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={message.id === messages[messages.length - 1]?.id}
              autoPlay={autoPlayVoice && message.role === 'assistant'}
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
                <span className="text-white/60 text-sm">Oput is thinking...</span>
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