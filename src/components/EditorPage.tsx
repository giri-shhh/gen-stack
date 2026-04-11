import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import Canvas from './Canvas';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanelModular';
import ResizablePanel from './ResizablePanel';
import Header from './Header';
import Toast from './Toast';
import { useCanvasState } from '../hooks/useCanvasState';
import { getTechById } from '../data/techStack';
import type { 
  User, 
  Project, 
  CanvasComponent, 
  Technology, 
  Toast as ToastType,
  Connection
} from '../types';

export const ProjectLoader = ({ currentProject, setCurrentProject }: { currentProject: any, setCurrentProject: any }) => {
  const { projectId } = useParams();
  
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id.toString() !== projectId)) {
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const found = projects.find((p: any) => p.id.toString() === projectId);
        if (found) {
          setCurrentProject(found);
        }
      }
    }
  }, [projectId, currentProject, setCurrentProject]);
  
  return null;
};

interface EditorPageProps {
  user: User | null;
  currentProject: Project | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
  onLogout: () => void;
}

export default function EditorPage({ user, currentProject, setCurrentProject, onLogout }: EditorPageProps) {
  const navigate = useNavigate();
  const [toast, setToast] = useState<ToastType | null>(null);

  // Canvas state
  const {
    components,
    connections,
    selectedComponent,
    setSelectedComponent,
    addComponent,
    updateComponent,
    removeComponent,
    addConnection,
    removeConnection,
    resetCanvas,
    loadCanvasState
  } = useCanvasState();

  // Debug component selection
  useEffect(() => {
    console.log('App: Selected component changed:', selectedComponent);
  }, [selectedComponent]);

  // Drag and drop state
  const [draggedTech, setDraggedTech] = useState<Technology | null>(null);
  const [dragOverlayContent, setDragOverlayContent] = useState<React.ReactNode>(null);

  // Properties panel state
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [previewComponent, setPreviewComponent] = useState<CanvasComponent | null>(null);
  const [isPropertiesPanelPopup, setIsPropertiesPanelPopup] = useState(false);

  // Panel width state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : 300;
  });
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(() => {
    const saved = localStorage.getItem('propertiesPanelWidth');
    return saved ? parseInt(saved, 10) : 350;
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save project
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (currentProject) {
          handleSaveProject();
        }
      }
      
      // Escape to clear selection
      if (event.key === 'Escape') {
        setSelectedComponent(null);
      }
      
      // P key to focus properties panel when component is selected
      if (event.key === 'p' && selectedComponent) {
        event.preventDefault();
        const propertiesPanel = document.querySelector('[data-properties-panel]');
        if (propertiesPanel) {
          propertiesPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProject, selectedComponent]);

  // Migration function to convert old component structure to new format
  const migrateComponentStructure = (component: any): CanvasComponent => {
    if (component.x !== undefined && component.y !== undefined) {
      return {
        id: component.id,
        type: component.type || component.techId,
        techId: component.techId,
        position: { x: component.x, y: component.y },
        size: { width: component.width, height: component.height },
        properties: component.properties || {
          name: component.name,
          description: component.description,
          color: component.color
        },
        label: component.label,
        description: component.description
      };
    }
    return component;
  };

  const migrateConnectionStructure = (connection: any): any => {
    if (connection.from !== undefined && connection.to !== undefined) {
      return {
        id: connection.id,
        source: connection.from,
        target: connection.to,
        type: connection.type || 'default'
      };
    }
    return connection;
  };

  useEffect(() => {
    if (currentProject && currentProject.canvasState) {
      if (currentProject.canvasState.components) {
        const migratedComponents = currentProject.canvasState.components.map(migrateComponentStructure);
        const migratedConnections = currentProject.canvasState.connections.map(migrateConnectionStructure);
        loadCanvasState(migratedComponents, migratedConnections);
      }
    } else if (currentProject) {
      resetCanvas();
    }
  }, [currentProject?.id]);

  useEffect(() => {
    (window as any).debugSaveProject = () => {
      console.log('Current project:', currentProject);
      console.log('Components:', components);
      console.log('Connections:', connections);
    };
    (window as any).debugCheckSavedProjects = () => {
      const saved = localStorage.getItem('userProjects');
      if (saved) {
        console.log('Parsed projects:', JSON.parse(saved));
      }
    };
  }, [currentProject, components, connections]);

  const handleBackToLanding = () => {
    setCurrentProject(null);
    navigate('/');
    navigate('/dashboard');
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;
    
    try {
      const canvasState = {
        components: components.map((comp: CanvasComponent) => ({ ...comp })),
        connections: connections.map((conn: any) => ({ ...conn })),
        zoom: 1,
        pan: { x: 0, y: 0 }
      };

      const updatedProject: Project = {
        ...currentProject,
        canvasState,
        lastModified: new Date().toISOString()
      };

      setCurrentProject(updatedProject);

      const savedProjects = localStorage.getItem('userProjects');
      let projects: Project[] = [];
      if (savedProjects) {
        try { projects = JSON.parse(savedProjects); } catch (e) { projects = []; }
      }

      const existingIndex = projects.findIndex(p => p.id === updatedProject.id);
      if (existingIndex >= 0) projects[existingIndex] = updatedProject;
      else projects.unshift(updatedProject);

      localStorage.setItem('userProjects', JSON.stringify(projects));
      
      const verifySave = localStorage.getItem('userProjects');
      if (verifySave) {
        const verifyProjects = JSON.parse(verifySave);
        const savedProject = verifyProjects.find((p: Project) => p.id === updatedProject.id);
        if (savedProject && savedProject.canvasState) {
          setToast({ message: 'Project saved successfully!', type: 'success' });
        } else {
          setToast({ message: 'Failed to save project', type: 'error' });
        }
      }
    } catch (error) {
      setToast({ message: 'Error saving project', type: 'error' });
    }
  };

  const handleComponentDoubleClick = (component: CanvasComponent) => {
    setSelectedComponent(component);
    setIsPropertiesPanelPopup(true);
    setToast({
      message: `Properties panel opened in full view for ${component.properties?.name || component.techId}`,
      type: 'success'
    });
  };

  const handleViewProjectStructure = (component: CanvasComponent) => {
    setPreviewComponent(component);
    setShowProjectPreview(true);
  };

  const handlePropertiesPanelPopupToggle = (isPopup: boolean) => {
    setIsPropertiesPanelPopup(isPopup);
  };

  const handleDeleteCurrentProject = () => {
    if (currentProject) {
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const updatedProjects = projects.filter((p: Project) => p.id !== currentProject.id);
        localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      }
      setCurrentProject(null);
      navigate('/');
      navigate('/dashboard');
      setToast({ message: `Project "${currentProject.name}" has been deleted successfully`, type: 'success' });
    }
  };

  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
    localStorage.setItem('sidebarWidth', width.toString());
  };

  const handlePropertiesPanelResize = (width: number) => {
    setPropertiesPanelWidth(width);
    localStorage.setItem('propertiesPanelWidth', width.toString());
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    
    if (active.id.startsWith('tech-')) {
      const techId = active.id.replace('tech-', '');
      const tech = getTechById(techId);
      if (tech) {
        setDraggedTech(tech);
        setDragOverlayContent(
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              {tech.logo && <tech.logo className="w-5 h-5 text-blue-500" />}
              <span className="font-medium text-sm">{tech.name}</span>
            </div>
          </div>
        );
      }
    } else if (active.data?.current?.type === 'canvas-component') {
      const component = active.data.current.component;
      const tech = getTechById(component.techId);
      setDragOverlayContent(
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            {tech?.logo && <tech.logo className="w-5 h-5 text-blue-500" />}
            <span className="font-medium text-sm">{component.properties?.name || tech?.name || 'Component'}</span>
          </div>
        </div>
      );
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && over.id === 'canvas' && active.id.startsWith('tech-')) {
      const techId = active.id.replace('tech-', '');
      const tech = getTechById(techId);
      if (tech) {
        const canvasElement = document.querySelector('[data-droppable-id="canvas"]');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const newComponent: CanvasComponent = {
            id: `${techId}-${Date.now()}`,
            type: techId,
            techId: techId,
            position: { x: centerX - 100, y: centerY - 70 },
            size: { width: 200, height: 140 },
            properties: { name: tech.name, description: tech.description, color: tech.color }
          };
          addComponent(newComponent);
        }
      }
    } else if (over && over.id === 'canvas' && active.data?.current?.type === 'canvas-component') {
      const component = active.data.current.component;
      if (event.delta) {
        updateComponent(component.id, {
          position: {
            x: component.position.x + event.delta.x,
            y: component.position.y + event.delta.y
          }
        });
      }
    }
    setDraggedTech(null);
    setDragOverlayContent(null);
  };

  const handleDragCancel = () => {
    setDraggedTech(null);
    setDragOverlayContent(null);
  };

  const clearSelection = () => {
    setSelectedComponent(null);
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ProjectLoader currentProject={currentProject} setCurrentProject={setCurrentProject} />
        Loading project...
      </div>
    );
  }

  return (
    <>
      <ProjectLoader currentProject={currentProject} setCurrentProject={setCurrentProject} />
      <DndContext 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCenter}
      >
        <div className="h-screen flex flex-col bg-gray-50">
          <Header 
            onBackToLanding={handleBackToLanding} 
            user={user || undefined} 
            onLogout={onLogout}
            currentProject={currentProject || undefined}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteCurrentProject}
            components={components}
            connections={connections}
          />
          
          <div className="flex flex-1 overflow-hidden flex-layout">
            <ResizablePanel
              side="left"
              defaultWidth={sidebarWidth}
              minWidth={250}
              maxWidth={500}
              onResize={handleSidebarResize}
            >
              <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
                <Sidebar 
                  currentProject={currentProject || undefined}
                  onProjectUpdate={(updates) => {
                    if (currentProject) {
                      setCurrentProject({ ...currentProject, ...updates });
                    }
                  }}
                />
              </div>
            </ResizablePanel>
            
            <div className={`relative flex-1 min-w-0 canvas-container ${selectedComponent ? 'canvas-with-panel' : ''}`}>
              <Canvas
                components={components}
                connections={connections}
                selectedComponent={selectedComponent || undefined}
                onComponentSelect={setSelectedComponent}
                onComponentUpdate={updateComponent}
                onComponentRemove={removeComponent}
                onConnectionAdd={(connection: Connection) => addConnection(connection.source, connection.target)}
                onConnectionRemove={removeConnection}
                onCanvasClick={clearSelection}
                onAddComponent={addComponent}
                draggedTech={draggedTech || undefined}
                onComponentDoubleClick={handleComponentDoubleClick}
                onViewProjectStructure={handleViewProjectStructure}
              />
              
              {selectedComponent && (
                <div className="absolute bottom-4 right-4 z-50">
                  <button
                    onClick={() => {
                      const propertiesPanel = document.querySelector('[data-properties-panel]');
                      if (propertiesPanel) {
                        propertiesPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    title="Open Properties Panel (Press 'P' key)"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            {selectedComponent && (
              <ResizablePanel
                side="right"
                defaultWidth={propertiesPanelWidth}
                minWidth={280}
                maxWidth={600}
                onResize={handlePropertiesPanelResize}
              >
                <div className="h-full bg-white border-l border-gray-200 overflow-y-auto properties-panel-visible" data-properties-panel>
                  <PropertiesPanel
                    selectedComponent={selectedComponent}
                    onComponentUpdate={updateComponent}
                    onComponentRemove={removeComponent}
                    onConnectionRemove={removeConnection}
                    components={components}
                    connections={connections}
                    addComponent={addComponent}
                    showProjectPreview={showProjectPreview}
                    setShowProjectPreview={setShowProjectPreview}
                    previewComponent={previewComponent}
                    isPopupMode={isPropertiesPanelPopup}
                    setIsPopupMode={handlePropertiesPanelPopupToggle}
                  />
                </div>
              </ResizablePanel>
            )}
          </div>
          
          <DragOverlay dropAnimation={null}>
            {dragOverlayContent}
          </DragOverlay>
        </div>
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </DndContext>
    </>
  );
}
