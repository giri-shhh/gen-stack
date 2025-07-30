import React, { useState } from 'react';
import { Maximize2, X, Globe, Settings, BarChart3, FolderOpen } from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import {
  TechnologyInfo,
  ComponentProperties,
  ConnectionsPanel,
  ReactConfiguration,
  SpringBootConfiguration,
  ProjectStructureViewer
} from './properties';

import type { CanvasComponent, Connection } from '../types';

interface PropertiesPanelProps {
  selectedComponent: CanvasComponent | null;
  onComponentUpdate: (id: string, updates: Partial<CanvasComponent>) => void;
  onComponentRemove: (id: string) => void;
  onConnectionRemove: (id: string) => void;
  components: CanvasComponent[];
  connections: Connection[];
  addComponent: (component: CanvasComponent) => void;
  showProjectPreview: boolean;
  setShowProjectPreview: (show: boolean) => void;
  previewComponent: CanvasComponent | null;
  isPopupMode?: boolean;
  setIsPopupMode?: (isPopup: boolean) => void;
}

const PropertiesPanelModular = ({
  selectedComponent,
  onComponentUpdate,
  onComponentRemove,
  onConnectionRemove,
  components,
  connections,
  showProjectPreview,
  setShowProjectPreview,
  previewComponent,
  isPopupMode: externalIsPopupMode,
  setIsPopupMode: externalSetIsPopupMode
}: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState('properties');
  const [internalIsPopupMode, setInternalIsPopupMode] = useState(false);

  // Use external popup mode control if provided, otherwise use internal state
  const isPopupMode = externalIsPopupMode !== undefined ? externalIsPopupMode : internalIsPopupMode;
  const setIsPopupMode = externalSetIsPopupMode || setInternalIsPopupMode;

  // Use previewComponent if provided, otherwise use selectedComponent
  const currentComponent = previewComponent || selectedComponent;
  const currentTech = currentComponent ? getTechById(currentComponent.techId) : null;
  const currentCategory = currentComponent ? getCategoryByTechId(currentComponent.techId) : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (currentComponent && onComponentUpdate) {
      if (property === 'selectedLibraries') {
        onComponentUpdate(currentComponent.id, { selectedLibraries: value });
      } else {
        const currentProperties = currentComponent.properties || {};
        const updatedProperties = {
          ...currentProperties,
          [property]: value
        };
        onComponentUpdate(currentComponent.id, { properties: updatedProperties });
      }
    }
  };

  const renderPropertiesTab = () => {
    if (!currentComponent) {
      return (
        <div className="text-center text-gray-500 py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Component Selected</h3>
          <p className="text-sm text-gray-500">Select a component to view its properties</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <TechnologyInfo component={currentComponent} />
        <ComponentProperties 
          component={currentComponent} 
          onPropertyChange={handlePropertyChange} 
        />
        <ConnectionsPanel 
          component={currentComponent}
          connections={connections}
          onConnectionRemove={onConnectionRemove}
        />
        
        {/* Technology-specific configurations */}
        {currentComponent.techId === 'react' && (
          <ReactConfiguration 
            component={currentComponent}
            onPropertyChange={handlePropertyChange}
          />
        )}
        
        {currentComponent.techId === 'spring' && (
          <SpringBootConfiguration 
            component={currentComponent}
            onPropertyChange={handlePropertyChange}
          />
        )}
      </div>
    );
  };

  const renderSummaryTab = () => {
    const techCounts: Record<string, number> = {};
    components.forEach(comp => {
      const category = getCategoryByTechId(comp.techId);
      if (category) {
        techCounts[category] = (techCounts[category] || 0) + 1;
      }
    });

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Architecture Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">{components.length}</div>
              <div className="text-gray-600 text-sm">Components</div>
            </div>
            <div className="text-center p-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-green-600 mb-1">{connections.length}</div>
              <div className="text-gray-600 text-sm">Connections</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
            Technology Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(techCounts).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg border border-green-100">
                <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {String(count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 text-purple-600 mr-2" />
            Component List
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {components.map(comp => {
              const tech = getTechById(comp.techId);
              return (
                <div key={comp.id} className="flex items-center space-x-3 p-3 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg border border-purple-100">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: tech?.color || '#6B7280' }}
                  />
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {comp.properties?.name || 'Component'}
                  </span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {tech?.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectStructureTab = () => {
    if (!currentComponent) {
      return (
        <div className="text-center text-gray-500 py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Component Selected</h3>
          <p className="text-sm text-gray-500">Select a component to view its project structure</p>
        </div>
      );
    }

    return <ProjectStructureViewer component={currentComponent} />;
  };

  const renderPropertiesContent = () => (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6 border-b border-gray-200 bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Properties Panel</h2>
          {!isPopupMode && (
            <button
              onClick={() => setIsPopupMode(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Expand to popup"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'properties'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Properties</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'summary'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('project-structure')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'project-structure'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Project Structure</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'project-structure' && renderProjectStructureTab()}
      </div>
    </div>
  );

  // Popup overlay
  if (isPopupMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900">Properties Panel - Expanded View</h2>
            <button
              onClick={() => setIsPopupMode(false)}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Close popup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderPropertiesContent()}
          </div>
        </div>
      </div>
    );
  }

  // Regular panel view
  return (
    <div className="h-full bg-white border-l border-gray-200 shadow-lg">
      {renderPropertiesContent()}
    </div>
  );
};

export default PropertiesPanelModular; 