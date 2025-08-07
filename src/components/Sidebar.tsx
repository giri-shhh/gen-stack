import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { techCategories } from '../data/techStack';
import { Search, X, Filter, Command, Clock, Edit3, Eye, Calendar, User, Tag, Activity, Layers, Settings, ChevronDown } from 'lucide-react';
import type { DraggableTechItemProps, QuickFiltersProps, SearchHistoryProps, SearchPanelProps, Project } from '../types';

interface SidebarProps {
  currentProject?: Project;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

const DraggableTechItem: React.FC<DraggableTechItemProps> = ({ tech, searchQuery }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tech-${tech.id}`,
    data: {
      type: 'tech-item',
      tech
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 'auto',
  } : undefined;

  // Highlight search terms in tech name and description
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part: string, index: number) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`tech-item group transition-all duration-200 rounded-lg hover:bg-gray-50 cursor-move ${
        isDragging ? 'scale-105 shadow-xl rotate-2 z-50' : 'hover:scale-[1.02]'
      } ${searchQuery ? 'ring-1 ring-blue-200 bg-blue-50' : ''}`}
    >
      <div className="flex items-center space-x-2 p-2">
        {/* Logo/Icon */}
        {tech.logo ? (
          <tech.logo className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <div 
            className={`w-3 h-3 rounded-full flex-shrink-0 transition-transform ${
              isDragging ? 'scale-125' : 'group-hover:scale-110'
            }`}
            style={{ backgroundColor: tech.color }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate text-xs">
            {highlightText(tech.name, searchQuery)}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {highlightText(tech.description, searchQuery)}
          </div>
        </div>
        <div className={`transition-all duration-200 ${
          isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      
      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-70 rounded-lg border-2 border-dashed border-blue-400 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-700 text-xs font-medium">Dragging...</div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickFilters: React.FC<QuickFiltersProps> = ({ onFilterSelect }) => {
  const quickFilters = [
    { label: 'Frontend', query: 'frontend' },
    { label: 'Backend', query: 'backend' },
    { label: 'Database', query: 'database' },
    { label: 'Cloud', query: 'cloud' },
    { label: 'DevOps', query: 'devops' },
    { label: 'Mobile', query: 'mobile' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {quickFilters.map((filter) => (
        <button
          key={filter.query}
          onClick={() => onFilterSelect(filter.query)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full transition-colors duration-200 border border-gray-200 hover:border-purple-200"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

const SearchHistory: React.FC<SearchHistoryProps> = ({ searchHistory, onHistorySelect, onClearHistory }) => {
  if (searchHistory.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-gray-700 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Recent Searches
        </h4>
        <button
          onClick={onClearHistory}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {searchHistory.slice(0, 5).map((query, index) => (
          <button
            key={index}
            onClick={() => onHistorySelect(query)}
            className="px-2 py-1 text-xs bg-white hover:bg-purple-50 text-gray-600 hover:text-purple-700 rounded border border-gray-200 hover:border-purple-200 transition-colors duration-200"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};

const SearchPanel: React.FC<SearchPanelProps> = ({ searchQuery, setSearchQuery, filteredResults, totalCount }) => {
      const searchInputRef = useRef<HTMLInputElement>(null);
      const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Add to search history when search is performed
  useEffect(() => {
    if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
      setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 9)]);
    }
  }, [searchQuery, searchHistory]);

  // Keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        (searchInputRef.current as HTMLInputElement)?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFilterSelect = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };

  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <div className="mb-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <Search className="w-4 h-4 mr-2 text-purple-600" />
          Search Components
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Find components by name or category
        </p>
        
        {/* Quick Filters */}
        <QuickFilters onFilterSelect={handleFilterSelect} />
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search technologies... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs hidden sm:block">
            <Command className="w-3 h-3" />
          </div>
        </div>
        
        {/* Search History */}
        {showHistory && searchHistory.length > 0 && !searchQuery && (
          <SearchHistory 
            searchHistory={searchHistory}
            onHistorySelect={handleHistorySelect}
            onClearHistory={handleClearHistory}
          />
        )}
        
        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              {filteredResults.reduce((total, group) => total + group.items.length, 0)} of {totalCount} results
            </span>
            {filteredResults.length === 0 && (
              <span className="text-orange-600 font-medium">No matches found</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentProject, onProjectUpdate }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [editingProject, setEditingProject] = useState(false);

  // Memoize filtered results for performance
  const { filteredResults, totalCount } = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return all technologies grouped by category
      const allTechs = Object.entries(techCategories).map(([categoryKey, category]) => ({
        categoryKey,
        category,
        items: category.items
      }));
      return {
        filteredResults: allTechs,
        totalCount: Object.values(techCategories).reduce((total, category) => total + category.items.length, 0)
      };
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: any[] = [];

    Object.entries(techCategories).forEach(([categoryKey, category]) => {
      const matchingItems = category.items.filter(tech => 
        tech.name.toLowerCase().includes(query) ||
        tech.description.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query)
      );

      if (matchingItems.length > 0) {
        filtered.push({
          categoryKey,
          category,
          items: matchingItems
        });
      }
    });

    const totalCount = Object.values(techCategories).reduce((total, category) => total + category.items.length, 0);

    return {
      filteredResults: filtered,
      totalCount
    };
  }, [searchQuery]);

  // Project Details Panel Component
  const ProjectDetailsPanel = () => {
    if (!currentProject) return null;

    const handleEditToggle = () => {
      setEditingProject(!editingProject);
    };

    const handleProjectSave = () => {
      setEditingProject(false);
      // onProjectUpdate would be called from input changes
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active':
          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'completed':
          return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'draft':
          return 'bg-amber-100 text-amber-700 border-amber-200';
        default:
          return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    return (
      <div className="mb-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl border border-indigo-200 shadow-lg overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
              </div>
              <h3 className="text-sm font-bold">Active Project</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowProjectEdit(!showProjectEdit)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title={showProjectEdit ? "Hide details" : "Show details"}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleEditToggle}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Edit project"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div className="mb-1">
            {editingProject ? (
              <input
                type="text"
                value={currentProject.name}
                onChange={(e) => onProjectUpdate?.({ name: e.target.value })}
                className="w-full text-base font-bold bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                onBlur={handleProjectSave}
                onKeyDown={(e) => e.key === 'Enter' && handleProjectSave()}
              />
            ) : (
              <h4 className="text-base font-bold text-white truncate">{currentProject.name}</h4>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-xs text-white/90">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(currentProject.lastModified).toLocaleDateString()}</span>
            </div>
            {currentProject.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(currentProject.status)} bg-white/20 text-white border-white/30`}>
                {currentProject.status}
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {/* Always visible quick info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
              <div className="flex items-center space-x-2 mb-1">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-700">Technologies</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">
                {currentProject.technologies?.length || 0}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Components</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {currentProject.components || 0}
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          {showProjectEdit && (
            <div className="space-y-4 pt-4 border-t border-indigo-200">
              {/* Project Description */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">Description</span>
                </div>
                {editingProject ? (
                  <textarea
                    value={currentProject.description || ''}
                    onChange={(e) => onProjectUpdate?.({ description: e.target.value })}
                    className="w-full text-sm bg-white border border-indigo-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={3}
                    placeholder="Add project description..."
                    onBlur={handleProjectSave}
                  />
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentProject.description || 'No description available'}
                  </p>
                )}
              </div>

              {/* Additional Project Info */}
              <div className="grid grid-cols-1 gap-3">
                {currentProject.author && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">Author</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{currentProject.author}</p>
                  </div>
                )}
                
                {currentProject.version && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                    <div className="flex items-center space-x-2 mb-1">
                      <Tag className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-700">Version</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{currentProject.version}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {currentProject.tags && currentProject.tags.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-700">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentProject.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-md border border-indigo-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setShowProjectEdit(!showProjectEdit)}
            className="w-full mt-3 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 hover:from-indigo-200 hover:to-blue-200 text-indigo-700 font-medium text-sm rounded-xl border border-indigo-200 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>{showProjectEdit ? 'Show Less' : 'Show More'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProjectEdit ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    );
  };

  // Limit search suggestions to 2-3 items per category
  const limitedResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredResults;
    }
    
    return filteredResults.map(({ categoryKey, category, items }) => ({
      categoryKey,
      category,
      items: items.slice(0, 3) // Limit to 3 suggestions per category
    }));
  }, [filteredResults, searchQuery]);

  return (
    <div className="p-4">
      {/* Project Details Panel */}
      <ProjectDetailsPanel />

      {/* Merged Search and Components */}
      <div className="space-y-4">
        {/* Compact Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Components List */}
        <div className="space-y-4">
          {limitedResults.map(({ categoryKey, category, items }) => (
            <div 
              key={categoryKey} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
              onMouseEnter={() => setHoveredCategory(categoryKey)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className={`p-3 border-b border-gray-100 transition-all duration-200 ${
                hoveredCategory === categoryKey ? 'bg-blue-50' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{category.icon}</span>
                    <span className="font-semibold text-gray-800 text-sm">{category.name}</span>
                    {searchQuery && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {items.length}{searchQuery && items.length === 3 ? '+' : ''}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {!searchQuery ? `${items.length} items` : `${items.length} matches`}
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {items.map((tech: any) => (
                  <DraggableTechItem key={tech.id} tech={tech} searchQuery={searchQuery} />
                ))}
              </div>
            </div>
          ))}
          
          {/* No Results Message */}
          {searchQuery && limitedResults.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-gray-600 font-medium mb-1">No technologies found</h3>
              <p className="text-sm text-gray-500">
                Try searching with different keywords or browse all categories
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 