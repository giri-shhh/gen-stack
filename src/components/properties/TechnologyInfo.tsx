import React from 'react';
import { Info, Settings, Package, Star } from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../../data/techStack';
import type { CanvasComponent } from '../../types';

interface TechnologyInfoProps {
  component: CanvasComponent;
}

const TechnologyInfo: React.FC<TechnologyInfoProps> = ({ component }) => {
  const tech = getTechById(component.techId);
  const category = getCategoryByTechId(component.techId);

  if (!tech) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Info className="w-5 h-5 text-gray-500" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Technology Information</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Technology not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1 bg-blue-100 rounded">
          <Info className="w-3 h-3 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Technology Information</h3>
      </div>
      
      {/* Compact Technology Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
        <div className="flex items-center space-x-3">
          {tech.logo && (
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <tech.logo className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-gray-900 text-sm truncate">{tech.name}</h4>
              <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex-shrink-0">
                {category || 'frontend'}
              </div>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed truncate">{tech.description}</p>
          </div>
        </div>
        
        {/* Compact Details */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-600">ID:</span>
            <span className="text-xs text-gray-900 font-mono">{tech.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyInfo; 