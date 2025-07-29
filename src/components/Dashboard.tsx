import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Folder, Clock, Users, Sparkles, Settings, LogOut, ArrowRight, Calendar, Star, Trash2, Edit2,
  Search, Bell, Download, Share2, Grid, List, Filter, TrendingUp, Activity, Zap, Target, Award
} from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import type { DashboardProps, Project } from '../types';

const Dashboard: React.FC<DashboardProps> = ({ user, onCreateNewProject, onLogout }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Edit project modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Templates modal state
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Project | null>(null);
  
  // New state for enhanced features
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Example templates (could be moved to a separate file)
  const templates: Project[] = [
    {
      id: 'template-1',
      name: 'Blog Platform',
      description: 'A simple blog platform with authentication and CRUD features.',
      lastModified: new Date().toISOString(),
      technologies: ['React', 'Node.js', 'MongoDB'],
      status: 'draft'
    },
    {
      id: 'template-2',
      name: 'Chat App',
      description: 'A real-time chat application with WebSocket support.',
      lastModified: new Date().toISOString(),
      technologies: ['React', 'Express', 'Socket.io'],
      status: 'draft'
    },
    {
      id: 'template-3',
      name: 'Portfolio Website',
      description: 'A personal portfolio site to showcase projects and skills.',
      lastModified: new Date().toISOString(),
      technologies: ['React', 'TailwindCSS'],
      status: 'draft'
    }
  ];

  // Handler to open edit modal
  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  // Handler to save edited project
  const handleSaveEditedProject = (updatedProject: Project) => {
    const updatedProjects = recentProjects.map((p) =>
      p.id === updatedProject.id ? updatedProject : p
    );
    setRecentProjects(updatedProjects);
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    setShowEditModal(false);
    setProjectToEdit(null);
  };

  // Handler to close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProjectToEdit(null);
  };

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

  // Enhanced filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = recentProjects;
    
    // Apply status filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(project => project.status === currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [recentProjects, currentFilter, searchQuery, sortBy]);

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
            
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAnalytics(true)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Analytics"
              >
                <TrendingUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
              </button>
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

        {/* Enhanced Quick Stats */}
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
                  Showing {currentFilter} projects ({filteredAndSortedProjects.length})
                </span>
              )}
            </div>
            
            {/* Enhanced Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'status')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
              </select>
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredAndSortedProjects.map((project: Project) => (
              <div 
                key={project.id} 
                className={`border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center space-x-4'
                }`}
                onClick={() => {
                  // Prevent navigation if edit modal is open
                  if (!showEditModal) {
                    handleOpenProject(project);
                  }
                }}
              >
                {viewMode === 'grid' ? (
                  <>
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
                      {project.technologies.slice(0, 3).map((tech: string, index: number) => (
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
                            handleOpenProject(project);
                          }}
                        >
                          Open
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          title="Manage project"
                        >
                          <Edit2 className="w-3 h-3" />
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
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="capitalize">{project.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Modified {new Date(project.lastModified).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {project.technologies.slice(0, 2).map((tech: string, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 2 && (
                            <span className="text-gray-500 text-xs">+{project.technologies.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProject(project);
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        title="Manage project"
                      >
                        <Edit2 className="w-3 h-3" />
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
                  </>
                )}
      {/* Edit Project Modal */}
      {showEditModal && projectToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (projectToEdit) {
                  // Save changes to localStorage and state
                  handleSaveEditedProject(projectToEdit);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={projectToEdit.name}
                  onChange={e => setProjectToEdit({ ...projectToEdit, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={projectToEdit.description}
                  onChange={e => setProjectToEdit({ ...projectToEdit, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
              </div>
            ))}
          </div>

          {/* Show message when no projects match filter */}
          {filteredAndSortedProjects.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {currentFilter} projects found</h3>
              <p className="text-gray-500">Try selecting a different filter or create a new project.</p>
            </div>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left group">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Import Project</p>
                <p className="text-sm text-gray-500">Load existing architecture</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left group">
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Share Project</p>
                <p className="text-sm text-gray-500">Collaborate with team</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left group">
              <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export Code</p>
                <p className="text-sm text-gray-500">Download project files</p>
              </div>
            </button>
            
            <button
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left group"
              onClick={() => setShowTemplatesModal(true)}
            >
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Templates</p>
                <p className="text-sm text-gray-500">Browse project templates</p>
              </div>
            </button>
      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Templates</h3>
            <div className="grid grid-cols-1 gap-4 mb-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{template.name}</span>
                    {selectedTemplate?.id === template.id && (
                      <span className="text-xs text-blue-600 font-medium">Selected</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTemplatesModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedTemplate}
                onClick={() => {
                  if (selectedTemplate) {
                    // Create a new project from the template
                    const newProject = {
                      ...selectedTemplate,
                      id: Date.now(),
                      lastModified: new Date().toISOString(),
                      status: 'active' as const,
                    };
                    setShowTemplatesModal(false);
                    setSelectedTemplate(null);
                    handleCreateProject(newProject);
                  }
                }}
                className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${!selectedTemplate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Project Analytics</h3>
            <button 
              onClick={() => setShowAnalytics(true)}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{quickStats.activeProjects}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Active Projects</h4>
              <p className="text-sm text-gray-600">Currently in development</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-600">{quickStats.completedProjects}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Completed</h4>
              <p className="text-sm text-gray-600">Successfully finished</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{quickStats.totalTechnologies}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Technologies</h4>
              <p className="text-sm text-gray-600">Total tech stack used</p>
            </div>
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

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 p-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New template available</p>
                  <p className="text-xs text-gray-600">React + Node.js starter template is now available</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="bg-green-500 p-1 rounded-full">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Project completed</p>
                  <p className="text-xs text-gray-600">Your E-commerce Platform is ready for deployment</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="bg-yellow-500 p-1 rounded-full">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">System update</p>
                  <p className="text-xs text-gray-600">New features and improvements available</p>
                  <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Project Analytics</h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Project Status Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="font-medium">{quickStats.activeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium">{quickStats.completedProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Draft</span>
                    <span className="font-medium">{recentProjects.filter(p => p.status === 'draft').length}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Technology Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Technologies</span>
                    <span className="font-medium">{quickStats.totalTechnologies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average per Project</span>
                    <span className="font-medium">
                      {recentProjects.length > 0 ? Math.round(quickStats.totalTechnologies / recentProjects.length) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {recentProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-600">Modified {new Date(project.lastModified).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 