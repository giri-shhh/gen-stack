// Global type declarations

// Declare module for .js files that haven't been converted to TypeScript yet
declare module '*.js' {
  const content: any;
  export default content;
}

// Extend Window interface for debug functions
declare global {
  interface Window {
    debugSaveProject: () => void;
    debugCheckSavedProjects: () => void;
    debugCreateTestProject: () => void;
    debugDashboardProjects: () => void;
    forceRefreshFromLocalStorage: () => void;
    clearLocalStorageAndReset: () => void;
  }
}

export {}; 