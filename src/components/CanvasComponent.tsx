import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { X, Link, Maximize2, Package } from 'lucide-react';
import { getTechById } from '../data/techStack';
import type { CanvasComponentProps } from '../types';

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

  // Refs for click detection — avoids extra re-renders
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevIsDraggingRef = useRef(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: { type: 'canvas-component', component },
    disabled: !isSelected || isResizing,
  });

  // Briefly highlight the card after a drag ends
  useEffect(() => {
    if (prevIsDraggingRef.current && !isDragging) {
      setJustPlaced(true);
      const timer = setTimeout(() => setJustPlaced(false), 800);
      return () => clearTimeout(timer);
    }
    prevIsDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    return () => { if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current); };
  }, []);

  const tech = useMemo(() => getTechById(component.techId), [component.techId]);
  const selectedLibraries = component.selectedLibraries || [];
  const techColor = tech?.color || '#6366f1';

  // ── Style ─────────────────────────────────────────────────────────────────
  // Canvas container applies zoom+pan; components use plain canvas-space coords.
  // During drag, translate by (dnd-kit delta / zoom) to track cursor exactly.
  const style = useMemo(() => {
    if (!component.position || !component.size) {
      return { left: 0, top: 0, width: 200, height: 140 };
    }

    const base = {
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
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
  }, [component.position.x, component.position.y, component.size.width, component.size.height, transform, zoom, isDragging]);

  // ── Class name ────────────────────────────────────────────────────────────
  const className = useMemo(() => {
    const base = [
      'canvas-component absolute flex flex-col overflow-hidden rounded-xl',
      'bg-white border transition-shadow duration-150',
    ];

    // Cursor
    base.push(isDragging ? 'cursor-grabbing' : isSelected ? 'cursor-grab' : 'cursor-pointer');

    // Shadow
    base.push(isDragging ? 'shadow-2xl z-50' : isSelected ? 'shadow-lg' : 'shadow-md hover:shadow-lg');

    // Ring / border state
    if (justPlaced) {
      base.push('ring-2 ring-yellow-400 border-yellow-300');
    } else if (isConnectionStart) {
      base.push('ring-2 ring-emerald-400 border-emerald-300');
    } else if (isConnecting && !isSelected) {
      base.push('ring-2 ring-indigo-300 border-indigo-200');
    } else if (isSelected) {
      base.push('ring-2 ring-indigo-400/60 border-indigo-300');
    } else {
      base.push('border-gray-200/80');
    }

    if (isResizing) base.push('ring-2 ring-violet-400 border-violet-300');

    return base.join(' ');
  }, [isSelected, isConnectionStart, isConnecting, isDragging, isResizing, justPlaced]);

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
    clickCountRef.current += 1;
    if (clickCountRef.current === 1) {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => { clickCountRef.current = 0; }, 300);
    } else if (clickCountRef.current >= 2) {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      clickCountRef.current = 0;
      onDoubleClick();
    }
  }, [isDragging, isResizing, onSelect, onDoubleClick]);

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
      {/* ── Colored accent strip (tech identity) ── */}
      <div
        className="flex-shrink-0 h-1 w-full"
        style={{ backgroundColor: techColor }}
      />

      {/* ── Header: name + controls ──────────────── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 min-h-0">
        <span
          className="text-xs font-semibold truncate leading-none"
          style={{ color: isSelected ? techColor : '#374151', maxWidth: isSelected ? 'calc(100% - 56px)' : '100%' }}
        >
          {component.properties?.name || tech?.name || 'Component'}
        </span>

        {/* Action buttons — visible only when selected */}
        {isSelected && (
          <div className="flex items-center gap-1 flex-shrink-0 ml-1" style={{ zIndex: 50, position: 'relative' }}>
            <button
              onClick={handleConnectionClick}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              data-component-button="true"
              title={isConnecting ? 'Connect to this' : 'Start connection'}
              className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${
                isConnecting
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 border border-indigo-200'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              <Link className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={handleRemove}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              data-component-button="true"
              title="Remove"
              className="w-5 h-5 flex items-center justify-center rounded bg-red-50 text-red-400 hover:bg-red-100 border border-red-200 transition-colors"
              style={{ pointerEvents: 'auto' }}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Main icon + label ─────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 pb-3 gap-2">
        {/* Tech icon */}
        <div
          className={`rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 transition-all duration-150 ${
            isSelected ? 'shadow-md scale-105' : ''
          }`}
          style={{
            width: 48,
            height: 48,
            backgroundColor: techColor,
          }}
        >
          {tech?.logo ? (
            <tech.logo className="w-6 h-6 text-white" />
          ) : (
            <span className="text-white text-lg font-bold leading-none">
              {(component.properties?.name || tech?.name || 'C').charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Library badge (compact) */}
        {selectedLibraries.length > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${techColor}18`, color: techColor }}
          >
            <Package className="w-2.5 h-2.5" />
            <span>{selectedLibraries.length} lib{selectedLibraries.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* View structure shortcut when selected + has libs */}
        {isSelected && selectedLibraries.length > 0 && onViewProjectStructure && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewProjectStructure(); }}
            className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-1 transition-colors"
            style={{ pointerEvents: 'auto', zIndex: 50, position: 'relative' }}
          >
            view structure
          </button>
        )}

        {/* Subtle double-click hint when selected */}
        {isSelected && !isDragging && (
          <span className="text-xs text-gray-400 leading-none select-none">↗ dbl-click</span>
        )}
      </div>

      {/* ── Draggable overlay (behind action buttons) ── */}
      {isSelected && !isResizing && (
        <div
          {...listeners}
          {...attributes}
          className="absolute inset-0 rounded-xl cursor-grab active:cursor-grabbing"
          style={{ zIndex: 20, backgroundColor: 'transparent', pointerEvents: 'auto' }}
          title="Drag to move"
        />
      )}

      {/* ── Resize handle ──────────────────────────── */}
      {isSelected && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-5 h-5 z-30 cursor-se-resize flex items-end justify-end p-1"
          onMouseDown={handleMouseDown}
        >
          <Maximize2 className="w-3 h-3 text-gray-400 hover:text-indigo-400 transition-colors" />
        </div>
      )}

      {/* Size tooltip during resize */}
      {isResizing && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded z-50 whitespace-nowrap pointer-events-none">
          {component.size?.width || 200} × {component.size?.height || 140}
        </div>
      )}

      {/* Connection-state ring overlays */}
      {isConnectionStart && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400 pointer-events-none" />
      )}
      {isConnecting && !isSelected && !isConnectionStart && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-indigo-300 pointer-events-none" />
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
