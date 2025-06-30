import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, GraduationCap, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Opportunity } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  matchScore?: number;
  index: number;
  actionItems?: string[];
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  opportunity, 
  matchScore,
  index,
  actionItems = []
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      scholarship: 'bg-blue-500/20 text-blue-300',
      grant: 'bg-green-500/20 text-green-300',
      fellowship: 'bg-purple-500/20 text-purple-300',
      internship: 'bg-orange-500/20 text-orange-300',
      research: 'bg-pink-500/20 text-pink-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  const formatDeadline = (deadline: string) => {
    try {
      return new Date(deadline).toLocaleDateString();
    } catch {
      return deadline;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{opportunity.title}</h3>
          <p className="text-white/70 text-sm mb-2">{opportunity.institution}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
              {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
              {opportunity.level.charAt(0).toUpperCase() + opportunity.level.slice(1)}
            </span>
          </div>
        </div>
        
        {matchScore && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${getMatchScoreColor(matchScore)}`}>
              {matchScore}%
            </div>
            <div className="text-xs text-white/60">Match</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <DollarSign className="w-4 h-4" />
          <span>{formatAmount(opportunity.funding_amount)}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{opportunity.country}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{formatDeadline(opportunity.deadline)}</span>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <GraduationCap className="w-4 h-4" />
          <span>{opportunity.field}</span>
        </div>
      </div>

      {/* Action Items and Details Toggle */}
      {actionItems.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            <span>Action Steps</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-1"
              >
                {actionItems.map((item, idx) => (
                  <div key={idx} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-white/60">
          {opportunity.requirements ? opportunity.requirements.split(',').length : 0} requirements
        </div>
        <button
          onClick={() => window.open(opportunity.application_url, '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};