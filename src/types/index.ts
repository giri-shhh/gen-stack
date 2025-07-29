// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  lastModified: string;
  technologies: string[];
  status: 'active' | 'completed' | 'archived' | 'draft';
  canvasState?: CanvasState;
}

// Canvas component types
export interface CanvasComponent {
  id: string;
  type: string;
  techId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  label?: string;
  description?: string;
  selectedLibraries?: any[];
}

// Connection types
export interface Connection {
  id: string;
  source: string;
  target: string;
  type: string;
}

// Canvas state types
export interface CanvasState {
  components: CanvasComponent[];
  connections: Connection[];
  zoom: number;
  pan: { x: number; y: number };
}

// Technology types
export interface Technology {
  id: string;
  name: string;
  description: string;
  color: string;
  logo?: React.ComponentType<{ className?: string }>;
}

export interface TechCategory {
  name: string;
  icon: string;
  items: Technology[];
}

export interface TechCategories {
  [key: string]: TechCategory;
}

// Toast types
export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Auth types
export interface AuthModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

// Component props types
export interface HeaderProps {
  onBackToLanding?: () => void;
  user?: User;
  onLogout?: () => void;
  currentProject?: Project;
  onSaveProject?: () => Promise<void>;
  onDeleteProject?: () => void;
}

export interface DashboardProps {
  user: User;
  onCreateNewProject: (project?: Project) => void;
  onLogout: () => void;
}

export interface CanvasProps {
  components: CanvasComponent[];
  connections: Connection[];
  selectedComponent?: CanvasComponent;
  onComponentSelect: (component: CanvasComponent | null) => void;
  onComponentUpdate: (id: string, updates: Partial<CanvasComponent>) => void;
  onComponentRemove: (id: string) => void;
  onConnectionAdd: (connection: Connection) => void;
  onConnectionRemove: (id: string) => void;
  onCanvasClick: () => void;
  onAddComponent: (component: CanvasComponent) => void;
  draggedTech?: Technology;
  onComponentDoubleClick?: (component: CanvasComponent) => void;
}

export interface SidebarProps {
  onFilterSelect: (category: string) => void;
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
  onClearHistory: () => void;
}

export interface DraggableTechItemProps {
  tech: Technology;
  searchQuery: string;
}

export interface QuickFiltersProps {
  onFilterSelect: (category: string) => void;
}

export interface SearchHistoryProps {
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
  onClearHistory: () => void;
}

export interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredResults: any[];
  totalCount: number;
}

export interface ConnectionLinesProps {
  connections: Connection[];
  components: CanvasComponent[];
  isConnecting: boolean;
  connectionStart: string | null;
  mousePosition: { x: number; y: number } | null;
  zoom?: number;
}

export interface CanvasComponentProps {
  component: CanvasComponent;
  isSelected: boolean;
  isConnecting?: boolean;
  isConnectionStart?: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasComponent>) => void;
  onRemove: () => void;
  onDoubleClick: () => void;
  onConnectionStart: () => void;
  onConnectionEnd: () => void;
  zoom: number;
}

export interface CodeGeneratorProps {
  components: CanvasComponent[];
  connections: Connection[];
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => Promise<void>;
}

export interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export interface PropertiesPanelProps {
  selectedComponent: CanvasComponent;
  onComponentUpdate: (id: string, updates: Partial<CanvasComponent>) => void;
  onComponentRemove: (id: string) => void;
  onConnectionRemove: (id: string) => void;
  components: CanvasComponent[];
  connections: Connection[];
  addComponent: (component: CanvasComponent) => void;
  showProjectPreview: boolean;
  setShowProjectPreview: (show: boolean) => void;
  previewComponent?: CanvasComponent;
}

// Event types
export interface DragEvent {
  active: { id: string; data: any };
  over: { id: string } | null;
}

// Utility types
export type ComponentType = 'frontend' | 'backend' | 'database' | 'cloud' | 'messaging' | 'caching' | 'additional'; 