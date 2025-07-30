import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import CanvasComponent from './CanvasComponent';
import ConnectionLines from './ConnectionLines';
import type { CanvasProps } from '../types';

const Canvas: React.FC<CanvasProps> = React.memo(({
  components,
  connections,
  selectedComponent,
  onComponentSelect,
  onComponentUpdate,
  onComponentRemove,
  onConnectionAdd,
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
  const [gridSize] = useState(25); // Grid size for snap-to-grid

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
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left
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
    if (e.target === canvasRef.current) {
      onCanvasClick();
      // Cancel connection mode if clicking on empty canvas
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
      }
    }
  }, [onCanvasClick, isConnecting]);

  const handleComponentClick = useCallback((component: any) => {
    console.log('Canvas: Component clicked:', component);
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
    if (isConnecting && connectionStart && connectionStart !== componentId) {
      onConnectionAdd({ 
        id: `${connectionStart}-${componentId}`, 
        source: connectionStart, 
        target: componentId,
        type: 'connection'
      });
    }
    setIsConnecting(false);
    setConnectionStart(null);
  }, [isConnecting, connectionStart, onConnectionAdd]);

  // DndKit handles all drag and drop logic, so we don't need native handlers
  // The drop indicator is handled by the isOver state from useDroppable

  // Memoize canvas class name
  const canvasClassName = useMemo(() => {
    return `h-full w-full relative canvas-grid overflow-hidden transition-colors duration-200 ${
      isOver && draggedTech ? 'bg-blue-50' : ''
    } ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`;
  }, [isOver, draggedTech, isPanning]);

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
    >
      {/* Bottom-left controls and navigation note */}
      <div className="absolute bottom-4 left-4 z-50 flex flex-row items-end space-x-4">
        {/* Zoom Controls */}
        <div className="flex flex-col space-y-2">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="flex flex-col space-y-1">
              <button
                onClick={zoomIn}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Zoom In (Ctrl/Cmd + Scroll)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={zoomOut}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Zoom Out (Ctrl/Cmd + Scroll)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs font-medium"
                title="Reset View"
              >
                {Math.round(zoom * 100)}%
              </button>
            </div>
          </div>
        </div>
        {/* Navigation Note */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-3 py-2">
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">Navigation:</div>
            <div>• Ctrl/Cmd + Scroll to zoom</div>
            <div>• Alt + Drag to pan</div>
            <div>• Middle mouse to pan</div>
          </div>
        </div>
      </div>

      <div 
        ref={canvasRef} 
        className="relative w-full h-full min-h-[600px] min-w-[800px] transition-transform duration-200"
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
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium z-50 flex items-center space-x-3 shadow-lg">
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
            <div className="bg-white bg-opacity-90 border-2 border-dashed border-blue-400 rounded-lg p-8 text-center">
              <div className="text-blue-600 text-lg font-medium mb-2">Drop to add component</div>
              <div className="text-gray-600 text-sm">Release to place the component on the canvas</div>
            </div>
          </div>
        )}

        {/* Empty Canvas Instructions */}
        {components.length === 0 && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white bg-opacity-95 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center max-w-md">
              <div className="text-gray-600 text-lg font-medium mb-4">Welcome to Fullstack App Generator</div>
              <div className="text-gray-500 text-sm space-y-2">
                <p>🎯 <strong>Get Started:</strong> Drag components from the left sidebar to build your architecture</p>
                <p>🔗 <strong>Connect:</strong> Click the link icon on components to create connections</p>
                <p>⚙️ <strong>Configure:</strong> Select any component to view and edit its properties</p>
                <p>📦 <strong>Generate:</strong> Use the properties panel to generate your project code</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas; 