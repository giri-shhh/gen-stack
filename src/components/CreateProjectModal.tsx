import React, { useState } from 'react';
import { X, Folder, Sparkles, Rocket, ArrowRight, Lightbulb, Zap } from 'lucide-react';
import type { CreateProjectModalProps, Project } from '../types';

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Project name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Project description is required');
      }

      // Create new project object
      const newProject: Project = {
        id: Date.now(), // Simple ID generation
        name: formData.name.trim(),
        description: formData.description.trim(),
        lastModified: new Date().toISOString().split('T')[0],
        technologies: [],
        status: 'draft' as const
      };

      // Call the parent function to handle project creation
      await onCreateProject(newProject);
      
      // Reset form and close modal
      setFormData({ name: '', description: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '' });
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-6 right-6 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="relative p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-3xl shadow-2xl">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Project</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Start building your next amazing fullstack application with our intuitive drag-and-drop interface
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span>Project Name</span>
                </label>
                <div className="relative">
                  <Folder className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                    placeholder="My Awesome App"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Quick Templates */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span>Quick Templates</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, name: 'E-commerce Store', description: 'A full-featured online store with user authentication, product catalog, shopping cart, and payment processing.' }))}
                    className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-xs font-medium text-blue-700"
                    disabled={loading}
                  >
                    🛒 E-commerce
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, name: 'Social Platform', description: 'A social media platform with user profiles, posts, real-time messaging, and content sharing features.' }))}
                    className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-xs font-medium text-purple-700"
                    disabled={loading}
                  >
                    👥 Social App
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, name: 'Task Manager', description: 'A collaborative task management application with project tracking, team collaboration, and progress monitoring.' }))}
                    className="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 text-xs font-medium text-green-700"
                    disabled={loading}
                  >
                    ✅ Task Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, name: 'Analytics Dashboard', description: 'A data visualization dashboard with real-time analytics, charts, reports, and business intelligence features.' }))}
                    className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-200 text-xs font-medium text-orange-700"
                    disabled={loading}
                  >
                    📊 Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Project Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none shadow-sm hover:shadow-md"
                placeholder="Describe your project goals, features, and target audience..."
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-700 text-sm font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.description.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Project...</span>
                  </>
                ) : (
                  <>
                    <span>Create Project</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal; 