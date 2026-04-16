import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { Settings, BrainCircuit, Loader2, Key, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import Canvas from './Canvas';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanelModular';
import ResizablePanel from './ResizablePanel';
import Header from './Header';
import Toast from './Toast';
import { useCanvasState } from '../hooks/useCanvasState';
import { getTechById } from '../data/techStack';
import { generateArchitecture, getStoredApiKey, saveApiKey } from '../lib/aiArchitectureGenerator';
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

  // AI architecture generation state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiKeyPrompt, setAiKeyPrompt] = useState(false);
  const [aiKeyInput, setAiKeyInput] = useState('');
  const aiGeneratedRef = useRef(false);

  // Mobile state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobilePanel, setMobilePanel] = useState<'canvas' | 'sidebar' | 'properties'>('canvas');

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


  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and drop state
  const [draggedTech, setDraggedTech] = useState<Technology | null>(null);
  const [dragOverlayContent, setDragOverlayContent] = useState<React.ReactNode>(null);

  // Properties panel state
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [previewComponent, setPreviewComponent] = useState<CanvasComponent | null>(null);
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

  // Handle clone event from Header
  useEffect(() => {
    const handleClone = () => {
      handleCloneProject();
    };
    window.addEventListener('clone-project', handleClone);
    return () => window.removeEventListener('clone-project', handleClone);
  }, []);

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
    // Reset AI generation guard when project changes
    aiGeneratedRef.current = false;
  }, [currentProject?.id]);

  // Auto-generate AI architecture for new AI-enabled projects (no canvas state yet)
  useEffect(() => {
    if (
      !currentProject?.useAiArchitecture ||
      currentProject.canvasState ||
      aiGeneratedRef.current ||
      isGeneratingAI
    ) return;

    const apiKey = getStoredApiKey(currentProject.aiModel ?? 'openai');
    if (!apiKey) {
      setAiKeyPrompt(true);
      return;
    }
    runAiGeneration(apiKey);
  }, [currentProject?.id, isGeneratingAI]);

  const runAiGeneration = async (apiKey: string) => {
    if (!currentProject) return;
    aiGeneratedRef.current = true;
    setAiKeyPrompt(false);
    setIsGeneratingAI(true);
    try {
      const { components: genComponents, connections: genConnections } = await generateArchitecture(currentProject, apiKey);
      loadCanvasState(genComponents, genConnections);
      setToast({ message: 'AI architecture generated successfully!', type: 'success' });
    } catch (err) {
      aiGeneratedRef.current = false;
      setToast({ message: `AI generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`, type: 'error' });
    } finally {
      setIsGeneratingAI(false);
    }
  };


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
    if (!currentProject) return;

    // Auto-save current canvas state to localStorage and App state before navigating
    const canvasState = {
      components: components.map((c: CanvasComponent) => ({ ...c })),
      connections: connections.map((c: any) => ({ ...c })),
      zoom: 1,
      pan: { x: 0, y: 0 }
    };
    const updatedProject: Project = {
      ...currentProject,
      canvasState,
      lastModified: new Date().toISOString()
    };

    const savedProjects = localStorage.getItem('userProjects');
    let projects: Project[] = [];
    if (savedProjects) {
      try { projects = JSON.parse(savedProjects); } catch { projects = []; }
    }
    const idx = projects.findIndex(p => p.id === updatedProject.id);
    if (idx >= 0) projects[idx] = updatedProject;
    else projects.unshift(updatedProject);
    localStorage.setItem('userProjects', JSON.stringify(projects));

    setCurrentProject(updatedProject);
    navigate(`/project/${currentProject.id}/module/${component.id}`);
  };

  const handleViewProjectStructure = (component: CanvasComponent) => {
    setPreviewComponent(component);
    setShowProjectPreview(true);
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

  const handleCloneProject = () => {
    if (!currentProject) return;

    try {
      const canvasState = {
        components: components.map((comp: CanvasComponent) => ({ ...comp })),
        connections: connections.map((conn: any) => ({ ...conn })),
        zoom: 1,
        pan: { x: 0, y: 0 }
      };

      const newProject: Project = {
        id: Date.now(),
        name: `${currentProject.name} (Copy)`,
        description: currentProject.description,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        canvasState,
        technologies: currentProject.technologies,
        status: 'draft'
      };

      const savedProjects = localStorage.getItem('userProjects');
      let projects: Project[] = [];
      if (savedProjects) {
        try { projects = JSON.parse(savedProjects); } catch (e) { projects = []; }
      }

      projects.unshift(newProject);
      localStorage.setItem('userProjects', JSON.stringify(projects));

      setCurrentProject(newProject);
      navigate(`/editor/${newProject.id}`);
      setToast({ message: `Project cloned successfully! Created "${newProject.name}"`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Error cloning project', type: 'error' });
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
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
    const { active, over, delta } = event;

    // Handle moving an existing canvas component — use event.delta (screen pixels)
    // divided by the current canvas zoom to get canvas-space displacement.
    if (active.data?.current?.type === 'canvas-component') {
      const component = active.data.current.component as CanvasComponent;
      const canvasEl = document.querySelector('.canvas-background') as any;
      const zoom: number = canvasEl?._zoom ?? 1;
      updateComponent(component.id, {
        position: {
          x: component.position.x + delta.x / zoom,
          y: component.position.y + delta.y / zoom,
        },
      });
    }

    // Handle tech items dragged from the sidebar onto the canvas
    if (over?.id === 'canvas' && active.id.startsWith('tech-')) {
      const techId = active.id.replace('tech-', '');
      const tech = getTechById(techId);
      if (tech) {
        const canvasElement = document.querySelector('[data-droppable-id="canvas"]');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          // Read current pan/zoom from the canvas-background element
          const canvasEl = document.querySelector('.canvas-background') as any;
          const zoom: number = canvasEl?._zoom ?? 1;
          const pan: { x: number; y: number } = canvasEl?._pan ?? { x: 0, y: 0 };
          // Convert the visible canvas center to canvas-space coordinates
          const cx = (rect.width / 2 - pan.x) / zoom;
          const cy = (rect.height / 2 - pan.y) / zoom;
          const newComponent: CanvasComponent = {
            id: `${techId}-${Date.now()}`,
            type: techId,
            techId: techId,
            position: { x: cx - 100, y: cy - 70 },
            size: { width: 200, height: 140 },
            properties: { name: tech.name, description: tech.description, color: tech.color },
          };
          addComponent(newComponent);
        }
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
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
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
          
          {/* Mobile Panel Selector */}
          {isMobile && (
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-1 p-1 overflow-x-auto">
              <button
                onClick={() => setMobilePanel('canvas')}
                className={`flex-1 px-2 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                  mobilePanel === 'canvas'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Canvas
              </button>
              <button
                onClick={() => setMobilePanel('sidebar')}
                className={`flex-1 px-2 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                  mobilePanel === 'sidebar'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Components
              </button>
              {selectedComponent && (
                <button
                  onClick={() => setMobilePanel('properties')}
                  className={`flex-1 px-2 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                    mobilePanel === 'properties'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Properties
                </button>
              )}
            </div>
          )}
          <div className="flex flex-1 overflow-hidden gap-0" style={{ minWidth: 0 }}>
            {/* Sidebar - Hide on mobile or show based on panel selection */}
            {(!isMobile || mobilePanel === 'sidebar') && (
              <ResizablePanel
                side="left"
                defaultWidth={isMobile ? window.innerWidth - 40 : sidebarWidth}
                minWidth={250}
                maxWidth={isMobile ? window.innerWidth - 40 : 500}
                onResize={handleSidebarResize}
              >
                <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
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
            )}
            
            {/* Canvas - Hide on mobile or show based on panel selection */}
            {(!isMobile || mobilePanel === 'canvas') && (
              <div className="relative flex-1" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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

                {/* AI generation loading overlay */}
                {isGeneratingAI && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 max-w-sm mx-4">
                      <div className="relative">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                          <BrainCircuit className="w-8 h-8 text-white" />
                        </div>
                        <Loader2 className="absolute -top-1 -right-1 w-5 h-5 text-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">Generating Architecture</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          AI is designing your system architecture…
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI key prompt overlay — shown when key is missing */}
                {aiKeyPrompt && !isGeneratingAI && (
                  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col space-y-5 max-w-sm w-full mx-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl shadow">
                          <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">API Key Required</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Enter your key to generate the architecture</p>
                        </div>
                      </div>
                      <input
                        type="password"
                        value={aiKeyInput}
                        onChange={e => setAiKeyInput(e.target.value)}
                        placeholder="Paste your API key…"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && aiKeyInput.trim()) {
                            saveApiKey(currentProject?.aiModel ?? 'openai', aiKeyInput.trim());
                            runAiGeneration(aiKeyInput.trim());
                          }
                        }}
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setAiKeyPrompt(false)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          disabled={!aiKeyInput.trim()}
                          onClick={() => {
                            saveApiKey(currentProject?.aiModel ?? 'openai', aiKeyInput.trim());
                            runAiGeneration(aiKeyInput.trim());
                          }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regenerate button for AI projects */}
                {currentProject?.useAiArchitecture && !isGeneratingAI && !aiKeyPrompt && (
                  <div className="absolute bottom-4 left-4 z-30">
                    <button
                      onClick={() => {
                        const apiKey = getStoredApiKey(currentProject.aiModel ?? 'openai');
                        if (!apiKey) { setAiKeyInput(''); setAiKeyPrompt(true); return; }
                        aiGeneratedRef.current = false;
                        runAiGeneration(apiKey);
                      }}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold transition-all hover:scale-105"
                      title="Regenerate AI Architecture"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                )}

                {selectedComponent && !isMobile && (
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
            )}
            
            {/* Properties Panel - Hide on mobile or show based on panel selection */}
            {selectedComponent && (!isMobile || mobilePanel === 'properties') && (
              <ResizablePanel
                side="right"
                defaultWidth={isMobile ? window.innerWidth - 40 : propertiesPanelWidth}
                minWidth={280}
                maxWidth={isMobile ? window.innerWidth - 40 : 600}
                onResize={handlePropertiesPanelResize}
              >
                <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto overflow-x-hidden properties-panel-visible" data-properties-panel>
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
