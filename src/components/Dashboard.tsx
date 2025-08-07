import React from 'react';
import { Trash2 } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import UserProfile from './dashboard/UserProfile';
import CompactOverview from './dashboard/CompactOverview';
import ViewModeToggle from './dashboard/ViewModeToggle';
import ProjectList from './dashboard/ProjectList';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardProps, Project } from '../types';

const Dashboard: React.FC<DashboardProps> = ({ user, onCreateNewProject, onLogout }) => {
  const {
    // State
    recentProjects,
    currentFilter,
    viewMode,
    searchQuery,
    filteredAndSortedProjects,
    
    // Modal states
    showCreateModal,
    showDeleteModal,
    projectToDelete,
    showEditModal,
    projectToEdit,
    
    // Setters
    setCurrentFilter,
    setViewMode,
    setSearchQuery,
    setShowCreateModal,
    setProjectToEdit,
    
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
  } = useDashboard();

  const handleOpenProject = (project: Project) => {
      onCreateNewProject(project);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* User Profile Section */}
        <div className="relative backdrop-blur-sm bg-white/70 rounded-2xl shadow-lg border border-white/20 p-6 z-10">
          <UserProfile 
          user={user} 
          onLogout={onLogout} 
          onSearch={setSearchQuery}
          searchPlaceholder="Search projects, technologies, tags..."
        />
        </div>

        {/* Compact Overview */}
        <CompactOverview
          projects={recentProjects}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          onCreateProject={() => setShowCreateModal(true)}
          onImportProject={handleImportProject}
          onBrowseTemplates={handleBrowseTemplates}
        />

        {/* Recent Projects Section */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden z-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <ViewModeToggle 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
          
          {/* Projects List */}
          <ProjectList
            projects={filteredAndSortedProjects}
            viewMode={viewMode}
            currentFilter={currentFilter}
            onOpenProject={handleOpenProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onToggleFavorite={handleToggleFavorite}
            onOpenRepository={handleOpenRepository}
            onOpenDeployment={handleOpenDeployment}
          />
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

      {/* Edit Project Modal */}
      {showEditModal && projectToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (projectToEdit) {
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
                  value={projectToEdit.description || ''}
                  onChange={e => setProjectToEdit({ ...projectToEdit, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={projectToEdit.status}
                  onChange={e => setProjectToEdit({ ...projectToEdit, status: e.target.value as Project['status'] })}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
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
  );
};

export default Dashboard; 