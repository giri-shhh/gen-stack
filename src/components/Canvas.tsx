import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';
import CanvasComponent from './CanvasComponent';
import ConnectionLines from './ConnectionLines';
import ConnectionTypeModal from './ConnectionTypeModal';
import type { CanvasProps } from '../types';

const Canvas: React.FC<CanvasProps> = React.memo(({
  components,
  connections,
  selectedComponent,
  onComponentSelect,
  onComponentUpdate,
  onComponentRemove,
  onConnectionAdd,
  onConnectionRemove,
  onConnectionUpdate,
  onCanvasClick,
  onComponentDoubleClick,
  onViewProjectStructure,
  draggedTech
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
    data: {
      type: 'canvas-drop-zone'
    }
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [gridSize] = useState(25);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Zoom limits
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 3;

  // Grid snap functionality is now handled by DndKit

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, MIN_ZOOM));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => {
        const newZoom = prev * delta;
        return Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));
      });
    }
  }, []);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check if clicking on a component or component-related element
    const isClickingOnComponent = !!target.closest('[data-canvas-component]') ||
                                  !!target.closest('.resize-handle') ||
                                  !!target.closest('[data-component-button]');

    // Check if clicking within the canvas drawing area (exclude floating UI panels
    // that sit outside or on top of the canvas, e.g. zoom controls, connection banner)
    const isOnCanvasBackground = !target.closest('[data-canvas-ui]') &&
                                 (target === canvasRef.current || !!target.closest('.canvas-background'));

    // Allow panning when:
    // 1. Middle mouse button (always)
    // 2. Alt + Left click (always)
    // 3. Left click on canvas background when not clicking on a component
    const shouldPan = e.button === 1 ||
                      (e.button === 0 && e.altKey) ||
                      (e.button === 0 && !isClickingOnComponent && isOnCanvasBackground);

    if (shouldPan) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  // Handle pan move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
    
    // Track mouse position for connecting line
    if (isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setMousePosition({ x, y });
    }
  }, [isPanning, panStart, isConnecting, pan, zoom]);

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle escape key to cancel connection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isConnecting]);

  // Add global mouse event listeners for panning
  useEffect(() => {
    if (isPanning) {
      const handleMouseMoveDOM = (e: MouseEvent) => {
        handleMouseMove(e as unknown as React.MouseEvent);
      };
      const handleMouseUpDOM = () => {
        handleMouseUp();
      };
      
      document.addEventListener('mousemove', handleMouseMoveDOM);
      document.addEventListener('mouseup', handleMouseUpDOM);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveDOM);
        document.removeEventListener('mouseup', handleMouseUpDOM);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasBackground = target === canvasRef.current || target.closest('.canvas-background');

    if (isCanvasBackground && !isPanning) {
      onCanvasClick();
      setSelectedConnectionId(null);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
      }
    }
  }, [onCanvasClick, isConnecting, isPanning]);

  const handleComponentClick = useCallback((component: any) => {
    setSelectedConnectionId(null); // deselect any connection when a component is clicked
    onComponentSelect(component);
  }, [onComponentSelect]);



  // Expose zoom and pan state for parent component
  useEffect(() => {
    // Store zoom and pan state in a custom property for parent access
    if (canvasRef.current) {
      (canvasRef.current as any)._zoom = zoom;
      (canvasRef.current as any)._pan = pan;
    }
  }, [zoom, pan]);

  // Drop indicator is now handled by DndKit's isOver state

  const handleConnectionStart = useCallback((componentId: string) => {
    setIsConnecting(true);
    setConnectionStart(componentId);
  }, []);

  const handleConnectionEnd = useCallback((componentId: string) => {
    if (isConnecting && connectionStart) {
      if (connectionStart !== componentId) {
        const newId = `${connectionStart}-${componentId}`;
        onConnectionAdd({
          id: newId,
          source: connectionStart,
          target: componentId,
          type: 'connection',
        });
        // Auto-open the type selector for the new connection
        setSelectedConnectionId(newId);
      }
      setIsConnecting(false);
      setConnectionStart(null);
    }
  }, [isConnecting, connectionStart, onConnectionAdd]);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId((prev) => prev === connectionId ? null : connectionId);
  }, []);

  // DndKit handles all drag and drop logic, so we don't need native handlers
  // The drop indicator is handled by the isOver state from useDroppable

  // Memoize canvas class name
  const canvasClassName = useMemo(() => {
    let cursor = 'cursor-default';
    
    if (isPanning) {
      cursor = 'cursor-grabbing';
    } else if (isConnecting) {
      cursor = 'cursor-crosshair';
    } else {
      // Always show grab cursor on canvas background - user can always pan by dragging empty areas
      cursor = 'cursor-grab';
    }
    
    return `h-full w-full relative canvas-grid overflow-hidden transition-colors duration-200 ${
      isOver && draggedTech ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    } ${cursor}`;
  }, [isOver, draggedTech, isPanning, isConnecting]);

  // Drop indicator is now handled by DndKit's isOver state

  // Memoize canvas transform style
  const canvasTransformStyle = useMemo(() => {
    return {
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: '0 0',
    };
  }, [pan, zoom]);

  return (
    <div
      ref={setNodeRef}
      data-droppable-id="canvas"
      className={canvasClassName}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Bottom-left controls */}
      <div className="absolute bottom-5 left-5 z-50 flex flex-row items-center gap-2" data-canvas-ui="true">
        {/* Zoom pill */}
        <div className="flex items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/80 dark:border-gray-700/80 px-1 py-1 gap-0.5">
          <button
            onClick={zoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2.5 h-7 flex items-center justify-center rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all min-w-[44px]"
            title="Reset View"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <button
            onClick={resetZoom}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
            title="Fit to screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nav tips — hoverable info pill */}
        <div className="group relative">
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border border-gray-200/80 dark:border-gray-700/80 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Info className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-9 left-0 hidden group-hover:block w-52 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl shadow-xl px-3 py-2.5 leading-relaxed pointer-events-none">
            <div className="font-semibold mb-1.5 text-gray-200">Navigation</div>
            <div className="space-y-0.5 text-gray-400">
              <div>⌃/⌘ + Scroll · zoom</div>
              <div>Drag canvas · pan</div>
              <div>Alt + Drag · force pan</div>
              <div>Middle mouse · pan</div>
              <div>Click · select</div>
              <div>↗ button · open module</div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="canvas-background relative w-full h-full min-h-[600px] min-w-[800px]"
        style={canvasTransformStyle}
      >
        {/* Connection Lines */}
        <ConnectionLines
          connections={connections}
          components={components}
          isConnecting={isConnecting}
          connectionStart={connectionStart}
          mousePosition={mousePosition}
          zoom={zoom}
          selectedConnectionId={selectedConnectionId}
          onConnectionClick={handleConnectionClick}
        />

        {/* Drop indicator is now handled by DndKit's isOver state */}

        {/* Grid Snap Indicators - Only show when dragging new tech items from sidebar */}
        {isOver && draggedTech && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" style={{ opacity: 0.1 }}>
              <defs>
                <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                  <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#3b82f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Canvas Components */}
        {components.map((component) => (
          <CanvasComponent
            key={component.id}
            component={component}
            isSelected={selectedComponent?.id === component.id}
            isConnecting={isConnecting}
            isConnectionStart={connectionStart === component.id}
            onSelect={() => handleComponentClick(component)}
            onUpdate={(updates) => onComponentUpdate(component.id, updates)}
            onRemove={() => onComponentRemove(component.id)}
            onConnectionStart={() => handleConnectionStart(component.id)}
            onConnectionEnd={() => handleConnectionEnd(component.id)}
            onDoubleClick={() => onComponentDoubleClick?.(component)}
            onViewProjectStructure={() => onViewProjectStructure?.(component)}
            zoom={zoom}
          />
        ))}

        {/* Connection Mode Indicator */}
        {isConnecting && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium z-50 flex items-center space-x-3 shadow-lg" data-canvas-ui="true">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Click on a component to create connection</span>
            <button
              onClick={() => {
                setIsConnecting(false);
                setConnectionStart(null);
              }}
              className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
            >
              Cancel
            </button>
            <div className="text-xs opacity-75">(or press ESC)</div>
          </div>
        )}

        {/* Drop Zone Instructions - Only show when dragging new tech items from sidebar */}
        {isOver && draggedTech && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-2xl px-10 py-8 text-center shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="text-indigo-700 dark:text-indigo-300 text-sm font-bold">Drop to place</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Release to add to canvas</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Canvas Instructions */}
        {components.length === 0 && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-5 text-center max-w-sm px-6">
              {/* Icon cluster */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 opacity-60" />
                <div className="absolute inset-3 rounded-2xl bg-indigo-200 dark:bg-indigo-800/40 opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-9 h-9 text-indigo-400 dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-600 dark:text-gray-300 mb-1">Start building your architecture</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Drag components from the sidebar onto the canvas</p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full text-left">
                {[
                  { icon: '⬡', label: 'Drag', desc: 'from sidebar to place' },
                  { icon: '⟶', label: 'Connect', desc: 'click link icon to wire' },
                  { icon: '⚙', label: 'Configure', desc: 'select to edit properties' },
                  { icon: '↗', label: 'Open', desc: 'click ↗ button on node' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-2 bg-white/70 dark:bg-gray-800/70 rounded-xl px-3 py-2.5 border border-gray-200/60 dark:border-gray-700/60">
                    <span className="text-base leading-none mt-0.5 text-indigo-400 dark:text-indigo-400">{icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection type configuration modal — rendered outside the zoomed canvas so it's unaffected by pan/zoom */}
      {selectedConnectionId && (() => {
        const conn = connections.find((c) => c.id === selectedConnectionId);
        if (!conn) return null;
        return (
          <ConnectionTypeModal
            connection={conn}
            components={components}
            onUpdate={onConnectionUpdate}
            onDelete={(id) => {
              onConnectionRemove(id);
              setSelectedConnectionId(null);
            }}
            onClose={() => setSelectedConnectionId(null)}
          />
        );
      })()}
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas; 