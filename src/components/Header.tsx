import React, { useState } from 'react';
import { Sparkles, Home, User, LogOut, Save, ChevronDown, Trash2, Download, Copy, Settings, Sun, Moon, Github } from 'lucide-react';
import ExportModal from './ExportModal';
import { useTheme } from '../contexts/ThemeContext';
import type { HeaderProps } from '../types';

const Header: React.FC<HeaderProps & { onPushToGitHub?: () => void }> = ({ onBackToLanding, user, onLogout, currentProject, onSaveProject, onDeleteProject, components, connections }) => {
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportModalTab, setExportModalTab] = useState<'zip' | 'git'>('zip');

  const handleSaveProject = async () => {
    if (!onSaveProject) return;
    setIsSaving(true);
    try {
      await onSaveProject();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = () => {
    if (onDeleteProject && window.confirm(`Are you sure you want to delete project "${currentProject?.name}"? This action cannot be undone.`)) {
      onDeleteProject();
    }
  };

  const handleCloneProject = () => {
    window.dispatchEvent(new CustomEvent('clone-project'));
  };

  return (
    <>
      <header className="h-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 sm:px-4 lg:px-6 gap-2 sm:gap-4 overflow-x-auto">
        {/* Left — brand + nav */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-gray-100 hidden sm:block">Fullstack Gen</h1>
          </div>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors whitespace-nowrap"
            >
              <Home className="w-3 h-3" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {currentProject && (
            <div className="flex items-center space-x-1 border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-4 ml-1 sm:ml-2">
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-blue-200 dark:border-blue-700 rounded-md whitespace-nowrap"
                title="Save project (Ctrl+S)"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span className="hidden sm:inline font-medium">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              <button
                onClick={handleCloneProject}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 rounded-md whitespace-nowrap"
                title="Clone project"
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Clone</span>
              </button>

              <button
                onClick={() => {
                  setExportModalTab('zip');
                  setShowExportModal(true);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 rounded-md whitespace-nowrap"
                title="Export project"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={() => {
                  setExportModalTab('git');
                  setShowExportModal(true);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 rounded-md whitespace-nowrap"
                title="Push to GitHub"
              >
                <Github className="w-3 h-3" />
                <span className="hidden sm:inline">Push</span>
              </button>

              <button
                onClick={handleDeleteProject}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border border-red-200 dark:border-red-800 rounded-md whitespace-nowrap"
                title="Delete project"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Center — project name */}
        <div className="flex-1 justify-center hidden md:flex">
          {currentProject && (
            <h2 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{currentProject.name}</h2>
          )}
        </div>

        {/* Right — theme toggle + user menu */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <img src={user.avatar} alt={user.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                <span className="hidden lg:block">{user.name}</span>
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 sm:py-2 z-50">
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    {!user.isTemporary && user.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    )}
                    {user.isTemporary && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Temporary User</p>
                    )}
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          components={components || []}
          connections={connections || []}
          currentProject={currentProject}
              initialOption={exportModalTab}
        />
      )}
    </>
  );
};

export default Header;
