import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import GetStartedModal from './components/GetStartedModal';
import EditorPage from './components/EditorPage';
import ModuleDetailPage from './components/ModuleDetailPage';
import SettingsPage from './components/SettingsPage';
import type { User, Project } from './types';

function App() {
  const navigate = useNavigate();
  // State management
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    return null;
  });
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [getStartedModalOpen, setGetStartedModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Event handlers
  const handleGetStarted = () => {
    if (!user) {
      setGetStartedModalOpen(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleContinueAsTemp = () => {
    // Generate a random name for temporary user
    const adjectives = ['Creative', 'Innovative', 'Dynamic', 'Brilliant', 'Curious', 'Adventurous', 'Bold', 'Clever', 'Energetic', 'Inspiring'];
    const nouns = ['Developer', 'Creator', 'Builder', 'Designer', 'Architect', 'Explorer', 'Innovator', 'Maker', 'Visionary', 'Pioneer'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomName = `${randomAdjective} ${randomNoun}`;
    
    // Create a temporary user
    const tempUser: User = {
      id: `temp_${Date.now()}`,
      name: randomName,
      email: '', // No email for temporary users
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=6366f1&color=fff`,
      isTemporary: true
    };
    
    localStorage.setItem('user', JSON.stringify(tempUser));
    setUser(tempUser);
    setGetStartedModalOpen(false);
    
    navigate('/dashboard');
  };

  const handleGetStartedSignUp = () => {
    setGetStartedModalOpen(false);
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleCreateNewProject = (project: Project | null = null) => {
    if (project) {
      setCurrentProject(project);
      navigate(`/project/${project.id}`);
    } else {
      const newProject: Project = {
        id: Date.now(),
        name: 'New Project',
        description: 'A new project',
        lastModified: new Date().toISOString(),
        technologies: [],
        status: 'active'
      };
      setCurrentProject(newProject);
      navigate(`/project/${newProject.id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentProject(null);
    navigate('/');
  };

  const handleUpdateUser = (updated: User) => {
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const handleOpenSignIn = () => {
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userObj: User) => {
    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    setAuthModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <Routes>
      <Route path="/" element={
        <>
          <LandingPage 
            onGetStarted={handleGetStarted}
            onSignIn={handleOpenSignIn}
            onSignUp={handleOpenSignUp}
          />
          <GetStartedModal
            isOpen={getStartedModalOpen}
            onClose={() => setGetStartedModalOpen(false)}
            onSignUp={handleGetStartedSignUp}
            onContinueAsTemp={handleContinueAsTemp}
          />
          {authModalOpen && (
            <AuthModal
              isOpen={authModalOpen}
              mode={authModalMode}
              onClose={() => setAuthModalOpen(false)}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
        </>
      } />
      
      <Route path="/dashboard" element={
        user ? (
          <Dashboard
            user={user}
            onCreateNewProject={handleCreateNewProject}
            onLogout={handleLogout}
          />
        ) : (
          <Navigate to="/" />
        )
      } />

      <Route path="/project/:projectId" element={
        user ? (
          <EditorPage
            user={user}
            currentProject={currentProject}
            setCurrentProject={setCurrentProject}
            onLogout={handleLogout}
          />
        ) : (
          <Navigate to="/" />
        )
      } />

      <Route path="/project/:projectId/module/:componentId" element={
        user ? (
          <ModuleDetailPage
            user={user}
            currentProject={currentProject}
            setCurrentProject={setCurrentProject}
            onLogout={handleLogout}
          />
        ) : (
          <Navigate to="/" />
        )
      } />

      <Route path="/settings" element={
        user ? (
          <SettingsPage
            user={user}
            onLogout={handleLogout}
            onUserUpdate={handleUpdateUser}
          />
        ) : (
          <Navigate to="/" />
        )
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;