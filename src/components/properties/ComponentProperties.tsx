import React from 'react';
import { Settings, Palette, Type, FileText } from 'lucide-react';
import type { CanvasComponent } from '../../types';

interface ComponentPropertiesProps {
  component: CanvasComponent;
  onPropertyChange: (property: string, value: any) => void;
}

const ComponentProperties: React.FC<ComponentPropertiesProps> = ({ 
  component, 
  onPropertyChange 
}) => {
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
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Settings className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">Component Properties</h3>
      </div>
      
      <div className="space-y-6">
        {/* Component Name */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-green-100">
          <div className="flex items-center space-x-2 mb-3">
            <Type className="w-4 h-4 text-green-600" />
            <label className="text-sm font-medium text-gray-700">Component Name</label>
          </div>
          <input
            type="text"
            value={component.properties?.name || ''}
            onChange={(e) => onPropertyChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white bg-opacity-50 transition-all duration-200"
            placeholder="Enter component name"
          />
        </div>
        
        {/* Description */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-green-100">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-green-600" />
            <label className="text-sm font-medium text-gray-700">Description</label>
          </div>
          <textarea
            value={component.properties?.description || ''}
            onChange={(e) => onPropertyChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white bg-opacity-50 transition-all duration-200 resize-none"
            placeholder="Describe what this component does..."
          />
        </div>
        
        {/* Color Selection */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-green-100">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-4 h-4 text-green-600" />
            <label className="text-sm font-medium text-gray-700">Component Color</label>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => onPropertyChange('color', color.value)}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  component.properties?.color === color.value 
                    ? 'border-gray-900 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {component.properties?.color === color.value && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
                <div className="text-xs font-medium text-white text-center mt-1">
                  {color.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Component Info */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-green-100">
          <h4 className="font-semibold text-gray-900 mb-3">Component Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 font-medium">ID</div>
              <div className="text-gray-900 font-mono">{component.id}</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Type</div>
              <div className="text-gray-900">{component.type}</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Position</div>
              <div className="text-gray-900">
                ({component.position.x}, {component.position.y})
              </div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Size</div>
              <div className="text-gray-900">
                {component.size.width} × {component.size.height}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentProperties; 