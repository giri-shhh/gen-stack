import React from 'react';
import { X, User, UserPlus, Zap } from 'lucide-react';
import type { GetStartedModalProps } from '../types';

const GetStartedModal: React.FC<GetStartedModalProps> = ({ 
  isOpen, 
  onClose, 
  onSignUp, 
  onContinueAsTemp 
}) => {
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

          {/* Sign Up */}
          <button
            onClick={onSignUp}
            className="w-full border-2 border-gray-300 text-gray-700 p-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Account</span>
          </button>
          <p className="text-sm text-gray-500 text-center -mt-2">
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