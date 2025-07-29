import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import PropertiesPanel from './components/PropertiesPanel';
import ResizablePanel from './components/ResizablePanel';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Toast from './components/Toast';
import { useCanvasState } from './hooks/useCanvasState';
import { getTechById } from './data/techStack';
import type { 
  User, 
  Project, 
  CanvasComponent, 
  Technology, 
  Toast as ToastType,
  Connection
} from './types';

// Sample user data - commented out as it's not being used
// const sampleUser: User = {
//   id: '1',
//   name: 'test',
//   email: 'test@example.com',
//   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
// };

function App() {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProject]);

  // Migration function to convert old component structure to new format
  const migrateComponentStructure = (component: any): CanvasComponent => {
    // Check if component has old structure (direct x, y, width, height)
    if (component.x !== undefined && component.y !== undefined) {
      return {
        id: component.id,
        type: component.type || component.techId,
        techId: component.techId,
        position: {
          x: component.x,
          y: component.y
        },
        size: {
          width: component.width,
          height: component.height
        },
        properties: component.properties || {
          name: component.name,
          description: component.description,
          color: component.color
        },
        label: component.label,
        description: component.description
      };
    }
    // Component already has new structure
    return component;
  };

  // Migration function to convert old connection structure to new format
  const migrateConnectionStructure = (connection: any): any => {
    // Check if connection has old structure (from, to)
    if (connection.from !== undefined && connection.to !== undefined) {
      return {
        id: connection.id,
        source: connection.from,
        target: connection.to,
        type: connection.type || 'default'
      };
    }
    // Connection already has new structure
    return connection;
  };

  // Load project canvas state when project changes
  useEffect(() => {
    if (currentProject && currentProject.canvasState) {
      if (currentProject.canvasState.components) {
        console.log('Loading project canvas state:', currentProject.canvasState);
        
        // Migrate components and connections to new structure
        const migratedComponents = currentProject.canvasState.components.map(migrateComponentStructure);
        const migratedConnections = currentProject.canvasState.connections.map(migrateConnectionStructure);
        
        loadCanvasState(migratedComponents, migratedConnections);
      }
    } else if (currentProject) {
      console.log('New project - resetting canvas');
      resetCanvas();
    }
  }, [currentProject?.id]);

  // Debug functions for development
  useEffect(() => {
    (window as any).debugSaveProject = () => {
      console.log('Current project:', currentProject);
      console.log('Components:', components);
      console.log('Connections:', connections);
    };

    (window as any).debugCheckSavedProjects = () => {
      const saved = localStorage.getItem('userProjects');
      console.log('Saved projects in localStorage:', saved);
      if (saved) {
        console.log('Parsed projects:', JSON.parse(saved));
      }
    };

    (window as any).debugCreateTestProject = () => {
      const testProject: Project = {
        id: Date.now(),
        name: 'Test Project',
        description: 'A test project for debugging',
        lastModified: new Date().toISOString(),
        technologies: ['react', 'express'],
        status: 'active',
        canvasState: {
          components: [],
          connections: [],
          zoom: 1,
          pan: { x: 0, y: 0 }
        }
      };
      setCurrentProject(testProject);
    };
  }, [currentProject, components, connections]);

  // Event handlers
  const handleGetStarted = () => {
    if (!user) {
      // If no user is logged in, open the sign up modal
      setAuthModalMode('signup');
      setAuthModalOpen(true);
    } else {
      setShowLanding(false);
      setShowDashboard(true);
    }
  };

  const handleBackToLanding = () => {
    setCurrentProject(null);
    setShowDashboard(true);
    setDashboardKey(prev => prev + 1); // Force Dashboard re-render
  };

  const handleSaveProject = async () => {
    if (!currentProject) {
      console.log('No current project to save');
      return;
    }

    console.log('Saving project:', currentProject.name);
    
    try {
      // Deep copy components and connections to avoid reference issues
      const canvasState = {
        components: components.map((comp: CanvasComponent) => ({ ...comp })),
        connections: connections.map((conn: any) => ({ ...conn })),
        zoom: 1, // Default zoom level
        pan: { x: 0, y: 0 } // Default pan position
      };

      const updatedProject: Project = {
        ...currentProject,
        canvasState,
        lastModified: new Date().toISOString()
      };

      setCurrentProject(updatedProject);

      // Save to localStorage
      const savedProjects = localStorage.getItem('userProjects');
      let projects: Project[] = [];
      
      if (savedProjects) {
        try {
          projects = JSON.parse(savedProjects);
        } catch (error) {
          console.error('Error parsing saved projects:', error);
          projects = [];
        }
      }

      // Update or add the project
      const existingIndex = projects.findIndex(p => p.id === updatedProject.id);
      if (existingIndex >= 0) {
        projects[existingIndex] = updatedProject;
      } else {
        projects.unshift(updatedProject);
      }

      localStorage.setItem('userProjects', JSON.stringify(projects));
      
      // Verify save by re-reading
      const verifySave = localStorage.getItem('userProjects');
      if (verifySave) {
        const verifyProjects = JSON.parse(verifySave);
        const savedProject = verifyProjects.find((p: Project) => p.id === updatedProject.id);
        if (savedProject && savedProject.canvasState) {
          console.log('Project saved successfully with canvas state');
          setToast({
            message: 'Project saved successfully!',
            type: 'success'
          });
        } else {
          console.error('Project save verification failed');
          setToast({
            message: 'Failed to save project',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setToast({
        message: 'Error saving project',
        type: 'error'
      });
    }
  };

  const handleCreateNewProject = (project: Project | null = null) => {
    if (project) {
      setCurrentProject(project);
    } else {
      const newProject: Project = {
        id: Date.now(),
        name: 'New Project',
        description: 'A new project',
        lastModified: new Date().toISOString(),
        technologies: [],
        status: 'active'
      };
      setCurrentProject(newProject);
    }
    setShowDashboard(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentProject(null);
    setShowDashboard(false);
    setShowLanding(true);
  };

  const handleOpenSignIn = () => {
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userObj: User) => {
    setUser(userObj);
    setAuthModalOpen(false);
    setShowLanding(false);
    setShowDashboard(true);
  };

  const handleComponentDoubleClick = (component: CanvasComponent) => {
    setPreviewComponent(component);
    setShowProjectPreview(true);
  };

  // Handle delete current project
  const handleDeleteCurrentProject = () => {
    if (currentProject) {
      // Remove project from localStorage
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const updatedProjects = projects.filter((p: Project) => p.id !== currentProject.id);
        localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      }
      
      // Navigate back to dashboard
      setCurrentProject(null);
      setShowDashboard(true);
      setShowLanding(false);
      
      // Show success toast
      setToast({
        message: `Project "${currentProject.name}" has been deleted successfully`,
        type: 'success'
      });
    }
  };

  // Panel width handlers with localStorage persistence
  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
    localStorage.setItem('sidebarWidth', width.toString());
  };

  const handlePropertiesPanelResize = (width: number) => {
    setPropertiesPanelWidth(width);
    localStorage.setItem('propertiesPanelWidth', width.toString());
  };

  // Drag and drop handlers
  const handleDragStart = (event: any) => {
    const { active } = event;
    
    // Handle tech items from sidebar
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
    }
    // Handle existing canvas components
    else if (active.data?.current?.type === 'canvas-component') {
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
    
    // Handle tech items from sidebar being dropped on canvas
    if (over && over.id === 'canvas' && active.id.startsWith('tech-')) {
      const techId = active.id.replace('tech-', '');
      const tech = getTechById(techId);
      
      if (tech) {
        // Get the canvas element to calculate proper position
        const canvasElement = document.querySelector('[data-droppable-id="canvas"]');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const newComponent: CanvasComponent = {
            id: `${techId}-${Date.now()}`,
            type: techId,
            techId: techId,
            position: {
              x: centerX - 75, // Center the component
              y: centerY - 50
            },
            size: {
              width: 150,
              height: 100
            },
            properties: {
              name: tech.name,
              description: tech.description,
              color: tech.color
            }
          };
          
          addComponent(newComponent);
        }
      }
    }
    // Handle canvas component repositioning
    else if (over && over.id === 'canvas' && active.data?.current?.type === 'canvas-component') {
      const component = active.data.current.component;
      
      // Use the delta from the drag event to update the position
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

  // Render landing page
  if (showLanding) {
    return (
      <>
        <LandingPage 
          onGetStarted={handleGetStarted}
          onSignIn={handleOpenSignIn}
          onSignUp={handleOpenSignUp}
        />
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            mode={authModalMode}
            onClose={() => setAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </>
    );
  }

  // Render dashboard
  if (showDashboard && user) {
    return (
      <Dashboard
        key={`dashboard-${dashboardKey}`} // Force re-render when dashboard becomes visible
        user={user}
        onCreateNewProject={handleCreateNewProject}
        onLogout={handleLogout}
      />
    );
  }

  // Render main canvas
  return (
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
          onLogout={handleLogout}
          currentProject={currentProject || undefined}
          onSaveProject={handleSaveProject}
          onDeleteProject={handleDeleteCurrentProject}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Resizable */}
          <ResizablePanel
            side="left"
            defaultWidth={sidebarWidth}
            minWidth={250}
            maxWidth={500}
            onResize={handleSidebarResize}
          >
            <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
              <Sidebar />
            </div>
          </ResizablePanel>
          
          {/* Main Canvas */}
          <div className="relative flex-1">
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
            />
          </div>
          
          {/* Right Panel - Resizable, only show when component is selected */}
          {selectedComponent && (
            <ResizablePanel
              side="right"
              defaultWidth={propertiesPanelWidth}
              minWidth={280}
              maxWidth={600}
              onResize={handlePropertiesPanelResize}
            >
              <div className="h-full bg-white border-l border-gray-200 overflow-y-auto">
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
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DndContext>
  );
}

export default App; 