import React, { useState } from 'react';
import { X, Filter, Calendar, DollarSign, MapPin, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      type: [],
      level: [],
      country: [],
      field: [],
      minFunding: 0,
      maxFunding: 100000,
      deadlineRange: 'all',
      minMatchScore: 0,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onApplyFilters();
  };

  const opportunityTypes = ['scholarship', 'grant', 'fellowship', 'internship', 'research'];
  const academicLevels = ['undergraduate', 'graduate', 'phd', 'postdoc'];
  const countries = ['United States', 'Germany', 'United Kingdom', 'Canada', 'Australia', 'Netherlands', 'Sweden', 'France'];
  const fields = ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Physics', 'Chemistry', 'Biology', 'Mathematics'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-black/95 backdrop-blur-sm border-l border-white/20 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Opportunity Type */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Opportunity Type
                  </h3>
                  <div className="space-y-2">
                    {opportunityTypes.map(type => (
                      <label key={type} className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('type', [...localFilters.type, type]);
                            } else {
                              updateFilter('type', localFilters.type.filter(t => t !== type));
                            }
                          }}
                          className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Academic Level */}
                <div>
                  <h3 className="text-white font-medium mb-3">Academic Level</h3>
                  <div className="space-y-2">
                    {academicLevels.map(level => (
                      <label key={level} className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.level.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('level', [...localFilters.level, level]);
                            } else {
                              updateFilter('level', localFilters.level.filter(l => l !== level));
                            }
                          }}
                          className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Country
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {countries.map(country => (
                      <label key={country} className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.country.includes(country)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('country', [...localFilters.country, country]);
                            } else {
                              updateFilter('country', localFilters.country.filter(c => c !== country));
                            }
                          }}
                          className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                        />
                        <span>{country}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Field of Study */}
                <div>
                  <h3 className="text-white font-medium mb-3">Field of Study</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fields.map(field => (
                      <label key={field} className="flex items-center gap-2 text-white/80 hover:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.field.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('field', [...localFilters.field, field]);
                            } else {
                              updateFilter('field', localFilters.field.filter(f => f !== field));
                            }
                          }}
                          className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                        />
                        <span>{field}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Funding Amount */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Funding Amount
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/80 text-sm">Minimum: ${localFilters.minFunding.toLocaleString()}</label>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        value={localFilters.minFunding}
                        onChange={(e) => updateFilter('minFunding', parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-white/80 text-sm">Maximum: ${localFilters.maxFunding.toLocaleString()}</label>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        value={localFilters.maxFunding}
                        onChange={(e) => updateFilter('maxFunding', parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Deadline Range */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Deadline
                  </h3>
                  <select
                    value={localFilters.deadlineRange}
                    onChange={(e) => updateFilter('deadlineRange', e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="all">All deadlines</option>
                    <option value="30days">Next 30 days</option>
                    <option value="60days">Next 60 days</option>
                    <option value="90days">Next 90 days</option>
                  </select>
                </div>

                {/* Match Score */}
                <div>
                  <h3 className="text-white font-medium mb-3">Minimum Match Score</h3>
                  <div>
                    <label className="text-white/80 text-sm">Minimum: {localFilters.minMatchScore}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={localFilters.minMatchScore}
                      onChange={(e) => updateFilter('minMatchScore', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};