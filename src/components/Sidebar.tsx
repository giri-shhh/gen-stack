import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { techCategories } from '../data/techStack';
import { Search, X, Filter, Command, Clock } from 'lucide-react';
import type { DraggableTechItemProps, QuickFiltersProps, SearchHistoryProps, SearchPanelProps } from '../types';

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
      className={`tech-item group transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-xl rotate-2' : 'hover:scale-102'
      } ${searchQuery ? 'ring-1 ring-purple-200 bg-purple-50' : ''}`}
    >
      <div className="flex items-center space-x-3 p-3">
        {/* Logo/Icon */}
        {tech.logo ? (
          <tech.logo className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" />
        ) : (
          <div 
            className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm transition-transform ${
              isDragging ? 'scale-125' : 'group-hover:scale-110'
            }`}
            style={{ backgroundColor: tech.color }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate text-sm">
            {highlightText(tech.name, searchQuery)}
          </div>
          <div className="text-xs text-gray-500 truncate mt-0.5">
            {highlightText(tech.description, searchQuery)}
          </div>
        </div>
        <div className={`transition-all duration-200 ${
          isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg border-2 border-dashed border-blue-400 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="text-blue-600 text-xs font-medium">Dragging...</div>
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

const Sidebar = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="p-6">
      {/* Search Panel */}
      <SearchPanel 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredResults={filteredResults}
        totalCount={totalCount}
      />

      <div className="space-y-8">
        {filteredResults.map(({ categoryKey, category, items }) => (
          <div 
            key={categoryKey} 
            className="sidebar-section"
            onMouseEnter={() => setHoveredCategory(categoryKey)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className={`sidebar-title transition-all duration-200 ${
              hoveredCategory === categoryKey ? 'bg-blue-50 border-blue-200' : ''
            }`}>
              <div className="flex items-center space-x-3">
                <span className="text-lg">{category.icon}</span>
                <span className="font-semibold text-gray-800">{category.name}</span>
                {searchQuery && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {items.length} match{items.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {items.length} technologies
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {items.map((tech: any) => (
                <DraggableTechItem key={tech.id} tech={tech} searchQuery={searchQuery} />
              ))}
            </div>
          </div>
        ))}
        
        {/* No Results Message */}
        {searchQuery && filteredResults.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-gray-600 font-medium mb-1">No technologies found</h3>
            <p className="text-sm text-gray-500">
              Try searching with different keywords or browse all categories
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 