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

  const renderConnection = (connection: any) => {
    if (!connection || !connection.source || !connection.target) return null;
    
    const fromComponent = components.find(c => c.id === connection.source);
    const toComponent = components.find(c => c.id === connection.target);
    
    if (!fromComponent || !toComponent) return null;
    
    const fromCenter = getComponentCenter(connection.source);
    const toCenter = getComponentCenter(connection.target);
    
    // Calculate intersection points with component borders
    const fromIntersection = getIntersectionPoint(toCenter, fromCenter, fromComponent);
    const toIntersection = getIntersectionPoint(fromCenter, toCenter, toComponent);
    
    // Calculate control points for smooth curve
    const dx = toIntersection.x - fromIntersection.x;
    const dy = toIntersection.y - fromIntersection.y;
    // const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Adjust control points based on distance
    // const controlDistance = Math.min(distance * 0.3, 100);
    
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
        <defs>
          <marker
            id={`arrow-${connection.id}`}
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,8 10,4"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="1"
            />
          </marker>
          <filter id={`glow-${connection.id}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection line with glow effect */}
        <path
          d={pathData}
          className="connection-line"
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          markerEnd={`url(#arrow-${connection.id})`}
          filter={`url(#glow-${connection.id})`}
          style={{
            transition: 'all 0.2s ease-in-out'
          }}
        />
        
        {/* Connection points at component borders */}
        <circle
          cx={fromIntersection.x}
          cy={fromIntersection.y}
          r="3"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="1"
        />
        <circle
          cx={toIntersection.x}
          cy={toIntersection.y}
          r="3"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="1"
        />
      </g>
    );
  };

  const renderConnectingLine = () => {
    if (!isConnecting || !connectionStart || !mousePosition) return null;
    
    const startComponent = components.find(c => c.id === connectionStart);
    if (!startComponent) return null;
    
    const startCenter = getComponentCenter(connectionStart);
    
    // Use the actual mouse position
    const startIntersection = getIntersectionPoint(mousePosition, startCenter, startComponent);
    
    return (
      <g>
        <defs>
          <marker
            id="connecting-arrow"
            markerWidth="12"
            markerHeight="12"
            refX="10"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,8 10,4"
              fill="#3b82f6"
              opacity="0.6"
              stroke="#1e40af"
              strokeWidth="1"
            />
          </marker>
        </defs>
        
        {/* Connecting line with dashed style */}
        <path
          d={`M ${startIntersection.x} ${startIntersection.y} L ${mousePosition.x} ${mousePosition.y}`}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#connecting-arrow)"
          opacity="0.6"
          strokeDasharray="8,4"
          style={{
            animation: 'dash 1s linear infinite'
          }}
        />
        
        {/* Connection point at start component border */}
        <circle
          cx={startIntersection.x}
          cy={startIntersection.y}
          r="3"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    );
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
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
      </defs>
      <g transform={`scale(${zoom})`}>
        {connections.map(renderConnection)}
        {renderConnectingLine()}
      </g>
    </svg>
  );
};

export default ConnectionLines; 