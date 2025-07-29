import { useState, useCallback } from 'react';
import type { CanvasComponent, Connection } from '../types';

export const useCanvasState = () => {
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<CanvasComponent | null>(null);

  const setSelectedComponentWithLog = useCallback((component: CanvasComponent | null) => {
    console.log('Setting selected component:', component);
    setSelectedComponent(component);
  }, []);

  const addComponent = useCallback((component: CanvasComponent) => {
    setComponents(prev => [...prev, component]);
  }, []);

  const updateComponent = useCallback((id: string, updates: Partial<CanvasComponent>) => {
    console.log('Updating component:', id, updates);
    setComponents(prev => 
      prev.map(comp => {
        if (comp.id === id) {
          // Handle properties update specially to merge them properly
          if (updates.properties) {
            return {
              ...comp,
              ...updates,
              properties: {
                ...comp.properties,
                ...updates.properties
              }
            };
          }
          // For non-properties updates (like position), just spread the updates
          return { ...comp, ...updates };
        }
        return comp;
      })
    );
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setConnections(prev => 
      prev.filter(conn => conn.source !== id && conn.target !== id)
    );
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const addConnection = useCallback((source: string, target: string) => {
    const newConnection: Connection = {
      id: `${source}-${target}`,
      source,
      target,
      type: 'default'
    };
    setConnections(prev => [...prev, newConnection]);
  }, []);

  const removeConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedComponent(null);
  }, []);

  const resetCanvas = useCallback(() => {
    setComponents([]);
    setConnections([]);
    setSelectedComponent(null);
  }, []);

  const loadCanvasState = useCallback((newComponents: CanvasComponent[], newConnections: Connection[]) => {
    setComponents(newComponents || []);
    setConnections(newConnections || []);
    setSelectedComponent(null);
  }, []);

  return {
    components,
    connections,
    selectedComponent,
    addComponent,
    updateComponent,
    removeComponent,
    addConnection,
    removeConnection,
    setSelectedComponent: setSelectedComponentWithLog,
    clearSelection,
    resetCanvas,
    loadCanvasState
  };
}; 