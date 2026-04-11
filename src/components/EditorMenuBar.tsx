import React, { useState } from 'react';
import { 
  Save, 
  Copy, 
  Download, 
  Trash2, 
  MoreVertical, 
  Info,
  FileText,
  Undo2,
  Redo2,
  ZoomIn
} from 'lucide-react';
import type { CanvasComponent, Connection, Project } from '../types';

interface EditorMenuBarProps {
  project: Project;
  components: CanvasComponent[];
  connections: Connection[];
  onSave: () => void | Promise<void>;
  onClone: () => void;
  onExport: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
}

const EditorMenuBar: React.FC<EditorMenuBarProps> = ({
  project,
  components,
  connections,
  onSave,
  onClone,
  onExport,
  onDelete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isSaving = false
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) {
      onDelete();
    }
  };

  return ( 
    <div className="h-14 bg-white border-b border-gray-200 px-2 sm:px-4 flex items-center justify-between gap-1 sm:gap-4 shadow-sm overflow-x-auto">
      {/* Left section - Main actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="relative group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-blue-200 whitespace-nowrap"
          title="Save project (Ctrl+S)"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Save</span>
            </>
          )}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ctrl+S
          </span>
        </button>

        {/* Clone button */}
        <button
          onClick={onClone}
          className="relative group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 border border-gray-200 whitespace-nowrap"
          title="Clone project"
        >
          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Clone</span>
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Duplicate project
          </span>
        </button>

        {/* Export button */}
        <button
          onClick={onExport}
          className="relative group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 border border-gray-200 whitespace-nowrap"
          title="Export project"
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Export</span>
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Download project files
          </span>
        </button>

        {/* Divider */}
        <div className="h-6 border-l border-gray-300 mx-1 hidden sm:block"></div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="relative group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 border border-red-200 whitespace-nowrap"
          title="Delete project"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Delete</span>
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Remove project
          </span>
        </button>
      </div>

      {/* Center section - Project stats - Hidden on mobile */}
      <div className="flex-1 flex justify-center items-center gap-2 sm:gap-4 hidden md:flex">
        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600 bg-gray-50 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">{components.length}</span>
            <span className="hidden sm:inline">Components</span>
            <span className="sm:hidden">Comp</span>
          </div>
          <div className="h-3 border-l border-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700">{connections.length}</span>
            <span className="hidden sm:inline">Connections</span>
            <span className="sm:hidden">Conn</span>
          </div>
        </div>
      </div>

      {/* Right section - Edit and View options */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Undo button */}
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="relative group p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Undo
            </span>
          </button>
        )}

        {/* Redo button */}
        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="relative group p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Redo
            </span>
          </button>
        )}

        {/* Divider */}
        <div className="h-6 border-l border-gray-300 mx-1 hidden sm:block"></div>

        {/* Info button */}
        <div className="relative">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="relative group p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-200 border border-gray-200"
            title="Project information"
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Project info
            </span>
          </button>

          {/* Info panel */}
          {showInfo && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 text-xs sm:text-sm z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Project Information</h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 text-gray-700">
                <div>
                  <span className="font-medium text-gray-900">Name:</span> {project.name}
                </div>
                <div>
                  <span className="font-medium text-gray-900">ID:</span> {project.id}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Created:</span>{' '}
                  {new Date(project.createdAt || 0).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Last Modified:</span>{' '}
                  {new Date(project.lastModified || 0).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Technology Stack:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {components.length > 0 ? (
                      components.slice(0, 5).map((comp) => (
                        <span key={comp.id} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200">
                          {comp.properties?.name || comp.techId}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No components added</span>
                    )}
                    {components.length > 5 && (
                      <span className="text-gray-500 text-xs">+{components.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="relative group p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-200 border border-gray-200"
            title="More options"
          >
            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              More options
            </span>
          </button>

          {/* More menu dropdown */}
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 sm:py-2 z-50">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowMoreMenu(false);
                  // TODO: Implement view documentation
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Documentation</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowMoreMenu(false);
                  // TODO: Implement keyboard shortcuts
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Keyboard Shortcuts</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorMenuBar;
