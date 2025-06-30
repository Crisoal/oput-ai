import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';
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

  const downloadCSV = () => {
    if (filteredOpportunities.length === 0) {
      alert('No opportunities to download. Please find some opportunities first.');
      return;
    }

    const headers = [
      'Title',
      'Institution',
      'Type',
      'Level',
      'Field',
      'Country',
      'Deadline',
      'Funding Amount',
      'Match Score (%)',
      'Requirements',
      'GPA Requirement',
      'Citizenship Requirements',
      'Language Requirements',
      'Application URL',
      'Created Date'
    ];

    const csvData = filteredOpportunities.map(opp => [
      opp.title,
      opp.institution,
      opp.type,
      opp.level,
      opp.field || 'N/A',
      opp.country,
      opp.deadline,
      `$${opp.funding_amount.toLocaleString()}`,
      (opp as any).matchScore || 'N/A',
      opp.requirements || 'N/A',
      opp.gpa_requirement || 'N/A',
      Array.isArray(opp.citizenship_requirements) ? opp.citizenship_requirements.join(', ') : opp.citizenship_requirements || 'N/A',
      typeof opp.language_requirements === 'object' ? JSON.stringify(opp.language_requirements) : opp.language_requirements || 'N/A',
      opp.application_url || 'N/A',
      new Date(opp.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `oput_cybersecurity_opportunities_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    matchScore: (opp as any).matchScore || Math.floor(Math.random() * 30) + 70, // 70-100% range
    action_items: (opp as any).action_items || [
      'Review eligibility requirements carefully',
      'Prepare academic transcripts and certificates',
      'Write compelling personal statement',
      'Gather strong letters of recommendation',
      'Submit application before deadline'
    ]
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
              Cybersecurity scholarships and fellowships ranked by eligibility match
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export CSV</span>
            </button>
            
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
        </div>

        <div className="space-y-4">
          {sortedOpportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              matchScore={opportunity.matchScore}
              actionItems={opportunity.action_items}
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