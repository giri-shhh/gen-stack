import React from 'react';
import { Plus, Folder, LayoutTemplate, Archive, Clock, CheckCircle, FileEdit, Heart } from 'lucide-react';
import type { Project } from '../../types';

interface CompactOverviewProps {
  projects: Project[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  onCreateProject: () => void;
  onImportProject: () => void;
  onBrowseTemplates: () => void;
}

const FILTERS = [
  {
    key: 'all',
    label: 'All',
    icon: Archive,
    activeClass: 'bg-gray-900 text-white border-gray-900 shadow-md',
    inactiveClass: 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
    getCount: (projects: Project[]) => projects.length,
  },
  {
    key: 'active',
    label: 'Active',
    icon: Clock,
    activeClass: 'bg-green-600 text-white border-green-600 shadow-md',
    inactiveClass: 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20',
    getCount: (projects: Project[]) => projects.filter(p => p.status === 'active').length,
  },
  {
    key: 'completed',
    label: 'Done',
    icon: CheckCircle,
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-md',
    inactiveClass: 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    getCount: (projects: Project[]) => projects.filter(p => p.status === 'completed').length,
  },
  {
    key: 'draft',
    label: 'Draft',
    icon: FileEdit,
    activeClass: 'bg-yellow-500 text-white border-yellow-500 shadow-md',
    inactiveClass: 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    getCount: (projects: Project[]) => projects.filter(p => p.status === 'draft').length,
  },
  {
    key: 'favorites',
    label: 'Starred',
    icon: Heart,
    activeClass: 'bg-red-500 text-white border-red-500 shadow-md',
    inactiveClass: 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20',
    getCount: (projects: Project[]) => projects.filter(p => p.isFavorite).length,
  },
];

const CompactOverview: React.FC<CompactOverviewProps> = ({
  projects,
  currentFilter,
  onFilterChange,
  onCreateProject,
  onImportProject,
  onBrowseTemplates
}) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(({ key, label, icon: Icon, activeClass, inactiveClass, getCount }) => {
            const count = getCount(projects);
            const isActive = currentFilter === key;
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                  isActive ? activeClass : inactiveClass
                }`}
              >
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span>{label}</span>
                <span className={`font-bold tabular-nums ${isActive ? 'opacity-90' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onImportProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 transition-all duration-150 text-xs font-medium"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button
            onClick={onBrowseTemplates}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 transition-all duration-150 text-xs font-medium"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />

          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-150 font-semibold text-xs shadow-sm hover:shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactOverview;
