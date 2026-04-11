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
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'archived': return 'bg-gray-100 text-gray-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
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
    // Prevent navigation if clicking on action buttons or their icons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'path' || target.tagName === 'svg') {
      return;
    }
    onOpenProject(project);
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className={`group relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl hover:shadow-2xl hover:border-white/70 transition-all duration-300 cursor-pointer p-8 hover:-translate-y-2 transform overflow-hidden ${
          project.isFavorite ? 'ring-2 ring-red-200/50 border-red-200/50 shadow-red-100/20' : ''
        } ${project.status === 'active' ? 'ring-2 ring-green-200/50 border-green-200/50 shadow-green-100/20' : ''}`}
        onClick={handleCardClick}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        </div>
        
        {/* Header with title and primary actions */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-bold text-gray-900 text-xl truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {project.name}
              </h4>
              {project.isFavorite && (
                <div className="animate-pulse">
                  <Heart className="w-5 h-5 text-red-500 fill-current drop-shadow-sm" />
                </div>
              )}
              {project.isPublic && (
                <div className="p-1 bg-blue-100 rounded-full">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {project.version && (
                <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-gradient-to-r from-indigo-100 to-purple-100 px-3 py-1 rounded-full border border-indigo-200/50">
                  v{project.version}
                </span>
              )}
              <div className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold items-center space-x-2 shadow-sm ${getStatusColor(project.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                <span className="capitalize tracking-wide">{project.status}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(project);
              }}
              className={`p-2 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md ${
                project.isFavorite 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100 shadow-red-100' 
                  : 'text-gray-400 bg-white hover:text-red-500 hover:bg-red-50 hover:shadow-red-100'
              }`}
              title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditProject(project);
              }}
              className="p-2 text-gray-400 bg-white hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-blue-100"
              title="Edit project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(project);
              }}
              className="p-2 text-gray-400 bg-white hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-red-100"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="relative mb-4">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 font-medium">
              {project.description}
            </p>
            <div className="absolute bottom-0 right-0 w-8 h-4 bg-gradient-to-l from-white/90 to-transparent"></div>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200/50 shadow-sm">
                #{tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200/50 shadow-sm">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span key={index} className="inline-flex items-center bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full mr-2"></div>
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              +{project.technologies.length - 4} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="relative bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-xl p-4 mb-5 border border-gray-100/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {project.components !== undefined && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <Box className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="font-semibold">{project.components}</span>
                  <span className="text-gray-500">components</span>
                </div>
              )}
              {project.connections !== undefined && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <Users className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="font-semibold">{project.connections}</span>
                  <span className="text-gray-500">connections</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="p-1 bg-gray-100 rounded-lg">
                <Clock className="w-3 h-3" />
              </div>
              <span className="font-medium text-xs">
                {new Date(project.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Author */}
          {project.author && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <span className="text-xs text-gray-600 font-medium">
                Created by <span className="text-gray-800 font-semibold">{project.author}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateProject(project);
              }}
              className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Duplicate</span>
            </button>
            
            {project.repository && onOpenRepository && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRepository(project.repository!);
                }}
                className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:text-gray-900 hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Code</span>
              </button>
            )}
            
            {project.deploymentUrl && onOpenDeployment && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDeployment(project.deploymentUrl!);
                }}
                className="group flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:text-green-600 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
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
      className={`group relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl hover:shadow-xl hover:border-white/70 transition-all duration-300 cursor-pointer p-6 hover:bg-white/95 transform hover:scale-[1.02] overflow-hidden ${
        project.isFavorite ? 'ring-2 ring-red-200/50 border-red-200/50 shadow-red-100/20' : ''
      } ${project.status === 'active' ? 'ring-2 ring-green-200/50 border-green-200/50 shadow-green-100/20' : ''}`}
      onClick={handleCardClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
      </div>
      
      <div className="relative flex items-start space-x-6 w-full">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-bold text-gray-900 text-lg truncate">{project.name}</h4>
                {project.isFavorite && (
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                )}
                {project.isPublic && (
                  <Globe className="w-4 h-4 text-blue-500" />
                )}
                {project.version && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    v{project.version}
                  </span>
                )}
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium items-center space-x-1 ${getStatusColor(project.status)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span className="capitalize">{project.status}</span>
                </div>
              </div>
              
              {/* Author and date */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
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
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(project);
                }}
                className={`p-1.5 rounded-md transition-colors ${
                  project.isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${project.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Tags and Technologies */}
          <div className="flex flex-wrap items-center gap-1 mb-2">
            {project.tags && project.tags.length > 0 && (
              <>
                {project.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </>
            )}
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
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
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateProject(project);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Duplicate</span>
              </button>
              
              {project.repository && onOpenRepository && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRepository(project.repository!);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Github className="w-3 h-3" />
                  <span>Code</span>
                </button>
              )}
              
              {project.deploymentUrl && onOpenDeployment && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDeployment(project.deploymentUrl!);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
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