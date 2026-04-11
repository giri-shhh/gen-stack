import React from 'react';
import type { ConnectionLinesProps } from '../types';

const ConnectionLines: React.FC<ConnectionLinesProps> = ({ connections, components, isConnecting, connectionStart, mousePosition, zoom = 1 }) => {
  // Calculate intersection point between a line and a rectangle (component border)
  const getIntersectionPoint = (lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }, component: any) => {
    if (!component || !component.position || !component.size) {
      return { x: lineStart.x, y: lineStart.y };
    }
    
    const { x, y, width, height } = {
      x: component.position.x,
      y: component.position.y,
      width: component.size.width,
      height: component.size.height
    };
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Calculate the direction vector from start to end
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: centerX, y: centerY };
    
    // Find the intersection with the component's bounding box
    
    // Check intersection with each side of the rectangle
    const sides = [
      { x1: x, y1: y, x2: x + width, y2: y }, // Top
      { x1: x + width, y1: y, x2: x + width, y2: y + height }, // Right
      { x1: x, y1: y + height, x2: x + width, y2: y + height }, // Bottom
      { x1: x, y1: y, x2: x, y2: y + height } // Left
    ];
    
    let minDistance = Infinity;
    let bestIntersection = { x: centerX, y: centerY };
    
    sides.forEach(side => {
      const intersection = getLineIntersection(
        lineStart.x, lineStart.y, lineEnd.x, lineEnd.y,
        side.x1, side.y1, side.x2, side.y2
      );
      
      if (intersection) {
        const distance = Math.sqrt(
          Math.pow(intersection.x - lineStart.x, 2) + 
          Math.pow(intersection.y - lineStart.y, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          bestIntersection = intersection;
        }
      }
    });
    
    return bestIntersection;
  };
  
  // Calculate intersection between two line segments
  const getLineIntersection = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null;
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    
    return null;
  };

  const getComponentCenter = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    if (!component || !component.position || !component.size) return { x: 0, y: 0 };
    
    return {
      x: component.position.x + component.size.width / 2,
      y: component.position.y + component.size.height / 2
    };
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1, transformOrigin: '0 0' }}
    >
      <defs>
        <style>
          {`
            @keyframes dash {
              to {
                stroke-dashoffset: -12;
              }
            }
          `}
        </style>
        
        {/* Arrow markers - using userSpaceOnUse for consistent scaling */}
        <marker
          id="arrow-default"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#3b82f6"
            stroke="#1e40af"
            strokeWidth="0.5"
          />
        </marker>
        
        <marker
          id="arrow-connecting"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#3b82f6"
            opacity="0.6"
            stroke="#1e40af"
            strokeWidth="0.5"
          />
        </marker>
      </defs>
      
      {/* Render all connections */}
      {connections.map((connection) => {
        if (!connection || !connection.source || !connection.target) return null;
        
        const fromComponent = components.find(c => c.id === connection.source);
        const toComponent = components.find(c => c.id === connection.target);
        
        if (!fromComponent || !toComponent) return null;
        
        const fromCenter = {
          x: fromComponent.position.x + fromComponent.size.width / 2,
          y: fromComponent.position.y + fromComponent.size.height / 2
        };
        const toCenter = {
          x: toComponent.position.x + toComponent.size.width / 2,
          y: toComponent.position.y + toComponent.size.height / 2
        };
        
        // Calculate intersection points with component borders
        const fromIntersection = getIntersectionPoint({ x: toCenter.x, y: toCenter.y }, { x: fromCenter.x, y: fromCenter.y }, fromComponent);
        const toIntersection = getIntersectionPoint({ x: fromCenter.x, y: fromCenter.y }, { x: toCenter.x, y: toCenter.y }, toComponent);
        
        // Calculate control points for smooth curve
        const dx = toIntersection.x - fromIntersection.x;
        const dy = toIntersection.y - fromIntersection.y;
        
        const controlPoint1 = {
          x: fromIntersection.x + dx * 0.3,
          y: fromIntersection.y + dy * 0.3
        };
        
        const controlPoint2 = {
          x: toIntersection.x - dx * 0.3,
          y: toIntersection.y - dy * 0.3
        };
        
        const pathData = `M ${fromIntersection.x} ${fromIntersection.y} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${toIntersection.x} ${toIntersection.y}`;
        
        return (
          <g key={connection.id}>
            {/* Connection line with glow effect */}
            <path
              d={pathData}
              className="connection-line"
              stroke="#3b82f6"
              strokeWidth={2 / zoom}
              fill="none"
              markerEnd="url(#arrow-default)"
              style={{
                transition: 'all 0.2s ease-in-out',
                filter: `drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))`
              }}
            />
            
            {/* Connection points at component borders */}
            <circle
              cx={fromIntersection.x}
              cy={fromIntersection.y}
              r={3 / zoom}
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth={1 / zoom}
            />
            <circle
              cx={toIntersection.x}
              cy={toIntersection.y}
              r={3 / zoom}
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth={1 / zoom}
            />
          </g>
        );
      })}
      
      {/* Render connecting line during connection creation */}
      {isConnecting && connectionStart && mousePosition && (() => {
        const startComponent = components.find(c => c.id === connectionStart);
        if (!startComponent) return null;
        
        const startCenter = {
          x: startComponent.position.x + startComponent.size.width / 2,
          y: startComponent.position.y + startComponent.size.height / 2
        };
        
        const startIntersection = getIntersectionPoint(mousePosition, startCenter, startComponent);
        
        const dx = mousePosition.x - startIntersection.x;
        const dy = mousePosition.y - startIntersection.y;
        const controlPoint1 = {
          x: startIntersection.x + dx * 0.3,
          y: startIntersection.y + dy * 0.3
        };
        const controlPoint2 = {
          x: mousePosition.x - dx * 0.3,
          y: mousePosition.y - dy * 0.3
        };
        const pathData = `M ${startIntersection.x} ${startIntersection.y} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${mousePosition.x} ${mousePosition.y}`;
        
        return (
          <g>
            {/* Connecting line with dashed style */}
            <path
              d={pathData}
              stroke="#3b82f6"
              strokeWidth={2 / zoom}
              fill="none"
              markerEnd="url(#arrow-connecting)"
              opacity="0.6"
              strokeDasharray={`${8 / zoom},${4 / zoom}`}
              style={{
                animation: 'dash 1s linear infinite'
              }}
            />
            {/* Connection point at start component border */}
            <circle
              cx={startIntersection.x}
              cy={startIntersection.y}
              r={3 / zoom}
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth={1 / zoom}
              opacity="0.6"
            />
          </g>
        );
      })()}
    </svg>
  );
};

export default ConnectionLines; 