import React from 'react';
import { Plus, Folder } from 'lucide-react';

interface QuickActionsProps {
  onCreateProject: () => void;
  onImportProject: () => void;
  onBrowseTemplates: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateProject,
  onImportProject,
  onBrowseTemplates
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onImportProject}
          className="group flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm"
        >
          <Folder className="w-4 h-4" />
          <span className="font-medium">Import</span>
        </button>
        <button
          onClick={onBrowseTemplates}
          className="group flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm"
        >
          <Folder className="w-4 h-4" />
          <span className="font-medium">Templates</span>
        </button>
      </div>
      
      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
      
      {/* Create New Project Button */}
      <button
        onClick={onCreateProject}
        className="group relative flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Project</span>
      </button>
    </div>
  );
};

export default QuickActions;