import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Target, Sparkles, FileText } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { OpportunityResults } from './components/OpportunityResults';
import { ScholarshipTracker } from './components/ScholarshipTracker';
import { BoltBadge } from './components/BoltBadge';
import { Opportunity, OpportunityMatch, Message } from './types';
import { SupabaseService } from './lib/supabaseService';

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [trackedOpportunities, setTrackedOpportunities] = useState<(OpportunityMatch & { opportunity: Opportunity })[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'results' | 'tracker'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Oput, your AI assistant for discovering educational opportunities. I'll help you find scholarships, grants, and fellowships that match your profile perfectly.\n\nTo get started, could you tell me about your current academic level? Are you an undergraduate, graduate student, or pursuing a PhD?",
      timestamp: new Date(),
      canPlayAudio: true,
    }
  ]);
  
  const supabaseService = new SupabaseService();

  // Load opportunities from localStorage on component mount (only if they exist)
  useEffect(() => {
    const storedOpportunities = localStorage.getItem('oput_opportunities');
    if (storedOpportunities) {
      try {
        const parsedOpportunities = JSON.parse(storedOpportunities);
        setOpportunities(parsedOpportunities);
        
        // Create tracked opportunities from stored data
        const trackedOps = parsedOpportunities.map((opp: any, index: number) => ({
          id: `match_${Date.now()}_${index}`,
          user_id: 'demo_user',
          opportunity_id: opp.id,
          match_score: opp.matchScore || Math.floor(Math.random() * 30) + 70,
          success_probability: Math.floor(Math.random() * 40) + 60,
          eligibility_status: 'eligible' as const,
          action_items: opp.action_items || [
            'Review eligibility requirements',
            'Prepare academic transcripts',
            'Write personal statement',
            'Submit application before deadline'
          ],
          is_bookmarked: false,
          application_status: 'not_started' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          opportunity: opp
        }));
        
        setTrackedOpportunities(trackedOps);
      } catch (error) {
        console.error('Error loading stored opportunities:', error);
      }
    }
  }, []);

  const handleOpportunitiesFound = (newOpportunities: Opportunity[]) => {
    setOpportunities(newOpportunities);
    
    // Create tracked opportunities with match data
    const trackedOps = newOpportunities.map((opp, index) => ({
      id: `match_${Date.now()}_${index}`,
      user_id: 'demo_user', // In real app, this would be the authenticated user ID
      opportunity_id: opp.id,
      match_score: (opp as any).matchScore || Math.floor(Math.random() * 30) + 70,
      success_probability: Math.floor(Math.random() * 40) + 60,
      eligibility_status: 'eligible' as const,
      action_items: (opp as any).action_items || [
        'Review eligibility requirements',
        'Prepare academic transcripts',
        'Write personal statement',
        'Submit application before deadline'
      ],
      is_bookmarked: false,
      application_status: 'not_started' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      opportunity: opp
    }));
    
    setTrackedOpportunities(trackedOps);
    
    // Automatically switch to results tab when opportunities are found
    if (newOpportunities.length > 0) {
      setActiveTab('results');
    }
  };

  const handleUpdateStatus = async (matchId: string, status: string) => {
    setTrackedOpportunities(prev => 
      prev.map(tracked => 
        tracked.id === matchId 
          ? { ...tracked, application_status: status as any, updated_at: new Date().toISOString() }
          : tracked
      )
    );
    
    // In a real app, you would also update the database
    // await supabaseService.updateMatchStatus(matchId, { application_status: status });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Oput</h1>
                <p className="text-xs text-white/60">AI Opportunity Discovery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'chat'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'results'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Results
                  {opportunities.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {opportunities.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'tracker'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Tracker
                  {trackedOpportunities.length > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {trackedOpportunities.length}
                    </span>
                  )}
                </button>
              </div>
              
              <BoltBadge variant="white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto h-full">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'chat' && (
              <ChatInterface 
                onOpportunitiesFound={handleOpportunitiesFound}
                messages={messages}
                setMessages={setMessages}
              />
            )}
            {activeTab === 'results' && (
              <OpportunityResults opportunities={opportunities} />
            )}
            {activeTab === 'tracker' && (
              <ScholarshipTracker 
                opportunities={trackedOpportunities}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </motion.div>
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default App;