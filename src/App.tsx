import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Target, Sparkles } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { OpportunityResults } from './components/OpportunityResults';
import { BoltBadge } from './components/BoltBadge';
import { Opportunity } from './types';

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'results'>('chat');

  const handleOpportunitiesFound = (newOpportunities: Opportunity[]) => {
    setOpportunities(newOpportunities);
    if (newOpportunities.length > 0) {
      setActiveTab('results');
    }
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
            {activeTab === 'chat' ? (
              <ChatInterface onOpportunitiesFound={handleOpportunitiesFound} />
            ) : (
              <OpportunityResults opportunities={opportunities} />
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