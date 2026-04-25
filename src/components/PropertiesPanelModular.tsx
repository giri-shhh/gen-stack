import React, { useState } from 'react';
import { Maximize2, X, Globe, Settings, BarChart3, Palette, ExternalLink } from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import {
  TechnologyInfo,
  ComponentProperties,
  ConnectionsPanel,
  ReactConfiguration,
  SpringBootConfiguration,
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
  onOpenModuleConfig?: () => void;
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
  setIsPopupMode: externalSetIsPopupMode,
  onOpenModuleConfig,
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
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">No Component Selected</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select a component from the canvas to configure its properties</p>
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
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Architecture Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-700 bg-opacity-80 backdrop-blur-sm rounded-xl border border-blue-100 dark:border-gray-600">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{components.length}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Components</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-700 bg-opacity-80 backdrop-blur-sm rounded-xl border border-blue-100 dark:border-gray-600">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{connections.length}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Connections</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-green-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            Technology Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(techCounts).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 bg-opacity-80 backdrop-blur-sm rounded-lg border border-green-100 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
                  {String(count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-purple-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            Component List
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {components.map(comp => {
              const tech = getTechById(comp.techId);
              return (
                <div key={comp.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 bg-opacity-80 backdrop-blur-sm rounded-lg border border-purple-100 dark:border-gray-600">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: tech?.color || '#6B7280' }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                    {comp.properties?.name || 'Component'}
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-full">
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

  const renderAppearanceTab = () => {
    if (!currentComponent) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">No Component Selected</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select a component to customize its appearance</p>
        </div>
      );
    }

    const colorOptions = [
      { value: '#3B82F6', name: 'Blue' },
      { value: '#10B981', name: 'Green' },
      { value: '#F59E0B', name: 'Amber' },
      { value: '#EF4444', name: 'Red' },
      { value: '#8B5CF6', name: 'Purple' },
      { value: '#06B6D4', name: 'Cyan' },
      { value: '#F97316', name: 'Orange' },
      { value: '#EC4899', name: 'Pink' }
    ];

    return (
      <div className="space-y-4">
        {/* Color Selection */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-purple-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Component Color</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handlePropertyChange('color', color.value)}
                className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  currentComponent.properties?.color === color.value 
                    ? 'border-gray-900 shadow-md scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {currentComponent.properties?.color === color.value && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                )}
                <div className="text-xs font-medium text-white text-center mt-1 opacity-90">
                  {color.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Component Information */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Component Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100 dark:border-gray-600">
              <div className="text-gray-600 dark:text-gray-400 font-medium mb-1">ID</div>
              <div className="text-gray-900 dark:text-gray-100 font-mono text-xs">{currentComponent.id}</div>
            </div>
            <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100 dark:border-gray-600">
              <div className="text-gray-600 dark:text-gray-400 font-medium mb-1">Type</div>
              <div className="text-gray-900 dark:text-gray-100">{currentComponent.type}</div>
            </div>
            <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100 dark:border-gray-600">
              <div className="text-gray-600 dark:text-gray-400 font-medium mb-1">Position</div>
              <div className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                ({currentComponent.position.x}, {currentComponent.position.y})
              </div>
            </div>
            <div className="bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100 dark:border-gray-600">
              <div className="text-gray-600 dark:text-gray-400 font-medium mb-1">Size</div>
              <div className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                {currentComponent.size.width} × {currentComponent.size.height}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesContent = () => (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Compact Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Properties</span>
          </h2>
          <div className="flex items-center space-x-1">
            {currentComponent && onOpenModuleConfig && (
              <button
                onClick={onOpenModuleConfig}
                className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg transition-all duration-200 hover:scale-105"
                title="Open full module configuration screen"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Configure</span>
              </button>
            )}
            {!isPopupMode && (
              <button
                onClick={() => setIsPopupMode(true)}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Expand to popup view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Compact Tab Navigation */}
        <div className="flex space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm border border-gray-100 dark:border-gray-600">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              activeTab === 'properties'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Config</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              activeTab === 'summary'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Info</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 flex items-center space-x-1.5 ${
              activeTab === 'appearance'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>Style</span>
          </button>
        </div>
      </div>

      {/* Tab Content with optimized spacing */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {activeTab === 'properties' && renderPropertiesTab()}
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
        </div>
      </div>
    </div>
  );

  // Popup overlay
  if (isPopupMode) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Properties Panel</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expanded View - Configure your component</p>
              </div>
            </div>
            <button
              onClick={() => setIsPopupMode(false)}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-sm"
              title="Close popup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50/30 to-blue-50/20 dark:from-gray-900 dark:to-gray-900">
            {renderPropertiesContent()}
          </div>
        </div>
      </div>
    );
  }

  // Regular panel view
  return (
    <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-sm">
      {renderPropertiesContent()}
    </div>
  );
};

export default PropertiesPanelModular; 