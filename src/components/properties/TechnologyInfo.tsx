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
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">Technology Information</h3>
      </div>
      
      <div className="space-y-6">
        {/* Technology Header */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-4">
            {tech.logo && (
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <tech.logo className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-gray-900 text-lg">{tech.name}</h4>
                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {category || 'Unknown'}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{tech.description}</p>
            </div>
          </div>
        </div>
        
        {/* Technology Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 capitalize">{category || 'Unknown'}</div>
          </div>
          
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">ID</span>
            </div>
            <div className="text-sm font-semibold text-gray-900">{tech.id}</div>
          </div>
        </div>
        
        {/* Technology Description */}
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <h4 className="font-semibold text-gray-900">Description</h4>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{tech.description}</p>
        </div>
      </div>
    </div>
  );
};

export default TechnologyInfo; 