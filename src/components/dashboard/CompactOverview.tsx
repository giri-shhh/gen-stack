import React from 'react';
import { Plus, Folder, Archive, Clock, CheckCircle } from 'lucide-react';
import type { Project } from '../../types';

interface CompactOverviewProps {
  projects: Project[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  onCreateProject: () => void;
  onImportProject: () => void;
  onBrowseTemplates: () => void;
}

const CompactOverview: React.FC<CompactOverviewProps> = ({
  projects,
  currentFilter,
  onFilterChange,
  onCreateProject,
  onImportProject,
  onBrowseTemplates
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
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-md p-6">
      {/* Single Row - Filters on Left, Actions on Right */}
      <div className="flex items-center justify-between">
        {/* Left Side - Project Filters */}
        <div className="flex items-center space-x-3">
          {/* All Projects */}
          <button
            onClick={() => onFilterChange('all')}
            className={`group relative rounded-lg p-3 shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform ${getFilterButtonStyle('all')}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md">
                  <Archive className="w-3 h-3 text-gray-700" />
                </div>
                <span className="font-medium text-xs">All</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent ml-3">
                {getFilterCount('all')}
              </span>
            </div>
          </button>

          {/* Active Projects */}
          <button
            onClick={() => onFilterChange('active')}
            className={`group relative rounded-lg p-3 shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform ${getFilterButtonStyle('active')}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-200 rounded-md">
                  <Clock className="w-3 h-3 text-green-700" />
                </div>
                <span className="font-medium text-xs">Active</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent ml-3">
                {getFilterCount('active')}
              </span>
            </div>
          </button>

          {/* Completed Projects */}
          <button
            onClick={() => onFilterChange('completed')}
            className={`group relative rounded-lg p-3 shadow-sm border transition-all duration-200 hover:shadow-md hover:scale-[1.02] transform ${getFilterButtonStyle('completed')}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-md">
                  <CheckCircle className="w-3 h-3 text-blue-700" />
                </div>
                <span className="font-medium text-xs">Done</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent ml-3">
                {getFilterCount('completed')}
              </span>
            </div>
          </button>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Quick Actions */}
          <button
            onClick={onImportProject}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
          >
            <Folder className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={onBrowseTemplates}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
          >
            <Folder className="w-4 h-4" />
            <span>Templates</span>
          </button>
          
          {/* Divider */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1"></div>
          
          {/* Create New Project Button */}
          <button
            onClick={onCreateProject}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactOverview;