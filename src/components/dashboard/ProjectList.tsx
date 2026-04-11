import React from 'react';
import { Folder } from 'lucide-react';
import ProjectCard from './ProjectCard';
import type { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  currentFilter: string;
  onOpenProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onDuplicateProject: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
  onOpenRepository?: (url: string) => void;
  onOpenDeployment?: (url: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  viewMode,
  currentFilter,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onToggleFavorite,
  onOpenRepository,
  onOpenDeployment
}) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No {currentFilter} projects found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">Try selecting a different filter or create a new project.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto p-8 pt-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        : "space-y-3"
      }>
        {projects.map((project: Project) => (
          <ProjectCard
            key={project.id}
            project={project}
            viewMode={viewMode}
            onOpenProject={onOpenProject}
            onEditProject={onEditProject}
            onDeleteProject={onDeleteProject}
            onDuplicateProject={onDuplicateProject}
            onToggleFavorite={onToggleFavorite}
            onOpenRepository={onOpenRepository}
            onOpenDeployment={onOpenDeployment}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
