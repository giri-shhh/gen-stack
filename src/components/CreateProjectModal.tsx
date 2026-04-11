import React, { useState } from 'react';
import { X, Folder, Sparkles, Rocket, ArrowRight, Lightbulb, Zap, Github, Globe, Tag } from 'lucide-react';
import type { CreateProjectModalProps, Project } from '../types';

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
  const [formData, setFormData] = useState({ name: '', description: '', repository: '', deploymentUrl: '', version: '' });
  const [githubIntegration, setGithubIntegration] = useState<'none' | 'create' | 'link'>('none');
  const [githubToken, setGithubToken] = useState(localStorage.getItem('githubToken') || '');
  const [repoPrivate, setRepoPrivate] = useState(true);
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
      if (!formData.name.trim()) throw new Error('Project name is required');
      if (!formData.description.trim()) throw new Error('Project description is required');

      let finalRepositoryUrl = formData.repository.trim() || undefined;

      if (githubIntegration === 'create') {
        if (!githubToken.trim()) throw new Error('GitHub token is required to create a repository');
        
        const res = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: { Authorization: `token ${githubToken.trim()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
            private: repoPrivate,
            auto_init: true
          })
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error('Failed to create GitHub repository: ' + (err.message || 'Unknown error'));
        }
        
        const repoData = await res.json();
        finalRepositoryUrl = repoData.html_url;
        localStorage.setItem('githubToken', githubToken.trim());
      } else if (githubIntegration === 'link') {
        if (!formData.repository.trim()) throw new Error('Existing repository URL is required');
        finalRepositoryUrl = formData.repository.trim();
      } else {
        finalRepositoryUrl = undefined;
      }

      const newProject: Project = {
        id: Date.now(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        repository: finalRepositoryUrl,
        deploymentUrl: formData.deploymentUrl.trim() || undefined,
        version: formData.version.trim() || undefined,
        lastModified: new Date().toISOString().split('T')[0],
        technologies: [],
        status: 'draft' as const
      };

      await onCreateProject(newProject);
      setFormData({ name: '', description: '', repository: '', deploymentUrl: '', version: '' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '', repository: '', deploymentUrl: '', version: '' });
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-y-auto overflow-x-hidden max-h-[95vh]">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-indigo-900/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-3xl shadow-2xl">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-50 animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Project</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start building your next amazing fullstack application with our intuitive drag-and-drop interface
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span>Project Name</span>
                </label>
                <div className="relative">
                  <Folder className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                    placeholder="My Awesome App"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Quick Templates */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span>Quick Templates</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { emoji: '🛒', label: 'E-commerce', name: 'E-commerce Store', desc: 'A full-featured online store with user authentication, product catalog, shopping cart, and payment processing.', cls: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 text-blue-700 dark:text-blue-300' },
                    { emoji: '👥', label: 'Social App', name: 'Social Platform', desc: 'A social media platform with user profiles, posts, real-time messaging, and content sharing features.', cls: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 text-purple-700 dark:text-purple-300' },
                    { emoji: '✅', label: 'Task Manager', name: 'Task Manager', desc: 'A collaborative task management application with project tracking, team collaboration, and progress monitoring.', cls: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 text-green-700 dark:text-green-300' },
                    { emoji: '📊', label: 'Analytics', name: 'Analytics Dashboard', desc: 'A data visualization dashboard with real-time analytics, charts, reports, and business intelligence features.', cls: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 text-orange-700 dark:text-orange-300' },
                  ].map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, name: t.name, description: t.desc }))}
                      className={`p-3 bg-gradient-to-r ${t.cls} border rounded-xl transition-all duration-200 text-xs font-medium`}
                      disabled={loading}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Project Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none shadow-sm hover:shadow-md"
                placeholder="Describe your project goals, features, and target audience..."
                required
                disabled={loading}
              />
            </div>

            {/* GitHub Setup (Optional) */}
            <div className="md:col-span-3 space-y-3 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-200 dark:border-gray-600">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Github className="w-4 h-4 text-gray-500" />
                <span>GitHub Repository Setup</span>
              </label>
              
              <div className="flex items-center space-x-6 mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={githubIntegration === 'none'} onChange={() => setGithubIntegration('none')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" disabled={loading} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Skip</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={githubIntegration === 'link'} onChange={() => setGithubIntegration('link')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" disabled={loading} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Link Existing</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={githubIntegration === 'create'} onChange={() => setGithubIntegration('create')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" disabled={loading} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Create New Repo</span>
                </label>
              </div>

              {githubIntegration === 'link' && (
                <input
                  type="url"
                  name="repository"
                  value={formData.repository}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                  placeholder="https://github.com/owner/repo"
                  disabled={loading}
                />
              )}

              {githubIntegration === 'create' && (
                <div className="space-y-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub Personal Access Token (Requires 'repo' scope)</label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                      placeholder="ghp_..."
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Your token is stored locally for convenience. <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Generate a token</a>.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="repoPrivate"
                      checked={repoPrivate}
                      onChange={(e) => setRepoPrivate(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      disabled={loading}
                    />
                    <label htmlFor="repoPrivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Make repository private</label>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details (Optional) */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Live URL */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Live URL</span>
                </label>
                <input
                  type="url"
                  name="deploymentUrl"
                  value={formData.deploymentUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                  placeholder="https://..."
                  disabled={loading}
                />
              </div>

              {/* Version */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Tag className="w-4 h-4 text-green-500" />
                  <span>Version</span>
                </label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
                  placeholder="1.0.0"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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
