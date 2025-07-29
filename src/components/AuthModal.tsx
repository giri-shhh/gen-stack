import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import type { AuthModalProps } from '../types';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode = 'signin', onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update authMode when mode prop changes
  useEffect(() => {
    setAuthMode(mode);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  }, [mode]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      if (!formData.email || !formData.password || (authMode === 'signup' && !formData.name)) {
        throw new Error('Please fill in all fields');
      }
      // Dummy user logic
      const user = {
        id: '1',
        name: formData.name || formData.email.split('@')[0] || 'User',
        email: formData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.email.split('@')[0] || 'User')}&background=6366f1&color=fff`
      };
      localStorage.setItem('user', JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {authMode === 'signup' ? 'Sign up to start building amazing apps' : 'Sign in to continue to Fullstack App Generator'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required={authMode === 'signup'}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{authMode === 'signup' ? 'Sign Up' : 'Sign In'}</span>
            )}
          </button>
        </form>
        {/* Social sign-in options */}
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-3 text-gray-400 text-xs">or continue with</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <div className="flex space-x-3 justify-center">
            <button
              type="button"
              onClick={() => alert('Google sign-in coming soon!')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Sign in with Google"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.82 2.7 30.28 0 24 0 14.82 0 6.73 5.4 2.69 13.32l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.18 5.59C43.98 37.13 46.1 31.3 46.1 24.5z"/><path fill="#FBBC05" d="M10.67 28.52c-1.13-3.36-1.13-6.98 0-10.34l-7.98-6.2C.7 16.18 0 19.01 0 22c0 2.99.7 5.82 1.97 8.02l8.7-6.5z"/><path fill="#EA4335" d="M24 44c6.28 0 11.56-2.08 15.41-5.67l-7.18-5.59c-2.01 1.35-4.6 2.16-8.23 2.16-6.38 0-11.87-3.59-14.33-8.72l-8.7 6.5C6.73 42.6 14.82 48 24 48z"/></g></svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Apple sign-in coming soon!')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Sign in with Apple"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-.04 0-.08 0-.12-.01-.02-.04-.03-.09-.03-.13 0-1.13.93-2.06 2.07-2.06.04 0 .08 0 .12.01.02.04.03.09.03.12zm3.13 4.13c-1.7-1.62-4.36-1.36-5.5-1.36-1.13 0-3.13-.26-5.16 1.36C5.13 7.13 4 10.13 4 13.13c0 3.13 2.13 6.13 5.13 6.13 1.13 0 1.57-.74 3.13-.74 1.56 0 2 .74 3.13.74 3 0 5.13-3 5.13-6.13 0-3-1.13-6-3.87-7.57z"/></svg>
              <span className="text-sm font-medium text-gray-700">Apple</span>
            </button>
            <button
              type="button"
              onClick={() => alert('GitHub sign-in coming soon!')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Sign in with GitHub"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.49 2.87 8.3 6.84 9.64.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>
              <span className="text-sm font-medium text-gray-700">GitHub</span>
            </button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={switchMode}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 