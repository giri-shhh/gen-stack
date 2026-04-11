import React, { useState } from 'react';
import { X, User, Zap, Github } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import type { GetStartedModalProps } from '../types';

type ExtendedProps = GetStartedModalProps & {
  onAuthSuccess?: (user: any) => void;
};

const GetStartedModal: React.FC<ExtendedProps> = ({ 
  isOpen, 
  onClose, 
  onSignUp, 
  onContinueAsTemp,
  onAuthSuccess
}) => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
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
        if (onAuthSuccess) onAuthSuccess(user);
        else window.location.reload();
        onClose();
      } catch (err) {
        console.error('Google sign-in failed', err);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      console.error('Google sign-in was cancelled or failed.');
      setGoogleLoading(false);
    },
  });

  const handleGithubLogin = () => {
    const user = {
      id: `github_${Date.now()}`,
      name: 'GitHub User',
      email: 'user@github.com',
      avatar: `https://ui-avatars.com/api/?name=GitHub+User&background=24292e&color=fff`,
    };
    localStorage.setItem('user', JSON.stringify(user));
    if (onAuthSuccess) onAuthSuccess(user);
    else window.location.reload();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
        {/* Close Button */}
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
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Get Started
          </h2>
          <p className="text-gray-600">
            Choose how you'd like to begin building your fullstack application
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Continue as Temporary User */}
          <button
            onClick={onContinueAsTemp}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
          >
            <User className="w-5 h-5" />
            <span>Continue as Temporary User</span>
          </button>
          <p className="text-sm text-gray-500 text-center -mt-2">
            Quick start - no registration required
          </p>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-sm text-gray-500">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

      {/* Google Sign In */}
      <button
        onClick={() => {
          setGoogleLoading(true);
          googleLogin();
        }}
        disabled={googleLoading}
        className="w-full border-2 border-gray-200 text-gray-700 p-3.5 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      {/* GitHub Sign In */}
      <button
        onClick={handleGithubLogin}
        className="w-full bg-[#24292F] text-white p-3.5 rounded-xl font-semibold hover:bg-[#24292F]/90 transition-all duration-200 flex items-center justify-center space-x-3 mt-3"
      >
        <Github className="w-5 h-5" />
        <span>Continue with GitHub</span>
      </button>

      <p className="text-sm text-gray-500 text-center pt-2">
        Save your projects and access them anytime
      </p>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800 text-center">
            <strong>Temporary users</strong> can use all features but projects won't be saved permanently
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStartedModal;