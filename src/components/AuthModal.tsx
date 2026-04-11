import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Sparkles, AlertCircle, Github } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import type { AuthModalProps } from '../types';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode = 'signin', onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

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
      const displayName = formData.name || formData.email.split('@')[0] || 'User';
      const user = {
        id: `email_${Date.now()}`,
        name: displayName,
        email: formData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`,
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

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  // Uses the implicit/token flow: exchange the access token for user profile
  // from Google's userinfo endpoint.
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch Google profile');
        const profile = await res.json();

        const user = {
          id: `google_${profile.sub}`,
          name: profile.name || profile.email.split('@')[0],
          email: profile.email,
          avatar: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=6366f1&color=fff`,
        };
        localStorage.setItem('user', JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
      } catch (err) {
        setError('Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
      setGoogleLoading(false);
    },
  });

  const handleGithubLogin = () => {
    // Mock fallback for GitHub
    const user = {
      id: `github_${Date.now()}`,
      name: 'GitHub User',
      email: 'user@github.com',
      avatar: `https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff`,
    };
    localStorage.setItem('user', JSON.stringify(user));
    onAuthSuccess(user);
    onClose();
  };

  const isGoogleConfigured = Boolean(GOOGLE_CLIENT_ID);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 text-sm">
            {authMode === 'signup'
              ? 'Sign up to start building amazing apps'
              : 'Sign in to continue to Fullstack Gen'}
          </p>
        </div>

        {/* Google Sign-In button */}
        <div className="mb-5 space-y-3">
          {isGoogleConfigured ? (
            <button
              type="button"
              onClick={() => {
                setGoogleLoading(true);
                googleLogin();
              }}
              disabled={googleLoading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-700"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.82 2.7 30.28 0 24 0 14.82 0 6.73 5.4 2.69 13.32l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.18 5.59C43.98 37.13 46.1 31.3 46.1 24.5z"/>
                    <path fill="#FBBC05" d="M10.67 28.52c-1.13-3.36-1.13-6.98 0-10.34l-7.98-6.2C.7 16.18 0 19.01 0 22c0 2.99.7 5.82 1.97 8.02l8.7-6.5z"/>
                    <path fill="#EA4335" d="M24 44c6.28 0 11.56-2.08 15.41-5.67l-7.18-5.59c-2.01 1.35-4.6 2.16-8.23 2.16-6.38 0-11.87-3.59-14.33-8.72l-8.7 6.5C6.73 42.6 14.82 48 24 48z"/>
                  </g>
                </svg>
              )}
              <span>{googleLoading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>
          ) : (
            <div className="w-full flex items-start space-x-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <span>
                Google sign-in is not configured.{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Set up a Client ID
                </a>{' '}
                and add <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your <code className="bg-amber-100 px-1 rounded">.env</code> file.
              </span>
            </div>
          )}

          {/* GitHub Sign-In button */}
          <button
            type="button"
            onClick={handleGithubLogin}
            className="w-full bg-[#24292F] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#24292F]/90 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-5">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 text-gray-400 text-xs">or continue with email</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter your full name"
                  required={authMode === 'signup'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>{authMode === 'signup' ? 'Creating Account…' : 'Signing In…'}</span>
              </>
            ) : (
              <span>{authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
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
