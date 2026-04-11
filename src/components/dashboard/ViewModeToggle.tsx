import React from 'react';
import { Grid, List } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-1.5 rounded-2xl flex space-x-2 shadow-inner border border-gray-200/50 dark:border-gray-600/50">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`group flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-lg scale-105 ring-2 ring-blue-100 dark:ring-blue-900'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-600/50'
        }`}
      >
        <Grid className={`w-4 h-4 transition-transform duration-200 ${viewMode === 'grid' ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span>Grid</span>
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`group flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-lg scale-105 ring-2 ring-blue-100 dark:ring-blue-900'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-600/50'
        }`}
      >
        <List className={`w-4 h-4 transition-transform duration-200 ${viewMode === 'list' ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span>List</span>
      </button>
    </div>
  );
};

export default ViewModeToggle;
