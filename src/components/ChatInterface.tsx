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
  const [hasProvidedOpportunities, setHasProvidedOpportunities] = useState(false);
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
    if (conversationText.includes('phd') || conversationText.includes('doctoral') || conversationText.includes('doctorate')) {
      info.academic_level = 'phd';
    } else if (conversationText.includes('graduate') || conversationText.includes('master') || conversationText.includes('masters')) {
      info.academic_level = 'graduate';
    } else if (conversationText.includes('undergraduate') || conversationText.includes('bachelor') || conversationText.includes('bachelors')) {
      info.academic_level = 'undergraduate';
    }

    // Extract field of study - more comprehensive
    const fieldMappings = {
      'computer science': ['computer science', 'cs', 'computing', 'software engineering', 'software development'],
      'cybersecurity': ['cybersecurity', 'cyber security', 'information security', 'network security'],
      'engineering': ['engineering', 'mechanical engineering', 'electrical engineering', 'civil engineering'],
      'medicine': ['medicine', 'medical', 'healthcare', 'health sciences', 'biomedical'],
      'business': ['business', 'management', 'mba', 'finance', 'marketing', 'economics'],
      'physics': ['physics', 'theoretical physics', 'applied physics'],
      'chemistry': ['chemistry', 'biochemistry', 'chemical engineering'],
      'biology': ['biology', 'life sciences', 'biotechnology', 'molecular biology'],
      'mathematics': ['mathematics', 'math', 'statistics', 'applied mathematics'],
      'artificial intelligence': ['artificial intelligence', 'ai', 'machine learning', 'ml', 'data science'],
    };

    for (const [field, keywords] of Object.entries(fieldMappings)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        info.field_of_study = field;
        break;
      }
    }

    // Extract citizenship/nationality - more comprehensive
    const citizenshipMappings = {
      'Nigeria': ['nigerian', 'nigeria', 'from nigeria'],
      'United States': ['american', 'usa', 'us citizen', 'united states', 'from america'],
      'Canada': ['canadian', 'canada', 'from canada'],
      'United Kingdom': ['british', 'uk', 'united kingdom', 'from uk', 'from britain'],
      'Germany': ['german', 'germany', 'from germany'],
      'Australia': ['australian', 'australia', 'from australia'],
      'India': ['indian', 'india', 'from india'],
      'Ghana': ['ghanaian', 'ghana', 'from ghana'],
      'Kenya': ['kenyan', 'kenya', 'from kenya'],
      'South Africa': ['south african', 'south africa', 'from south africa'],
    };

    for (const [country, keywords] of Object.entries(citizenshipMappings)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        info.citizenship = country;
        break;
      }
    }

    // Extract country preferences
    const countryPreferences = {
      'Germany': ['germany', 'german universities'],
      'United States': ['united states', 'usa', 'america', 'us universities'],
      'Canada': ['canada', 'canadian universities'],
      'United Kingdom': ['united kingdom', 'uk', 'britain', 'british universities'],
      'Australia': ['australia', 'australian universities'],
      'Netherlands': ['netherlands', 'holland'],
      'Sweden': ['sweden', 'swedish universities'],
      'France': ['france', 'french universities'],
    };

    for (const [country, keywords] of Object.entries(countryPreferences)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        info.country = country;
        break;
      }
    }

    // Extract GPA if mentioned
    const gpaPatterns = [
      /gpa[:\s]*(\d+\.?\d*)/,
      /grade point average[:\s]*(\d+\.?\d*)/,
      /cgpa[:\s]*(\d+\.?\d*)/,
      /(\d+\.?\d*)[:\s]*gpa/,
      /(\d+\.?\d*)[:\s]*out of[:\s]*4/,
    ];

    for (const pattern of gpaPatterns) {
      const match = conversationText.match(pattern);
      if (match) {
        const gpa = parseFloat(match[1]);
        if (gpa >= 0 && gpa <= 4.0) {
          info.current_gpa = gpa;
          break;
        }
      }
    }

    return info;
  };

  const searchAndStoreOpportunities = async (userInfo: Partial<UserProfile>) => {
    try {
      console.log('Searching opportunities with user info:', userInfo);
      
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
      if (userInfo.citizenship) {
        searchFilters.citizenship = userInfo.citizenship;
      }

      console.log('Search filters:', searchFilters);

      // Get opportunities from Supabase database only
      const opportunities = await supabaseService.searchOpportunities(searchFilters);
      console.log('Found opportunities from database:', opportunities.length);
      
      // Filter out expired opportunities (only show currently open ones)
      const currentDate = new Date();
      const openOpportunities = opportunities.filter(opp => {
        const deadline = new Date(opp.deadline);
        return deadline > currentDate;
      });

      console.log('Open opportunities after filtering:', openOpportunities.length);

      // Calculate match scores and create matches
      const opportunitiesWithScores = openOpportunities.map(opp => {
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
        .slice(0, 12); // Increased to 12 for better selection

      console.log('Top opportunities with scores:', topOpportunities.length);

      // Store opportunities in localStorage for persistence
      if (topOpportunities.length > 0) {
        localStorage.setItem('oput_opportunities', JSON.stringify(topOpportunities));
        console.log('Stored opportunities in localStorage');
      }

      return topOpportunities;
    } catch (error) {
      console.error('Error searching opportunities:', error);
      return [];
    }
  };

  const isProfileComplete = (userInfo: Partial<UserProfile>) => {
    return userInfo.academic_level && userInfo.field_of_study && userInfo.citizenship;
  };

  const shouldProvideOpportunities = (content: string, userInfo: Partial<UserProfile>) => {
    // Only provide opportunities if:
    // 1. Profile is complete
    // 2. User is asking for opportunities/recommendations
    // 3. Haven't already provided opportunities in this session
    
    const searchTriggers = [
      'find', 'search', 'show', 'recommend', 'suggest', 'look for',
      'scholarship', 'fellowship', 'grant', 'opportunity', 'opportunities', 'funding',
      'ready', 'provide', 'give me', 'help me find', 'can you find',
      'yes', 'sure', 'okay', 'ok', 'please', 'go ahead'
    ];
    
    const hasSearchTrigger = searchTriggers.some(trigger => 
      content.toLowerCase().includes(trigger)
    );
    
    const profileComplete = isProfileComplete(userInfo);
    
    return hasSearchTrigger && profileComplete && !hasProvidedOpportunities;
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
      
      console.log('Extracted user info:', userInfo);
      
      // Update context
      const updatedContext = { 
        ...context, 
        last_query: content.trim(),
        collected_info: { ...context.collected_info, ...userInfo }
      };
      
      // Check if we should provide opportunities
      const shouldProvide = shouldProvideOpportunities(content, userInfo);
      console.log('Should provide opportunities:', shouldProvide);
      
      let opportunities: any[] = [];
      
      if (shouldProvide) {
        console.log('Searching for personalized opportunities...');
        opportunities = await searchAndStoreOpportunities(userInfo);
        
        if (opportunities.length > 0) {
          console.log('Found and storing opportunities:', opportunities.length);
          
          // Add opportunities to results immediately
          onOpportunitiesFound(opportunities);
          
          // Update context to include found opportunities
          updatedContext.opportunities_shown = opportunities.map(opp => opp.id);
          updatedContext.current_stage = 'results';
          setHasProvidedOpportunities(true);
          
          console.log('Opportunities provided to results section');
        } else {
          console.log('No opportunities found matching criteria');
        }
      }
      
      // Generate AI response with context about found opportunities and profile completeness
      const contextForAI = {
        ...updatedContext,
        profile_complete: isProfileComplete(userInfo),
        missing_info: {
          academic_level: !userInfo.academic_level,
          field_of_study: !userInfo.field_of_study,
          citizenship: !userInfo.citizenship,
          gpa: !userInfo.current_gpa
        },
        found_opportunities: opportunities.length > 0 ? {
          count: opportunities.length,
          top_matches: opportunities.slice(0, 3).map(opp => ({
            title: opp.title,
            institution: opp.institution,
            match_score: opp.matchScore,
            country: opp.country,
            funding_amount: opp.funding_amount
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
        content: 'I apologize, but I encountered an error while searching for opportunities. Please try again or check your API configuration.',
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
                <span className="text-white/60 text-sm">Oput is searching for personalized opportunities...</span>
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
              placeholder="Tell me about your academic background and goals..."
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