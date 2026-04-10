import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { Settings } from 'lucide-react';

import Canvas from './Canvas';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanelModular';
import ResizablePanel from './ResizablePanel';
import Header from './Header';
import Toast from './Toast';
import { useAppContext } from '../contexts/AppContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { usePanelResize } from '../hooks/usePanelResize';

import type { CanvasComponent, Connection } from '../types';

export default function EditorPage() {
  const {
    user,
    currentProject,
    toast,
    components,
    connections,
    selectedComponent,
    draggedTech,
    dragOverlayContent,
    zoom,
    pan,
    setZoom,
    setPan,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleBackToLanding,
    handleSaveProject,
    handleLogout,
    setToast,
    setSelectedComponent,
    addComponent,
    updateComponent,
    removeComponent,
    addConnection,
    removeConnection,
    setCurrentProject,
    handleDeleteCurrentProject
  } = useAppContext();

  const clearSelection = () => {
    setSelectedComponent(null);
  };

  useKeyboardShortcuts(handleSaveProject, clearSelection, currentProject, selectedComponent);

  const { width: sidebarWidth, handleResize: handleSidebarResize } = usePanelResize('left', 300);
  const { width: propertiesPanelWidth, handleResize: handlePropertiesPanelResize } = usePanelResize('right', 350);

  // Properties panel state
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [previewComponent, setPreviewComponent] = useState<CanvasComponent | null>(null);
  const [isPropertiesPanelPopup, setIsPropertiesPanelPopup] = useState(false);

  const handleComponentDoubleClick = (component: CanvasComponent) => {
    console.log('App: handleComponentDoubleClick called for component:', component.id);
    setSelectedComponent(component);
    setIsPropertiesPanelPopup(true);
    setToast({
      message: `Properties panel opened in full view for ${component.properties?.name || component.techId}`,
      type: 'success'
    });
  };

  const handleViewProjectStructure = (component: CanvasComponent) => {
    setPreviewComponent(component);
    setShowProjectPreview(true);
  };

  const handlePropertiesPanelPopupToggle = (isPopup: boolean) => {
    setIsPropertiesPanelPopup(isPopup);
  };

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
          selectedComponent={selectedComponent}
        />

        <div className="flex flex-1 overflow-hidden flex-layout">
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
                  }
                }}
              />
            </div>
          </ResizablePanel>

          <div className={`relative flex-1 min-w-0 canvas-container ${selectedComponent ? 'canvas-with-panel' : ''}`}>
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
              draggedTech={draggedTech || undefined}
              onComponentDoubleClick={handleComponentDoubleClick}
              onViewProjectStructure={handleViewProjectStructure}
              zoom={zoom}
              pan={pan}
              onZoomChange={setZoom}
              onPanChange={setPan}
            />

            {selectedComponent && (
              <div className="absolute bottom-4 right-4 z-50">
                <button
                  onClick={() => {
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DndContext>
  );
}
