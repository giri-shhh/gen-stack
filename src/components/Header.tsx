import React, { useState } from 'react';
import { Sparkles, Home, User, LogOut, Save, ChevronDown, Trash2, Download, Copy } from 'lucide-react';
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

  return (
    <header className="h-header bg-white border-b border-gray-200 flex items-center justify-between px-golden-lg">
      {/* Left side - Project controls */}
      <div className="flex items-center space-x-golden-sm">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        )}

        {currentProject && onSaveProject && (
          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Project</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>

            {/* Project Dropdown Menu */}
            {showProjectMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button 
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Project'}</span>
                </button>
                <button 
                  onClick={handleCloneProject}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Clone Project</span>
                </button>
                <button 
                  onClick={handleExportProject}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Project</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={handleDeleteProject}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center - Title and project info */}
      <div className="flex items-center space-x-golden-sm">
        <Sparkles className="w-6 h-6 text-primary-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fullstack App Generator</h1>
          {currentProject && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{currentProject.name}</span>
              {currentProject.description && (
                <span className="ml-2">• {currentProject.description}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - User menu */}
      <div className="flex items-center space-x-golden-sm">
        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="hidden md:block">{user.name}</span>
              <User className="w-4 h-4" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
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