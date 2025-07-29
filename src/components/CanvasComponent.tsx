import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { X, Link, GripVertical, Maximize2, Package, Folder } from 'lucide-react';
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
  onConnectionStart,
  onConnectionEnd,
  zoom = 1
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: {
      type: 'canvas-component',
      component
    }
  });

  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<{ width: number; height: number } | null>(null);
  // Track if the component was just placed (dropped)
  const [justPlaced, setJustPlaced] = useState(false);

  // Set justPlaced to true when drag ends
  useEffect(() => {
    if (!isDragging && transform && !justPlaced) {
      setJustPlaced(true);
      // Remove highlight after 1s
      setTimeout(() => setJustPlaced(false), 1000);
    }
  }, [isDragging, transform, justPlaced]);
  
  // Memoize tech data to prevent unnecessary lookups
  const tech = useMemo(() => getTechById(component.techId), [component.techId]);

  // Get selected libraries for this component
  const selectedLibraries = component.selectedLibraries || [];

  // Optimized style calculation with better performance
  const style = useMemo(() => {
    // Add null checks for component structure
    if (!component.position || !component.size) {
      console.warn('Component missing position or size:', component);
      return {
        left: 0,
        top: 0,
        width: 150,
        height: 100,
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
        willChange: 'transform', // Optimize for animations
      };
    }

    const baseStyle = {
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      transform: `scale(${zoom})`,
      transformOrigin: '0 0',
      willChange: 'transform', // Optimize for animations
    };

    if (transform) {
      return {
        ...baseStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${zoom})`,
        zIndex: 1000,
        // Use hardware acceleration for smoother dragging
        backfaceVisibility: 'hidden' as const,
        perspective: 1000,
      };
    }

    return baseStyle;
  }, [component.position.x, component.position.y, component.size.width, component.size.height, transform, zoom]);

  // Optimized className calculation with better performance
  const className = useMemo(() => {
    const classes = ['canvas-component', 'hover:shadow-lg', 'transition-all', 'duration-200'];
    if (justPlaced) {
      classes.push('ring-4', 'ring-yellow-400', 'animate-pulse');
    }
    if (isSelected) {
      classes.push('selected', 'ring-4', 'ring-blue-500');
    }
    if (isConnectionStart) {
      classes.push('ring-2', 'ring-green-500');
    } else if (isConnecting) {
      classes.push('ring-2', 'ring-blue-300', 'cursor-pointer');
    }
    if (isDragging) {
      classes.push('shadow-2xl', 'scale-105', 'rotate-1', 'z-50');
    }
    if (isResizing) {
      classes.push('resizing');
    }
    return classes.join(' ');
  }, [isSelected, isConnectionStart, isConnecting, isDragging, isResizing, justPlaced]);

  // Optimized resize handling with throttling for better performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && dragStartPos && resizeStartSize) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        const deltaX = (e.clientX - dragStartPos.x) / zoom;
        const deltaY = (e.clientY - dragStartPos.y) / zoom;
        
        const newWidth = Math.max(120, resizeStartSize.width + deltaX);
        const newHeight = Math.max(80, resizeStartSize.height + deltaY);
        
        // Snap resize to grid (using 25 as default grid size)
        const gridSize = 25;
        const snappedWidth = Math.round(newWidth / gridSize) * gridSize;
        const snappedHeight = Math.round(newHeight / gridSize) * gridSize;
        
        onUpdate({
          size: {
            width: snappedWidth,
            height: snappedHeight
          }
        });
      });
    }
  }, [isResizing, dragStartPos, resizeStartSize, zoom, onUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof Element && (e.target.classList.contains('resize-handle') || e.target.closest('.resize-handle'))) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setResizeStartSize({ 
        width: component.size?.width || 150, 
        height: component.size?.height || 100 
      });
    }
  }, [component.size?.width, component.size?.height]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setDragStartPos(null);
      setResizeStartSize(null);
    }
  }, [isResizing]);

  // Global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
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
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Only update cursor when dragging state changes
  useEffect(() => {
    if (isDragging && !isResizing) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else if (!isResizing) {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      if (!isResizing) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isDragging, isResizing]);

  const handleConnectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) {
      onConnectionEnd();
    } else {
      onConnectionStart();
    }
  }, [isConnecting, onConnectionEnd, onConnectionStart]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Allow clicks unless we're actively dragging or resizing
    if (!isDragging && !isResizing) {
      onSelect();
    }
  }, [isDragging, isResizing, onSelect]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      onDoubleClick();
    }
  }, [isDragging, isResizing, onDoubleClick]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Component Header */}
      <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
          style={{ backgroundColor: justPlaced ? '#facc15' : (tech?.color || '#6B7280') }}
        />
        <span className="text-sm font-semibold text-gray-900 truncate">
          {component.properties?.name || tech?.name || 'Component'}
        </span>
      </div>
        
        {isSelected && (
          <div className="flex items-center space-x-1">
            <button
              onClick={handleConnectionClick}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                isConnecting ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
              }`}
              title={isConnecting ? "Click to connect to this component" : "Start connection from this component"}
            >
              <Link className="w-3 h-3" />
            </button>
            <button
              onClick={handleRemove}
              className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
              title="Remove component"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Component Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-1">{tech?.name}</div>
          <div className="text-xs text-gray-500 capitalize">{tech?.description}</div>
        </div>
      </div>

      {/* Selected Libraries Display */}
      {selectedLibraries.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center space-x-1 mb-1">
            <Package className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Libraries ({selectedLibraries.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedLibraries.slice(0, 3).map((lib, index) => (
              <div
                key={lib.id || index}
                className="flex items-center space-x-1 px-1.5 py-0.5 bg-white rounded text-xs border border-blue-300"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: lib.color || '#6B7280' }}
                />
                <span className="text-blue-700 truncate max-w-16">{lib.name}</span>
              </div>
            ))}
            {selectedLibraries.length > 3 && (
              <div className="text-xs text-blue-600 px-1.5 py-0.5">
                +{selectedLibraries.length - 3}
              </div>
            )}
          </div>
          <div className="mt-1 text-xs text-blue-600 flex items-center space-x-1">
            <Folder className="w-3 h-3" />
            <span>Double-click to preview</span>
          </div>
        </div>
      )}

      {/* Enhanced Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className={`absolute top-1 right-1 p-1 rounded transition-all duration-200 ${
          isDragging ? 'opacity-100 bg-blue-100' : 'opacity-0 hover:opacity-100'
        } cursor-move z-10`}
        title="Drag to move"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      {/* Connection Indicators */}
      {isConnecting && !isSelected && !isConnectionStart && (
        <div className="absolute top-1 left-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {isConnectionStart && (
        <div className="absolute top-1 left-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}

      {/* Enhanced Resize Handle */}
      {isSelected && (
        <div className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-20">
          <div className="w-full h-full bg-blue-500 rounded-tl-sm opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-3 h-3 text-white" />
          </div>
          {/* Invisible larger hit area */}
          <div className="absolute inset-0 w-8 h-8 -top-1 -left-1 cursor-se-resize"></div>
        </div>
      )}

      {/* Resize Corner Indicators */}
      {isSelected && (
        <>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 opacity-50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 opacity-50"></div>
        </>
      )}

      {/* Grid Snap Lines (only show when dragging or resizing) */}
      {(isDragging || isResizing) && (
        <>
          <div className="absolute left-0 top-0 w-full h-0.5 bg-blue-400 opacity-50"></div>
          <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-400 opacity-50"></div>
        </>
      )}

      {/* Size Display (when resizing) */}
      {isResizing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-30">
                      {component.size?.width || 150} × {component.size?.height || 100}
        </div>
      )}
    </div>
  );
});

CanvasComponent.displayName = 'CanvasComponent';

export default CanvasComponent; 