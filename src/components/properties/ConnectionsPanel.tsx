import React from 'react';
import { Link, X, Network, ArrowRight } from 'lucide-react';
import { getTechById } from '../../data/techStack';
import type { CanvasComponent, Connection } from '../../types';

interface ConnectionsPanelProps {
  component: CanvasComponent;
  connections: Connection[];
  onConnectionRemove: (id: string) => void;
}

const ConnectionsPanel: React.FC<ConnectionsPanelProps> = ({ 
  component, 
  connections, 
  onConnectionRemove 
}) => {
  const componentConnections = connections.filter(
    conn => conn.source === component.id || conn.target === component.id
  );

  const getConnectedComponent = (connection: Connection) => {
    const otherId = connection.source === component.id ? connection.target : connection.source;
    return otherId;
  };

  if (componentConnections.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Network className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Connections</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-500 text-sm">No connections found</p>
          <p className="text-gray-400 text-xs mt-2">Connect this component to others to show relationships</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Network className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">Connections</h3>
        <div className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          {componentConnections.length}
        </div>
      </div>
      
      <div className="space-y-3">
        {componentConnections.map((connection) => {
          const connectedId = getConnectedComponent(connection);
          const connectedTech = getTechById(connectedId);
          const isSource = connection.source === component.id;
          
          return (
            <div
              key={connection.id}
              className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: connectedTech?.color || '#6B7280' }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {connectedTech?.name || 'Unknown Component'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-purple-500">
                    <ArrowRight className={`w-4 h-4 ${isSource ? 'rotate-0' : 'rotate-180'}`} />
                    <span className="text-xs font-medium">
                      {isSource ? '→' : '←'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: component.properties?.color || '#6B7280' }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {component.properties?.name || component.techId}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onConnectionRemove(connection.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Remove connection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Connection ID: {connection.id}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {connection.type || 'default'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center space-x-2 text-sm text-purple-700">
          <Link className="w-4 h-4" />
          <span className="font-medium">Connection Tips</span>
        </div>
        <p className="text-xs text-purple-600 mt-1">
          Click and drag from one component to another to create new connections
        </p>
      </div>
    </div>
  );
};

export default ConnectionsPanel; 