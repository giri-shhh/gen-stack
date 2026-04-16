import React, { useMemo } from 'react';
import {
  Trash2, Layout, Zap, Package, Link2, BarChart2,
  GitBranch, Box, Activity
} from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';
import TemplatesModal from './TemplatesModal';
import UserProfile from './dashboard/UserProfile';
import CompactOverview from './dashboard/CompactOverview';
import ViewModeToggle from './dashboard/ViewModeToggle';
import ProjectList from './dashboard/ProjectList';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardProps, Project } from '../types';

const getTimeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
};

const Dashboard: React.FC<DashboardProps> = ({ user, onCreateNewProject, onLogout }) => {
  const {
    recentProjects,
    currentFilter,
    viewMode,
    filteredAndSortedProjects,
    showCreateModal,
    showDeleteModal,
    projectToDelete,
    showEditModal,
    projectToEdit,
    showTemplatesModal,
    setCurrentFilter,
    setViewMode,
    setSearchQuery,
    setShowCreateModal,
    setShowTemplatesModal,
    setProjectToEdit,
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

  const handleUseTemplate = async (project: Project) => {
    await handleCreateProject(project);
    onCreateNewProject(project);
  };

  const stats = useMemo(() => {
    return recentProjects.reduce(
      (acc, p) => {
        if (p.status === 'active') acc.active++;
        if (p.status === 'completed') acc.completed++;
        if (p.isFavorite) acc.favorites++;
        acc.totalComponents += p.components || 0;
        acc.totalConnections += p.connections || 0;
        return acc;
      },
      { total: recentProjects.length, active: 0, completed: 0, favorites: 0, totalComponents: 0, totalConnections: 0 }
    );
  }, [recentProjects]);

  const recentActivity = useMemo(
    () =>
      [...recentProjects]
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 6),
    [recentProjects]
  );

  const { topTechs, maxTechCount } = useMemo(() => {
    const usage = recentProjects
      .flatMap(p => p.technologies)
      .reduce((acc, tech) => {
        acc[tech] = (acc[tech] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const top = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { topTechs: top, maxTechCount: top[0]?.[1] ?? 1 };
  }, [recentProjects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 space-y-4 lg:space-y-5">

        {/* Header */}
        <div className="relative backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-lg sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6 z-10">
          <UserProfile
            user={user}
            onLogout={onLogout}
            onSearch={setSearchQuery}
            searchPlaceholder="Search projects, technologies, tags..."
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-4 flex items-center space-x-3 hover:shadow-md transition-shadow duration-200 cursor-default">
            <div className="p-2.5 bg-blue-100 rounded-xl flex-shrink-0">
              <Layout className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Total Projects</p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-4 flex items-center space-x-3 hover:shadow-md transition-shadow duration-200 cursor-default">
            <div className="p-2.5 bg-green-100 rounded-xl flex-shrink-0">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.active}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Active Projects</p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-4 flex items-center space-x-3 hover:shadow-md transition-shadow duration-200 cursor-default">
            <div className="p-2.5 bg-purple-100 rounded-xl flex-shrink-0">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.totalComponents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Components Built</p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-4 flex items-center space-x-3 hover:shadow-md transition-shadow duration-200 cursor-default">
            <div className="p-2.5 bg-orange-100 rounded-xl flex-shrink-0">
              <Link2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.totalConnections}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Total Connections</p>
            </div>
          </div>
        </div>

        {/* Main content: Projects + Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5 items-start">

          {/* Projects section — takes 2/3 on xl */}
          <div className="xl:col-span-2 space-y-4">
            <CompactOverview
              projects={recentProjects}
              currentFilter={currentFilter}
              onFilterChange={setCurrentFilter}
              onCreateProject={() => setShowCreateModal(true)}
              onImportProject={handleImportProject}
              onBrowseTemplates={handleBrowseTemplates}
            />

            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md border border-white/20 dark:border-gray-700/20 overflow-hidden">
              <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
                      {currentFilter !== 'all' && (
                        <span className="ml-1 text-blue-600 dark:text-blue-400">• filtered by {currentFilter}</span>
                      )}
                    </p>
                  </div>
                  <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>

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
          </div>

          {/* Sidebar — takes 1/3 on xl */}
          <div className="space-y-4">

            {/* Recent Activity */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((project, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 group cursor-pointer"
                      onClick={() => handleOpenProject(project)}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        project.status === 'active' ? 'bg-green-500' :
                        project.status === 'completed' ? 'bg-blue-500' :
                        project.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{getTimeAgo(project.lastModified)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        project.status === 'active' ? 'bg-green-100 text-green-700' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* Tech Stack Usage */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-violet-500" />
                <span>Tech Stack Usage</span>
              </h3>
              {topTechs.length > 0 ? (
                <div className="space-y-2.5">
                  {topTechs.map(([tech, count]) => (
                    <div key={tech}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{tech}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{count} {count === 1 ? 'project' : 'projects'}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxTechCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No technology data yet</p>
              )}
            </div>

            {/* Build Info */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-5 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <GitBranch className="w-4 h-4 opacity-80" />
                <h3 className="text-sm font-semibold">Drag & Drop Builder</h3>
              </div>
              <p className="text-xs opacity-80 leading-relaxed mb-3">
                Open any project to visually connect frontend, backend, database, and cloud services on the canvas.
              </p>
              <div className="flex items-center space-x-4 text-xs opacity-75">
                <div className="flex items-center space-x-1">
                  <Box className="w-3 h-3" />
                  <span>{stats.totalComponents} components</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Link2 className="w-3 h-3" />
                  <span>{stats.totalConnections} links</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCreateProject={handleCreateProject}
      />

      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onUseTemplate={handleUseTemplate}
      />

      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Project</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{projectToDelete.name}"</span>?
              This will permanently remove the project and all its data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {showEditModal && projectToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Project</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (projectToEdit) handleSaveEditedProject(projectToEdit);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={projectToEdit.name}
                  onChange={e => setProjectToEdit({ ...projectToEdit, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={projectToEdit.description || ''}
                  onChange={e => setProjectToEdit({ ...projectToEdit, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={projectToEdit.repository || ''}
                  onChange={e => setProjectToEdit({ ...projectToEdit, repository: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live Application URL</label>
                <input
                  type="url"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={projectToEdit.deploymentUrl || ''}
                  onChange={e => setProjectToEdit({ ...projectToEdit, deploymentUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={projectToEdit.version || ''}
                  onChange={e => setProjectToEdit({ ...projectToEdit, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
