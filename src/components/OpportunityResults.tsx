import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { OpportunityCard } from './OpportunityCard';
import { Opportunity } from '../types';

interface OpportunityResultsProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
}

export const OpportunityResults: React.FC<OpportunityResultsProps> = ({ 
  opportunities, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60"></div>
        <p className="mt-4 text-sm">Searching for opportunities...</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60">
        <Search className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No opportunities found yet</p>
        <p className="text-sm text-center max-w-md">
          Start a conversation with Oput to discover personalized opportunities based on your profile and interests.
        </p>
      </div>
    );
  }

  // Calculate mock match scores
  const opportunitiesWithScores = opportunities.map((opp, index) => ({
    ...opp,
    matchScore: Math.floor(Math.random() * 30) + 70 // 70-100% range
  }));

  // Sort by match score
  const sortedOpportunities = opportunitiesWithScores.sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Found {opportunities.length} Opportunities
            </h2>
            <p className="text-white/60">
              Ranked by eligibility match and success probability
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors duration-200">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
        </div>

        <div className="space-y-4">
          {sortedOpportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              matchScore={opportunity.matchScore}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};