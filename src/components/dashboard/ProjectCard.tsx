import React from 'react';
import {
  Heart, Globe, Edit2, Trash2, Copy, ExternalLink, Github, Clock, Box, Users
} from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onOpenProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
  onOpenRepository?: (url: string) => void;
  onOpenDeployment?: (url: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'archived':  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'draft':     return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleFavorite,
  onOpenRepository,
  onOpenDeployment
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'path' || target.tagName === 'svg') return;
    onOpenProject(project);
  };

  if (viewMode === 'grid') {
    return (
      <div
        className={`group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-2xl hover:shadow-2xl hover:border-white/70 dark:hover:border-gray-600/70 transition-all duration-300 cursor-pointer p-8 hover:-translate-y-2 transform overflow-hidden ${
          project.isFavorite ? 'ring-2 ring-red-200/50 dark:ring-red-800/50' : ''
        } ${project.status === 'active' ? 'ring-2 ring-green-200/50 dark:ring-green-800/50' : ''}`}
        onClick={handleCardClick}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
        </div>

        {/* Header */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xl truncate">
                {project.name}
              </h4>
              {project.isFavorite && (
                <div className="animate-pulse">
                  <Heart className="w-5 h-5 text-red-500 fill-current drop-shadow-sm" />
                </div>
              )}
              {project.isPublic && (
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {project.version && (
                <span className="inline-flex items-center text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 px-3 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-700/50">
                  v{project.version}
                </span>
              )}
              <div className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold items-center space-x-2 shadow-sm ${getStatusColor(project.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span className="capitalize tracking-wide">{project.status}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(project); }}
              className={`p-2 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md ${
                project.isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
                  : 'text-gray-400 bg-white dark:bg-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
              }`}
              title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
              className="p-2 text-gray-400 bg-white dark:bg-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md"
              title="Edit project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }}
              className="p-2 text-gray-400 bg-white dark:bg-gray-700 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="relative mb-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 font-medium">
              {project.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                #{tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span key={index} className="inline-flex items-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full mr-2" />
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="inline-flex items-center bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
              +{project.technologies.length - 4} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="relative bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-700/80 dark:to-gray-700/80 rounded-xl p-4 mb-5 border border-gray-100/50 dark:border-gray-600/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {project.components !== undefined && (
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Box className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold">{project.components}</span>
                  <span className="text-gray-500 dark:text-gray-400">components</span>
                </div>
              )}
              {project.connections !== undefined && (
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-semibold">{project.connections}</span>
                  <span className="text-gray-500 dark:text-gray-400">connections</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="p-1 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <Clock className="w-3 h-3" />
              </div>
              <span className="font-medium text-xs">
                {new Date(project.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>

          {project.author && (
            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Created by <span className="text-gray-800 dark:text-gray-200 font-semibold">{project.author}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicateProject(project); }}
              className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Duplicate</span>
            </button>

            {project.repository && onOpenRepository && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenRepository(project.repository!); }}
                className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Code</span>
              </button>
            )}

            {project.deploymentUrl && onOpenDeployment && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenDeployment(project.deploymentUrl!); }}
                className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Live</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className={`group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-2xl hover:shadow-xl hover:border-white/70 dark:hover:border-gray-600/70 transition-all duration-300 cursor-pointer p-6 hover:bg-white/95 dark:hover:bg-gray-800/95 transform hover:scale-[1.02] overflow-hidden ${
        project.isFavorite ? 'ring-2 ring-red-200/50 dark:ring-red-800/50' : ''
      } ${project.status === 'active' ? 'ring-2 ring-green-200/50 dark:ring-green-800/50' : ''}`}
      onClick={handleCardClick}
    >
      <div className="relative flex items-start space-x-6 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg truncate">{project.name}</h4>
                {project.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                {project.isPublic && <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
                {project.version && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                    v{project.version}
                  </span>
                )}
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium items-center space-x-1 ${getStatusColor(project.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="capitalize">{project.status}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                {project.author && <span>by {project.author}</span>}
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(project); }}
                className={`p-1.5 rounded-md transition-colors ${
                  project.isFavorite ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                title="Edit project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1 mb-2">
            {project.tags && project.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs">
                {tag}
              </span>
            ))}
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-xs">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {project.components !== undefined && (
                <div className="flex items-center space-x-1">
                  <Box className="w-3 h-3" />
                  <span>{project.components} components</span>
                </div>
              )}
              {project.connections !== undefined && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{project.connections} connections</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicateProject(project); }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Duplicate</span>
              </button>

              {project.repository && onOpenRepository && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenRepository(project.repository!); }}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Github className="w-3 h-3" />
                  <span>Code</span>
                </button>
              )}

              {project.deploymentUrl && onOpenDeployment && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenDeployment(project.deploymentUrl!); }}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Live</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
