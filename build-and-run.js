#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
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
    execSync(`${openCmd} "${url}"`, { stdio: 'ignore' });
    logSuccess(`Opened ${url} in browser`);
  } catch (error) {
    logWarning(`Failed to open ${url} automatically. Please open it manually.`);
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
    logInfo(`Installing dependencies for ${path.basename(projectPath)}...`);
    execSync('npm install', { 
      cwd: projectPath, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    logSuccess(`Dependencies installed for ${path.basename(projectPath)}`);
    return true;
  } catch (error) {
    logError(`Failed to install dependencies for ${path.basename(projectPath)}`);
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
      logWarning(`No start script found in ${path.basename(projectPath)}`);
      return null;
    }
    
    // Set the port in environment variables
    const env = { ...process.env, PORT: port.toString() };
    
    logInfo(`Starting server for ${path.basename(projectPath)} on port ${port}...`);
    const child = spawn('npm', ['run', startCommand.includes('dev') ? 'dev' : 'start'], {
      cwd: projectPath,
      stdio: 'pipe',
      env
    });
    
    // Handle output
    child.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('localhost:') || output.includes('http://')) {
        logSuccess(`Server started for ${path.basename(projectPath)}`);
      }
      process.stdout.write(`[${path.basename(projectPath)}] ${output}`);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(`[${path.basename(projectPath)}] ${data}`);
    });
    
    child.on('error', (error) => {
      logError(`Failed to start server for ${path.basename(projectPath)}: ${error.message}`);
    });
    
    return child;
  } catch (error) {
    logError(`Failed to start server for ${path.basename(projectPath)}: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  log('🚀 Fullstack App Generator - Build and Run Script', 'bright');
  log('================================================', 'bright');
  
  // Step 1: Build the main application
  log('\n📦 Step 1: Building the main application...', 'cyan');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Main application built successfully');
  } catch (error) {
    logError('Failed to build the main application');
    process.exit(1);
  }
  
  // Step 2: Find all projects (extracted ZIP files or project directories)
  log('\n🔍 Step 2: Scanning for projects...', 'cyan');
  
  const projectsDir = path.join(__dirname, 'projects');
  const downloadsDir = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');
  
  let projectPaths = [];
  
  // Check if projects directory exists
  if (fs.existsSync(projectsDir)) {
    const projects = await readdir(projectsDir);
    for (const project of projects) {
      const projectPath = path.join(projectsDir, project);
      const stats = await stat(projectPath);
      if (stats.isDirectory()) {
        projectPaths.push(projectPath);
      }
    }
  }
  
  // Check Downloads directory for extracted ZIP files
  if (fs.existsSync(downloadsDir)) {
    try {
      const downloads = await readdir(downloadsDir);
      for (const item of downloads) {
        const itemPath = path.join(downloadsDir, item);
        const stats = await stat(itemPath);
        if (stats.isDirectory() && item.includes('fullstack') || item.includes('my-fullstack')) {
          projectPaths.push(itemPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }
  
  if (projectPaths.length === 0) {
    logWarning('No projects found. Please export a project first using the app.');
    logInfo('The script will look for projects in:');
    logInfo(`  - ${projectsDir}`);
    logInfo(`  - ${downloadsDir} (folders containing 'fullstack' or 'my-fullstack')`);
    return;
  }
  
  logSuccess(`Found ${projectPaths.length} project(s)`);
  
  // Step 3: Install dependencies for each project
  log('\n📦 Step 3: Installing dependencies...', 'cyan');
  const packageJsonFiles = [];
  
  for (const projectPath of projectPaths) {
    const files = await findPackageJsonFiles(projectPath);
    packageJsonFiles.push(...files);
  }
  
  for (const packageJsonPath of packageJsonFiles) {
    const projectDir = path.dirname(packageJsonPath);
    installDependencies(projectDir);
  }
  
  // Step 4: Start servers
  log('\n🚀 Step 4: Starting servers...', 'cyan');
  const servers = [];
  let currentPort = 3000;
  
  for (const packageJsonPath of packageJsonFiles) {
    const projectDir = path.dirname(packageJsonPath);
    const projectName = path.basename(projectDir);
    
    // Check if this is a frontend or backend project
    const isFrontend = projectName.includes('frontend') || 
                      fs.existsSync(path.join(projectDir, 'src', 'App.js')) ||
                      fs.existsSync(path.join(projectDir, 'src', 'App.tsx')) ||
                      fs.existsSync(path.join(projectDir, 'src', 'app'));
    
    const isBackend = projectName.includes('backend') ||
                     fs.existsSync(path.join(projectDir, 'server.js')) ||
                     fs.existsSync(path.join(projectDir, 'app.js')) ||
                     fs.existsSync(path.join(projectDir, 'index.js'));
    
    // Assign ports based on project type
    let port = currentPort;
    if (isFrontend) {
      port = 3000;
    } else if (isBackend) {
      port = 5000;
    } else {
      port = currentPort++;
    }
    
    const server = startServer(projectDir, port);
    if (server) {
      servers.push({
        name: projectName,
        port: port,
        process: server,
        url: `http://localhost:${port}`
      });
    }
    
    // Wait a bit between starting servers
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 5: Open URLs in browser
  log('\n🌐 Step 5: Opening URLs in browser...', 'cyan');
  
  // Wait a bit for servers to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  for (const server of servers) {
    logInfo(`Opening ${server.name} at ${server.url}`);
    openUrl(server.url);
    
    // Wait a bit between opening URLs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Step 6: Show summary
  log('\n📊 Summary:', 'cyan');
  log(`Main application: http://localhost:3000 (if running)`);
  
  for (const server of servers) {
    log(`${server.name}: ${server.url}`);
  }
  
  log('\n💡 Tips:', 'yellow');
  log('- Press Ctrl+C to stop all servers');
  log('- Check the console output for any errors');
  log('- Make sure ports 3000, 5000, etc. are not already in use');
  
  // Keep the script running
  log('\n🔄 Keeping servers running... (Press Ctrl+C to stop)', 'green');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down servers...', 'yellow');
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
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, installDependencies, startServer, openUrl }; 