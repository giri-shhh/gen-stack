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
  onViewProjectStructure,
  onConnectionStart,
  onConnectionEnd,
  zoom = 1
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<{ width: number; height: number } | null>(null);
  // Track if the component was just placed (dropped)
  const [justPlaced, setJustPlaced] = useState(false);
  // Track clicks for custom double-click detection
  const [clickCount, setClickCount] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: {
      type: 'canvas-component',
      component
    },
    disabled: !isSelected || isResizing // Only allow dragging when component is selected and not resizing
  });

  // Track previous dragging state to detect when drag ends
  const [wasDragging, setWasDragging] = useState(false);
  const [dragEndTransform, setDragEndTransform] = useState<any>(null);

  // Detect drag end and update position
  useEffect(() => {
    // If we were dragging and now we're not, and we have a transform, update the position
    if (wasDragging && !isDragging && dragEndTransform && isSelected) {
      const newX = component.position.x + (dragEndTransform.x / zoom);
      const newY = component.position.y + (dragEndTransform.y / zoom);
      
      console.log('Drag ended - updating position:', {
        old: component.position,
        new: { x: newX, y: newY },
        transform: dragEndTransform,
        zoom
      });

      // Update the component position
      onUpdate({
        position: {
          x: newX,
          y: newY
        }
      });

      // Visual feedback - highlight when just placed
      setJustPlaced(true);
      setTimeout(() => setJustPlaced(false), 1000);

      // Reset the drag end tracking
      setDragEndTransform(null);
    }

    // Update tracking state
    setWasDragging(isDragging);
    if (isDragging && transform) {
      setDragEndTransform(transform);
    }
  }, [isDragging, dragEndTransform, transform, isSelected, component.position, zoom, onUpdate]);
  
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
        width: 200,
        height: 140,
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

    // Only apply visual transform while actively dragging
    if (transform && isDragging) {
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
  }, [component.position.x, component.position.y, component.size.width, component.size.height, transform, zoom, isDragging, isResizing]);

  // Optimized className calculation with better performance
  const className = useMemo(() => {
    const classes = [
      'canvas-component', 
      'absolute', 
      'bg-white', 
      'border-2', 
      'border-gray-200', 
      'rounded-xl', 
      'shadow-md', 
      'hover:shadow-xl', 
      'transition-all', 
      'duration-200',
      'flex',
      'flex-col',
      'overflow-hidden'
    ];
    
    // Cursor styles based on state
    if (isDragging) {
      classes.push('cursor-grabbing');
    } else if (isSelected) {
      classes.push('cursor-grab'); // Show grab cursor when selected (draggable)
    } else {
      classes.push('cursor-pointer'); // Show pointer cursor when not selected (clickable to select)
    }
    
    if (justPlaced) {
      classes.push('ring-4', 'ring-yellow-400', 'animate-pulse');
    }
    if (isSelected) {
      classes.push('selected', 'ring-4', 'ring-blue-400', 'ring-opacity-75', 'border-blue-400', 'bg-gradient-to-br', 'from-blue-50', 'to-indigo-50', 'shadow-xl', 'shadow-blue-200/50');
    }
    if (isConnectionStart) {
      classes.push('ring-2', 'ring-green-500', 'border-green-300');
    } else if (isConnecting) {
      classes.push('ring-2', 'ring-blue-300', 'border-blue-200');
    }
    if (isDragging) {
      classes.push('shadow-2xl', 'scale-105', 'rotate-1', 'z-50');
    }
    if (isResizing) {
      classes.push('resizing', 'ring-2', 'ring-purple-400');
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
        
        const newWidth = Math.max(160, resizeStartSize.width + deltaX);
        const newHeight = Math.max(120, resizeStartSize.height + deltaY);
        
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
        width: component.size?.width || 200, 
        height: component.size?.height || 140 
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const handleConnectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
      
      // Custom double-click detection
      setClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 1) {
          // First click - set timeout
          if (clickTimeout) clearTimeout(clickTimeout);
          const timeout = setTimeout(() => {
            setClickCount(0);
            setClickTimeout(null);
          }, 300); // 300ms for double-click detection
          setClickTimeout(timeout);
        } else if (newCount === 2) {
          // Double-click detected
          console.log('Custom double-click detected on component:', component.id);
          if (clickTimeout) clearTimeout(clickTimeout);
          setClickTimeout(null);
          onDoubleClick();
          return 0;
        }
        return newCount;
      });
    }
  }, [isDragging, isResizing, onSelect, clickTimeout, onDoubleClick, component.id]);

  // Removed original double-click handler - using custom detection in handleClick

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
      onMouseDown={handleMouseDown}
      data-canvas-component="true"
    >
      {/* Component Header */}
      <div className={`flex items-center justify-between mb-3 px-3 py-2 ${
        isSelected ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200' : ''
      }`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div 
            className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
            }`}
            style={{ backgroundColor: justPlaced ? '#facc15' : (tech?.color || '#6B7280') }}
          />
          <span className={`text-sm font-semibold truncate transition-colors duration-200 ${
            isSelected ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {component.properties?.name || tech?.name || 'Component'}
          </span>
          {isSelected && (
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">Selected</span>
            </div>
          )}
        </div>
        
        {isSelected && (
          <div className="flex items-center space-x-2 relative z-50">
            <button
              onClick={handleConnectionClick}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
              }}
              className={`p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md relative z-50 ${
                isConnecting 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
              }`}
              title={isConnecting ? "Click to connect to this component" : "Start connection from this component"}
              data-component-button="true"
              style={{ pointerEvents: 'auto' }}
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemove}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
              }}
              className="p-2 rounded-lg bg-white text-red-500 hover:bg-red-50 border border-red-200 transition-all duration-200 shadow-sm hover:shadow-md hover:text-red-600 relative z-50"
              title="Remove component"
              data-component-button="true"
              style={{ pointerEvents: 'auto' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Component Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
        {/* Technology Icon */}
        <div className={`mb-3 transition-all duration-200 ${
          isSelected ? 'transform scale-110' : ''
        }`}>
          {tech?.logo ? (
            <div className={`p-3 rounded-xl shadow-lg transition-all duration-200 ${
              isSelected 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl ring-4 ring-blue-200 ring-opacity-50' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <tech.logo className="w-8 h-8 text-white" />
            </div>
          ) : (
            <div 
              className={`w-14 h-14 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 ${
                isSelected ? 'shadow-xl ring-4 ring-blue-200 ring-opacity-50' : ''
              }`}
              style={{ 
                backgroundColor: isSelected 
                  ? `${tech?.color || '#6B7280'}dd` 
                  : tech?.color || '#6B7280' 
              }}
            >
              <span className="text-white text-lg font-bold">
                {tech?.name?.charAt(0) || 'C'}
              </span>
            </div>
          )}
        </div>
        
        {/* Technology Name and Description */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 mb-1 leading-tight">{tech?.name}</div>
          <div className="text-sm text-gray-600 leading-relaxed px-2">{tech?.description}</div>
          {isSelected && (
            <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full text-xs text-blue-700 font-medium border border-blue-200 animate-pulse">
              Double-click for details
            </div>
          )}
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
             <span>Double-click to open properties in full view</span>
           </div>
        </div>
      )}

      {/* View Project Structure Button - Only show when selected */}
      {isSelected && selectedLibraries.length > 0 && (
        <div className="mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Trigger project preview modal
              if (onViewProjectStructure) {
                onViewProjectStructure();
              }
            }}
            className="w-full bg-green-600 text-white py-1.5 px-2 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
            title="View Project Structure"
          >
            <Folder className="w-3 h-3" />
            <span>View Project Structure</span>
          </button>
        </div>
      )}

      {/* Draggable Overlay - Allows drag from anywhere on content area */}
      {isSelected && !isResizing && (
        <div
          {...listeners}
          {...attributes}
          className="absolute rounded-lg cursor-grab active:cursor-grabbing z-20 transition-all duration-150"
          style={{
            pointerEvents: 'auto',
            backgroundColor: 'transparent',
            top: '42px', // Below header area (approx 42px)
            left: 0,
            right: 0,
            bottom: 0,
            // Visual feedback during drag
            boxShadow: isDragging ? 'inset 0 0 0 2px rgba(59, 130, 246, 0.4)' : 'none',
          }}
          title="Drag to move this component anywhere on the canvas"
        />
      )}

      {/* Drag Indicator */}
      <div
        className={`absolute top-2 right-2 p-1 rounded pointer-events-none transition-all duration-200 z-40 ${
          isDragging ? 'opacity-100 scale-110' : 'opacity-0'
        }`}
        style={{
          background: isDragging ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          borderRadius: '6px',
        }}
      >
        <GripVertical className={`w-3 h-3 transition-colors duration-200 ${
          isDragging ? 'text-blue-600' : 'text-gray-400'
        }`} />
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
        <div className="resize-handle absolute bottom-0 right-0 w-8 h-8 cursor-se-resize z-30" onMouseDown={handleMouseDown}>
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-tl-lg shadow-lg hover:shadow-xl opacity-80 hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:scale-105 ring-2 ring-blue-200 ring-opacity-50">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
          {/* Invisible larger hit area */}
          <div className="absolute inset-0 w-10 h-10 -top-1 -left-1 cursor-se-resize" onMouseDown={handleMouseDown}></div>
        </div>
      )}

      {/* Enhanced Corner Indicators */}
      {isSelected && (
        <>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-tr-md opacity-60 shadow-sm"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-bl from-blue-500 to-indigo-600 rounded-bl-md opacity-60 shadow-sm"></div>
          <div className="absolute top-0 left-0 w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-br-md opacity-60 shadow-sm"></div>
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