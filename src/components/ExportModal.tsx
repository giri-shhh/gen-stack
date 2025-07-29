import React, { useState } from 'react';
import { X, Download, GitBranch, Globe, FileText, Code, Folder, Settings } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import type { CanvasComponent, Connection, Project } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: CanvasComponent[];
  connections: Connection[];
  currentProject?: Project;
}

type ExportOption = 'zip' | 'git';

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  components, 
  connections, 
  currentProject 
}) => {
  const [selectedOption, setSelectedOption] = useState<ExportOption>('zip');
  const [generating, setGenerating] = useState(false);
  const [projectName, setProjectName] = useState(currentProject?.name || 'my-fullstack-app');
  
  // Git repository settings
  const [gitSettings, setGitSettings] = useState({
    repositoryUrl: '',
    branch: 'main',
    commitMessage: 'Initial commit from Fullstack App Generator',
    isPrivate: true
  });

  const generateProjectStructure = () => {
    const zip = new JSZip();
    
    // Group components by category
    const componentsByCategory: Record<string, CanvasComponent[]> = {};
    components.forEach(comp => {
      const category = getCategoryByTechId(comp.techId);
      if (category && !componentsByCategory[category]) {
        componentsByCategory[category] = [];
      }
      if (category) {
        componentsByCategory[category].push(comp);
      }
    });

    // Generate README
    const readmeContent = generateReadme(componentsByCategory, connections);
    zip.file('README.md', readmeContent);

    // Generate package.json for Node.js projects
    if (componentsByCategory.backend?.some(c => ['express', 'nextjs'].includes(c.techId))) {
      const packageJson = generatePackageJson(componentsByCategory);
      zip.file('package.json', JSON.stringify(packageJson, null, 2));
    }

    // Generate Docker files
    if (components.some(c => c.techId === 'docker')) {
      const dockerfile = generateDockerfile(componentsByCategory);
      zip.file('Dockerfile', dockerfile);
      
      const dockerCompose = generateDockerCompose(componentsByCategory);
      zip.file('docker-compose.yml', JSON.stringify(dockerCompose, null, 2));
    }

    // Generate environment files
    const envExample = generateEnvExample(componentsByCategory);
    zip.file('.env.example', envExample);

    // Generate basic source files
    if (componentsByCategory.frontend) {
      zip.file('frontend/package.json', JSON.stringify(generateFrontendPackageJson(componentsByCategory.frontend), null, 2));
      zip.file('frontend/README.md', generateFrontendReadme(componentsByCategory.frontend));
      
      // Generate React-specific files
      if (componentsByCategory.frontend.some(c => c.techId === 'react')) {
        generateReactProjectFiles(zip, componentsByCategory.frontend);
      }
    }

    if (componentsByCategory.backend) {
      zip.file('backend/package.json', JSON.stringify(generateBackendPackageJson(componentsByCategory.backend), null, 2));
      zip.file('backend/README.md', generateBackendReadme(componentsByCategory.backend));
    }

    // Generate architecture diagram
    const architectureDiagram = generateArchitectureDiagram(components, connections);
    zip.file('ARCHITECTURE.md', architectureDiagram);

    // Generate build and run scripts
    generateBuildScripts(zip);

    return zip;
  };

  const generateReadme = (componentsByCategory: Record<string, CanvasComponent[]>, connections: Connection[]) => {
    const techStack = Object.entries(componentsByCategory).map(([category, comps]) => {
      const techNames = comps.map(c => getTechById(c.techId)?.name).join(', ');
      return `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${techNames}`;
    }).join('\n');

    return `# ${projectName}

A fullstack application generated with Fullstack App Generator.

## Technology Stack

${techStack}

## Architecture

This application consists of ${components.length} components with ${connections.length} connections between them.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker (optional, for containerized deployment)

### Quick Start (Recommended)

This project includes automated scripts to help you get started quickly:

**Cross-platform (Node.js):**
\`\`\`bash
node scripts/build-and-run.js
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
.\\scripts\\build-and-run.ps1
\`\`\`

**Windows (Batch):**
\`\`\`cmd
scripts\\build-and-run.bat
\`\`\`

These scripts will automatically:
1. Install dependencies for all projects
2. Start development servers
3. Open URLs in your browser

### Manual Installation

If you prefer to set up manually:

1. Install dependencies: \`npm install\`
2. Copy \`.env.example\` to \`.env\` and configure your environment variables
3. Run the development server: \`npm run dev\`

For more information about the scripts, see \`scripts/README.md\`.

## Project Structure

This project was generated using the Fullstack App Generator, which creates a complete application architecture based on your selected components and their configurations.

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
`;
  };

  const generatePackageJson = (componentsByCategory: Record<string, CanvasComponent[]>) => {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};

    // Add common dependencies based on selected technologies
    if (componentsByCategory.backend?.some(c => c.techId === 'express')) {
      dependencies.express = '^4.18.2';
      dependencies.cors = '^2.8.5';
      dependencies.dotenv = '^16.0.3';
    }

    if (componentsByCategory.frontend?.some(c => c.techId === 'react')) {
      dependencies.react = '^18.2.0';
      dependencies['react-dom'] = '^18.2.0';
    }

    if (componentsByCategory.database?.some(c => c.techId === 'mongodb')) {
      dependencies.mongoose = '^7.0.3';
    }

    if (componentsByCategory.database?.some(c => c.techId === 'postgresql')) {
      dependencies.pg = '^8.10.0';
    }

    return {
      name: projectName,
      version: '1.0.0',
      description: 'A fullstack application generated with Fullstack App Generator',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        dev: 'nodemon index.js',
        test: 'jest'
      },
      dependencies,
      devDependencies,
      keywords: ['fullstack', 'generator', 'nodejs'],
      author: '',
      license: 'MIT'
    };
  };

  const generateDockerfile = (_componentsByCategory: Record<string, CanvasComponent[]>) => {
    return `# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
`;
  };

  const generateDockerCompose = (componentsByCategory: Record<string, CanvasComponent[]>) => {
    const services: Record<string, any> = {
      app: {
        build: '.',
        ports: ['3000:3000'],
        environment: ['NODE_ENV=production'],
        depends_on: []
      }
    };

    // Add database services if present
    if (componentsByCategory.database?.some(c => c.techId === 'mongodb')) {
      services.mongodb = {
        image: 'mongo:latest',
        ports: ['27017:27017'],
        environment: ['MONGO_INITDB_ROOT_USERNAME=admin', 'MONGO_INITDB_ROOT_PASSWORD=password'],
        volumes: ['./mongo-data:/data/db']
      };
      services.app.depends_on.push('mongodb');
    }

    if (componentsByCategory.database?.some(c => c.techId === 'postgresql')) {
      services.postgres = {
        image: 'postgres:latest',
        ports: ['5432:5432'],
        environment: ['POSTGRES_USER=admin', 'POSTGRES_PASSWORD=password', 'POSTGRES_DB=app'],
        volumes: ['./postgres-data:/var/lib/postgresql/data']
      };
      services.app.depends_on.push('postgres');
    }

    return {
      version: '3.8',
      services
    };
  };

  const generateEnvExample = (componentsByCategory: Record<string, CanvasComponent[]>) => {
    let envContent = '# Application Configuration\n';
    envContent += 'NODE_ENV=development\n';
    envContent += 'PORT=3000\n\n';

    if (componentsByCategory.database?.some(c => c.techId === 'mongodb')) {
      envContent += '# MongoDB Configuration\n';
      envContent += 'MONGODB_URI=mongodb://localhost:27017/app\n\n';
    }

    if (componentsByCategory.database?.some(c => c.techId === 'postgresql')) {
      envContent += '# PostgreSQL Configuration\n';
      envContent += 'POSTGRES_HOST=localhost\n';
      envContent += 'POSTGRES_PORT=5432\n';
      envContent += 'POSTGRES_USER=admin\n';
      envContent += 'POSTGRES_PASSWORD=password\n';
      envContent += 'POSTGRES_DB=app\n\n';
    }

    envContent += '# JWT Configuration\n';
    envContent += 'JWT_SECRET=your-secret-key\n';
    envContent += 'JWT_EXPIRES_IN=7d\n\n';

    envContent += '# API Configuration\n';
    envContent += 'API_BASE_URL=http://localhost:3000/api\n';

    return envContent;
  };

  const generateArchitectureDiagram = (components: CanvasComponent[], connections: Connection[]) => {
    let diagram = `# Architecture Diagram

## Components

${components.map(comp => {
  const tech = getTechById(comp.techId);
  return `- **${comp.properties?.name || tech?.name || comp.techId}** (${comp.techId})`;
}).join('\n')}

## Connections

${connections.map(conn => {
  const sourceComp = components.find(c => c.id === conn.source);
  const targetComp = components.find(c => c.id === conn.target);
  const sourceName = sourceComp?.properties?.name || getTechById(sourceComp?.techId || '')?.name || conn.source;
  const targetName = targetComp?.properties?.name || getTechById(targetComp?.techId || '')?.name || conn.target;
  return `- ${sourceName} → ${targetName} (${conn.type})`;
}).join('\n')}

## Technology Stack Summary

${Array.from(new Set(components.map(c => c.techId))).map(techId => {
  const tech = getTechById(techId);
  return `- ${tech?.name || techId}`;
}).join('\n')}
`;

    return diagram;
  };

  const generateFrontendPackageJson = (frontendComponents: CanvasComponent[]) => {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};
    const hasTypeScript = frontendComponents.some(c => c.techId === 'typescript');
    const hasNextJS = frontendComponents.some(c => c.techId === 'nextjs');
    const hasVite = frontendComponents.some(c => c.techId === 'vite');
    const hasTailwind = frontendComponents.some(c => c.techId === 'tailwindcss');

    // Add React dependencies
    dependencies.react = '^18.2.0';
    dependencies['react-dom'] = '^18.2.0';

    // Add TypeScript dependencies
    if (hasTypeScript) {
      devDependencies.typescript = '^5.0.0';
      devDependencies['@types/react'] = '^18.2.0';
      devDependencies['@types/react-dom'] = '^18.2.0';
      devDependencies['@types/node'] = '^20.0.0';
    }

    // Add framework-specific dependencies
    if (hasNextJS) {
      dependencies.next = '^13.4.0';
    }

    if (hasVite) {
      devDependencies.vite = '^4.3.0';
      devDependencies['@vitejs/plugin-react'] = '^4.0.0';
    }

    // Add UI library dependencies
    if (hasTailwind) {
      devDependencies.tailwindcss = '^3.3.0';
      devDependencies.autoprefixer = '^10.4.14';
      devDependencies.postcss = '^8.4.24';
    }

    // Determine scripts based on framework
    let scripts: Record<string, string> = {};
    if (hasNextJS) {
      scripts = {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      };
    } else if (hasVite) {
      scripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
      };
    } else {
      // Default React scripts (create-react-app style)
      scripts = {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      };
      dependencies['react-scripts'] = '5.0.1';
    }

    return {
      name: `${projectName}-frontend`,
      version: '1.0.0',
      private: true,
      scripts,
      dependencies,
      devDependencies,
      browserslist: {
        production: [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        development: [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    };
  };

  const generateBackendPackageJson = (backendComponents: CanvasComponent[]) => {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};

    // Add Express dependencies
    if (backendComponents.some(c => c.techId === 'express')) {
      dependencies.express = '^4.18.2';
      dependencies.cors = '^2.8.5';
      dependencies.dotenv = '^16.0.3';
    }

    // Add database dependencies
    if (backendComponents.some(c => c.techId === 'mongodb')) {
      dependencies.mongoose = '^7.0.3';
    }

    if (backendComponents.some(c => c.techId === 'postgresql')) {
      dependencies.pg = '^8.10.0';
    }

    // Add authentication dependencies
    dependencies.jsonwebtoken = '^9.0.0';
    dependencies.bcryptjs = '^2.4.3';

    return {
      name: `${projectName}-backend`,
      version: '1.0.0',
      description: 'Backend API for the fullstack application',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        dev: 'nodemon index.js',
        test: 'jest'
      },
      dependencies,
      devDependencies: {
        nodemon: '^2.0.22',
        ...devDependencies
      }
    };
  };

  const generateFrontendReadme = (frontendComponents: CanvasComponent[]) => {
    const techStack = frontendComponents.map(c => getTechById(c.techId)?.name || c.techId).join(', ');

    return `# Frontend

This is the frontend application for ${projectName}.

## Technology Stack

- ${techStack}

## Getting Started

1. Install dependencies: \`npm install\`
2. Start the development server: \`npm run dev\`
3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
`;
  };

  const generateBackendReadme = (backendComponents: CanvasComponent[]) => {
    const techStack = backendComponents.map(c => getTechById(c.techId)?.name || c.techId).join(', ');

    return `# Backend API

This is the backend API for ${projectName}.

## Technology Stack

- ${techStack}

## Getting Started

1. Install dependencies: \`npm install\`
2. Copy \`.env.example\` to \`.env\` and configure your environment variables
3. Start the development server: \`npm run dev\`
4. The API will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm start\` - Start production server
- \`npm test\` - Run tests
`;
  };

  const generateReactProjectFiles = (zip: JSZip, frontendComponents: CanvasComponent[]) => {
    const hasTypeScript = frontendComponents.some(c => c.techId === 'typescript');
    const hasTailwind = frontendComponents.some(c => c.techId === 'tailwindcss');
    const hasVite = frontendComponents.some(c => c.techId === 'vite');
    const hasNextJS = frontendComponents.some(c => c.techId === 'nextjs');
    
    // Generate public/index.html
    const indexHtml = generateReactIndexHtml();
    zip.file('frontend/public/index.html', indexHtml);
    
    // Generate public/manifest.json
    const manifestJson = generateManifestJson();
    zip.file('frontend/public/manifest.json', manifestJson);
    
    // Generate public/robots.txt
    const robotsTxt = generateRobotsTxt();
    zip.file('frontend/public/robots.txt', robotsTxt);
    
    // Generate src/index.js or src/index.tsx
    const indexFile = hasTypeScript ? generateReactIndexTSX() : generateReactIndexJS();
    zip.file(`frontend/src/index.${hasTypeScript ? 'tsx' : 'js'}`, indexFile);
    
    // Generate src/App.js or src/App.tsx
    const appFile = hasTypeScript ? generateReactAppTSX() : generateReactAppJS();
    zip.file(`frontend/src/App.${hasTypeScript ? 'tsx' : 'js'}`, appFile);
    
    // Generate CSS files
    const indexCss = generateReactIndexCSS(hasTailwind);
    zip.file('frontend/src/index.css', indexCss);
    
    const appCss = generateReactAppCSS();
    zip.file('frontend/src/App.css', appCss);
    
    if (hasTailwind) {
      const tailwindConfig = generateTailwindConfig();
      zip.file('frontend/tailwind.config.js', tailwindConfig);
      
      const postcssConfig = generatePostCSSConfig();
      zip.file('frontend/postcss.config.js', postcssConfig);
    }
    
    // Generate TypeScript config if using TypeScript
    if (hasTypeScript) {
      const tsConfig = generateTSConfig();
      zip.file('frontend/tsconfig.json', tsConfig);
    }
    
    // Generate Vite config if using Vite
    if (hasVite) {
      const viteConfig = generateViteConfig(hasTypeScript);
      zip.file('frontend/vite.config.js', viteConfig);
    }
    
    // Generate Next.js specific files
    if (hasNextJS) {
      const nextConfig = generateNextConfig();
      zip.file('frontend/next.config.js', nextConfig);
      
      const nextAppDir = generateNextAppDir();
      zip.file('frontend/src/app/layout.tsx', nextAppDir.layout);
      zip.file('frontend/src/app/page.tsx', nextAppDir.page);
      zip.file('frontend/src/app/globals.css', nextAppDir.globals);
    }
    
    // Generate .gitignore
    const gitignore = generateGitignore(hasNextJS);
    zip.file('frontend/.gitignore', gitignore);
  };

  // React file generation helper functions
  const generateReactIndexHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>${projectName}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  };

  const generateReactIndexJS = () => {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  };

  const generateReactIndexTSX = () => {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  };

  const generateReactAppJS = () => {
    return `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${projectName}</h1>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;`;
  };

  const generateReactAppTSX = () => {
    return `import React from 'react';
import './App.css';

function App(): JSX.Element {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${projectName}</h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;`;
  };

  const generateReactIndexCSS = (hasTailwind: boolean) => {
    if (hasTailwind) {
      return `@tailwind base;
@tailwind components;
@tailwind utilities;`;
    }
    
    return `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`;
  };

  const generateReactAppCSS = () => {
    return `.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}`;
  };

  const generateTailwindConfig = () => {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  };

  const generatePostCSSConfig = () => {
    return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  };

  const generateTSConfig = () => {
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}`;
  };

  const generateViteConfig = (hasTypeScript: boolean) => {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})`;
  };

  const generateNextConfig = () => {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`;
  };

  const generateNextAppDir = () => {
    return {
      layout: `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated with Fullstack App Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
      page: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to ${projectName}</h1>
        <p className="text-xl">Generated with Fullstack App Generator</p>
      </div>
    </main>
  )
}`,
      globals: `@tailwind base;
