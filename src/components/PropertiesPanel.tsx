import React, { useState, useMemo } from 'react';
import { Settings, Info, Link, Zap, Shield, Database, Globe, Maximize2, X, Search, Package, Folder, FileText, Check, Plus } from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../data/techStack';

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
  previewComponent
}: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState('properties');
  const [isPopupMode, setIsPopupMode] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibraries, setSelectedLibraries] = useState<Record<string, any[]>>({});

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
    
    // Update component with selected libraries
    handlePropertyChange('selectedLibraries', newSelected);
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
      // Update the properties object instead of the component directly
      const updatedProperties = {
        ...currentComponent.properties,
        [property]: value
      };
      onComponentUpdate(currentComponent.id, { properties: updatedProperties });
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
                key={currentComponent?.id + '-name'}
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
                key={currentComponent?.id + '-description'}
                value={currentComponent?.properties?.description || ''}
                onChange={(e) => handlePropertyChange('description', e.target.value)}
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
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' ? renderPropertiesTab() : renderSummaryTab()}
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