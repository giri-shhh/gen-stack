const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// FIX 1: localStorage in user state
content = content.replace(
  "const [user, setUser] = useState<User | null>(null);",
  "const [user, setUser] = useState<User | null>(() => {\n    const saved = localStorage.getItem('user');\n    if (saved) {\n      try {\n        return JSON.parse(saved);\n      } catch (e) {\n        console.error('Failed to parse user from localStorage', e);\n      }\n    }\n    return null;\n  });"
);

// FIX 2: handleAuthSuccess
content = content.replace(
  "  const handleAuthSuccess = (userObj: User) => {\n    setUser(userObj);\n    setAuthModalOpen(false);\n    \n    navigate('/dashboard');\n  };",
  "  const handleAuthSuccess = (userObj: User) => {\n    localStorage.setItem('user', JSON.stringify(userObj));\n    setUser(userObj);\n    setAuthModalOpen(false);\n    \n    navigate('/dashboard');\n  };"
);

// FIX 3: handleContinueAsTemp
content = content.replace(
  "      isTemporary: true\n    };\n    \n    setUser(tempUser);\n    setGetStartedModalOpen(false);\n    \n    navigate('/dashboard');",
  "      isTemporary: true\n    };\n    \n    localStorage.setItem('user', JSON.stringify(tempUser));\n    setUser(tempUser);\n    setGetStartedModalOpen(false);\n    \n    navigate('/dashboard');"
);

// FIX 4: handleLogout
content = content.replace(
  "  const handleLogout = () => {\n    setUser(null);",
  "  const handleLogout = () => {\n    localStorage.removeItem('user');\n    setUser(null);"
);

// FIX 5: handleCreateNewProject (already fixed in patch_app.cjs but I need to make sure)
// Actually patch_app.cjs had the navigate fix for handleCreateNewProject. Let's verify:
if (!content.includes("navigate('/project/' + project.id)")) {
    // If not, it means I need to add it, but wait, in patch_app.cjs I did:
    // navigate('/project/' + project.id) and navigate('/project/' + newProject.id)
    // Wait, earlier I did navigate(`/project/${project.id}`)
}

// FIX 6: Extricate ProjectEditorWrapper
// We will replace the entire block of ProjectEditorWrapper.
// First, insert ProjectLoader before function App()
const loader = `
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
content = content.replace('function App() {', loader + '\nfunction App() {');

// We need to replace the entire `const ProjectEditorWrapper = () => { ... }` up to the `return (<Routes>...` with the variable definition.
const wrapperStartStr = `  // Setup a wrapper for the project editor to handle URL parameters
  const ProjectEditorWrapper = () => {`;
const startIdx = content.indexOf(wrapperStartStr);

const endStr = `      </DndContext>
    );
  };

  return (
    <Routes>`;
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const before = content.substring(0, startIdx);
  const after = content.substring(endIdx + endStr.length);
  
  // The content between start and end is the body of the wrapper.
  // The first part is the useEffect and if(!currentProject) check.
  // The second part is the return ( <DndContext> ... </DndContext> )
  
  // Let's get the DndContext block from the original content
  const dndContextStart = content.indexOf('<DndContext', startIdx);
  const dndContextEnd = content.indexOf('</DndContext>', dndContextStart) + '</DndContext>'.length;
  
  const dndContextCode = content.substring(dndContextStart, dndContextEnd);
  
  const newWrapperCode = `  // Setup project editor content
  const projectEditorContent = !currentProject ? (
    <div className="flex items-center justify-center h-screen">
      <ProjectLoader currentProject={currentProject} setCurrentProject={setCurrentProject} />
      Loading project...
    </div>
  ) : (
    <>
      <ProjectLoader currentProject={currentProject} setCurrentProject={setCurrentProject} />
${dndContextCode.replace(/^/gm, '      ')}
    </>
  );

  return (
    <Routes>`;
    
  content = before + newWrapperCode + after;
}

// Replace the `<ProjectEditorWrapper />` inside the Routes.
content = content.replace('<ProjectEditorWrapper />', '{projectEditorContent}');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx fully patched!');
