import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  onResize?: (width: number) => void;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  side,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 300,
  onResize
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('Resize handle clicked:', side, e.clientX);
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, side]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = side === 'left' 
      ? startWidthRef.current + deltaX
      : startWidthRef.current - deltaX;

    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    console.log('Resizing:', side, 'deltaX:', deltaX, 'newWidth:', clampedWidth);
    setWidth(clampedWidth);
    
    if (onResize) {
      onResize(clampedWidth);
    }
  }, [isResizing, side, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const resizeHandleStyle = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: '6px',
    cursor: 'col-resize' as const,
    backgroundColor: isResizing ? '#3b82f6' : 'transparent',
    transition: 'background-color 0.2s',
    zIndex: 9999,
    pointerEvents: 'auto' as const,
    ...(side === 'left' ? { right: '-3px' } : { left: '-3px' })
  };

  const panelStyle = {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
    position: 'relative' as const,
    flexShrink: 0,
    pointerEvents: 'auto' as const
  };

  return (
    <div style={panelStyle} ref={panelRef} className={isResizing ? 'resizing' : ''}>
      {children}
      <div
        style={resizeHandleStyle}
        onMouseDown={handleMouseDown}
        className="hover:bg-blue-300 hover:bg-opacity-50 group resize-handle"
        title={`Drag to resize ${side === 'left' ? 'sidebar' : 'properties panel'}`}
      >
        {/* Visual indicator dots */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity resize-handle-dots">
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizablePanel; 