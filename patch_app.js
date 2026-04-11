const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Imports
content = content.replace(
    "import { Settings } from 'lucide-react';",
    "import { Settings } from 'lucide-react';\nimport { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';"
);

// 2. Add useNavigate and remove showLanding/showDashboard
content = content.replace(
    /function App\(\) \{\n\s*\/\/ State management\n\s*const \[user, setUser\] = useState<User \| null>\(null\);\n\s*const \[showDashboard, setShowDashboard\] = useState\(false\);\n\s*const \[showLanding, setShowLanding\] = useState\(true\);/,
    "function App() {\n  const navigate = useNavigate();\n\n  // State management\n  const [user, setUser] = useState<User | null>(null);\n  const [authModalOpen, setAuthModalOpen] = useState(false);\n  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');"
);

// Cleanup if the regex didn't work (fallback)
content = content.replace("const [showDashboard, setShowDashboard] = useState(false);", "");
content = content.replace("const [showLanding, setShowLanding] = useState(true);", "");

if (!content.includes("const navigate = useNavigate();")) {
    content = content.replace("function App() {", "function App() {\n  const navigate = useNavigate();");
}

// 3. Handlers
content = content.replace(
    "setShowLanding(false);\n      setShowDashboard(true);",
    "navigate('/dashboard');"
);
content = content.replace(
    "setShowDashboard(true);\n    setShowLanding(false);",
    "navigate('/dashboard');"
);
content = content.replace(
    "setShowDashboard(true);\n      setShowLanding(false);",
    "navigate('/dashboard');"
);
content = content.replace(
    "setShowDashboard(false);\n    setShowLanding(true);",
    "navigate('/');"
);
content = content.replace(
    "setShowDashboard(false);",
    ""
);
content = content.replace(
    "setShowLanding(true);",
    ""
);

// handleBackToLanding
content = content.replace(
    "setCurrentProject(null);\n    setShowDashboard(true);\n    setDashboardKey(prev => prev + 1); // Force Dashboard re-render",
    "setCurrentProject(null);\n    setDashboardKey(prev => prev + 1);\n    navigate('/dashboard');"
);

// handleCreateNewProject
content = content.replace(
    `    if (project) {
      setCurrentProject(project);
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
    }`,
    `    if (project) {
      setCurrentProject(project);
      navigate('/project/' + project.id);
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
      navigate('/project/' + newProject.id);
    }`
);

// handleLogout
content = content.replace(
    "setCurrentProject(null);",
    "setCurrentProject(null);\n    navigate('/');"
);

// Render block
const render_code = `  // Setup a wrapper for the project editor to handle URL parameters
  const ProjectEditorWrapper = () => {
    const { projectId } = useParams();
    
    // Auto-load project if we have an ID but no current project in state
    useEffect(() => {
      if (projectId && (!currentProject || currentProject.id.toString() !== projectId)) {
        const savedProjects = localStorage.getItem('userProjects');
        if (savedProjects) {
          const projects = JSON.parse(savedProjects);
          const found = projects.find((p: Project) => p.id.toString() === projectId);
          if (found) {
            setCurrentProject(found);
          }
        }
      }
    }, [projectId, currentProject]);

    if (!currentProject) {
      return <div className="flex items-center justify-center h-screen">Loading project...</div>;
    }

    return (
      <DndContext 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCenter}
      >
        <div className="h-screen flex flex-col bg-gray-50">
          <Header 
            onBackToLanding={handleBackToLanding} 
            user={user || undefined} 
            onLogout={handleLogout}
            currentProject={currentProject || undefined}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteCurrentProject}
            components={components}
            connections={connections}
          />
          
          <div className="flex flex-1 overflow-hidden flex-layout">
            {/* Left Sidebar - Resizable */}
            <ResizablePanel
              side="left"
              defaultWidth={sidebarWidth}
              minWidth={250}
              maxWidth={500}
              onResize={handleSidebarResize}
            >
              <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
                <Sidebar 
                  currentProject={currentProject || undefined}
                  onProjectUpdate={(updates) => {
                    if (currentProject) {
                      const updatedProject = { ...currentProject, ...updates };
                      setCurrentProject(updatedProject);
                      // Update localStorage or backend here if needed
                    }
                  }}
                />
              </div>
            </ResizablePanel>
            
            {/* Main Canvas - Ensure it doesn't overflow when properties panel is visible */}
            <div className={\`relative flex-1 min-w-0 canvas-container \${selectedComponent ? 'canvas-with-panel' : ''}\`}>
              <Canvas
                components={components}
                connections={connections}
                selectedComponent={selectedComponent || undefined}
                onComponentSelect={setSelectedComponent}
                onComponentUpdate={updateComponent}
                onComponentRemove={removeComponent}
                onConnectionAdd={(connection: Connection) => addConnection(connection.source, connection.target)}
                onConnectionRemove={removeConnection}
                onCanvasClick={clearSelection}
                onAddComponent={addComponent}
                draggedTech={draggedTech || undefined}
                onComponentDoubleClick={handleComponentDoubleClick}
                onViewProjectStructure={handleViewProjectStructure}
              />
              
              {/* Floating Properties Panel Button */}
              {selectedComponent && (
                <div className="absolute bottom-4 right-4 z-50">
                  <button
                    onClick={() => {
                      // Ensure properties panel is visible by scrolling to it
                      const propertiesPanel = document.querySelector('[data-properties-panel]');
                      if (propertiesPanel) {
                        propertiesPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    title="Open Properties Panel (Press 'P' key)"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Right Panel - Resizable, only show when component is selected */}
            {selectedComponent && (
              <ResizablePanel
                side="right"
                defaultWidth={propertiesPanelWidth}
                minWidth={280}
                maxWidth={600}
                onResize={handlePropertiesPanelResize}
              >
                <div className="h-full bg-white border-l border-gray-200 overflow-y-auto properties-panel-visible" data-properties-panel>
                  <PropertiesPanel
                    selectedComponent={selectedComponent}
                    onComponentUpdate={updateComponent}
                    onComponentRemove={removeComponent}
                    onConnectionRemove={removeConnection}
                    components={components}
                    connections={connections}
                    addComponent={addComponent}
                    showProjectPreview={showProjectPreview}
                    setShowProjectPreview={setShowProjectPreview}
                    previewComponent={previewComponent}
                    isPopupMode={isPropertiesPanelPopup}
                    setIsPopupMode={handlePropertiesPanelPopupToggle}
                  />
                </div>
              </ResizablePanel>
            )}
          </div>
          
          <DragOverlay dropAnimation={null}>
            {dragOverlayContent}
          </DragOverlay>
        </div>
        
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </DndContext>
    );
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
            key={\`dashboard-\${dashboardKey}\`} // Force re-render when dashboard becomes visible
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
          <ProjectEditorWrapper />
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;`;

// Find where the old return block starts
content = content.replace(/  \/\/ Render landing page\n  if \(showLanding\)[\s\S]*export default App;\n?/, render_code);

fs.writeFileSync('src/App.tsx', content);
