import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { X, Link, Maximize2, Package, ExternalLink } from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import type { CanvasComponentProps } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  cloud: 'Cloud',
  messaging: 'Messaging',
  caching: 'Caching',
  additional: 'DevOps',
};

const CanvasComponent: React.FC<CanvasComponentProps> = React.memo(({
  component,
  isSelected,
  isConnecting,
  isConnectionStart,
  onSelect,
  onUpdate,
  onRemove,
  onDoubleClick,
  onViewProjectStructure,
  onConnectionStart,
  onConnectionEnd,
  zoom = 1
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<{ width: number; height: number } | null>(null);
  const [justPlaced, setJustPlaced] = useState(false);

  const prevIsDraggingRef = useRef(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: { type: 'canvas-component', component },
    disabled: !isSelected || isResizing,
  });

  useEffect(() => {
    if (prevIsDraggingRef.current && !isDragging) {
      setJustPlaced(true);
      const timer = setTimeout(() => setJustPlaced(false), 800);
      return () => clearTimeout(timer);
    }
    prevIsDraggingRef.current = isDragging;
  }, [isDragging]);

  const tech = useMemo(() => getTechById(component.techId), [component.techId]);
  const selectedLibraries = component.selectedLibraries || [];
  const techColor = tech?.color || '#6366f1';

  const categoryKey = useMemo(() => getCategoryByTechId(component.techId), [component.techId]);
  const categoryLabel = categoryKey ? (CATEGORY_LABELS[categoryKey] ?? null) : null;

  // ── Style ─────────────────────────────────────────────────────────────────
  const style = useMemo(() => {
    if (!component.position || !component.size) {
      return { left: 0, top: 0, width: 200, height: 140 };
    }

    const shadowStyle = isConnectionStart
      ? `0 0 0 2px #34d399, 0 4px 20px rgba(52,211,153,0.25)`
      : justPlaced
      ? '0 0 0 2px #facc15, 0 8px 20px rgba(250,204,21,0.2)'
      : isSelected
      ? `0 0 0 2px ${techColor}, 0 8px 28px ${techColor}30, 0 2px 8px rgba(0,0,0,0.08)`
      : isDragging
      ? '0 12px 40px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)'
      : '0 1px 3px rgba(0,0,0,0.06), 0 2px 10px rgba(0,0,0,0.05)';

    const base = {
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      boxShadow: shadowStyle,
    };

    if (transform && isDragging) {
      return {
        ...base,
        transform: `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)`,
        zIndex: 1000,
        willChange: 'transform',
      };
    }
    return base;
  }, [
    component.position.x, component.position.y,
    component.size.width, component.size.height,
    transform, zoom, isDragging,
    isSelected, isConnectionStart, justPlaced, techColor,
  ]);

  // ── Class name ────────────────────────────────────────────────────────────
  const className = useMemo(() => {
    const base = [
      'canvas-component absolute flex flex-col overflow-hidden rounded-2xl',
      'bg-white dark:bg-gray-800 border transition-all duration-150',
    ];

    base.push(isDragging ? 'cursor-grabbing' : isSelected ? 'cursor-grab' : 'cursor-pointer');
    base.push(isDragging ? 'z-50 opacity-95' : isSelected ? 'z-20' : 'z-10');

    if (isResizing) {
      base.push('border-violet-400');
    } else if (isConnectionStart) {
      base.push('border-emerald-400');
    } else if (isConnecting && !isSelected) {
      base.push('border-indigo-300');
    } else if (isSelected) {
      base.push('border-transparent');
    } else {
      base.push('border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600');
    }

    return base.join(' ');
  }, [isSelected, isConnectionStart, isConnecting, isDragging, isResizing]);

  // ── Resize handlers ───────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !dragStartPos || !resizeStartSize) return;
    const deltaX = (e.clientX - dragStartPos.x) / zoom;
    const deltaY = (e.clientY - dragStartPos.y) / zoom;
    const grid = 25;
    onUpdate({
      size: {
        width: Math.round(Math.max(160, resizeStartSize.width + deltaX) / grid) * grid,
        height: Math.round(Math.max(120, resizeStartSize.height + deltaY) / grid) * grid,
      },
    });
  }, [isResizing, dragStartPos, resizeStartSize, zoom, onUpdate]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) { setIsResizing(false); setDragStartPos(null); setResizeStartSize(null); }
  }, [isResizing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = e.target as Element;
    if (el.classList.contains('resize-handle') || el.closest('.resize-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setResizeStartSize({ width: component.size?.width || 200, height: component.size?.height || 140 });
    }
  }, [component.size?.width, component.size?.height]);

  useEffect(() => {
    if (!isResizing) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isDragging && !isResizing) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else if (!isResizing) {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => { if (!isResizing) { document.body.style.cursor = ''; document.body.style.userSelect = ''; } };
  }, [isDragging, isResizing]);

  // ── Click / double-click ──────────────────────────────────────────────────
  const handleConnectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    isConnecting ? onConnectionEnd() : onConnectionStart();
  }, [isConnecting, onConnectionEnd, onConnectionStart]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging || isResizing) return;
    onSelect();
  }, [isDragging, isResizing, onSelect]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); onRemove();
  }, [onRemove]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-canvas-component="true"
    >
      {/* ── Colored accent strip ── */}
      <div
        className="flex-shrink-0 w-full"
        style={{ height: 3, backgroundColor: techColor }}
      />

      {/* ── Action buttons (top-right overlay, visible when selected) ── */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1"
          style={{ zIndex: 50 }}
        >
          <button
            onClick={handleConnectionClick}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            data-component-button="true"
            title={isConnecting ? 'Connect to this' : 'Start connection'}
            className={`w-6 h-6 flex items-center justify-center rounded-lg shadow-sm border transition-all ${
              isConnecting
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white dark:bg-gray-700 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            <Link className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            data-component-button="true"
            title="Open module detail"
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-700 shadow-sm transition-all"
            style={{ pointerEvents: 'auto' }}
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={handleRemove}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            data-component-button="true"
            title="Remove"
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 shadow-sm transition-all"
            style={{ pointerEvents: 'auto' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 pt-3 pb-3 gap-2">
        {/* Tech icon */}
        <div
          className={`rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isSelected ? 'scale-105' : ''
          }`}
          style={{
            width: 52,
            height: 52,
            backgroundColor: `${techColor}18`,
            border: `1.5px solid ${techColor}35`,
            color: techColor,
          }}
        >
          {tech?.logo ? (
            <tech.logo className="w-6 h-6" />
          ) : (
            <span
              className="text-2xl font-black leading-none"
              style={{ color: techColor }}
            >
              {(component.properties?.name || tech?.name || 'C').charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Tech name */}
        <span className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight text-center block w-full truncate px-1">
          {component.properties?.name || tech?.name || 'Component'}
        </span>

        {/* Badges row: category + libraries */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap w-full">
          {categoryLabel && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold leading-none whitespace-nowrap"
              style={{ backgroundColor: `${techColor}15`, color: techColor }}
            >
              {categoryLabel}
            </span>
          )}
          {selectedLibraries.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium leading-none">
              <Package className="w-2.5 h-2.5" />
              {selectedLibraries.length}
            </span>
          )}
        </div>

        {/* View structure shortcut when selected + has libs */}
        {isSelected && selectedLibraries.length > 0 && onViewProjectStructure && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewProjectStructure(); }}
            className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-1 transition-colors"
            style={{ pointerEvents: 'auto', zIndex: 50, position: 'relative' }}
          >
            view structure
          </button>
        )}
      </div>

      {/* ── Draggable overlay (behind action buttons) ── */}
      {isSelected && !isResizing && (
        <div
          {...listeners}
          {...attributes}
          className="absolute inset-0 rounded-2xl cursor-grab active:cursor-grabbing"
          style={{ zIndex: 20, backgroundColor: 'transparent', pointerEvents: 'auto' }}
          title="Drag to move"
        />
      )}

      {/* ── Resize handle ── */}
      {isSelected && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-5 h-5 z-30 cursor-se-resize flex items-end justify-end p-1"
          onMouseDown={handleMouseDown}
        >
          <Maximize2 className="w-3 h-3 text-gray-300 dark:text-gray-600 hover:text-indigo-400 transition-colors" />
        </div>
      )}

      {/* Size tooltip during resize */}
      {isResizing && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-md z-50 whitespace-nowrap pointer-events-none font-medium">
          {component.size?.width || 200} × {component.size?.height || 140}
        </div>
      )}

      {/* Connection-state ring overlays */}
      {isConnectionStart && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400 pointer-events-none" />
      )}
      {isConnecting && !isSelected && !isConnectionStart && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-indigo-300/70 pointer-events-none" />
      )}

      {/* Snap guides during drag/resize */}
      {(isDragging || isResizing) && (
        <>
          <div className="absolute left-0 top-0 w-full h-px bg-indigo-400 opacity-30 pointer-events-none" />
          <div className="absolute top-0 left-0 w-px h-full bg-indigo-400 opacity-30 pointer-events-none" />
        </>
      )}
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';
export default CanvasComponent;
