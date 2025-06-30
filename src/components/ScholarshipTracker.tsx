import React, { useState, useEffect } from 'react';
import { Calendar, Download, CheckCircle, Clock, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { OpportunityMatch, Opportunity } from '../types';

interface TrackedOpportunity extends OpportunityMatch {
  opportunity: Opportunity;
}

interface ScholarshipTrackerProps {
  opportunities: TrackedOpportunity[];
  onUpdateStatus: (matchId: string, status: string) => void;
}

export const ScholarshipTracker: React.FC<ScholarshipTrackerProps> = ({
  opportunities,
  onUpdateStatus,
}) => {
  const [sortBy, setSortBy] = useState<'deadline' | 'match_score' | 'status'>('deadline');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Auto-download CSV when component mounts and opportunities exist
  useEffect(() => {
    if (opportunities.length > 0) {
      downloadCSV();
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'text-gray-400 bg-gray-400/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-400/20';
      case 'submitted': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4" />;
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineUrgency = (deadline: string) => {
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return 'text-red-400';
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filterStatus === 'all') return true;
    return opp.application_status === filterStatus;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.opportunity.deadline).getTime() - new Date(b.opportunity.deadline).getTime();
      case 'match_score':
        return b.match_score - a.match_score;
      case 'status':
        return a.application_status.localeCompare(b.application_status);
      default:
        return 0;
    }
  });

  const downloadCSV = () => {
    if (opportunities.length === 0) {
      alert('No opportunities to download. Please find some opportunities first through the chat.');
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
      'Success Probability (%)',
      'Application Status',
      'Days Until Deadline',
      'Action Items',
      'Requirements',
      'Application URL',
      'Created Date'
    ];

    const csvData = opportunities.map(opp => [
      opp.opportunity.title,
      opp.opportunity.institution,
      opp.opportunity.type,
      opp.opportunity.level,
      opp.opportunity.field || 'N/A',
      opp.opportunity.country,
      opp.opportunity.deadline,
      `$${opp.opportunity.funding_amount.toLocaleString()}`,
      opp.match_score,
      opp.success_probability,
      opp.application_status.replace('_', ' '),
      getDaysUntilDeadline(opp.opportunity.deadline),
      opp.action_items.join('; '),
      opp.opportunity.requirements || 'N/A',
      opp.opportunity.application_url || 'N/A',
      new Date(opp.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `oput_opportunities_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No tracked opportunities yet</p>
        <p className="text-sm text-center max-w-md">
          Start discovering opportunities through chat to build your personalized tracker.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Scholarship Tracker</h2>
            <p className="text-white/60">
              Track your {opportunities.length} personalized opportunities
            </p>
          </div>
          
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-sm">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="deadline">Deadline</option>
              <option value="match_score">Match Score</option>
              <option value="status">Status</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-sm">Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {sortedOpportunities.map((trackedOpp, index) => (
            <motion.div
              key={trackedOpp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {trackedOpp.opportunity.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-2">
                    {trackedOpp.opportunity.institution}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                      {trackedOpp.opportunity.type}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                      {trackedOpp.match_score}% match
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getDeadlineUrgency(trackedOpp.opportunity.deadline)}`}>
                    {getDaysUntilDeadline(trackedOpp.opportunity.deadline)} days
                  </div>
                  <div className="text-xs text-white/60">until deadline</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Details</h4>
                  <div className="space-y-1 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(trackedOpp.opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span>Funding: ${trackedOpp.opportunity.funding_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎓</span>
                      <span>Level: {trackedOpp.opportunity.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📚</span>
                      <span>Field: {trackedOpp.opportunity.field}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Action Items</h4>
                  <div className="space-y-1">
                    {trackedOpp.action_items.map((item, idx) => (
                      <div key={idx} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">Status:</span>
                  <select
                    value={trackedOpp.application_status}
                    onChange={(e) => onUpdateStatus(trackedOpp.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(trackedOpp.application_status)}`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <button
                  onClick={() => window.open(trackedOpp.opportunity.application_url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};