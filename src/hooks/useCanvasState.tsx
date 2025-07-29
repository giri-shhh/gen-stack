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
    setComponents(prev => {
      const updated = prev.map(comp => {
        if (comp.id === id) {
          // Handle properties update specially to merge them properly
          if (updates.properties) {
            const updatedComp = {
              ...comp,
              ...updates,
              properties: {
                ...comp.properties,
                ...updates.properties
              }
            };
            return updatedComp;
          }
          // For non-properties updates (like position), just spread the updates
          const updatedComp = { ...comp, ...updates };
          return updatedComp;
        }
        return comp;
      });
      return updated;
    });
    
    // Also update the selected component if it's the one being updated
    setSelectedComponent(prev => {
      if (prev && prev.id === id) {
        if (updates.properties) {
          const updatedSelected = {
            ...prev,
            ...updates,
            properties: {
              ...prev.properties,
              ...updates.properties
            }
          };
          return updatedSelected;
        }
        const updatedSelected = { ...prev, ...updates };
        return updatedSelected;
      }
      return prev;
    });
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