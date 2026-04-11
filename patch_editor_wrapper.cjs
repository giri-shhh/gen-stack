const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Move ProjectLoader to the top, outside of App.
const projectLoaderCode = `
// A helper component to load project based on URL params without causing re-renders
const ProjectLoader = ({ currentProject, setCurrentProject }: { currentProject: any, setCurrentProject: any }) => {
  const { projectId } = useParams();
  
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id.toString() !== projectId)) {
      const savedProjects = localStorage.getItem('userProjects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const found = projects.find((p: any) => p.id.toString() === projectId);
        if (found) {
          setCurrentProject(found);
        }
      }
    }
  }, [projectId, currentProject, setCurrentProject]);
  
  return null;
};
`;

// Insert it right before "function App() {"
content = content.replace('function App() {', projectLoaderCode + '\nfunction App() {');

// 2. Replace ProjectEditorWrapper definition with projectEditorContent variable
// First, find the start of ProjectEditorWrapper
const wrapperStart = `  // Setup a wrapper for the project editor to handle URL parameters
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

    return (`;

const newContentPrefix = `  // Setup project editor content
  const projectEditorContent = !currentProject ? (
    <div className="flex items-center justify-center h-screen">
      <ProjectLoader currentProject={currentProject} setCurrentProject={setCurrentProject} />
      Loading project...
    </div>
  ) : (
    <>
      <ProjectLoader currentProject={currentProject} setCurrentProject={setCurrentProject} />`;

content = content.replace(wrapperStart, newContentPrefix);

const wrapperEndRegex = /      <\/DndContext>\n    \);\n  \};\n/g;
const newContentSuffix = `      </DndContext>\n    </>\n  );\n`;
content = content.replace(wrapperEndRegex, newContentSuffix);

// 3. Update the route usage
content = content.replace('<ProjectEditorWrapper />', '{projectEditorContent}');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched!');
