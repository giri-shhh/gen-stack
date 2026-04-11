import React, { useState } from 'react';
import { Sparkles, Home, User, LogOut, Save, ChevronDown, Trash2, Download, Copy, Settings } from 'lucide-react';
import ExportModal from './ExportModal';
import type { HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ onBackToLanding, user, onLogout, currentProject, onSaveProject, onDeleteProject, components, connections }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleExportProject = () => {
    setShowExportModal(true);
  };

  const handleCloneProject = () => {
    // Clone is handled through a separate trigger
    window.dispatchEvent(new CustomEvent('clone-project'));
  };

  // Check if any component is selected
  const hasSelectedComponent = components?.some(comp => comp.selected) || false;

  return (
    <>
      <header className="h-header bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 lg:px-6 gap-2 sm:gap-4 overflow-x-auto">
        {/* Left side - Company name and buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 hidden sm:block">Fullstack Gen</h1>
          </div>
          
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              <Home className="w-3 h-3" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* Action buttons when in project editor */}
          {currentProject && (
            <div className="flex items-center space-x-1 border-l border-gray-200 pl-2 sm:pl-4 ml-1 sm:ml-2">
              {/* Save button */}
              <button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-blue-200 rounded-md whitespace-nowrap"
                title="Save project (Ctrl+S)"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span className="hidden sm:inline font-medium">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>

              {/* Clone button */}
              <button
                onClick={handleCloneProject}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 border border-gray-200 rounded-md whitespace-nowrap"
                title="Clone project"
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Clone</span>
              </button>

              {/* Export button */}
              <button
                onClick={handleExportProject}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 border border-gray-200 rounded-md whitespace-nowrap"
                title="Export project"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Delete button */}
              <button
                onClick={handleDeleteProject}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 border border-red-200 rounded-md whitespace-nowrap"
                title="Delete project"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Center - Project name only - Hidden on small screens */}
        <div className="flex-1 flex justify-center hidden md:flex">
          {currentProject && (
            <div className="text-center">
              <h2 className="text-sm lg:text-lg font-semibold text-gray-900 truncate">{currentProject.name}</h2>
            </div>
          )}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                />
                <span className="hidden lg:block">{user.name}</span>
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 sm:py-2 z-50">
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gray-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{user.name}</p>
                    {!user.isTemporary && user.email && (
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    )}
                    {user.isTemporary && (
                      <p className="text-xs text-blue-600 font-medium">Temporary User</p>
                    )}
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
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

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          components={components || []}
          connections={connections || []}
          currentProject={currentProject}
        />
      )}
    </>
  );
};

export default Header; 