import React, { useState } from 'react';
import { Folder, FileText, Code, Info, FileCode, FolderOpen } from 'lucide-react';
import type { CanvasComponent } from '../../types';

interface ProjectStructureViewerProps {
  component: CanvasComponent;
}

const ProjectStructureViewer: React.FC<ProjectStructureViewerProps> = ({ component }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const generateProjectStructure = () => {
    const componentType = component.techId;
    const projectName = component.properties?.name || 'my-app';
    
    // Base structure for all projects
    const baseStructure = {
      'README.md': {
        type: 'file',
        content: `# ${projectName}

This project was generated using the Fullstack App Generator.

## Technology Stack
- ${componentType}

## Available Scripts

- \`npm start\`: Runs the app in development mode
- \`npm run build\`: Builds the app for production
- \`npm test\`: Launches the test runner
`
      }
    };

    // React-specific structure
    if (componentType === 'react') {
      return {
        ...baseStructure,
        'package.json': {
          type: 'file',
          content: `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`
        },
        'public/': {
          type: 'folder',
          children: {
            'index.html': {
              type: 'file',
              content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
            },
            'favicon.ico': { type: 'file', content: 'Binary file' },
            'manifest.json': {
              type: 'file',
              content: `{
  "short_name": "${projectName}",
  "name": "${projectName}",
  "icons": []
}`
            }
          }
        },
        'src/': {
          type: 'folder',
          children: {
            'index.js': {
              type: 'file',
              content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
            },
            'App.js': {
              type: 'file',
              content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${projectName}</h1>
      </header>
    </div>
  );
}

export default App;`
            },
            'App.css': {
              type: 'file',
              content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}
`
            },
            'index.css': {
              type: 'file',
              content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
            }
          }
        }
      };
    }

    // Spring Boot-specific structure
    if (componentType === 'spring') {
      const springStructure = {
        ...baseStructure,
        'pom.xml': {
          type: 'file',
          content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>${projectName}</artifactId>
    <version>0.1.0</version>
    <name>${projectName}</name>
    <description>${component.properties?.description || 'Spring Boot Application'}</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
        },
        'src/main/java/com/example/Application.java': {
          type: 'file',
          content: `package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}`
        },
        'src/main/java/com/example/controller/HelloController.java': {
          type: 'file',
          content: `package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/")
    public String hello() {
        return "Hello from ${projectName}!";
    }
}`
        },
        'src/main/resources/application.properties': {
          type: 'file',
          content: `server.port=8080
spring.application.name=${projectName}`
        },
        'src/test/java/com/example/ApplicationTests.java': {
          type: 'file',
          content: `package com.example;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {
    @Test
    void contextLoads() {
    }
}`
        }
      };
      return springStructure;
    }

    // Node.js/Express-specific structure
    if (componentType === 'node' || componentType === 'express') {
      return {
        ...baseStructure,
        'package.json': {
          type: 'file',
          content: `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "${component.properties?.description || 'Node.js Application'}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}`
        },
        'index.js': {
          type: 'file',
          content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${projectName}!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`
        },
        'src/': {
          type: 'folder',
          children: {
            'routes/': {
              type: 'folder',
              children: {
                'index.js': {
                  type: 'file',
                  content: `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = router;`
                }
              }
            }
          }
        }
      };
    }

    // Default structure for unknown components
    return {
      ...baseStructure,
      'package.json': {
        type: 'file',
        content: `{
  "name": "${projectName}",
  "version": "0.1.0",
  "description": "${component.properties?.description || 'Generated Project'}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`
      },
      'index.js': {
        type: 'file',
        content: `console.log('Hello from ${projectName}!');`
      }
    };
  };

  const renderFileTree = (tree: any, path: string = '') => {
    return Object.entries(tree).map(([name, item]: [string, any]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isFolder = item.type === 'folder';
      const isSelected = selectedFile === fullPath;
      const isExpanded = expandedFolders.has(fullPath);

      return (
        <div key={fullPath} className="ml-4">
          <div
            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-indigo-50 ${
              isSelected ? 'bg-indigo-100 text-indigo-700 shadow-sm' : ''
            }`}
            onClick={() => {
              if (isFolder) {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(fullPath);
                } else {
                  newExpanded.add(fullPath);
                }
                setExpandedFolders(newExpanded);
              } else {
                setSelectedFile(fullPath);
                setFileContent(item.content || '');
              }
            }}
          >
            {isFolder ? (
              <FolderOpen className={`w-4 h-4 text-indigo-500 ${isExpanded ? 'fill-current' : ''}`} />
            ) : (
              <FileText className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm font-medium">{name}</span>
          </div>
          {isFolder && item.children && isExpanded && (
            <div className="ml-4 border-l border-indigo-200 pl-2">
              {renderFileTree(item.children, fullPath)}
            </div>
          )}
        </div>
      );
    });
  };

  const projectStructure = generateProjectStructure();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Folder className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Project Structure</h3>
        </div>
        
        <div className="text-sm text-gray-600 mb-6">
          Generated project structure for <strong className="text-indigo-700">{component.properties?.name || component.techId}</strong>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Tree */}
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-4">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">File Structure</h4>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {renderFileTree(projectStructure)}
            </div>
          </div>

          {/* File Content */}
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="w-4 h-4 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">File Content</h4>
            </div>
            {selectedFile ? (
              <div className="space-y-3">
                <div className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-2 rounded-lg">
                  {selectedFile}
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto border border-gray-800">
                  {fileContent}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select a file to view its content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 text-lg">Project Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="text-gray-600 font-medium mb-1">Project Name</div>
            <div className="text-gray-900 font-semibold">{component.properties?.name || 'React App'}</div>
          </div>
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="text-gray-600 font-medium mb-1">Technology</div>
            <div className="text-gray-900 font-semibold">{component.techId}</div>
          </div>
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="text-gray-600 font-medium mb-1">Description</div>
            <div className="text-gray-900">{component.properties?.description || 'No description'}</div>
          </div>
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-3 border border-indigo-100">
            <div className="text-gray-600 font-medium mb-1">Files Generated</div>
            <div className="text-gray-900 font-semibold">{Object.keys(projectStructure).length} files</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStructureViewer; 