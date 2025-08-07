import React, { useState } from 'react';
import { Settings, LogOut, Bell, Sparkles, Zap, Search, Filter, X } from 'lucide-react';
import type { User } from '../../types';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onLogout, 
  onSearch,
  searchPlaceholder = "Search projects, templates, and more..."
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div className="flex items-center justify-between">
      {/* Brand Name */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Fullstack Gen
          </h1>
          <p className="text-sm text-gray-500 font-medium">Design and build your application</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <div className="relative flex items-center">
            <div className="absolute left-4 z-10">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full pl-12 pr-20 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl focus:shadow-2xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium"
            />
            <div className="absolute right-2 flex items-center space-x-1">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowSearchFilters(!showSearchFilters)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  showSearchFilters
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Search filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Filters Dropdown */}
          {showSearchFilters && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setShowSearchFilters(false)}
              ></div>
              
              {/* Filters Modal */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Search in:</h4>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                        Projects
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Templates
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Technologies
                      </button>
                      <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        Tags
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Filter by status:</h4>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                        Active
                      </button>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                        Completed
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                        Favorites
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Info and Actions */}
      <div className="flex items-center space-x-6">
        {/* User Info */}
        

        {/* Avatar and Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl bg-white border border-gray-200"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
          </button>

          {/* Notifications Modal */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[9998] bg-black/10" 
                onClick={() => setShowNotifications(false)}
              ></div>
              
              {/* Modal */}
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999]">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-lg">×</span>
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
                      <span className="text-white text-xs">✓</span>
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
            </>
          )}
          </div>

        {/* User Avatar Dropdown */}
        <div className="relative group">
          <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200 transform hover:scale-105 border border-gray-200 bg-white shadow-lg">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full ring-2 ring-indigo-100"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Account Settings</p>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] backdrop-blur-sm">
            <div className="p-2">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;