import { useState, useEffect } from 'react';
import {
  User,
  Project,
  CanvasComponent,
  Toast as ToastType,
  Technology,
  UseAppLogicReturn
} from '../types';
import { useCanvasState } from './useCanvasState';
import { getTechById } from '../data/techStack';
import { NavigateFunction } from 'react-router-dom';

export const useAppLogic = (navigate: NavigateFunction): UseAppLogicReturn => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [getStartedModalOpen, setGetStartedModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  // Canvas state from dedicated hook
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
    loadCanvasState,
  } = useCanvasState();

  // Drag and drop state
  const [draggedTech, setDraggedTech] = useState<Technology | null>(null);
  const [dragOverlayContent, setDragOverlayContent] = useState<React.ReactNode>(null);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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


  // Drag and Drop handlers
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
    const { active, over, delta } = event;

    // Handle tech items from sidebar being dropped on canvas
    if (over && over.id === 'canvas' && active.id.startsWith('tech-')) {
        const techId = active.id.replace('tech-', '');
        const tech = getTechById(techId);

        if (tech) {
            const canvasElement = document.querySelector('[data-droppable-id="canvas"]');
            if (canvasElement) {
                const rect = canvasElement.getBoundingClientRect();
                
                // Adjust for zoom and pan
                const dropX = (event.activatorEvent.clientX - rect.left - pan.x) / zoom;
                const dropY = (event.activatorEvent.clientY - rect.top - pan.y) / zoom;

                const newComponent: CanvasComponent = {
                    id: `${techId}-${Date.now()}`,
                    type: techId,
                    techId: techId,
                    position: {
                        x: dropX - 100, // Center the component on the cursor
                        y: dropY - 70
                    },
                    size: {
                        width: 200,
                        height: 140
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
    else if (active.data?.current?.type === 'canvas-component') {
      const component = active.data.current.component;
      if (delta) {
        updateComponent(component.id, {
          position: {
            x: component.position.x + delta.x / zoom,
            y: component.position.y + delta.y / zoom
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

  // Event handlers
  const handleGetStarted = () => {
    if (!user) {
      // If no user is logged in, show the get started modal with options
      setGetStartedModalOpen(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleContinueAsTemp = () => {
    // Generate a random name for temporary user
    const adjectives = ['Creative', 'Innovative', 'Dynamic', 'Brilliant', 'Curious', 'Adventurous', 'Bold', 'Clever', 'Energetic', 'Inspiring'];
    const nouns = ['Developer', 'Creator', 'Builder', 'Designer', 'Architect', 'Explorer', 'Innovator', 'Maker', 'Visionary', 'Pioneer'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomName = `${randomAdjective} ${randomNoun}`;

    // Create a temporary user
    const tempUser: User = {
      id: `temp_${Date.now()}`,
      name: randomName,
      email: '', // No email for temporary users
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=6366f1&color=fff`,
      isTemporary: true,
    };

    setUser(tempUser);
    setGetStartedModalOpen(false);
    navigate('/dashboard');
  };

  const handleGetStartedSignUp = () => {
    setGetStartedModalOpen(false);
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleBackToLanding = () => {
    setCurrentProject(null);
    setDashboardKey((prev) => prev + 1); // Force Dashboard re-render
    navigate('/dashboard');
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
        pan: { x: 0, y: 0 }, // Default pan position
      };

      const updatedProject: Project = {
        ...currentProject,
        canvasState,
        lastModified: new Date().toISOString(),
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
      const existingIndex = projects.findIndex((p) => p.id === updatedProject.id);
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
        const savedProject = verifyProjects.find(
          (p: Project) => p.id === updatedProject.id
        );
        if (savedProject && savedProject.canvasState) {
          console.log('Project saved successfully with canvas state');
          setToast({
            message: 'Project saved successfully!',
            type: 'success',
          });
        } else {
          console.error('Project save verification failed');
          setToast({
            message: 'Failed to save project',
            type: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setToast({
        message: 'Error saving project',
        type: 'error',
      });
    }
  };

  const handleCreateNewProject = (project: Project | null = null) => {
    let newProject;
    if (project) {
      newProject = project;
    } else {
      newProject = {
        id: Date.now(),
        name: 'New Project',
        description: 'A new project',
        lastModified: new Date().toISOString(),
        technologies: [],
        status: 'active',
      };
    }
    setCurrentProject(newProject);
    navigate(`/project/${newProject.id}`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentProject(null);
    navigate('/');
  };

  const handleAuthSuccess = (userObj: User) => {
    setUser(userObj);
    setAuthModalOpen(false);
    navigate('/dashboard');
  };
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
          navigate('/dashboard');
          
          // Show success toast
          setToast({
            message: `Project "${currentProject.name}" has been deleted successfully`,
            type: 'success'
          });
        }
      };

  return {
    user,
    authModalOpen,
    authModalMode,
    getStartedModalOpen,
    currentProject,
    toast,
    dashboardKey,
    components,
    connections,
    selectedComponent,
    draggedTech,
    dragOverlayContent,
    zoom,
    pan,
    setZoom,
    setPan,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleGetStarted,
    handleContinueAsTemp,
    handleGetStartedSignUp,
    handleBackToLanding,
    handleSaveProject,
    handleCreateNewProject,
    handleLogout,
    handleAuthSuccess,
    setToast,
    setGetStartedModalOpen,
    setAuthModalOpen,
    setSelectedComponent,
    addComponent,
    updateComponent,
    removeComponent,
    addConnection,
    removeConnection,
    setCurrentProject,
    handleDeleteCurrentProject
  };
};
