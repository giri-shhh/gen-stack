import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Globe, GitBranch, Zap, Radio, MessageSquare, Database, Server, Bell, Settings2 } from 'lucide-react';
import { CONNECTION_TYPES } from '../data/connectionTypes';
import { getTechById } from '../data/techStack';
import type { Connection, CanvasComponent, ConnectionProtocol } from '../types';

// ── Icon map ─────────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<ConnectionProtocol, React.ComponentType<{ className?: string }>> = {
  rest: Globe,
  graphql: GitBranch,
  grpc: Zap,
  websocket: Radio,
  'message-queue': MessageSquare,
  database: Database,
  cache: Server,
  event: Bell,
  custom: Settings2,
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface ConnectionTypeModalProps {
  connection: Connection;
  components: CanvasComponent[];
  onUpdate: (id: string, updates: Partial<Connection>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const ConnectionTypeModal: React.FC<ConnectionTypeModalProps> = ({
  connection,
  components,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<ConnectionProtocol>(
    connection.connectionType ?? 'rest'
  );
  const [label, setLabel] = useState(connection.label ?? '');

  const sourceComp = components.find((c) => c.id === connection.source);
  const targetComp = components.find((c) => c.id === connection.target);
  const sourceTech = sourceComp ? getTechById(sourceComp.techId) : null;
  const targetTech = targetComp ? getTechById(targetComp.techId) : null;

  const activeConfig = CONNECTION_TYPES.find((ct) => ct.id === selectedType)!;

  const handleSave = () => {
    onUpdate(connection.id, {
      connectionType: selectedType,
      label: label.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(connection.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden flex flex-col">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Configure Connection</h2>
            <p className="text-xs text-gray-400 mt-0.5">Set the protocol between these modules</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Source → Target banner ───────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
          {/* Source */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: sourceTech?.color || '#6b7280' }}
            >
              {sourceTech?.logo ? (
                <sourceTech.logo className="w-4 h-4 text-white" />
              ) : (
                <span className="text-white text-xs font-bold">
                  {(sourceComp?.properties?.name || sourceTech?.name || 'S').charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 truncate">
              {sourceComp?.properties?.name || sourceTech?.name || 'Source'}
            </span>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="h-px w-5 rounded" style={{ backgroundColor: activeConfig.color }} />
            <ArrowRight className="w-3.5 h-3.5" style={{ color: activeConfig.color }} />
          </div>

          {/* Target */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-xs font-medium text-gray-700 truncate text-right">
              {targetComp?.properties?.name || targetTech?.name || 'Target'}
            </span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: targetTech?.color || '#6b7280' }}
            >
              {targetTech?.logo ? (
                <targetTech.logo className="w-4 h-4 text-white" />
              ) : (
                <span className="text-white text-xs font-bold">
                  {(targetComp?.properties?.name || targetTech?.name || 'T').charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Type grid ────────────────────────────────── */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Connection Type
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CONNECTION_TYPES.map((ct) => {
              const isActive = selectedType === ct.id;
              const Icon = TYPE_ICONS[ct.id];
              return (
                <button
                  key={ct.id}
                  onClick={() => setSelectedType(ct.id)}
                  className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all text-center ${
                    isActive
                      ? 'border-transparent shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: `${ct.color}12`, borderColor: ct.color }
                      : {}
                  }
                  title={ct.desc}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: isActive ? `${ct.color}22` : '#f3f4f6',
                    }}
                  >
                    <span style={{ color: isActive ? ct.color : '#9ca3af', display: 'flex' }}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  {/* Name */}
                  <span
                    className="text-xs font-semibold leading-tight"
                    style={{ color: isActive ? ct.color : '#374151' }}
                  >
                    {ct.label}
                  </span>
                  {/* Line preview */}
                  <div className="w-full flex items-center justify-center mt-0.5">
                    <svg width="36" height="6" viewBox="0 0 36 6">
                      <line
                        x1="2" y1="3" x2="34" y2="3"
                        stroke={isActive ? ct.color : '#d1d5db'}
                        strokeWidth="1.5"
                        strokeDasharray={ct.dasharray || ''}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  {/* Active check */}
                  {isActive && (
                    <div
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: ct.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Label input ──────────────────────────────── */}
        <div className="px-5 py-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Label <span className="normal-case font-normal text-gray-300">(optional)</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={`e.g. "GET /api/users", "publish events"`}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:ring-2 focus:border-transparent outline-none transition-all"
            style={{ '--tw-ring-color': activeConfig.color } as React.CSSProperties}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm hover:opacity-90 active:scale-95"
              style={{ backgroundColor: activeConfig.color }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTypeModal;
