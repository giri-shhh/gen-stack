import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Folder, Clock, Users, Sparkles, Settings, LogOut, ArrowRight, Calendar, Star, Trash2 } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import type { DashboardProps, Project } from '../types';

const Dashboard: React.FC<DashboardProps> = ({ user, onCreateNewProject, onLogout }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Migration function to convert old component structure to new format
  const migrateComponentStructure = (component: any): any => {
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

  // Migration function to migrate project canvas state
  const migrateProjectCanvasState = (project: any): any => {
    if (project.canvasState && project.canvasState.components) {
      return {
        ...project,
        canvasState: {
          ...project.canvasState,
          components: project.canvasState.components.map(migrateComponentStructure),
          connections: project.canvasState.connections.map(migrateConnectionStructure)
        }
      };
    }
    return project;
  };

  // Load projects from localStorage on component mount
  useEffect(() => {
    console.log('Dashboard: Loading projects from localStorage...'); // Debug log
    const savedProjects = localStorage.getItem('userProjects');
    console.log('Dashboard: Raw localStorage data:', savedProjects); // Debug log
    
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        console.log('Dashboard: Parsed projects:', projects); // Debug log
        
        // Migrate projects to new structure
        const migratedProjects = projects.map(migrateProjectCanvasState);
        
        if (Array.isArray(migratedProjects) && migratedProjects.length > 0) {
          setRecentProjects(migratedProjects);
          // Save migrated projects back to localStorage
          localStorage.setItem('userProjects', JSON.stringify(migratedProjects));
        } else {
          console.log('Dashboard: No valid projects found, initializing with default projects');
          const defaultProjects = getSampleProjects();
          setRecentProjects(defaultProjects);
          localStorage.setItem('userProjects', JSON.stringify(defaultProjects));
        }
      } catch (error) {
        console.error('Dashboard: Error loading projects:', error);
        console.log('Dashboard: Using default projects due to error');
        const defaultProjects = getSampleProjects();
        setRecentProjects(defaultProjects);
        localStorage.setItem('userProjects', JSON.stringify(defaultProjects));
      }
    } else {
      console.log('Dashboard: No saved projects found, initializing with default projects');
      const defaultProjects = getSampleProjects();
      setRecentProjects(defaultProjects);
      localStorage.setItem('userProjects', JSON.stringify(defaultProjects));
    }
  }, []);

  // Helper function to get sample projects
  const getSampleProjects = (): Project[] => [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Fullstack e-commerce application with React and Node.js',
      lastModified: '2024-01-15',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      status: 'active' as const
    },
    {
      id: 2,
      name: 'Task Management App',
      description: 'Collaborative task management with real-time updates',
      lastModified: '2024-01-10',
      technologies: ['Vue.js', 'Express', 'MongoDB'],
      status: 'completed' as const
    }
  ];

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    // Only save if we have projects and they're different from what's in localStorage
    if (recentProjects.length > 0) {
      const savedProjects = localStorage.getItem('userProjects');
      let shouldSave = true;
      
      if (savedProjects) {
        try {
          const existingProjects = JSON.parse(savedProjects);
          // Only save if the projects are actually different
          if (JSON.stringify(existingProjects) === JSON.stringify(recentProjects)) {
            shouldSave = false;
          }
        } catch (error) {
          console.error('Dashboard: Error comparing projects:', error);
        }
      }
      
      if (shouldSave) {
        console.log('Dashboard: Saving projects to localStorage:', recentProjects); // Debug log
        localStorage.setItem('userProjects', JSON.stringify(recentProjects));
        console.log('Dashboard: Projects saved to localStorage successfully'); // Debug log
      }
    }
  }, [recentProjects]);

  // Manual refresh function for projects - always use localStorage as source of truth
  const refreshProjects = () => {
    console.log('Dashboard: Refreshing projects from localStorage...'); // Debug log
    const savedProjects = localStorage.getItem('userProjects');
    
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        console.log('Dashboard: Refreshing projects from localStorage:', projects); // Debug log
        setRecentProjects(projects);
      } catch (error) {
        console.error('Dashboard: Error loading projects from localStorage:', error);
        // If there's an error, initialize with default projects
        const defaultProjects = getSampleProjects();
        setRecentProjects(defaultProjects);
        localStorage.setItem('userProjects', JSON.stringify(defaultProjects));
      }
    } else {
      console.log('Dashboard: No projects in localStorage, initializing with defaults');
      const defaultProjects = getSampleProjects();
      setRecentProjects(defaultProjects);
      localStorage.setItem('userProjects', JSON.stringify(defaultProjects));
    }
  };

  // Add debug function to window
  useEffect(() => {
    window.debugDashboardProjects = () => {
      console.log('=== Dashboard Debug Info ===');
      console.log('Dashboard local state projects:', recentProjects);
      console.log('Number of projects in local state:', recentProjects.length);
      
      const savedProjects = localStorage.getItem('userProjects');
      console.log('Raw localStorage data:', savedProjects);
      
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects);
          console.log('Parsed localStorage projects:', projects);
          console.log('Number of projects in localStorage:', projects.length);
          
          // Check if local state matches localStorage
          const stateMatchesStorage = JSON.stringify(recentProjects) === JSON.stringify(projects);
          console.log('Local state matches localStorage:', stateMatchesStorage);
          
          if (!stateMatchesStorage) {
            console.warn('WARNING: Local state does not match localStorage!');
            console.log('Local state:', recentProjects);
            console.log('localStorage:', projects);
          }
        } catch (error) {
          console.error('Error parsing localStorage projects:', error);
        }
      } else {
        console.log('No projects found in localStorage');
      }
      console.log('===========================');
    };
    
    window.forceRefreshFromLocalStorage = () => {
      console.log('Dashboard: Force refreshing from localStorage...');
      refreshProjects();
    };
    
    window.clearLocalStorageAndReset = () => {
      console.log('Dashboard: Clearing localStorage and resetting to defaults...');
      localStorage.removeItem('userProjects');
      const defaultProjects = getSampleProjects();
      setRecentProjects(defaultProjects);
      localStorage.setItem('userProjects', JSON.stringify(defaultProjects));
      console.log('Dashboard: Reset complete');
    };
    
          return () => {
        (window as any).debugDashboardProjects = undefined;
        (window as any).forceRefreshFromLocalStorage = undefined;
        (window as any).clearLocalStorageAndReset = undefined;
      };
  }, [recentProjects]); // Update debug function when projects change

  // Calculate quick stats dynamically from projects
  const quickStats = useMemo(() => {
    const totalProjects = recentProjects.length;
    const activeProjects = recentProjects.filter(p => p.status === 'active').length;
    const completedProjects = recentProjects.filter(p => p.status === 'completed').length;
    const totalTechnologies = recentProjects.reduce((total, project) => {
      return total + (project.technologies ? project.technologies.length : 0);
    }, 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTechnologies
    };
  }, [recentProjects]);

  // Filter projects based on current selection
  const filteredProjects = useMemo(() => {
    if (currentFilter === 'all') {
      return recentProjects;
    }
    return recentProjects.filter(project => project.status === currentFilter);
  }, [recentProjects, currentFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'completed': return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'draft': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getFilterButtonStyle = (filter: string) => {
    return currentFilter === filter 
      ? 'bg-blue-200 text-white shadow-lg' 
      : 'bg-white text-gray-700 hover:bg-gray-50';
  };

  const handleCreateNewProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateProject = async (newProject: Project) => {
    console.log('Dashboard: Creating new project:', newProject); // Debug log
    
    // Always get the current state from localStorage first
    const savedProjects = localStorage.getItem('userProjects');
    let projects = [];
    
    if (savedProjects) {
      try {
        projects = JSON.parse(savedProjects);
        console.log('Dashboard: Existing projects from localStorage:', projects); // Debug log
      } catch (error) {
        console.error('Dashboard: Error parsing saved projects:', error);
        projects = getSampleProjects(); // Fallback to default projects
      }
    } else {
      console.log('Dashboard: No projects in localStorage, using default projects');
      projects = getSampleProjects();
    }
    
    // Add the new project to the beginning
    projects.unshift(newProject);
    
    // Save to localStorage first
    localStorage.setItem('userProjects', JSON.stringify(projects));
    console.log('Dashboard: Saved to localStorage:', projects); // Debug log
    
    // Then update the local state to match localStorage
    setRecentProjects(projects);
    
    // Verify the save was successful
    const verifySave = localStorage.getItem('userProjects');
    if (verifySave) {
      const verifiedProjects = JSON.parse(verifySave);
      console.log('Dashboard: Verified save - projects in localStorage:', verifiedProjects);
    } else {
      console.error('Dashboard: Save verification failed - localStorage is empty');
    }
    
    // Call the parent function to navigate to the canvas with the new project
    if (onCreateNewProject) {
      console.log('Dashboard: Navigating to canvas with project:', newProject);
      onCreateNewProject(newProject);
    }
  };

  const handleOpenProject = (project: Project) => {
    // Call the parent function to navigate to the canvas with the existing project
    if (onCreateNewProject) {
      onCreateNewProject(project);
    }
  };

  // const updateProjectInList = (updatedProject: Project) => {
  //   // Get current projects from localStorage
  //   const savedProjects = localStorage.getItem('userProjects');
  //   let projects = [];
    
  //   if (savedProjects) {
  //     try {
  //       projects = JSON.parse(savedProjects);
  //     } catch (error) {
  //       console.error('Dashboard: Error parsing projects for update:', error);
  //       return;
  //     }
  //   }
    
  //   // Update the project
  //   const updatedProjects = projects.map((project: Project) => 
  //     project.id === updatedProject.id ? updatedProject : project
  //   );
    
  //   // Save to localStorage first
  //   localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    
  //   // Then update local state
  //   setRecentProjects(updatedProjects);
    
  //   console.log('Dashboard: Updated project in list:', updatedProject);
  // };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  // Handle delete project
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Confirm delete project
  const confirmDeleteProject = () => {
    if (projectToDelete) {
      // Remove project from localStorage
      const updatedProjects = recentProjects.filter(p => p.id !== projectToDelete.id);
      setRecentProjects(updatedProjects);
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Fullstack App Generator</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.avatar} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Create New Project Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-gray-600">
              Ready to build your next amazing fullstack application?
            </p>
          </div>
          <button
            onClick={handleCreateNewProject}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Quick Stats - Clickable for filtering */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setCurrentFilter('all')}
            className={`rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md ${getFilterButtonStyle('all')}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalProjects}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentFilter('active')}
            className={`rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md ${getFilterButtonStyle('active')}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.activeProjects}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentFilter('completed')}
            className={`rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md ${getFilterButtonStyle('completed')}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.completedProjects}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </button>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Technologies</p>
                <p className="text-2xl font-bold text-gray-900">{quickStats.totalTechnologies}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects - 2 Rows */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-xl font-bold text-gray-900">Recent Projects</h3>
              {currentFilter !== 'all' && (
                <span className="text-sm text-gray-500">
                  Showing {currentFilter} projects ({filteredProjects.length})
                </span>
              )}
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to canvas with this project
                  handleOpenProject(project);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="capitalize">{project.status}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Modified {new Date(project.lastModified).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to canvas with this project
                        handleOpenProject(project);
                      }}
                    >
                      Open
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project);
                      }}
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show message when no projects match filter */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {currentFilter} projects found</h3>
              <p className="text-gray-500">Try selecting a different filter or create a new project.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Import Project</p>
                <p className="text-sm text-gray-500">Load existing architecture</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Share Project</p>
                <p className="text-sm text-gray-500">Collaborate with team</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Templates</p>
                <p className="text-sm text-gray-500">Browse project templates</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCreateProject={handleCreateProject}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{projectToDelete.name}"</span>? 
              This will permanently remove the project and all its data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 