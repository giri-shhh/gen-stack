import { useState } from 'react';
import { X, Download, FileText, Folder, Code } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import type { CanvasComponent, Connection } from '../types';

interface CodeGeneratorProps {
  components: CanvasComponent[];
  connections: Connection[];
  onClose: () => void;
}

const CodeGenerator = ({ components, connections, onClose }: CodeGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [projectName, setProjectName] = useState('my-fullstack-app');

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
    }

    if (componentsByCategory.backend) {
      zip.file('backend/package.json', JSON.stringify(generateBackendPackageJson(componentsByCategory.backend), null, 2));
      zip.file('backend/README.md', generateBackendReadme(componentsByCategory.backend));
    }

    // Generate architecture diagram
    const architectureDiagram = generateArchitectureDiagram(components, connections);
    zip.file('ARCHITECTURE.md', architectureDiagram);

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

### Installation

1. Clone this repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
${projectName}/
├── frontend/          # Frontend application
├── backend/           # Backend API
├── docker-compose.yml # Docker configuration
├── Dockerfile         # Docker image definition
└── README.md         # This file
\`\`\`

## Deployment

### Local Development
\`\`\`bash
npm run dev
\`\`\`

### Production
\`\`\`bash
npm run build
npm start
\`\`\`

### Docker
\`\`\`bash
docker-compose up -d
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
`;
  };

  const generatePackageJson = (componentsByCategory: Record<string, CanvasComponent[]>) => {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};

    // Add common dependencies based on selected technologies
    if (componentsByCategory.frontend?.some(c => c.techId === 'react')) {
      dependencies.react = '^18.2.0';
      dependencies['react-dom'] = '^18.2.0';
    }

    if (componentsByCategory.backend?.some(c => c.techId === 'express')) {
      dependencies.express = '^4.18.2';
      dependencies.cors = '^2.8.5';
    }

    if (componentsByCategory.database?.some(c => c.techId === 'mongodb')) {
      dependencies.mongodb = '^5.0.0';
    }

    if (componentsByCategory.database?.some(c => c.techId === 'postgresql')) {
      dependencies.pg = '^8.10.0';
    }

    return {
      name: projectName,
      version: '1.0.0',
      description: 'Fullstack application generated with Fullstack App Generator',
      main: 'backend/server.js',
      scripts: {
        dev: 'concurrently "npm run dev:backend" "npm run dev:frontend"',
        'dev:backend': 'cd backend && npm run dev',
        'dev:frontend': 'cd frontend && npm run dev',
        build: 'npm run build:backend && npm run build:frontend',
        'build:backend': 'cd backend && npm run build',
        'build:frontend': 'cd frontend && npm run build',
        start: 'cd backend && npm start',
        test: 'npm run test:backend && npm run test:frontend',
        'test:backend': 'cd backend && npm test',
        'test:frontend': 'cd frontend && npm test'
      },
      dependencies,
      devDependencies: {
        ...devDependencies,
        concurrently: '^7.6.0'
      },
      keywords: ['fullstack', 'generated', 'architecture'],
      author: 'Fullstack App Generator',
      license: 'MIT'
    };
  };

  const generateDockerfile = (_componentsByCategory: Record<string, CanvasComponent[]>) => {
    return `# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production
RUN cd frontend && npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy source code
COPY . .

# Build applications
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built applications
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "backend/dist/server.js"]`;
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

    // Add database services
    if (componentsByCategory.database?.some(c => c.techId === 'postgresql')) {
      services.postgres = {
        image: 'postgres:15-alpine',
        environment: {
          POSTGRES_DB: 'app_db',
          POSTGRES_USER: 'app_user',
          POSTGRES_PASSWORD: 'app_password'
        },
        volumes: ['postgres_data:/var/lib/postgresql/data']
      };
      services.app.depends_on.push('postgres');
    }

    if (componentsByCategory.database?.some(c => c.techId === 'mongodb')) {
      services.mongo = {
        image: 'mongo:6',
        environment: {
          MONGO_INITDB_ROOT_USERNAME: 'app_user',
          MONGO_INITDB_ROOT_PASSWORD: 'app_password'
        },
        volumes: ['mongo_data:/data/db']
      };
      services.app.depends_on.push('mongo');
    }

    // Add Redis for caching
    if (componentsByCategory.caching?.some(c => c.techId === 'redis-cache')) {
      services.redis = {
        image: 'redis:7-alpine',
        ports: ['6379:6379']
      };
      services.app.depends_on.push('redis');
    }

    return {
      version: '3.8',
      services,
      volumes: {
        postgres_data: null,
        mongo_data: null
      }
    };
  };

  const generateEnvExample = (componentsByCategory: Record<string, CanvasComponent[]>) => {
    const envVars = [
      '# Application',
      'NODE_ENV=development',
      'PORT=3000',
      '',
      '# Database',
    ];

    if (componentsByCategory.database?.some(c => c.techId === 'postgresql')) {
      envVars.push(
        'POSTGRES_HOST=localhost',
        'POSTGRES_PORT=5432',
        'POSTGRES_DB=app_db',
        'POSTGRES_USER=app_user',
        'POSTGRES_PASSWORD=app_password',
        ''
      );
    }

    if (componentsByCategory.database?.some(c => c.techId === 'mongodb')) {
      envVars.push(
        'MONGO_URI=mongodb://localhost:27017/app_db',
        'MONGO_USER=app_user',
        'MONGO_PASSWORD=app_password',
        ''
      );
    }

    if (componentsByCategory.caching?.some(c => c.techId === 'redis-cache')) {
      envVars.push(
        '# Redis',
        'REDIS_HOST=localhost',
        'REDIS_PORT=6379',
        'REDIS_PASSWORD=',
        ''
      );
    }

    if (componentsByCategory.additional?.some(c => c.techId === 'auth0')) {
      envVars.push(
        '# Authentication',
        'AUTH0_DOMAIN=your-domain.auth0.com',
        'AUTH0_CLIENT_ID=your-client-id',
        'AUTH0_CLIENT_SECRET=your-client-secret',
        ''
      );
    }

    envVars.push(
      '# API Keys',
      'API_KEY=your-api-key',
      '',
      '# External Services',
      'EXTERNAL_API_URL=https://api.example.com'
    );

    return envVars.join('\n');
  };

  const generateArchitectureDiagram = (components: CanvasComponent[], connections: Connection[]) => {
    const componentList = components.map(comp => {
      const tech = getTechById(comp.techId);
      const category = getCategoryByTechId(comp.techId);
      return `- ${comp.properties?.name || tech?.name || 'Component'} (${tech?.name}, ${category})`;
    }).join('\n');

    const connectionList = connections.map(conn => {
      const fromComp = components.find(c => c.id === conn.source);
      const toComp = components.find(c => c.id === conn.target);
      return `- ${fromComp?.properties?.name || 'Component'} → ${toComp?.properties?.name || 'Component'}`;
    }).join('\n');

    return `# Architecture Diagram

## Components

${componentList}

## Connections

${connectionList}

## Technology Distribution

${Object.entries(
  components.reduce((acc: Record<string, number>, comp) => {
    const category = getCategoryByTechId(comp.techId);
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>)
).map(([category, count]) => `- ${category}: ${count} components`).join('\n')}

## Architecture Notes

This architecture was designed using the Fullstack App Generator.
The components are organized by their functional roles and connected
to show data flow and service dependencies.
`;
  };

  const generateFrontendPackageJson = (frontendComponents: CanvasComponent[]) => {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};

    frontendComponents.forEach(comp => {
      switch (comp.techId) {
        case 'react':
          dependencies.react = '^18.2.0';
          dependencies['react-dom'] = '^18.2.0';
          break;
        case 'nextjs':
          dependencies.next = '^13.4.0';
          dependencies.react = '^18.2.0';
          dependencies['react-dom'] = '^18.2.0';
          break;
        case 'vue':
          dependencies.vue = '^3.3.0';
          break;
        default:
          // Handle other frontend frameworks
          break;
      }
    });

    return {
      name: `${projectName}-frontend`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies,
      devDependencies: {
        ...devDependencies,
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        typescript: '^5.0.0',
        tailwindcss: '^3.3.0',
        autoprefixer: '^10.4.14',
        postcss: '^8.4.24'
      }
    };
  };

  const generateBackendPackageJson = (backendComponents: CanvasComponent[]) => {
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};

    backendComponents.forEach(comp => {
      switch (comp.techId) {
        case 'express':
          dependencies.express = '^4.18.2';
          dependencies.cors = '^2.8.5';
          dependencies.helmet = '^7.0.0';
          break;
        case 'fastapi':
          // This would be for Python, but we're generating Node.js for now
          break;
        default:
          // Handle other backend frameworks
          break;
      }
    });

    return {
      name: `${projectName}-backend`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'nodemon src/server.js',
        start: 'node src/server.js',
        test: 'jest'
      },
      dependencies,
      devDependencies: {
        ...devDependencies,
        nodemon: '^3.0.0',
        jest: '^29.5.0'
      }
    };
  };

  const generateFrontendReadme = (frontendComponents: CanvasComponent[]) => {
    const techNames = frontendComponents.map((c: CanvasComponent) => getTechById(c.techId)?.name).join(', ');
    
    return `# Frontend Application

This is the frontend application for ${projectName}.

## Technology Stack

- ${techNames}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## Project Structure

\`\`\`
frontend/
├── src/           # Source code
├── public/        # Static assets
├── package.json   # Dependencies
└── README.md     # This file
\`\`\`
`;
  };

  const generateBackendReadme = (backendComponents: CanvasComponent[]) => {
    const techNames = backendComponents.map((c: CanvasComponent) => getTechById(c.techId)?.name).join(', ');
    
    return `# Backend API

This is the backend API for ${projectName}.

## Technology Stack

- ${techNames}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. The API will be available at [http://localhost:3001](http://localhost:3001)

## Available Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run start\` - Start production server
- \`npm test\` - Run tests

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/status\` - Application status

## Project Structure

\`\`\`
backend/
├── src/           # Source code
├── tests/         # Test files
├── package.json   # Dependencies
└── README.md     # This file
\`\`\`
`;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const zip = generateProjectStructure();
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${projectName}.zip`);
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-golden-lg p-golden-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-golden-lg">
          <h2 className="text-xl font-semibold text-gray-900">Generate Project Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-golden-md">
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
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 bg-primary-600 text-white py-golden-sm px-golden-md rounded-golden hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-golden-sm"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator; 