@tailwind components;
@tailwind utilities;`
    };
  };

  const generateGitignore = (hasNextJS: boolean) => {
    if (hasNextJS) {
      return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`;
    }
    
    return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*`;
  };

  const generateManifestJson = () => {
    return `{
  "short_name": "${projectName}",
  "name": "${projectName} - Generated with Fullstack App Generator",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}`;
  };

  const generateRobotsTxt = () => {
    return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:`;
  };

  // Generate build and run scripts
  const generateBuildScripts = (zip: JSZip) => {
    // Node.js script (cross-platform)
    const nodeScript = `#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Colors for console output
const colors = {
  reset: '\\x1b[0m',
  bright: '\\x1b[1m',
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  magenta: '\\x1b[35m',
  cyan: '\\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(\`\${colors[color]}\${message}\${colors.reset}\`);
}

function logError(message) {
  console.error(\`\${colors.red}ERROR: \${message}\${colors.reset}\`);
}

function logSuccess(message) {
  console.log(\`\${colors.green}✓ \${message}\${colors.reset}\`);
}

function logInfo(message) {
  console.log(\`\${colors.blue}ℹ \${message}\${colors.reset}\`);
}

function logWarning(message) {
  console.log(\`\${colors.yellow}⚠ \${message}\${colors.reset}\`);
}

// Get the platform-specific open command
function getOpenCommand() {
  const platform = process.platform;
  if (platform === 'win32') {
    return 'start';
  } else if (platform === 'darwin') {
    return 'open';
  } else {
    return 'xdg-open';
  }
}

// Open URL in browser
function openUrl(url) {
  const openCmd = getOpenCommand();
  try {
    execSync(\`\${openCmd} "\${url}"\`, { stdio: 'ignore' });
    logSuccess(\`Opened \${url} in browser\`);
  } catch (error) {
    logWarning(\`Failed to open \${url} automatically. Please open it manually.\`);
  }
}

// Find package.json files recursively
async function findPackageJsonFiles(dir) {
  const packageJsonFiles = [];
  
  async function scanDirectory(currentDir) {
    try {
      const items = await readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
            await scanDirectory(fullPath);
          }
        } else if (item === 'package.json') {
          packageJsonFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors and continue
    }
  }
  
  await scanDirectory(dir);
  return packageJsonFiles;
}

// Install dependencies for a project
function installDependencies(projectPath) {
  try {
    logInfo(\`Installing dependencies for \${path.basename(projectPath)}...\`);
    execSync('npm install', { 
      cwd: projectPath, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    logSuccess(\`Dependencies installed for \${path.basename(projectPath)}\`);
    return true;
  } catch (error) {
    logError(\`Failed to install dependencies for \${path.basename(projectPath)}\`);
    return false;
  }
}

// Start a server for a project
function startServer(projectPath, port) {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Determine the start command based on available scripts
    let startCommand = 'npm start';
    if (packageJson.scripts?.dev) {
      startCommand = 'npm run dev';
    } else if (packageJson.scripts?.start) {
      startCommand = 'npm start';
    } else if (packageJson.scripts?.serve) {
      startCommand = 'npm run serve';
    } else {
      logWarning(\`No start script found in \${path.basename(projectPath)}\`);
      return null;
    }
    
    // Set the port in environment variables
    const env = { ...process.env, PORT: port.toString() };
    
    logInfo(\`Starting server for \${path.basename(projectPath)} on port \${port}...\`);
    const child = spawn('npm', ['run', startCommand.includes('dev') ? 'dev' : 'start'], {
      cwd: projectPath,
      stdio: 'pipe',
      env
    });
    
    // Handle output
    child.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('localhost:') || output.includes('http://')) {
        logSuccess(\`Server started for \${path.basename(projectPath)}\`);
      }
      process.stdout.write(\`[\${path.basename(projectPath)}] \${output}\`);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(\`[\${path.basename(projectPath)}] \${data}\`);
    });
    
    child.on('error', (error) => {
      logError(\`Failed to start server for \${path.basename(projectPath)}: \${error.message}\`);
    });
    
    return child;
  } catch (error) {
    logError(\`Failed to start server for \${path.basename(projectPath)}: \${error.message}\`);
    return null;
  }
}

// Main function
async function main() {
  log('🚀 Fullstack App Generator - Build and Run Script', 'bright');
  log('================================================', 'bright');
  
  // Step 1: Find all projects
  log('\\n🔍 Step 1: Scanning for projects...', 'cyan');
  
  const projectPaths = [];
  
  // Check current directory and subdirectories
  const currentDir = process.cwd();
  const files = await findPackageJsonFiles(currentDir);
  
  for (const packageJsonPath of files) {
    const projectDir = path.dirname(packageJsonPath);
    if (projectDir !== currentDir) { // Don't include root package.json
      projectPaths.push(projectDir);
    }
  }
  
  if (projectPaths.length === 0) {
    logWarning('No projects found in current directory.');
    logInfo('Make sure you have extracted the ZIP file and are in the project directory.');
    return;
  }
  
  logSuccess(\`Found \${projectPaths.length} project(s)\`);
  
  // Step 2: Install dependencies for each project
  log('\\n📦 Step 2: Installing dependencies...', 'cyan');
  
  for (const projectPath of projectPaths) {
    installDependencies(projectPath);
  }
  
  // Step 3: Start servers
  log('\\n🚀 Step 3: Starting servers...', 'cyan');
  const servers = [];
  let currentPort = 3000;
  
  for (const projectPath of projectPaths) {
    const projectName = path.basename(projectPath);
    
    // Check if this is a frontend or backend project
    const isFrontend = projectName.includes('frontend') || 
                      fs.existsSync(path.join(projectPath, 'src', 'App.js')) ||
                      fs.existsSync(path.join(projectPath, 'src', 'App.tsx')) ||
                      fs.existsSync(path.join(projectPath, 'src', 'app'));
    
    const isBackend = projectName.includes('backend') ||
                     fs.existsSync(path.join(projectPath, 'server.js')) ||
                     fs.existsSync(path.join(projectPath, 'app.js')) ||
                     fs.existsSync(path.join(projectPath, 'index.js'));
    
    // Assign ports based on project type
    let port = currentPort;
    if (isFrontend) {
      port = 3000;
    } else if (isBackend) {
      port = 5000;
    } else {
      port = currentPort++;
    }
    
    const server = startServer(projectPath, port);
    if (server) {
      servers.push({
        name: projectName,
        port: port,
        process: server,
        url: \`http://localhost:\${port}\`
      });
    }
    
    // Wait a bit between starting servers
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 4: Open URLs in browser
  log('\\n🌐 Step 4: Opening URLs in browser...', 'cyan');
  
  // Wait a bit for servers to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  for (const server of servers) {
    logInfo(\`Opening \${server.name} at \${server.url}\`);
    openUrl(server.url);
    
    // Wait a bit between opening URLs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Step 5: Show summary
  log('\\n📊 Summary:', 'cyan');
  
  for (const server of servers) {
    log(\`\${server.name}: \${server.url}\`);
  }
  
  log('\\n💡 Tips:', 'yellow');
  log('- Press Ctrl+C to stop all servers');
  log('- Check the console output for any errors');
  log('- Make sure ports 3000, 5000, etc. are not already in use');
  
  // Keep the script running
  log('\\n🔄 Keeping servers running... (Press Ctrl+C to stop)', 'green');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\\n🛑 Shutting down servers...', 'yellow');
    servers.forEach(server => {
      if (server.process) {
        server.process.kill();
      }
    });
    process.exit(0);
  });
  
  // Keep the process alive
  process.stdin.resume();
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    logError(\`Script failed: \${error.message}\`);
    process.exit(1);
  });
}

module.exports = { main, installDependencies, startServer, openUrl };`;

    // PowerShell script (Windows)
    const powershellScript = `# Fullstack App Generator - Build and Run Script (PowerShell)
# This script builds the main application, finds generated projects, installs dependencies, and starts servers

param(
    [switch]$SkipInstall,
    [switch]$SkipStart,
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 5000
)

# Colors for console output
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = "White"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "ERROR: $Message" "Red"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Cyan"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

# Check if Node.js is installed
function Test-NodeJS {
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
        return $true
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH"
        return $false
    }
}

# Check if npm is installed
function Test-NPM {
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
        return $true
    }
    catch {
        Write-Error "npm is not installed or not in PATH"
        return $false
    }
}

# Open URL in default browser
function Open-URL {
    param([string]$URL)
    try {
        Start-Process $URL
        Write-Success "Opened $URL in browser"
    }
    catch {
        Write-Warning "Failed to open $URL automatically. Please open it manually."
    }
}

# Find package.json files recursively
function Find-PackageJsonFiles {
    param([string]$Directory)
    
    $packageJsonFiles = @()
    
    function Scan-Directory {
        param([string]$CurrentDir)
        
        try {
            $items = Get-ChildItem -Path $CurrentDir -Force
            foreach ($item in $items) {
                if ($item.PSIsContainer) {
                    # Skip common directories
                    if ($item.Name -notin @('node_modules', '.git', 'dist', 'build', '.next')) {
                        Scan-Directory -CurrentDir $item.FullName
                    }
                }
                elseif ($item.Name -eq 'package.json') {
                    $packageJsonFiles += $item.FullName
                }
            }
        }
        catch {
            # Ignore permission errors and continue
        }
    }
    
    Scan-Directory -CurrentDir $Directory
    return $packageJsonFiles
}

# Install dependencies for a project
function Install-Dependencies {
    param([string]$ProjectPath)
    
    try {
        Write-Info "Installing dependencies for $(Split-Path $ProjectPath -Leaf)..."
        Set-Location $ProjectPath
        npm install
        Write-Success "Dependencies installed for $(Split-Path $ProjectPath -Leaf)"
        return $true
    }
    catch {
        Write-Error "Failed to install dependencies for $(Split-Path $ProjectPath -Leaf)"
        return $false
    }
}

# Start a server for a project
function Start-ProjectServer {
    param(
        [string]$ProjectPath,
        [int]$Port
    )
    
    try {
        $packageJsonPath = Join-Path $ProjectPath "package.json"
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        
        # Determine the start command based on available scripts
        $startCommand = "start"
        if ($packageJson.scripts.dev) {
            $startCommand = "dev"
        }
        elseif ($packageJson.scripts.start) {
            $startCommand = "start"
        }
        elseif ($packageJson.scripts.serve) {
            $startCommand = "serve"
        }
        else {
            Write-Warning "No start script found in $(Split-Path $ProjectPath -Leaf)"
            return $null
        }
        
        # Set environment variables
        $env:PORT = $Port.ToString()
        $env:NODE_ENV = "development"
        
        Write-Info "Starting server for $(Split-Path $ProjectPath -Leaf) on port $Port..."
        
        # Start the process
        $process = Start-Process -FilePath "npm" -ArgumentList "run", $startCommand -WorkingDirectory $ProjectPath -PassThru -NoNewWindow
        
        # Wait a bit for the server to start
        Start-Sleep -Seconds 3
        
        return @{
            Name = Split-Path $ProjectPath -Leaf
            Port = $Port
            Process = $process
            URL = "http://localhost:$Port"
        }
    }
    catch {
        Write-Error "Failed to start server for $(Split-Path $ProjectPath -Leaf): $($_.Exception.Message)"
        return $null
    }
}

# Main function
function Main {
    Write-ColorOutput "🚀 Fullstack App Generator - Build and Run Script" "Magenta"
    Write-ColorOutput "================================================" "Magenta"
    
    # Check prerequisites
    if (-not (Test-NodeJS)) {
        exit 1
    }
    if (-not (Test-NPM)) {
        exit 1
    }
    
    # Step 1: Find all projects
    Write-Info "Step 1: Scanning for projects..."
    
    $projectPaths = @()
    $currentDir = Get-Location
    $files = Find-PackageJsonFiles -Directory $currentDir.Path
    
    foreach ($packageJsonPath in $files) {
        $projectDir = Split-Path $packageJsonPath -Parent
        if ($projectDir -ne $currentDir.Path) { # Don't include root package.json
            $projectPaths += $projectDir
        }
    }
    
    if ($projectPaths.Count -eq 0) {
        Write-Warning "No projects found in current directory."
        Write-Info "Make sure you have extracted the ZIP file and are in the project directory."
        return
    }
    
    Write-Success "Found $($projectPaths.Count) project(s)"
    
    # Step 2: Install dependencies for each project
    if (-not $SkipInstall) {
        Write-Info "Step 2: Installing dependencies..."
        
        foreach ($packageJsonPath in $files) {
            $projectDir = Split-Path $packageJsonPath -Parent
            if ($projectDir -ne $currentDir.Path) {
                Install-Dependencies -ProjectPath $projectDir
            }
        }
    }
    else {
        Write-Info "Skipping dependency installation..."
    }
    
    # Step 3: Start servers
    if (-not $SkipStart) {
        Write-Info "Step 3: Starting servers..."
        $servers = @()
        $currentPort = 3000
        
        foreach ($packageJsonPath in $files) {
            $projectDir = Split-Path $packageJsonPath -Parent
            if ($projectDir -eq $currentDir.Path) { continue } # Skip root
            
            $projectName = Split-Path $projectDir -Leaf
            
            # Check if this is a frontend or backend project
            $isFrontend = $projectName -like "*frontend*" -or 
                         (Test-Path (Join-Path $projectDir "src\\App.js")) -or
                         (Test-Path (Join-Path $projectDir "src\\App.tsx")) -or
                         (Test-Path (Join-Path $projectDir "src\\app"))
            
            $isBackend = $projectName -like "*backend*" -or
                        (Test-Path (Join-Path $projectDir "server.js")) -or
                        (Test-Path (Join-Path $projectDir "app.js")) -or
                        (Test-Path (Join-Path $projectDir "index.js"))
            
            # Assign ports based on project type
            if ($isFrontend) {
                $port = $FrontendPort
            }
            elseif ($isBackend) {
                $port = $BackendPort
            }
            else {
                $port = $currentPort++
            }
            
            $server = Start-ProjectServer -ProjectPath $projectDir -Port $port
            if ($server) {
                $servers += $server
            }
            
            # Wait a bit between starting servers
            Start-Sleep -Seconds 2
        }
        
        # Step 4: Open URLs in browser
        Write-Info "Step 4: Opening URLs in browser..."
        
        # Wait a bit for servers to start
        Start-Sleep -Seconds 5
        
        foreach ($server in $servers) {
            Write-Info "Opening $($server.Name) at $($server.URL)"
            Open-URL -URL $server.URL
            
            # Wait a bit between opening URLs
            Start-Sleep -Seconds 1
        }
        
        # Step 5: Show summary
        Write-Info "Summary:"
        
        foreach ($server in $servers) {
            Write-Info "$($server.Name): $($server.URL)"
        }
        
        Write-Warning "Tips:"
        Write-Warning "- Press Ctrl+C to stop all servers"
        Write-Warning "- Check the console output for any errors"
        Write-Warning "- Make sure ports 3000, 5000, etc. are not already in use"
        
        # Keep the script running
        Write-Success "Keeping servers running... (Press Ctrl+C to stop)"
        
        # Handle graceful shutdown
        $null = Register-EngineEvent PowerShell.Exiting -Action {
            Write-Warning "Shutting down servers..."
            foreach ($server in $servers) {
                if ($server.Process) {
                    Stop-Process -Id $server.Process.Id -Force -ErrorAction SilentlyContinue
                }
            }
        }
        
        # Keep the process alive
        try {
            while ($true) {
                Start-Sleep -Seconds 1
            }
        }
        catch {
            Write-Warning "Shutting down servers..."
            foreach ($server in $servers) {
                if ($server.Process) {
                    Stop-Process -Id $server.Process.Id -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
    else {
        Write-Info "Skipping server startup..."
    }
}

# Run the script
try {
    Main
}
catch {
    Write-Error "Script failed: $($_.Exception.Message)"
    exit 1
}`;

    // Batch script (Windows)
    const batchScript = `@echo off
setlocal enabledelayedexpansion

REM Fullstack App Generator - Build and Run Script (Batch)
REM This script helps run generated projects

echo.
echo 🚀 Fullstack App Generator - Build and Run Script
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✓ Node.js and npm found
echo.

REM Step 1: Find projects
echo 🔍 Step 1: Scanning for projects...
set "foundProjects="

REM Check for package.json files in subdirectories
for /r %%i in (package.json) do (
    set "projectDir=%%~dpi"
    set "projectDir=!projectDir:~0,-1!"
    if not "!projectDir!"=="%CD%" (
        set "foundProjects=!foundProjects! !projectDir!"
    )
)

if "!foundProjects!"=="" (
    echo ⚠ No projects found in current directory.
    echo Make sure you have extracted the ZIP file and are in the project directory.
    echo.
    pause
    exit /b 0
)

echo ✓ Found projects
echo.

REM Step 2: Install dependencies for each project
echo 📦 Step 2: Installing dependencies...
for %%i in (!foundProjects!) do (
    echo Installing dependencies for %%~nxi...
    pushd "%%i"
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies for %%~nxi
    ) else (
        echo ✓ Dependencies installed for %%~nxi
    )
    popd
)
echo.

REM Step 3: Start servers
echo 🚀 Step 3: Starting servers...
echo.
echo Available projects:
set "port=3000"
for %%i in (!foundProjects!) do (
    echo   %%~nxi (http://localhost:!port!)
    set /a port+=1
)
echo.

echo 💡 To start a specific project:
echo   1. Navigate to the project directory
echo   2. Run: npm run dev (or npm start)
echo   3. Open http://localhost:3000 in your browser
echo.

echo 💡 Tips:
echo   - Frontend projects typically run on port 3000
echo   - Backend projects typically run on port 5000
echo   - Check the project's package.json for available scripts
echo   - Make sure ports are not already in use
echo.

echo 🎯 Quick start commands:
for %%i in (!foundProjects!) do (
    echo   cd "%%i" ^&^& npm run dev
)
echo.

pause`;

    // Add scripts to ZIP
    zip.file('scripts/build-and-run.js', nodeScript);
    zip.file('scripts/build-and-run.ps1', powershellScript);
    zip.file('scripts/build-and-run.bat', batchScript);
    
    // Create scripts README
    const scriptsReadme = `# Build and Run Scripts

Scripts to automatically install dependencies and start servers for your generated project.

## Available Scripts

### 1. \`build-and-run.js\` (Node.js - Cross-platform)
Automatically installs dependencies, starts servers, and opens URLs.

\`\`\`bash
node scripts/build-and-run.js
\`\`\`

### 2. \`build-and-run.ps1\` (PowerShell - Windows)
Advanced version with parameters and custom options.

\`\`\`powershell
# Basic usage
.\\scripts\\build-and-run.ps1

# Skip dependency installation
.\\scripts\\build-and-run.ps1 -SkipInstall

# Skip server startup
.\\scripts\\build-and-run.ps1 -SkipStart

# Custom ports
.\\scripts\\build-and-run.ps1 -FrontendPort 3001 -BackendPort 5001
\`\`\`

### 3. \`build-and-run.bat\` (Batch - Windows)
Simple batch file for basic operations.

\`\`\`cmd
scripts\\build-and-run.bat
\`\`\`

## How It Works

1. **Scans** for projects in the current directory
2. **Installs** dependencies for each project
3. **Starts** servers automatically
4. **Opens** URLs in browser

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Usage

1. **Extract** the ZIP file to a directory
2. **Navigate** to the extracted directory
3. **Run** one of the scripts:

\`\`\`bash
# Using Node.js script
node scripts/build-and-run.js

# Using PowerShell (Windows)
.\\scripts\\build-and-run.ps1

# Using Batch file (Windows)
scripts\\build-and-run.bat
\`\`\`

## Project Detection

The scripts automatically detect:
- **Frontend**: Contains \`src/App.js\`, \`src/App.tsx\`, or \`src/app/\`
- **Backend**: Contains \`server.js\`, \`app.js\`, or \`index.js\`
- **Ports**: Frontend (3000), Backend (5000), others (incremental)

## Troubleshooting

### "No projects found"
- Make sure you're in the extracted project directory
- Check that package.json files exist in subdirectories

### "Port already in use"
- Stop other applications using the ports
- Use PowerShell script with custom ports

### "npm install failed"
- Check internet connection
- Verify Node.js installation

## Features

- ✅ Cross-platform compatibility
- ✅ Colored console output
- ✅ Automatic browser opening
- ✅ Graceful shutdown handling
- ✅ Smart port assignment
- ✅ Parameter support (PowerShell)`;

    zip.file('scripts/README.md', scriptsReadme);
  };

  const handleExport = async () => {
    setGenerating(true);
    try {
      if (selectedOption === 'zip') {
        const zip = generateProjectStructure();
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `${projectName}.zip`);
      } else if (selectedOption === 'git') {
        // Simulate Git push (in a real implementation, this would integrate with Git APIs)
        console.log('Pushing to Git repository:', gitSettings.repositoryUrl);
        // Here you would implement actual Git integration
        alert('Git integration would be implemented here. For now, the ZIP option is available.');
      }
    } catch (error) {
      console.error('Error exporting project:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-golden-lg p-golden-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-golden-lg">
          <h2 className="text-xl font-semibold text-gray-900">Export Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-golden-md">
          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-golden-sm">
              Export Method
            </label>
            <div className="grid grid-cols-2 gap-golden-sm">
              <button
                onClick={() => setSelectedOption('zip')}
                className={`p-golden-md rounded-golden border-2 transition-colors ${
                  selectedOption === 'zip'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-golden-sm">
                  <Download className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Download ZIP</div>
                    <div className="text-sm text-gray-500">Generate and download project files</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedOption('git')}
                className={`p-golden-md rounded-golden border-2 transition-colors ${
                  selectedOption === 'git'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-golden-sm">
                  <GitBranch className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Push to Git</div>
                    <div className="text-sm text-gray-500">Push directly to repository</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-golden-sm">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-golden-md py-golden-sm border border-gray-300 rounded-golden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="my-fullstack-app"
            />
          </div>

          {/* Git Settings */}
          {selectedOption === 'git' && (
            <div className="space-y-golden-sm">
              <h3 className="font-medium text-gray-900 flex items-center space-x-golden-sm">
                <Settings className="w-4 h-4" />
                Git Repository Settings
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-golden-sm">
                  Repository URL
                </label>
                <input
                  type="url"
                  value={gitSettings.repositoryUrl}
                  onChange={(e) => setGitSettings(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                  className="w-full px-golden-md py-golden-sm border border-gray-300 rounded-golden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://github.com/username/repository.git"
                />
              </div>

              <div className="grid grid-cols-2 gap-golden-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-golden-sm">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={gitSettings.branch}
                    onChange={(e) => setGitSettings(prev => ({ ...prev, branch: e.target.value }))}
                    className="w-full px-golden-md py-golden-sm border border-gray-300 rounded-golden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="main"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-golden-sm">
                    Commit Message
                  </label>
                  <input
                    type="text"
                    value={gitSettings.commitMessage}
                    onChange={(e) => setGitSettings(prev => ({ ...prev, commitMessage: e.target.value }))}
                    className="w-full px-golden-md py-golden-sm border border-gray-300 rounded-golden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Initial commit"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-golden-sm">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={gitSettings.isPrivate}
                  onChange={(e) => setGitSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                  Make repository private
                </label>
              </div>
            </div>
          )}

          {/* What will be generated */}
          <div className="bg-gray-50 p-golden-md rounded-golden">
            <h3 className="font-medium text-gray-900 mb-golden-sm">What will be generated:</h3>
            <ul className="space-y-golden-sm text-sm text-gray-600">
              <li className="flex items-center space-x-golden-sm">
                <FileText className="w-4 h-4 text-primary-600" />
                README.md with setup instructions
              </li>
              <li className="flex items-center space-x-golden-sm">
                <Code className="w-4 h-4 text-primary-600" />
                Package.json with dependencies
              </li>
              <li className="flex items-center space-x-golden-sm">
                <Folder className="w-4 h-4 text-primary-600" />
                Project structure and basic templates
              </li>
              <li className="flex items-center space-x-golden-sm">
                <FileText className="w-4 h-4 text-primary-600" />
                Docker configuration (if Docker is selected)
              </li>
              <li className="flex items-center space-x-golden-sm">
                <FileText className="w-4 h-4 text-primary-600" />
                Environment configuration
              </li>
            </ul>
          </div>

          {/* Architecture Summary */}
          <div className="bg-blue-50 p-golden-md rounded-golden">
            <h3 className="font-medium text-blue-900 mb-golden-sm">Architecture Summary</h3>
            <div className="text-sm text-blue-800">
              <p><strong>{components.length}</strong> components selected</p>
              <p><strong>{connections.length}</strong> connections defined</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-golden-sm mt-golden-lg">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-golden-sm px-golden-md rounded-golden hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={generating || (selectedOption === 'git' && !gitSettings.repositoryUrl)}
            className="flex-1 bg-primary-600 text-white py-golden-sm px-golden-md rounded-golden hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-golden-sm"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {selectedOption === 'zip' ? 'Generating...' : 'Pushing to Git...'}
              </>
            ) : (
              <>
                {selectedOption === 'zip' ? <Download className="w-4 h-4" /> : <GitBranch className="w-4 h-4" />}
                {selectedOption === 'zip' ? 'Generate & Download' : 'Push to Repository'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 