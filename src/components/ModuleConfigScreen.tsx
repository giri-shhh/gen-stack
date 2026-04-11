import React, { useState } from 'react';
import {
  X,
  Settings,
  Package,
  Terminal,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Info,
  Shield,
} from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import type { CanvasComponent, Connection } from '../types';

interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

interface ModuleConfigScreenProps {
  component: CanvasComponent;
  components: CanvasComponent[];
  connections: Connection[];
  onComponentUpdate: (id: string, updates: Partial<CanvasComponent>) => void;
  onClose: () => void;
}

type NavTab = 'overview' | 'configuration' | 'environment' | 'dependencies' | 'advanced';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
  { id: 'configuration', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
  { id: 'environment', label: 'Environment', icon: <Terminal className="w-4 h-4" /> },
  { id: 'dependencies', label: 'Dependencies', icon: <Package className="w-4 h-4" /> },
  { id: 'advanced', label: 'Advanced', icon: <Layers className="w-4 h-4" /> },
];


const ModuleConfigScreen: React.FC<ModuleConfigScreenProps> = ({
  component,
  components,
  connections,
  onComponentUpdate,
  onClose,
}) => {
  const tech = getTechById(component.techId);
  const category = getCategoryByTechId(component.techId);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Local editable state — saved on click
  const [localProps, setLocalProps] = useState<Record<string, any>>({
    ...component.properties,
  });
  const [envVars, setEnvVars] = useState<EnvVar[]>(
    component.properties?.envVars || []
  );
  const [port, setPort] = useState<string>(component.properties?.port || '');
  const [version, setVersion] = useState<string>(component.properties?.version || '');
  const [notes, setNotes] = useState<string>(component.properties?.notes || '');
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => setIsDirty(true);

  const handlePropChange = (key: string, value: any) => {
    setLocalProps(prev => ({ ...prev, [key]: value }));
    markDirty();
  };

  const handleSave = () => {
    onComponentUpdate(component.id, {
      properties: {
        ...localProps,
        envVars,
        port,
        version,
        notes,
      },
    });
    setIsDirty(false);
  };

  const handleReset = () => {
    setLocalProps({ ...component.properties });
    setEnvVars(component.properties?.envVars || []);
    setPort(component.properties?.port || '');
    setVersion(component.properties?.version || '');
    setNotes(component.properties?.notes || '');
    setIsDirty(false);
  };

  // Connections involving this module
  const inbound = connections.filter(c => c.target === component.id);
  const outbound = connections.filter(c => c.source === component.id);

  const getComponentName = (id: string) => {
    const c = components.find(x => x.id === id);
    return c?.properties?.name || getTechById(c?.techId || '')?.name || id;
  };

  // ── Overview ───────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Tech identity card */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-5">
          {tech?.logo ? (
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex-shrink-0">
              <tech.logo className="w-10 h-10 text-white" />
            </div>
          ) : (
            <div
              className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 p-4"
              style={{ backgroundColor: tech?.color || '#6B7280' }}
            >
              <span className="text-white text-2xl font-bold">
                {tech?.name?.charAt(0) || 'M'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{tech?.name}</h3>
              {category && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                  {category}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{tech?.description}</p>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Display Name
              </label>
              <input
                type="text"
                value={localProps.name || ''}
                onChange={e => handlePropChange('name', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="Module display name"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{inbound.length}</div>
          <div className="text-xs text-gray-500 mt-1">Inbound connections</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{outbound.length}</div>
          <div className="text-xs text-gray-500 mt-1">Outbound connections</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(component.selectedLibraries || []).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Libraries</div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Module Description
        </label>
        <textarea
          rows={3}
          value={localProps.description || ''}
          onChange={e => handlePropChange('description', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="Describe what this module does in your architecture…"
        />
      </div>

      {/* Connections summary */}
      {(inbound.length > 0 || outbound.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Connection Map</h4>
          <div className="space-y-2">
            {inbound.map(c => (
              <div key={c.id} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="font-medium text-gray-800">{getComponentName(c.source)}</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-blue-700 font-medium">This module</span>
              </div>
            ))}
            {outbound.map(c => (
              <div key={c.id} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-blue-700 font-medium">This module</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-800">{getComponentName(c.target)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Configuration ──────────────────────────────────────────────────────────
  const renderConfiguration = () => (
    <div className="space-y-6">
      {/* Port */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Port / Host
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={port}
            onChange={e => { setPort(e.target.value); markDirty(); }}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            placeholder="e.g. 3000"
          />
          <input
            type="text"
            value={localProps.host || ''}
            onChange={e => handlePropChange('host', e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            placeholder="e.g. localhost"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Port and host this service listens on</p>
      </div>

      {/* Version */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Version</label>
        <input
          type="text"
          value={version}
          onChange={e => { setVersion(e.target.value); markDirty(); }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
          placeholder="e.g. 18.x, latest, ^5.0.0"
        />
      </div>

      {/* Run mode */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Run Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {['development', 'staging', 'production'].map(mode => (
            <button
              key={mode}
              onClick={() => handlePropChange('runMode', mode)}
              className={`py-2.5 px-3 text-sm rounded-lg border-2 font-medium transition-all duration-150 capitalize ${
                localProps.runMode === mode
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Replicas */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Replicas / Instances
        </label>
        <input
          type="number"
          min={1}
          value={localProps.replicas || 1}
          onChange={e => handlePropChange('replicas', parseInt(e.target.value) || 1)}
          className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-gray-400 mt-1.5">Number of running instances for this service</p>
      </div>

      {/* Health check */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Health Check</label>
          <button
            onClick={() => handlePropChange('healthCheckEnabled', !localProps.healthCheckEnabled)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              localProps.healthCheckEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                localProps.healthCheckEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {localProps.healthCheckEnabled && (
          <input
            type="text"
            value={localProps.healthCheckPath || ''}
            onChange={e => handlePropChange('healthCheckPath', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            placeholder="/health"
          />
        )}
      </div>

      {/* Authentication */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-gray-700">Requires Authentication</label>
            <p className="text-xs text-gray-400 mt-0.5">Whether this module requires auth tokens</p>
          </div>
          <button
            onClick={() => handlePropChange('requiresAuth', !localProps.requiresAuth)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              localProps.requiresAuth ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                localProps.requiresAuth ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Environment ────────────────────────────────────────────────────────────
  const addEnvVar = () => {
    setEnvVars(prev => [...prev, { key: '', value: '', isSecret: false }]);
    markDirty();
  };

  const updateEnvVar = (index: number, field: keyof EnvVar, value: string | boolean) => {
    setEnvVars(prev =>
      prev.map((ev, i) => (i === index ? { ...ev, [field]: value } : ev))
    );
    markDirty();
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(prev => prev.filter((_, i) => i !== index));
    markDirty();
  };

  const renderEnvironment = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Environment Variables</h4>
          <p className="text-xs text-gray-400 mt-0.5">Configure runtime environment for this module</p>
        </div>
        <button
          onClick={addEnvVar}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Variable</span>
        </button>
      </div>

      {envVars.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <Terminal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No environment variables defined</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Variable" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Secret</span>
            <span />
          </div>

          {envVars.map((ev, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <input
                type="text"
                value={ev.key}
                onChange={e => updateEnvVar(idx, 'key', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                placeholder="KEY_NAME"
              />
              <input
                type={ev.isSecret ? 'password' : 'text'}
                value={ev.value}
                onChange={e => updateEnvVar(idx, 'value', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                placeholder="value"
              />
              <button
                onClick={() => updateEnvVar(idx, 'isSecret', !ev.isSecret)}
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  ev.isSecret
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
                title="Toggle secret"
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => removeEnvVar(idx)}
                className="w-8 h-8 rounded-lg border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preset env templates */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Templates
        </h5>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Node.js', vars: [{ key: 'NODE_ENV', value: 'development', isSecret: false }] },
            { label: 'Database URL', vars: [{ key: 'DATABASE_URL', value: '', isSecret: true }] },
            { label: 'API Keys', vars: [{ key: 'API_KEY', value: '', isSecret: true }, { key: 'API_SECRET', value: '', isSecret: true }] },
            { label: 'Debug', vars: [{ key: 'DEBUG', value: '*', isSecret: false }] },
          ].map(template => (
            <button
              key={template.label}
              onClick={() => {
                setEnvVars(prev => {
                  const existingKeys = prev.map(e => e.key);
                  const newVars = template.vars.filter(v => !existingKeys.includes(v.key));
                  return [...prev, ...newVars];
                });
                markDirty();
              }}
              className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              + {template.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Dependencies ───────────────────────────────────────────────────────────
  const renderDependencies = () => {
    const libs = component.selectedLibraries || [];
    return (
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Selected Libraries</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Libraries are configured in the Properties panel. Here you can review and manage them.
          </p>
        </div>

        {libs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No libraries selected</p>
            <p className="text-xs text-gray-400 mt-1">
              Go to the Config tab in the Properties panel to add libraries
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {libs.map((lib: any, idx: number) => (
              <div
                key={lib.id || idx}
                className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-4"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lib.color || '#6B7280' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{lib.name}</div>
                  {lib.description && (
                    <div className="text-xs text-gray-500 truncate">{lib.description}</div>
                  )}
                </div>
                {lib.version && (
                  <span className="text-xs text-gray-400 font-mono flex-shrink-0">{lib.version}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Custom packages */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Packages
          </label>
          <textarea
            rows={4}
            value={localProps.additionalPackages || ''}
            onChange={e => handlePropChange('additionalPackages', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono resize-none"
            placeholder={"lodash@4.x\naxios\ndayjs"}
          />
          <p className="text-xs text-gray-400 mt-1.5">One package per line (name@version)</p>
        </div>
      </div>
    );
  };

  // ── Advanced ───────────────────────────────────────────────────────────────
  const renderAdvanced = () => (
    <div className="space-y-5">
      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
        <textarea
          rows={5}
          value={notes}
          onChange={e => { setNotes(e.target.value); markDirty(); }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="Internal notes about this module, decisions, links to docs…"
        />
      </div>

      {/* Module metadata */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Module Metadata</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'ID', value: component.id },
            { label: 'Tech ID', value: component.techId },
            { label: 'Type', value: component.type },
            { label: 'Category', value: category || '—' },
            { label: 'Position', value: `(${Math.round(component.position.x)}, ${Math.round(component.position.y)})` },
            { label: 'Size', value: `${component.size.width} × ${component.size.height}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
              <div className="text-gray-900 font-mono text-xs break-all">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom tags */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
        <input
          type="text"
          value={localProps.tags || ''}
          onChange={e => handlePropChange('tags', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="api, core, public (comma-separated)"
        />
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h4>
        <p className="text-xs text-red-500 mb-4">
          Clear all custom configuration for this module and reset to defaults.
        </p>
        <button
          onClick={() => {
            const name = localProps.name;
            const description = localProps.description;
            const color = localProps.color;
            setLocalProps({ name, description, color });
            setEnvVars([]);
            setPort('');
            setVersion('');
            setNotes('');
            markDirty();
          }}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Reset All Configuration
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':       return renderOverview();
      case 'configuration':  return renderConfiguration();
      case 'environment':    return renderEnvironment();
      case 'dependencies':   return renderDependencies();
      case 'advanced':       return renderAdvanced();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            {tech?.logo ? (
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow">
                <tech.logo className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
                style={{ backgroundColor: tech?.color || '#6B7280' }}
              >
                <span className="text-white font-bold">{tech?.name?.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {localProps.name || tech?.name || 'Module'}
                </h2>
                {category && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                    {category}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Module Configuration</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isDirty && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
                isDirty
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
              disabled={!isDirty}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-48 flex-shrink-0 bg-gray-50 border-r border-gray-200 py-4">
            <nav className="space-y-1 px-3">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    activeTab === item.id
                      ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Module color swatch */}
            <div className="mt-6 px-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Color</div>
              <div className="grid grid-cols-4 gap-1.5">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => handlePropChange('color', color)}
                    className={`w-7 h-7 rounded-lg transition-all ${
                      localProps.color === color ? 'ring-2 ring-offset-1 ring-gray-700 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">{renderContent()}</div>
          </div>
        </div>

        {/* ── Footer status bar ── */}
        <div className="flex-shrink-0 px-6 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {tech?.name} · {component.id}
          </span>
          {isDirty ? (
            <span className="text-xs text-amber-600 font-medium">● Unsaved changes</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">✓ All changes saved</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleConfigScreen;
