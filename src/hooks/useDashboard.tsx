import { useState, useEffect, useMemo } from 'react';
import type { Project } from '../types';

export const useDashboard = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardKey, setDashboardKey] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Project | null>(null);

  // Sample projects data
  const getSampleProjects = (): Project[] => [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'A comprehensive e-commerce solution with user authentication, product management, shopping cart, payment integration, and order tracking.',
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'John Doe',
      version: '2.1.0',
      deploymentUrl: 'https://mystore.example.com',
      repository: 'https://github.com/johndoe/ecommerce-platform',
      components: 25,
      connections: 12,
      isPublic: true,
      isFavorite: true,
      tags: ['ecommerce', 'fullstack', 'production']
    },
    {
      id: 2,
      name: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, team collaboration, file attachments, and progress tracking.',
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      technologies: ['Vue.js', 'Express', 'PostgreSQL', 'Socket.io'],
      status: 'completed',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Jane Smith',
      version: '1.5.2',
      deploymentUrl: 'https://taskmanager.example.com',
      repository: 'https://github.com/janesmith/task-manager',
      components: 18,
      connections: 8,
      isPublic: false,
      isFavorite: false,
      tags: ['productivity', 'collaboration', 'realtime']
    }
  ];

  // Load projects on component mount
  useEffect(() => {
    // Always use the new sample projects (2 projects instead of 6)
    const sampleProjects = getSampleProjects();
    setRecentProjects(sampleProjects);
    localStorage.setItem('recentProjects', JSON.stringify(sampleProjects));
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (recentProjects.length > 0) {
      localStorage.setItem('recentProjects', JSON.stringify(recentProjects));
    }
  }, [recentProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = recentProjects;

    // Apply status filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(project => project.status === currentFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query)) ||
        project.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by lastModified (newest first)
    return filtered.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  }, [recentProjects, currentFilter, searchQuery]);

  // Project action handlers
  const handleCreateProject = async (project: Project) => {
    const newProject: Project = {
      ...project,
      id: project.id || Date.now(),
      lastModified: new Date().toISOString(),
    };
    setRecentProjects(prev => [newProject, ...prev]);
    setDashboardKey(prev => prev + 1);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setRecentProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
      setDashboardKey(prev => prev + 1);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  const handleSaveEditedProject = (updatedProject: Project) => {
    setRecentProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? {
        ...updatedProject,
        lastModified: new Date().toISOString()
      } : p)
    );
    setShowEditModal(false);
    setProjectToEdit(null);
    setDashboardKey(prev => prev + 1);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProjectToEdit(null);
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Copy)`,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
    setRecentProjects(prev => [duplicatedProject, ...prev]);
    setDashboardKey(prev => prev + 1);
    alert(`Project "${project.name}" has been duplicated successfully!`);
  };

  const handleToggleFavorite = (project: Project) => {
    setRecentProjects(prev => 
      prev.map(p => p.id === project.id ? { ...p, isFavorite: !p.isFavorite } : p)
    );
  };

  const handleOpenRepository = (url: string) => {
    window.open(url, '_blank');
  };

  const handleOpenDeployment = (url: string) => {
    window.open(url, '_blank');
  };

  const handleImportProject = () => {
    alert('Import functionality coming soon!');
  };

  const handleBrowseTemplates = () => {
    setShowTemplatesModal(true);
  };

  return {
    // State
    recentProjects,
    currentFilter,
    viewMode,
    searchQuery,
    dashboardKey,
    filteredAndSortedProjects,
    
    // Modal states
    showCreateModal,
    showDeleteModal,
    projectToDelete,
    showEditModal,
    projectToEdit,
    showTemplatesModal,
    selectedTemplate,
    
    // Setters
    setCurrentFilter,
    setViewMode,
    setSearchQuery,
    setShowCreateModal,
    setProjectToEdit,
    setSelectedTemplate,
    setShowTemplatesModal,
    
    // Handlers
    handleCreateProject,
    handleDeleteProject,
    confirmDeleteProject,
    cancelDelete,
    handleEditProject,
    handleSaveEditedProject,
    handleCloseEditModal,
    handleDuplicateProject,
    handleToggleFavorite,
    handleOpenRepository,
    handleOpenDeployment,
    handleImportProject,
    handleBrowseTemplates,
  };
};