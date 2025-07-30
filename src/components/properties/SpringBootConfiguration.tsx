import React, { useState } from 'react';
import { Shield, Check, Sparkles, Code, Package, Database, Coffee } from 'lucide-react';
import type { CanvasComponent } from '../../types';

interface SpringBootConfigurationProps {
  component: CanvasComponent;
  onPropertyChange: (property: string, value: any) => void;
}

const SpringBootConfiguration: React.FC<SpringBootConfigurationProps> = ({ 
  component, 
  onPropertyChange 
}) => {
  const [activePreset, setActivePreset] = useState<string>('');

  const presets = {
    'web-basic': {
      name: 'Web Application',
      description: 'Basic Spring Boot web app',
      icon: '🌐',
      config: {
        projectType: 'maven',
        language: 'java',
        packaging: 'jar',
        javaVersion: '17',
        springBootVersion: '3.1.0',
        dependencies: ['web', 'devtools']
      }
    },
    'web-jpa': {
      name: 'Web + JPA',
      description: 'Web app with database support',
      icon: '🗄️',
      config: {
        projectType: 'maven',
        language: 'java',
        packaging: 'jar',
        javaVersion: '17',
        springBootVersion: '3.1.0',
        dependencies: ['web', 'data-jpa', 'h2', 'devtools']
      }
    },
    'web-security': {
      name: 'Web + Security',
      description: 'Secure web application',
      icon: '🔒',
      config: {
        projectType: 'maven',
        language: 'java',
        packaging: 'jar',
        javaVersion: '17',
        springBootVersion: '3.1.0',
        dependencies: ['web', 'security', 'devtools']
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
    const config = component.properties?.springConfig || {};
    const features: string[] = [];
    
    if (config.projectType) features.push(config.projectType);
    if (config.language) features.push(config.language);
    if (config.packaging) features.push(config.packaging);
    if (config.javaVersion) features.push(`Java ${config.javaVersion}`);
    if (config.springBootVersion) features.push(`Spring Boot ${config.springBootVersion}`);
    if (config.dependencies) features.push(`${config.dependencies.length} dependencies`);
    
    return features.join(', ');
  };

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border border-red-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">Spring Boot Configuration</h3>
      </div>
      
      {/* Quick Presets */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Quick Presets</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                activePreset === key
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{preset.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </div>
                {activePreset === key && (
                  <Check className="w-5 h-5 text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Code className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Current Configuration</h4>
        </div>
        <div className="p-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl border border-red-100">
          <div className="text-sm text-gray-900 font-medium">
            {getConfigSummary() || 'No configuration set'}
          </div>
        </div>
      </div>

      {/* Project Type */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Project Type</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['maven', 'gradle'].map((type) => (
            <button
              key={type}
              onClick={() => onPropertyChange('projectType', type)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.springConfig?.projectType === type
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Code className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Language</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['java', 'kotlin'].map((lang) => (
            <button
              key={lang}
              onClick={() => onPropertyChange('language', lang)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.springConfig?.language === lang
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Packaging */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Packaging</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['jar', 'war'].map((packaging) => (
            <button
              key={packaging}
              onClick={() => onPropertyChange('packaging', packaging)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.springConfig?.packaging === packaging
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              {packaging.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Java Version */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Coffee className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Java Version</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['11', '17', '21'].map((version) => (
            <button
              key={version}
              onClick={() => onPropertyChange('javaVersion', version)}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.springConfig?.javaVersion === version
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              Java {version}
            </button>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Database className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-semibold text-gray-700">Dependencies</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['web', 'data-jpa', 'security', 'actuator', 'devtools', 'validation'].map((dep) => (
            <button
              key={dep}
              onClick={() => {
                const currentDeps = component.properties?.springConfig?.dependencies || [];
                const newDeps = currentDeps.includes(dep)
                  ? currentDeps.filter((d: string) => d !== dep)
                  : [...currentDeps, dep];
                onPropertyChange('dependencies', newDeps);
              }}
              className={`p-3 text-sm border-2 rounded-lg transition-all duration-200 font-medium ${
                component.properties?.springConfig?.dependencies?.includes(dep)
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              {dep === 'data-jpa' ? 'Data JPA' : 
               dep === 'devtools' ? 'DevTools' :
               dep.charAt(0).toUpperCase() + dep.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpringBootConfiguration; 