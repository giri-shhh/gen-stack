import React from 'react';
import { Settings, Type, FileText } from 'lucide-react';
import type { CanvasComponent } from '../../types';

interface ComponentPropertiesProps {
  component: CanvasComponent;
  onPropertyChange: (property: string, value: any) => void;
}

const ComponentProperties: React.FC<ComponentPropertiesProps> = ({ 
  component, 
  onPropertyChange 
}) => {


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
      </div>
    </div>
  );
};

export default ComponentProperties; 