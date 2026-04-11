import React, { useState } from 'react';
import { Sparkles, Home, User, LogOut, Save, ChevronDown, Trash2, Download, Copy, Settings } from 'lucide-react';
import ExportModal from './ExportModal';
import type { HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ onBackToLanding, user, onLogout, currentProject, onSaveProject, onDeleteProject, components, connections }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleSaveProject = async () => {
    if (!onSaveProject) return;
    
    setIsSaving(true);
    try {
      await onSaveProject();
    } finally {
      setIsSaving(false);
      setShowProjectMenu(false);
    }
  };

  const handleDeleteProject = () => {
    if (onDeleteProject) {
      onDeleteProject();
    }
    setShowProjectMenu(false);
  };

  const handleExportProject = () => {
    setShowExportModal(true);
    setShowProjectMenu(false);
  };

  const handleCloneProject = () => {
    // TODO: Implement clone functionality
    console.log('Clone project:', currentProject?.id);
    setShowProjectMenu(false);
  };

  // Check if any component is selected
  const hasSelectedComponent = components?.some(comp => comp.selected) || false;

  return (
    <header className="h-header bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 lg:px-6 gap-2 sm:gap-4 overflow-x-auto">
      {/* Left side - Company name and Back button */}
      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
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

        {currentProject && onSaveProject && (
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              disabled={isSaving}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 whitespace-nowrap"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-blue-600"></div>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  <span className="hidden sm:inline">Project</span>
                  <ChevronDown className="w-2 h-2" />
                </>
              )}
            </button>

            {/* Project Dropdown Menu */}
            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 sm:py-2 z-50">
                <button 
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Project'}</span>
                </button>
                <button 
                  onClick={handleCloneProject}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Clone Project</span>
                </button>
                <button 
                  onClick={handleExportProject}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Export Project</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  onClick={handleDeleteProject}
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Properties Panel Toggle - Show when component is selected */}
        {hasSelectedComponent && (
          <button
            onClick={() => {
              // Scroll to properties panel if it exists
              const propertiesPanel = document.querySelector('[data-properties-panel]');
              if (propertiesPanel) {
                propertiesPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors border border-green-200 whitespace-nowrap"
            title="Properties panel should be visible on the right side"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">Properties</span>
          </button>
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
    </header>
  );
};

export default Header; 