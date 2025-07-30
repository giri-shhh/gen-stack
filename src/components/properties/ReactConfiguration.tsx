import React, { useState } from 'react';
import { Zap, Check, Sparkles, Code, Palette, Database, Globe } from 'lucide-react';
import type { CanvasComponent } from '../../types';

interface ReactConfigurationProps {
  component: CanvasComponent;
  onPropertyChange: (property: string, value: any) => void;
}

const ReactConfiguration: React.FC<ReactConfigurationProps> = ({ 
  component, 
  onPropertyChange 
}) => {
  const [activePreset, setActivePreset] = useState<string>('');

  const presets = {
    'vite-ts': {
      name: 'Vite + TypeScript',
      description: 'Modern build tool with TypeScript',
      icon: '⚡',
      config: {
        buildSystem: 'vite',
        language: 'typescript',
        cssFramework: 'tailwind',
        stateManagement: 'zustand',
        routing: 'react-router',
        testing: 'vitest'
      }
    },
    'next-ts': {
      name: 'Next.js + TypeScript',
      description: 'Full-stack React framework',
      icon: '🚀',
      config: {
        buildSystem: 'next',
        language: 'typescript',
        cssFramework: 'tailwind',
        stateManagement: 'zustand',
        routing: 'next-router',
        testing: 'jest'
      }
    },
    'cra-js': {
      name: 'Create React App',
      description: 'Traditional React setup',
      icon: '⚛️',
      config: {
        buildSystem: 'cra',
        language: 'javascript',
        cssFramework: 'css-modules',
        stateManagement: 'context',
        routing: 'react-router',
        testing: 'jest'
      }
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    setActivePreset(presetKey);
    const preset = presets[presetKey as keyof typeof presets];
    if (preset) {
      Object.entries(preset.config).forEach(([key, value]) => {
        onPropertyChange(key, value);
      });
    }
  };

  const getConfigSummary = () => {
    const config = component.properties?.reactConfig || {};
    const features: string[] = [];
    
    if (config.buildSystem) features.push(config.buildSystem);
    if (config.language) features.push(config.language);
    if (config.cssFramework) features.push(config.cssFramework);
    if (config.stateManagement) features.push(config.stateManagement);
    if (config.routing) features.push(config.routing);
    if (config.testing) features.push(config.testing);
    
    return features.join(', ');
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Zap className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">React Configuration</h3>
      </div>
      
      {/* Quick Presets */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-700">Quick Presets</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                activePreset === key
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-orange-200 hover:border-orange-300 bg-white bg-opacity-80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{preset.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </div>
                {activePreset === key && (
                  <Check className="w-5 h-5 text-orange-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Code className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-700">Current Configuration</h4>
        </div>
        <div className="p-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl border border-orange-100">
          <div className="text-sm text-gray-900 font-medium">
            {getConfigSummary() || 'No configuration set'}
          </div>
        </div>
      </div>

      {/* Build System */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-700">Build System</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['vite', 'next', 'cra'].map((system) => (
            <button
              key={system}
              onClick={() => onPropertyChange('buildSystem', system)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.reactConfig?.buildSystem === system
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                  : 'border-orange-200 hover:border-orange-300 bg-white bg-opacity-80'
              }`}
            >
              {system.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Code className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-700">Language</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['javascript', 'typescript'].map((lang) => (
            <button
              key={lang}
              onClick={() => onPropertyChange('language', lang)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.reactConfig?.language === lang
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                  : 'border-orange-200 hover:border-orange-300 bg-white bg-opacity-80'
              }`}
            >
              {lang === 'javascript' ? 'JavaScript' : 'TypeScript'}
            </button>
          ))}
        </div>
      </div>

      {/* CSS Framework */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Palette className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-700">CSS Framework</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['tailwind', 'css-modules', 'styled-components', 'none'].map((framework) => (
            <button
              key={framework}
              onClick={() => onPropertyChange('cssFramework', framework)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.reactConfig?.cssFramework === framework
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                  : 'border-orange-200 hover:border-orange-300 bg-white bg-opacity-80'
              }`}
            >
              {framework === 'css-modules' ? 'CSS Modules' : 
               framework === 'styled-components' ? 'Styled Components' :
               framework === 'none' ? 'Plain CSS' : framework}
            </button>
          ))}
        </div>
      </div>

      {/* State Management */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Database className="w-4 h-4 text-orange-600" />
          <h4 className="text-sm font-semibold text-gray-700">State Management</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['context', 'zustand', 'redux', 'recoil'].map((state) => (
            <button
              key={state}
              onClick={() => onPropertyChange('stateManagement', state)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.reactConfig?.stateManagement === state
                  ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                  : 'border-orange-200 hover:border-orange-300 bg-white bg-opacity-80'
              }`}
            >
              {state === 'context' ? 'Context API' : 
               state === 'zustand' ? 'Zustand' :
               state === 'redux' ? 'Redux Toolkit' : 'Recoil'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactConfiguration; 