import React, { useState, useMemo } from 'react';
import { Settings, Info, Link, Zap, Shield, Database, Globe, Maximize2, X, Search, Package, Folder, FileText, Check, Plus } from 'lucide-react';
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

const PropertiesPanel = ({
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
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibraries, setSelectedLibraries] = useState<Record<string, any[]>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Use external popup mode control if provided, otherwise use internal state
  const isPopupMode = externalIsPopupMode !== undefined ? externalIsPopupMode : internalIsPopupMode;
  const setIsPopupMode = externalSetIsPopupMode || setInternalIsPopupMode;

  // const tech = selectedComponent ? getTechById(selectedComponent.techId) : null;
  // const category = selectedComponent ? getCategoryByTechId(selectedComponent.techId) : null;

  // Use previewComponent if provided, otherwise use selectedComponent
  const currentComponent = previewComponent || selectedComponent;
  const currentTech = currentComponent ? getTechById(currentComponent.techId) : null;
  const currentCategory = currentComponent ? getCategoryByTechId(currentComponent.techId) : null;

  // Initialize selected libraries for the current component
  React.useEffect(() => {
    if (currentComponent && !selectedLibraries[currentComponent.id]) {
      setSelectedLibraries(prev => ({
        ...prev,
        [currentComponent.id]: currentComponent.selectedLibraries || []
      }));
    }
  }, [currentComponent]);

  // Get comprehensive add-on libraries with detailed information
  const getAddOnLibraries = (category: string) => {
    const libraries: Record<string, any[]> = {
      frontend: [
        { 
          id: 'typescript', 
          name: 'TypeScript', 
          version: '^5.0.0',
          description: 'Type-safe JavaScript development',
          category: 'Language',
          dependencies: ['@types/node', '@types/react'],
          devDependencies: ['typescript', 'ts-node'],
          files: ['tsconfig.json', 'src/**/*.ts', 'src/**/*.tsx'],
          color: '#3178C6' 
        },
        { 
          id: 'tailwind', 
          name: 'Tailwind CSS', 
          version: '^3.3.0',
          description: 'Utility-first CSS framework',
          category: 'Styling',
          dependencies: ['tailwindcss'],
          devDependencies: ['autoprefixer', 'postcss'],
          files: ['tailwind.config.js', 'postcss.config.js', 'src/**/*.css'],
          color: '#06B6D4' 
        },
        { 
          id: 'redux', 
          name: 'Redux Toolkit', 
          version: '^1.9.0',
          description: 'State management for React',
          category: 'State Management',
          dependencies: ['@reduxjs/toolkit', 'react-redux'],
          devDependencies: [],
          files: ['src/store/**/*.js', 'src/store/index.js'],
          color: '#764ABC' 
        },
        { 
          id: 'react-router', 
          name: 'React Router', 
          version: '^6.8.0',
          description: 'Client-side routing for React',
          category: 'Routing',
          dependencies: ['react-router-dom'],
          devDependencies: [],
          files: ['src/App.js', 'src/routes/**/*.js'],
          color: '#CA4245' 
        },
        { 
          id: 'axios', 
          name: 'Axios', 
          version: '^1.3.0',
          description: 'HTTP client for API calls',
          category: 'HTTP Client',
          dependencies: ['axios'],
          devDependencies: [],
          files: ['src/services/**/*.js', 'src/api/**/*.js'],
          color: '#5A29E4' 
        },
        { 
          id: 'formik', 
          name: 'Formik', 
          version: '^2.2.0',
          description: 'Form management for React',
          category: 'Forms',
          dependencies: ['formik', 'yup'],
          devDependencies: [],
          files: ['src/components/forms/**/*.js'],
          color: '#FF6B6B' 
        }
      ],
      backend: [
        { 
          id: 'typescript', 
          name: 'TypeScript', 
          version: '^5.0.0',
          description: 'Type-safe Node.js development',
          category: 'Language',
          dependencies: ['@types/node', '@types/express'],
          devDependencies: ['typescript', 'ts-node'],
          files: ['tsconfig.json', 'src/**/*.ts'],
          color: '#3178C6' 
        },
        { 
          id: 'jwt', 
          name: 'JWT', 
          version: '^9.0.0',
          description: 'JSON Web Token authentication',
          category: 'Authentication',
          dependencies: ['jsonwebtoken'],
          devDependencies: ['@types/jsonwebtoken'],
          files: ['src/middleware/auth.js', 'src/utils/jwt.js'],
          color: '#000000' 
        },
        { 
          id: 'cors', 
          name: 'CORS', 
          version: '^2.8.5',
          description: 'Cross-Origin Resource Sharing',
          category: 'Security',
          dependencies: ['cors'],
          devDependencies: ['@types/cors'],
          files: ['src/middleware/cors.js'],
          color: '#FF6B6B' 
        },
        { 
          id: 'rate-limiting', 
          name: 'Rate Limiting', 
          version: '^6.7.0',
          description: 'API rate limiting middleware',
          category: 'Security',
          dependencies: ['express-rate-limit'],
          devDependencies: [],
          files: ['src/middleware/rateLimit.js'],
          color: '#4ECDC4' 
        },
        { 
          id: 'helmet', 
          name: 'Helmet', 
          version: '^7.0.0',
          description: 'Security headers middleware',
          category: 'Security',
          dependencies: ['helmet'],
          devDependencies: [],
          files: ['src/middleware/security.js'],
          color: '#45B7D1' 
        },
        { 
          id: 'joi', 
          name: 'Joi Validation', 
          version: '^17.9.0',
          description: 'Data validation library',
          category: 'Validation',
          dependencies: ['joi'],
          devDependencies: [],
          files: ['src/validation/**/*.js'],
          color: '#96CEB4' 
        }
      ],
      database: [
        { 
          id: 'connection-pooling', 
          name: 'Connection Pooling', 
          version: '^3.6.0',
          description: 'Database connection management',
          category: 'Performance',
          dependencies: ['pg-pool'],
          devDependencies: [],
          files: ['src/database/pool.js'],
          color: '#45B7D1' 
        },
        { 
          id: 'indexing', 
          name: 'Database Indexing', 
          version: 'N/A',
          description: 'Performance optimization strategy',
          category: 'Performance',
          dependencies: [],
          devDependencies: [],
          files: ['src/database/migrations/**/*.sql'],
          color: '#96CEB4' 
        },
        { 
          id: 'backup-strategy', 
          name: 'Backup Strategy', 
          version: 'N/A',
          description: 'Database backup and recovery',
          category: 'Operations',
          dependencies: [],
          devDependencies: [],
          files: ['scripts/backup.js', 'config/backup.json'],
          color: '#FFEAA7' 
        },
        { 
          id: 'monitoring', 
          name: 'Database Monitoring', 
          version: '^2.0.0',
          description: 'Database performance monitoring',
          category: 'Monitoring',
          dependencies: ['pg-stat-statements'],
          devDependencies: [],
          files: ['src/monitoring/db.js'],
          color: '#DDA0DD' 
        }
      ],
      cloud: [
        { 
          id: 'load-balancing', 
          name: 'Load Balancing', 
          version: 'N/A',
          description: 'Traffic distribution strategy',
          category: 'Scalability',
          dependencies: [],
          devDependencies: [],
          files: ['config/load-balancer.json'],
          color: '#FF6B6B' 
        },
        { 
          id: 'auto-scaling', 
          name: 'Auto Scaling', 
          version: 'N/A',
          description: 'Automatic resource scaling',
          category: 'Scalability',
          dependencies: [],
          devDependencies: [],
          files: ['config/auto-scaling.json'],
          color: '#4ECDC4' 
        },
        { 
          id: 'monitoring', 
          name: 'Cloud Monitoring', 
          version: '^1.0.0',
          description: 'Application performance monitoring',
          category: 'Monitoring',
          dependencies: ['@google-cloud/monitoring'],
          devDependencies: [],
          files: ['src/monitoring/cloud.js'],
          color: '#DDA0DD' 
        },
        { 
          id: 'security-groups', 
          name: 'Security Groups', 
          version: 'N/A',
          description: 'Network security configuration',
          category: 'Security',
          dependencies: [],
          devDependencies: [],
          files: ['config/security-groups.json'],
          color: '#45B7D1' 
        }
      ]
    };
    return libraries[category] || [];
  };

  // Filter libraries based on search query
  const filteredLibraries = useMemo(() => {
    if (!currentCategory) return [];
    const libraries = getAddOnLibraries(currentCategory);
    if (!searchQuery) return libraries;
    
    return libraries.filter(lib => 
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentCategory, searchQuery]);

  // Handle library selection
  const handleLibraryToggle = (libraryId: string) => {
    if (!currentComponent) return;
    const currentSelected = selectedLibraries[currentComponent.id] || [];
    const isSelected = currentSelected.some(lib => lib.id === libraryId);
    let newSelected: any[] = [];
    if (isSelected) {
      newSelected = currentSelected.filter(lib => lib.id !== libraryId);
    } else {
      const library = getAddOnLibraries(currentCategory || '').find(lib => lib.id === libraryId);
      if (library) {
        newSelected = [...currentSelected, library];
      }
    }
    setSelectedLibraries(prev => ({
      ...prev,
      [currentComponent.id]: newSelected
    }));
    // Persist selected libraries on the component itself
    if (onComponentUpdate) {
      onComponentUpdate(currentComponent.id, { selectedLibraries: newSelected });
    }
  };

  // Get project data for the selected component
  const getProjectData = () => {
    if (!currentComponent) return null;
    
    const selectedLibs = selectedLibraries[currentComponent.id] || [];
    const allDependencies: Record<string, string> = {};
    const allDevDependencies: Record<string, string> = {};
    const allFiles: string[] = [];
    
    selectedLibs.forEach(lib => {
      lib.dependencies?.forEach((dep: string) => {
        const [name, version] = dep.split('@');
        allDependencies[name] = version || 'latest';
      });
      lib.devDependencies?.forEach((dep: string) => {
        const [name, version] = dep.split('@');
        allDevDependencies[name] = version || 'latest';
      });
      allFiles.push(...(lib.files || []));
    });
    
    return {
      component: currentComponent,
      libraries: selectedLibs,
      dependencies: allDependencies,
      devDependencies: allDevDependencies,
      files: [...new Set(allFiles)],
      totalLibraries: selectedLibs.length
    };
  };

  // Calculate component statistics
  const componentStats = useMemo(() => {
    if (!currentComponent) return null;
    
    const incomingConnections = connections.filter(conn => conn.target === currentComponent.id);
    const outgoingConnections = connections.filter(conn => conn.source === currentComponent.id);
    const totalConnections = incomingConnections.length + outgoingConnections.length;
    
    return {
      incoming: incomingConnections.length,
      outgoing: outgoingConnections.length,
      total: totalConnections
    };
  }, [currentComponent, connections]);

  const handlePropertyChange = (property: string, value: any) => {
    if (currentComponent && onComponentUpdate) {
      if (property === 'selectedLibraries') {
        // Update selectedLibraries directly on the component
        onComponentUpdate(currentComponent.id, { selectedLibraries: value });
      } else {
        // Ensure properties object exists and update it
        const currentProperties = currentComponent.properties || {};
        const updatedProperties = {
          ...currentProperties,
          [property]: value
        };
        onComponentUpdate(currentComponent.id, { properties: updatedProperties });
      }
    }
  };



  const renderTechnologyInfo = () => {
    if (!currentTech || !currentCategory) return null;


    const selectedLibs = selectedLibraries[currentComponent?.id || ''] || [];

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <div 
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: currentTech.color }}
          />
          <h3 className="font-semibold text-gray-900">{currentTech.name}</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{currentTech.description}</p>
        
        {/* Component Name and Description */}
        <div className="bg-white bg-opacity-80 rounded-lg p-3 mb-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Component Name</label>
              <input
                type="text"
                value={currentComponent?.properties?.name || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  handlePropertyChange('name', newValue);
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter component name"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
              <textarea
                value={currentComponent?.properties?.description || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  handlePropertyChange('description', newValue);
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Describe what this component does..."
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Database className="w-3 h-3" />
            <span className="capitalize">{currentCategory}</span>
          </div>
          
          {/* Selected Libraries Summary */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">Add-On Libraries ({selectedLibs.length})</h4>
              <button
                onClick={() => setShowAddOnModal(true)}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
            
            {selectedLibs.length > 0 ? (
              <div className="space-y-1">
                {selectedLibs.slice(0, 3).map((lib) => (
                  <div key={lib.id} className="flex items-center space-x-2 p-1 bg-white rounded text-xs">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lib.color }}
                    />
                    <span className="text-gray-700">{lib.name}</span>
                    <span className="text-gray-500 text-xs">({lib.category})</span>
                  </div>
                ))}
                {selectedLibs.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{selectedLibs.length - 3} more libraries
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-2">
                No libraries selected
              </div>
            )}
          </div>

          {/* Project Preview Button */}
          {selectedLibs.length > 0 && (
            <button
              onClick={() => setShowProjectPreview(true)}
              className="w-full mt-3 bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors text-xs font-medium flex items-center justify-center space-x-2"
            >
              <Folder className="w-3 h-3" />
              <span>Preview Project Structure</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Component Details section has been merged into Technology Info section

  const renderConnections = () => {
    if (!currentComponent) return null;

    const componentConnections = connections.filter(
      conn => conn.source === currentComponent.id || conn.target === currentComponent.id
    );

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Link className="w-4 h-4 mr-2" />
          Connections ({componentStats?.total || 0})
        </h3>
        
        {componentStats && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
            <div className="flex justify-between text-blue-700">
              <span>Incoming: {componentStats.incoming}</span>
              <span>Outgoing: {componentStats.outgoing}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {componentConnections.map(connection => {
            const fromComp = components.find(c => c.id === connection.source);
            const toComp = components.find(c => c.id === connection.target);
            const isFrom = connection.source === currentComponent.id;
            const otherComp = isFrom ? toComp : fromComp;
            const otherTech = otherComp ? getTechById(otherComp.techId) : null;
            
            return (
              <div key={connection.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: otherTech?.color || '#6B7280' }}
                  />
                  <span className="text-sm text-gray-700">
                    {isFrom ? '→' : '←'} {otherComp?.properties?.name || 'Component'}
                  </span>
                </div>
                <button
                  onClick={() => onConnectionRemove && onConnectionRemove(connection.id)}
                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            );
          })}
          
          {componentConnections.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              <Link className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>No connections</p>
              <p className="text-xs mt-1">Use the link icon to create connections</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdvancedProperties = () => {
    if (!currentComponent) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Advanced Properties
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Version</label>
            <input
              type="text"
              value={currentComponent.properties?.version || '1.0.0'}
              onChange={(e) => handlePropertyChange('version', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.0.0"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Port (if applicable)</label>
            <input
              type="number"
              value={currentComponent.properties?.port || ''}
              onChange={(e) => handlePropertyChange('port', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="3000"
              min="1"
              max="65535"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Database Name (if applicable)</label>
            <input
              type="text"
              value={currentComponent.properties?.databaseName || ''}
              onChange={(e) => handlePropertyChange('databaseName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="my_database"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">API Base Path (if applicable)</label>
            <input
              type="text"
              value={currentComponent.properties?.apiBasePath || ''}
              onChange={(e) => handlePropertyChange('apiBasePath', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/api/v1"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Notes</label>
            <textarea
              value={currentComponent.properties?.notes || ''}
              onChange={(e) => handlePropertyChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add notes about this component..."
            />
          </div>
        </div>
      </div>
    );
  };

  // React-specific configuration section
  const renderReactConfiguration = () => {
    if (!currentComponent || currentComponent.techId !== 'react') return null;

    // Get React configuration summary
    const getReactConfigSummary = () => {
      const config = currentComponent.properties || {};
      const summary = {
        buildTool: config.buildTool || 'vite',
        language: config.language || 'javascript',
        cssFramework: config.cssFramework || 'tailwind',
        routing: config.routing || 'react-router',
        stateManagement: config.stateManagement || 'context',
        testingFramework: config.testingFramework || 'jest',
        features: [] as string[]
      };

      if (config.pwa) summary.features.push('PWA Support');
      if (config.i18n) summary.features.push('Internationalization');
      if (config.storybook) summary.features.push('Storybook');
      if (config.eslint) summary.features.push('ESLint');
      if (config.prettier) summary.features.push('Prettier');
      if (config.husky) summary.features.push('Git Hooks');

      return summary;
    };

    const configSummary = getReactConfigSummary();

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          React Configuration
        </h3>

        {/* Quick Presets */}
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handlePropertyChange('buildTool', 'vite');
                handlePropertyChange('language', 'typescript');
                handlePropertyChange('cssFramework', 'tailwind');
                handlePropertyChange('routing', 'react-router');
                handlePropertyChange('stateManagement', 'context');
                handlePropertyChange('testingFramework', 'vitest');
                handlePropertyChange('eslint', true);
                handlePropertyChange('prettier', true);
              }}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Modern React (Vite + TS + Tailwind)
            </button>
            <button
              onClick={() => {
                handlePropertyChange('buildTool', 'nextjs');
                handlePropertyChange('language', 'typescript');
                handlePropertyChange('cssFramework', 'tailwind');
                handlePropertyChange('routing', 'nextjs-routing');
                handlePropertyChange('stateManagement', 'context');
                handlePropertyChange('testingFramework', 'jest');
                handlePropertyChange('eslint', true);
                handlePropertyChange('prettier', true);
              }}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
            >
              Next.js Full Stack
            </button>
            <button
              onClick={() => {
                handlePropertyChange('buildTool', 'create-react-app');
                handlePropertyChange('language', 'javascript');
                handlePropertyChange('cssFramework', 'bootstrap');
                handlePropertyChange('routing', 'react-router');
                handlePropertyChange('stateManagement', 'redux');
                handlePropertyChange('testingFramework', 'jest');
                handlePropertyChange('eslint', true);
              }}
              className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
            >
              Classic React (CRA + Redux)
            </button>
            <button
              onClick={() => {
                handlePropertyChange('buildTool', 'vite');
                handlePropertyChange('language', 'typescript');
                handlePropertyChange('cssFramework', 'styled-components');
                handlePropertyChange('routing', 'react-router');
                handlePropertyChange('stateManagement', 'zustand');
                handlePropertyChange('testingFramework', 'vitest');
                handlePropertyChange('eslint', true);
                handlePropertyChange('prettier', true);
                handlePropertyChange('storybook', true);
              }}
              className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors"
            >
              Developer Experience
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Build System */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-blue-800">Build System</h4>
            
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Build Tool</label>
              <select
                value={currentComponent.properties?.buildTool || 'vite'}
                onChange={(e) => handlePropertyChange('buildTool', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="vite">Vite (Recommended)</option>
                <option value="create-react-app">Create React App</option>
                <option value="nextjs">Next.js</option>
                <option value="webpack">Webpack</option>
                <option value="parcel">Parcel</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Language</label>
              <select
                value={currentComponent.properties?.language || 'javascript'}
                onChange={(e) => handlePropertyChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">CSS Framework</label>
              <select
                value={currentComponent.properties?.cssFramework || 'tailwind'}
                onChange={(e) => handlePropertyChange('cssFramework', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="css-modules">CSS Modules</option>
                <option value="styled-components">Styled Components</option>
                <option value="emotion">Emotion</option>
                <option value="bootstrap">Bootstrap</option>
                <option value="material-ui">Material-UI</option>
                <option value="chakra-ui">Chakra UI</option>
                <option value="none">No CSS Framework</option>
              </select>
            </div>
          </div>

          {/* Project Structure */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-blue-800">Project Structure</h4>
            
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Routing</label>
              <select
                value={currentComponent.properties?.routing || 'react-router'}
                onChange={(e) => handlePropertyChange('routing', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="react-router">React Router</option>
                <option value="nextjs-routing">Next.js Routing</option>
                <option value="none">No Routing</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">State Management</label>
              <select
                value={currentComponent.properties?.stateManagement || 'context'}
                onChange={(e) => handlePropertyChange('stateManagement', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="context">React Context</option>
                <option value="redux">Redux Toolkit</option>
                <option value="zustand">Zustand</option>
                <option value="recoil">Recoil</option>
                <option value="jotai">Jotai</option>
                <option value="none">No State Management</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Testing Framework</label>
              <select
                value={currentComponent.properties?.testingFramework || 'jest'}
                onChange={(e) => handlePropertyChange('testingFramework', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="jest">Jest + React Testing Library</option>
                <option value="vitest">Vitest</option>
                <option value="cypress">Cypress</option>
                <option value="playwright">Playwright</option>
                <option value="none">No Testing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Advanced Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.pwa || false}
                onChange={(e) => handlePropertyChange('pwa', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-blue-700">PWA Support</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.i18n || false}
                onChange={(e) => handlePropertyChange('i18n', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-blue-700">Internationalization</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.storybook || false}
                onChange={(e) => handlePropertyChange('storybook', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-blue-700">Storybook</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.eslint || false}
                onChange={(e) => handlePropertyChange('eslint', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-blue-700">ESLint</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.prettier || false}
                onChange={(e) => handlePropertyChange('prettier', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-blue-700">Prettier</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.husky || false}
                onChange={(e) => handlePropertyChange('husky', e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-blue-700">Git Hooks (Husky)</span>
            </label>
          </div>
        </div>

        {/* Environment Configuration */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Environment Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Development Port</label>
              <input
                type="number"
                value={currentComponent.properties?.devPort || 3000}
                onChange={(e) => handlePropertyChange('devPort', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                min="1024"
                max="65535"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Production Port</label>
              <input
                type="number"
                value={currentComponent.properties?.prodPort || 3000}
                onChange={(e) => handlePropertyChange('prodPort', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                min="1024"
                max="65535"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-blue-700 block mb-1">API Base URL</label>
            <input
              type="text"
              value={currentComponent.properties?.apiBaseUrl || 'http://localhost:5000'}
              onChange={(e) => handlePropertyChange('apiBaseUrl', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="http://localhost:5000"
            />
          </div>
        </div>

        {/* Code Quality */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Code Quality</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Strict Mode</label>
              <select
                value={currentComponent.properties?.strictMode || 'enabled'}
                onChange={(e) => handlePropertyChange('strictMode', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">Error Boundary</label>
              <select
                value={currentComponent.properties?.errorBoundary || 'enabled'}
                onChange={(e) => handlePropertyChange('errorBoundary', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Configuration Summary</h4>
          
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-600">Build Tool:</span>
                <span className="font-medium">{configSummary.buildTool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Language:</span>
                <span className="font-medium">{configSummary.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">CSS Framework:</span>
                <span className="font-medium">{configSummary.cssFramework}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Routing:</span>
                <span className="font-medium">{configSummary.routing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">State Management:</span>
                <span className="font-medium">{configSummary.stateManagement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Testing:</span>
                <span className="font-medium">{configSummary.testingFramework}</span>
              </div>
            </div>
            
            {configSummary.features.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-100">
                <div className="text-xs text-blue-600 mb-2">Additional Features:</div>
                <div className="flex flex-wrap gap-1">
                  {configSummary.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Spring Boot-specific configuration section
  const renderSpringBootConfiguration = () => {
    if (!currentComponent || currentComponent.techId !== 'spring') return null;

    // Get Spring Boot configuration summary
    const getSpringBootConfigSummary = () => {
      const config = currentComponent.properties || {};
      const summary = {
        projectType: config.projectType || 'maven',
        language: config.language || 'java',
        packaging: config.packaging || 'jar',
        javaVersion: config.javaVersion || '17',
        springBootVersion: config.springBootVersion || '3.2.0',
        groupId: config.groupId || 'com.example',
        artifactId: config.artifactId || 'demo',
        name: config.name || 'demo',
        description: config.description || 'Demo project for Spring Boot',
        packageName: config.packageName || 'com.example.demo',
        features: [] as string[]
      };

      if (config.web) summary.features.push('Spring Web');
      if (config.dataJpa) summary.features.push('Spring Data JPA');
      if (config.dataMongodb) summary.features.push('Spring Data MongoDB');
      if (config.dataRedis) summary.features.push('Spring Data Redis');
      if (config.security) summary.features.push('Spring Security');
      if (config.actuator) summary.features.push('Spring Boot Actuator');
      if (config.devTools) summary.features.push('Spring Boot DevTools');
      if (config.validation) summary.features.push('Validation');
      if (config.cache) summary.features.push('Spring Cache');
      if (config.messaging) summary.features.push('Spring Messaging');
      if (config.cloud) summary.features.push('Spring Cloud');
      if (config.testcontainers) summary.features.push('Testcontainers');

      return summary;
    };

    const configSummary = getSpringBootConfigSummary();

    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Spring Boot Configuration
        </h3>

        {/* Quick Presets */}
        <div className="mb-4 p-3 bg-green-100 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handlePropertyChange('projectType', 'maven');
                handlePropertyChange('language', 'java');
                handlePropertyChange('packaging', 'jar');
                handlePropertyChange('javaVersion', '17');
                handlePropertyChange('springBootVersion', '3.2.0');
                handlePropertyChange('web', true);
                handlePropertyChange('dataJpa', true);
                handlePropertyChange('h2', true);
                handlePropertyChange('devTools', true);
                handlePropertyChange('actuator', true);
              }}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
            >
              Web Application
            </button>
            <button
              onClick={() => {
                handlePropertyChange('projectType', 'maven');
                handlePropertyChange('language', 'java');
                handlePropertyChange('packaging', 'jar');
                handlePropertyChange('javaVersion', '17');
                handlePropertyChange('springBootVersion', '3.2.0');
                handlePropertyChange('web', true);
                handlePropertyChange('dataJpa', true);
                handlePropertyChange('postgresql', true);
                handlePropertyChange('security', true);
                handlePropertyChange('actuator', true);
                handlePropertyChange('validation', true);
              }}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Secure REST API
            </button>
            <button
              onClick={() => {
                handlePropertyChange('projectType', 'maven');
                handlePropertyChange('language', 'java');
                handlePropertyChange('packaging', 'jar');
                handlePropertyChange('javaVersion', '17');
                handlePropertyChange('springBootVersion', '3.2.0');
                handlePropertyChange('web', true);
                handlePropertyChange('dataMongodb', true);
                handlePropertyChange('cache', true);
                handlePropertyChange('actuator', true);
                handlePropertyChange('devTools', true);
              }}
              className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
            >
              Microservice
            </button>
            <button
              onClick={() => {
                handlePropertyChange('projectType', 'maven');
                handlePropertyChange('language', 'java');
                handlePropertyChange('packaging', 'jar');
                handlePropertyChange('javaVersion', '17');
                handlePropertyChange('springBootVersion', '3.2.0');
                handlePropertyChange('web', true);
                handlePropertyChange('dataJpa', true);
                handlePropertyChange('postgresql', true);
                handlePropertyChange('security', true);
                handlePropertyChange('actuator', true);
                handlePropertyChange('validation', true);
                handlePropertyChange('cache', true);
                handlePropertyChange('messaging', true);
                handlePropertyChange('cloud', true);
              }}
              className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors"
            >
              Enterprise Application
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Metadata */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-800">Project Metadata</h4>
            
            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Project Type</label>
              <select
                value={currentComponent.properties?.projectType || 'maven'}
                onChange={(e) => handlePropertyChange('projectType', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="maven">Maven</option>
                <option value="gradle">Gradle</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Language</label>
              <select
                value={currentComponent.properties?.language || 'java'}
                onChange={(e) => handlePropertyChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="java">Java</option>
                <option value="kotlin">Kotlin</option>
                <option value="groovy">Groovy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Packaging</label>
              <select
                value={currentComponent.properties?.packaging || 'jar'}
                onChange={(e) => handlePropertyChange('packaging', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="jar">JAR</option>
                <option value="war">WAR</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Java Version</label>
              <select
                value={currentComponent.properties?.javaVersion || '17'}
                onChange={(e) => handlePropertyChange('javaVersion', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="8">Java 8</option>
                <option value="11">Java 11</option>
                <option value="17">Java 17</option>
                <option value="21">Java 21</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Spring Boot Version</label>
              <select
                value={currentComponent.properties?.springBootVersion || '3.2.0'}
                onChange={(e) => handlePropertyChange('springBootVersion', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="3.2.0">3.2.0 (Latest)</option>
                <option value="3.1.0">3.1.0</option>
                <option value="2.7.0">2.7.0</option>
              </select>
            </div>
          </div>

          {/* Project Coordinates */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-800">Project Coordinates</h4>
            
            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Group ID</label>
              <input
                type="text"
                value={currentComponent.properties?.groupId || 'com.example'}
                onChange={(e) => handlePropertyChange('groupId', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="com.example"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Artifact ID</label>
              <input
                type="text"
                value={currentComponent.properties?.artifactId || 'demo'}
                onChange={(e) => handlePropertyChange('artifactId', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="demo"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Name</label>
              <input
                type="text"
                value={currentComponent.properties?.name || 'demo'}
                onChange={(e) => handlePropertyChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="demo"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Description</label>
              <input
                type="text"
                value={currentComponent.properties?.description || 'Demo project for Spring Boot'}
                onChange={(e) => handlePropertyChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="Demo project for Spring Boot"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-green-700 block mb-1">Package Name</label>
              <input
                type="text"
                value={currentComponent.properties?.packageName || 'com.example.demo'}
                onChange={(e) => handlePropertyChange('packageName', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                placeholder="com.example.demo"
              />
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-3">Dependencies</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.web || false}
                onChange={(e) => handlePropertyChange('web', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Web</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.dataJpa || false}
                onChange={(e) => handlePropertyChange('dataJpa', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Data JPA</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.dataMongodb || false}
                onChange={(e) => handlePropertyChange('dataMongodb', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Data MongoDB</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.dataRedis || false}
                onChange={(e) => handlePropertyChange('dataRedis', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Data Redis</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.security || false}
                onChange={(e) => handlePropertyChange('security', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Security</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.actuator || false}
                onChange={(e) => handlePropertyChange('actuator', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Boot Actuator</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.devTools || false}
                onChange={(e) => handlePropertyChange('devTools', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Boot DevTools</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.validation || false}
                onChange={(e) => handlePropertyChange('validation', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Validation</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.cache || false}
                onChange={(e) => handlePropertyChange('cache', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Cache</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.messaging || false}
                onChange={(e) => handlePropertyChange('messaging', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Messaging</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.cloud || false}
                onChange={(e) => handlePropertyChange('cloud', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Spring Cloud</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.testcontainers || false}
                onChange={(e) => handlePropertyChange('testcontainers', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Testcontainers</span>
            </label>
          </div>
        </div>

        {/* Database */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-3">Database</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.h2 || false}
                onChange={(e) => handlePropertyChange('h2', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">H2 Database</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.postgresql || false}
                onChange={(e) => handlePropertyChange('postgresql', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">PostgreSQL</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.mysql || false}
                onChange={(e) => handlePropertyChange('mysql', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">MySQL</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.mariadb || false}
                onChange={(e) => handlePropertyChange('mariadb', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">MariaDB</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.mongodb || false}
                onChange={(e) => handlePropertyChange('mongodb', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">MongoDB</span>
            </label>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={currentComponent.properties?.redis || false}
                onChange={(e) => handlePropertyChange('redis', e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700">Redis</span>
            </label>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="mt-4 pt-4 border-t border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-3">Configuration Summary</h4>
          
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600">Project Type:</span>
                <span className="font-medium">{configSummary.projectType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Language:</span>
                <span className="font-medium">{configSummary.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Packaging:</span>
                <span className="font-medium">{configSummary.packaging}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Java Version:</span>
                <span className="font-medium">{configSummary.javaVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Spring Boot:</span>
                <span className="font-medium">{configSummary.springBootVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Group ID:</span>
                <span className="font-medium">{configSummary.groupId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Artifact ID:</span>
                <span className="font-medium">{configSummary.artifactId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Package:</span>
                <span className="font-medium">{configSummary.packageName}</span>
              </div>
            </div>
            
            {configSummary.features.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-100">
                <div className="text-xs text-green-600 mb-2">Selected Dependencies:</div>
                <div className="flex flex-wrap gap-1">
                  {configSummary.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesTab = () => {
    if (!currentComponent) {
      return (
        <div className="text-center text-gray-500 py-12">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Component Selected</h3>
          <p className="text-sm mb-6">Select a component to view and edit its properties</p>
          <div className="space-y-2 text-xs text-gray-400">
            <p>💡 <strong>Tip:</strong> Click on any component to select it</p>
            <p>🔗 <strong>Connect:</strong> Use the link icon to create workflow connections</p>
            <p>🎨 <strong>Resize:</strong> Drag the corner handle to resize components</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderTechnologyInfo()}
        {renderReactConfiguration()}
        {renderSpringBootConfiguration()}
        {renderConnections()}
        {renderAdvancedProperties()}
        
        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Danger Zone
          </h3>
          <p className="text-sm text-red-700 mb-3">
            This action cannot be undone. This will permanently delete the component and all its connections.
          </p>
          <button
            onClick={() => onComponentRemove && onComponentRemove(currentComponent.id)}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Remove Component
          </button>
        </div>
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
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Architecture Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{components.length}</div>
              <div className="text-gray-600">Components</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{connections.length}</div>
              <div className="text-gray-600">Connections</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Technology Distribution</h3>
          <div className="space-y-2">
            {Object.entries(techCounts).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700 capitalize">{category}</span>
                <span className="text-sm font-medium text-gray-900">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Component List</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {components.map(comp => {
              const tech = getTechById(comp.techId);
              return (
                <div key={comp.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tech?.color || '#6B7280' }}
                  />
                  <span className="text-sm text-gray-900">{comp.properties?.name || 'Component'}</span>
                  <span className="text-xs text-gray-500 ml-auto">{tech?.name}</span>
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
        <div className="text-center text-gray-500 py-8">
          <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Select a component to view its project structure</p>
        </div>
      );
    }

    const generateProjectStructure = () => {
      const componentType = currentComponent.techId;
      const projectName = currentComponent.properties?.name || 'my-app';
      
      // Base structure for all projects
      const baseStructure = {
        'README.md': {
          type: 'file',
          content: `# ${projectName}

This project was generated using the Fullstack App Generator.

## Technology Stack
- ${currentTech?.name || 'Unknown Technology'}

## Available Scripts

- \`npm start\`: Runs the app in development mode
- \`npm run build\`: Builds the app for production
- \`npm test\`: Launches the test runner
`
        }
      };

      // React-specific structure
      if (componentType === 'react') {
        return {
          ...baseStructure,
          'package.json': {
            type: 'file',
            content: `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`
          },
          'public/': {
            type: 'folder',
            children: {
              'index.html': {
                type: 'file',
                content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
              },
              'favicon.ico': { type: 'file', content: 'Binary file' },
              'manifest.json': {
                type: 'file',
                content: `{
  "short_name": "${projectName}",
  "name": "${projectName}",
  "icons": []
}`
              }
            }
          },
          'src/': {
            type: 'folder',
            children: {
              'index.js': {
                type: 'file',
                content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
              },
              'App.js': {
                type: 'file',
                content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${projectName}</h1>
      </header>
    </div>
  );
}

export default App;`
              },
              'App.css': {
                type: 'file',
                content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}
`
              },
              'index.css': {
                type: 'file',
                content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
              }
            }
          }
        };
      }

      // Spring Boot-specific structure
      if (componentType === 'spring') {
        const springStructure = {
          ...baseStructure,
          'pom.xml': {
            type: 'file',
            content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>${projectName}</artifactId>
    <version>0.1.0</version>
    <name>${projectName}</name>
    <description>${currentComponent.properties?.description || 'Spring Boot Application'}</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
          },
          'src/main/java/com/example/Application.java': {
            type: 'file',
            content: `package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}`
          },
          'src/main/java/com/example/controller/HelloController.java': {
            type: 'file',
            content: `package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/")
    public String hello() {
        return "Hello from ${projectName}!";
    }
}`
          },
          'src/main/resources/application.properties': {
            type: 'file',
            content: `server.port=8080
spring.application.name=${projectName}`
          },
          'src/test/java/com/example/ApplicationTests.java': {
            type: 'file',
            content: `package com.example;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {
    @Test
    void contextLoads() {
    }
}`
          }
        };
        return springStructure;
      }

      // Node.js/Express-specific structure
      if (componentType === 'node' || componentType === 'express') {
        return {
          ...baseStructure,
          'package.json': {
            type: 'file',
            content: `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "${currentComponent.properties?.description || 'Node.js Application'}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}`
          },
          'index.js': {
            type: 'file',
            content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${projectName}!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`
          },
          'src/': {
            type: 'folder',
            children: {
              'routes/': {
                type: 'folder',
                children: {
                  'index.js': {
                    type: 'file',
                    content: `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = router;`
                  }
                }
              }
            }
          }
        };
      }

      // Default structure for unknown components
      return {
        ...baseStructure,
        'package.json': {
          type: 'file',
          content: `{
  "name": "${projectName}",
  "version": "0.1.0",
  "description": "${currentComponent.properties?.description || 'Generated Project'}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`
        },
        'index.js': {
          type: 'file',
          content: `console.log('Hello from ${projectName}!');`
        }
      };
    };

    const renderFileTree = (tree: any, path: string = '') => {
      return Object.entries(tree).map(([name, item]: [string, any]) => {
        const fullPath = path ? `${path}/${name}` : name;
        const isFolder = item.type === 'folder';
        const isSelected = selectedFile === fullPath;
        const isExpanded = expandedFolders.has(fullPath);

        return (
          <div key={fullPath} className="ml-4">
            <div
              className={`flex items-center space-x-2 p-1 rounded cursor-pointer hover:bg-gray-100 ${
                isSelected ? 'bg-blue-100 text-blue-700' : ''
              }`}
              onClick={() => {
                if (isFolder) {
                  const newExpanded = new Set(expandedFolders);
                  if (isExpanded) {
                    newExpanded.delete(fullPath);
                  } else {
                    newExpanded.add(fullPath);
                  }
                  setExpandedFolders(newExpanded);
                } else {
                  setSelectedFile(fullPath);
                  setFileContent(item.content || '');
                }
              }}
            >
              {isFolder ? (
                <Folder className={`w-4 h-4 text-blue-500 ${isExpanded ? 'fill-current' : ''}`} />
              ) : (
                <FileText className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm">{name}</span>
            </div>
            {isFolder && item.children && isExpanded && (
              <div className="ml-4">
                {renderFileTree(item.children, fullPath)}
              </div>
            )}
          </div>
        );
      });
    };

    const projectStructure = generateProjectStructure();

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Folder className="w-4 h-4 mr-2" />
            Project Structure
          </h3>
          <div className="text-sm text-gray-600 mb-4">
            Generated project structure for <strong>{currentComponent.properties?.name || currentComponent.techId}</strong>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* File Tree */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">File Structure</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {renderFileTree(projectStructure)}
              </div>
            </div>

            {/* File Content */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">File Content</h4>
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">{selectedFile}</div>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    {fileContent}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-8 text-center">
                  Select a file to view its content
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Project Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Project Name</div>
              <div className="text-gray-900">{currentComponent.properties?.name || 'React App'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Technology</div>
              <div className="text-gray-900">{currentTech?.name || 'Unknown'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Description</div>
              <div className="text-gray-900">{currentComponent.properties?.description || 'No description'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Files Generated</div>
              <div className="text-gray-900">{Object.keys(projectStructure).length} files</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesContent = () => (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Properties Panel</h2>
          {!isPopupMode && (
            <button
              onClick={() => setIsPopupMode(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Expand to popup"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              activeTab === 'properties'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('project-structure')}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              activeTab === 'project-structure'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Project Structure
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
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
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Properties Panel - Expanded View</h2>
            <button
              onClick={() => setIsPopupMode(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderPropertiesContent()}
          </div>
        </div>
      </div>
    );
  }

  // Add-On Libraries Modal
  const renderAddOnModal = () => {
    if (!showAddOnModal || !currentComponent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Manage Add-On Libraries</h2>
            <button
              onClick={() => setShowAddOnModal(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLibraries.map((library) => {
                const isSelected = selectedLibraries[currentComponent.id]?.some(lib => lib.id === library.id);
                return (
                  <div
                    key={library.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleLibraryToggle(library.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: library.color }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{library.name}</h3>
                          <p className="text-sm text-gray-600">{library.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSelected ? (
                          <Check className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{library.category}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">v{library.version}</span>
                      </div>
                      
                      {library.dependencies && library.dependencies.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Dependencies:</span> {library.dependencies.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredLibraries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No libraries found</h3>
                <p className="text-sm">Try adjusting your search query</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedLibraries[currentComponent.id]?.length || 0} libraries selected
              </div>
              <button
                onClick={() => setShowAddOnModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Project Preview Modal
  const renderProjectPreviewModal = () => {
    if (!showProjectPreview || !currentComponent) return null;
    
    const projectData = getProjectData();
    if (!projectData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Project Structure Preview</h2>
            <button
              onClick={() => setShowProjectPreview(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Component Info */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Component Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{projectData.component.properties?.name || 'Component'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Technology:</span>
                      <span className="font-medium">{currentTech?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{currentCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Libraries:</span>
                      <span className="font-medium">{projectData.totalLibraries}</span>
                    </div>
                  </div>
                </div>

                {/* Dependencies */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Dependencies
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(projectData.dependencies).map(([name, version]) => (
                      <div key={name} className="flex justify-between text-sm">
                        <span className="text-gray-700">{name}</span>
                        <span className="text-gray-600">{version}</span>
                      </div>
                    ))}
                    {Object.keys(projectData.dependencies).length === 0 && (
                      <div className="text-sm text-gray-500">No dependencies</div>
                    )}
                  </div>
                </div>

                {/* Dev Dependencies */}
                {Object.keys(projectData.devDependencies).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Dev Dependencies
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(projectData.devDependencies).map(([name, version]) => (
                        <div key={name} className="flex justify-between text-sm">
                          <span className="text-gray-700">{name}</span>
                          <span className="text-gray-600">{version}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* File Structure */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  File Structure
                </h3>
                <div className="space-y-1">
                  {projectData.files.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="font-mono">{file}</span>
                    </div>
                  ))}
                  {projectData.files.length === 0 && (
                    <div className="text-sm text-gray-500">No files generated</div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Libraries */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Selected Libraries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectData.libraries.map((library) => (
                  <div key={library.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: library.color }}
                      />
                      <span className="font-medium text-sm">{library.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{library.description}</p>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Category:</span> {library.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ready to generate code with {projectData.totalLibraries} libraries
              </div>
              <button
                onClick={() => setShowProjectPreview(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Regular sidebar view
  return (
    <>
      {renderPropertiesContent()}
      {renderAddOnModal()}
      {renderProjectPreviewModal()}
    </>
  );
};

export default PropertiesPanel; 