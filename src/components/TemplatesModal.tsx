import React, { useState, useMemo } from 'react';
import {
  X, ArrowLeft, Layers, Cpu, CheckCircle2, Tag,
  ChevronRight, Star, Zap, Clock, LayoutTemplate,
} from 'lucide-react';
import type { Project } from '../types';
import { templates, templateCategories, type Template } from '../data/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (project: Project) => void;
}

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', classes: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  intermediate: { label: 'Intermediate', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  advanced: { label: 'Advanced', classes: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

// ─── Architecture tier preview ────────────────────────────────────────────────
const ArchitecturePreview: React.FC<{ template: Template }> = ({ template }) => (
  <div className="space-y-2">
    {template.architectureTiers.map((tier, idx) => (
      <div key={tier.name}>
        <div className={`rounded-lg border p-3 ${tier.bgClass} ${tier.borderClass}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${tier.colorClass}`}>
            {tier.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tier.components.map(comp => (
              <span
                key={comp.techId}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${tier.bgClass} ${tier.borderClass} ${tier.colorClass}`}
              >
                {comp.name}
              </span>
            ))}
          </div>
        </div>
        {idx < template.architectureTiers.length - 1 && (
          <div className="flex justify-center my-0.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 rotate-90" />
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── Template card ────────────────────────────────────────────────────────────
const TemplateCard: React.FC<{
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ template, isSelected, onSelect }) => {
  const diff = DIFFICULTY_CONFIG[template.difficulty];
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 group ${
        isSelected
          ? 'border-red-500 shadow-lg shadow-red-500/10 bg-red-50/50 dark:bg-red-900/10'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md'
      }`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.classes}`}>
              {diff.label}
            </span>
          </div>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
        {template.name}
      </h3>

      {/* Category badge */}
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <Tag className="w-3 h-3" />
        {template.category}
      </span>

      {/* Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {template.componentCount} components
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          {template.connectionCount} connections
        </span>
      </div>

      {/* Tech preview */}
      <div className="mt-3 flex flex-wrap gap-1">
        {template.technologies.slice(0, 5).map(tech => (
          <span
            key={tech}
            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {tech}
          </span>
        ))}
        {template.technologies.length > 5 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400">
            +{template.technologies.length - 5} more
          </span>
        )}
      </div>
    </button>
  );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const TemplateDetail: React.FC<{
  template: Template;
  onUseTemplate: (name: string) => void;
  onBack: () => void;
}> = ({ template, onUseTemplate, onBack }) => {
  const [projectName, setProjectName] = useState(`My ${template.name.split(' ').slice(0, 3).join(' ')}`);
  const diff = DIFFICULTY_CONFIG[template.difficulty];

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className={`bg-gradient-to-r ${template.gradientClasses} p-5 text-white rounded-t-xl flex-shrink-0`}>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/70 hover:text-white text-xs mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to templates
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{template.icon}</span>
          <div>
            <h2 className="text-lg font-bold leading-tight">{template.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                {diff.label}
              </span>
              <span className="text-xs text-white/70">{template.category}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">{template.description}</p>
      </div>

      {/* Scrollable detail body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">

        {/* Architecture preview */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Architecture Overview
          </h3>
          <ArchitecturePreview template={template} />
        </div>

        {/* Key features */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />
            Key Features
          </h3>
          <ul className="space-y-2">
            {template.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {template.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{template.componentCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Components</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{template.connectionCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Connections</p>
          </div>
        </div>
      </div>

      {/* Create form — pinned to bottom */}
      <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Project name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 mb-3"
          placeholder="Enter project name..."
        />
        <button
          onClick={() => onUseTemplate(projectName.trim() || template.name)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Zap className="w-4 h-4" />
          Create from Template
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          Opens in editor with architecture pre-loaded
        </p>
      </div>
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────
const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, onUseTemplate }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return templates;
    return templates.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowDetail(true);
  };

  const handleBack = () => {
    setShowDetail(false);
    setSelectedTemplate(null);
  };

  const handleUseTemplate = (projectName: string) => {
    if (!selectedTemplate) return;

    const now = new Date().toISOString();
    const project: Project = {
      id: Date.now(),
      name: projectName,
      description: selectedTemplate.longDescription,
      lastModified: now,
      createdAt: now,
      technologies: selectedTemplate.technologies,
      status: 'active',
      version: '1.0.0',
      components: selectedTemplate.componentCount,
      connections: selectedTemplate.connectionCount,
      tags: selectedTemplate.tags,
      isFavorite: false,
      isPublic: false,
      canvasState: selectedTemplate.canvasState,
    };

    onUseTemplate(project);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Template Gallery</h1>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              {templates.length} template{templates.length !== 1 ? 's' : ''} available
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: two-panel layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left panel — template list */}
          <div className="w-[45%] flex flex-col border-r border-gray-100 dark:border-gray-700 min-h-0">
            {/* Category tabs */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-1.5 flex-wrap">
                {templateCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      activeCategory === cat
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => handleSelectTemplate(template)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Coming soon</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Templates for this category are in the works
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel — detail or empty state */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {showDetail && selectedTemplate ? (
              <TemplateDetail
                template={selectedTemplate}
                onUseTemplate={handleUseTemplate}
                onBack={handleBack}
              />
            ) : (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Select a template
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  Choose a template from the left to preview its architecture, features, and tech stack — then create a project in one click.
                </p>
                {templates.length > 0 && (
                  <button
                    onClick={() => handleSelectTemplate(templates[0])}
                    className="mt-5 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all"
                  >
                    <span>{templates[0].icon}</span>
                    Try Netflix Template
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
