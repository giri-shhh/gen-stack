import React from 'react';
import { Clock, CheckCircle, Archive } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectFiltersProps {
  projects: Project[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  projects,
  currentFilter,
  onFilterChange
}) => {
  const getFilterButtonStyle = (filter: string) => {
    return currentFilter === filter
      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300/50 text-blue-700 shadow-blue-100/50'
      : 'bg-white/80 border-gray-200/50 text-gray-600 hover:bg-white hover:border-gray-300/50';
  };

  const getFilterCount = (status: string) => {
    if (status === 'all') return projects.length;
    return projects.filter(p => p.status === status).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* All Projects */}
      <button
        onClick={() => onFilterChange('all')}
        className={`group relative rounded-xl p-4 shadow-md border border-white/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] transform backdrop-blur-sm ${getFilterButtonStyle('all')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-gray-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                <Archive className="w-4 h-4 text-gray-700" />
              </div>
              <span className="font-semibold text-sm">All Projects</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                {getFilterCount('all')}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Active Projects */}
      <button
        onClick={() => onFilterChange('active')}
        className={`group relative rounded-xl p-4 shadow-md border border-white/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] transform backdrop-blur-sm ${getFilterButtonStyle('active')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg shadow-sm">
                <Clock className="w-4 h-4 text-green-700" />
              </div>
              <span className="font-semibold text-sm">Active</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {getFilterCount('active')}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Completed Projects */}
      <button
        onClick={() => onFilterChange('completed')}
        className={`group relative rounded-xl p-4 shadow-md border border-white/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] transform backdrop-blur-sm ${getFilterButtonStyle('completed')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg shadow-sm">
                <CheckCircle className="w-4 h-4 text-blue-700" />
              </div>
              <span className="font-semibold text-sm">Completed</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                {getFilterCount('completed')}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ProjectFilters;