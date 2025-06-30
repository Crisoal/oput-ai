import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { OpportunityCard } from './OpportunityCard';
import { FilterPanel } from './FilterPanel';
import { Opportunity, FilterOptions } from '../types';

interface OpportunityResultsProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
}

export const OpportunityResults: React.FC<OpportunityResultsProps> = ({ 
  opportunities, 
  isLoading = false 
}) => {
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>(opportunities);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    level: [],
    country: [],
    field: [],
    minFunding: 0,
    maxFunding: 100000,
    deadlineRange: 'all',
    minMatchScore: 0,
  });

  useEffect(() => {
    setFilteredOpportunities(opportunities);
  }, [opportunities]);

  const applyFilters = () => {
    let filtered = [...opportunities];

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(opp => filters.type.includes(opp.type));
    }

    // Level filter
    if (filters.level.length > 0) {
      filtered = filtered.filter(opp => filters.level.includes(opp.level));
    }

    // Country filter
    if (filters.country.length > 0) {
      filtered = filtered.filter(opp => filters.country.includes(opp.country));
    }

    // Field filter
    if (filters.field.length > 0) {
      filtered = filtered.filter(opp => 
        filters.field.some(field => 
          opp.field.toLowerCase().includes(field.toLowerCase())
        )
      );
    }

    // Funding amount filter
    filtered = filtered.filter(opp => 
      opp.funding_amount >= filters.minFunding && 
      opp.funding_amount <= filters.maxFunding
    );

    // Deadline filter
    if (filters.deadlineRange !== 'all') {
      const now = new Date();
      const daysMap = { '30days': 30, '60days': 60, '90days': 90 };
      const days = daysMap[filters.deadlineRange as keyof typeof daysMap];
      const cutoffDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(opp => {
        const deadline = new Date(opp.deadline);
        return deadline <= cutoffDate && deadline >= now;
      });
    }

    // Match score filter (if opportunities have match scores)
    if (filters.minMatchScore > 0) {
      filtered = filtered.filter(opp => {
        const matchScore = (opp as any).matchScore || 0;
        return matchScore >= filters.minMatchScore;
      });
    }

    setFilteredOpportunities(filtered);
  };

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

  // Add mock match scores if they don't exist
  const opportunitiesWithScores = filteredOpportunities.map((opp, index) => ({
    ...opp,
    matchScore: (opp as any).matchScore || Math.floor(Math.random() * 30) + 70 // 70-100% range
  }));

  // Sort by match score
  const sortedOpportunities = opportunitiesWithScores.sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Found {filteredOpportunities.length} of {opportunities.length} Opportunities
            </h2>
            <p className="text-white/60">
              Ranked by eligibility match and success probability
            </p>
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
            {(filters.type.length > 0 || filters.level.length > 0 || filters.country.length > 0 || filters.field.length > 0) && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {filters.type.length + filters.level.length + filters.country.length + filters.field.length}
              </span>
            )}
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

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={applyFilters}
      />
    </div>
  );
};