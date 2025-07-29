# Build and Run Scripts

Scripts to automatically build the main application, find generated projects, install dependencies, and start servers.

## Available Scripts

### 1. `build-and-run.js` (Node.js - Cross-platform)
Automatically builds, installs dependencies, starts servers, and opens URLs.

```bash
node build-and-run.js
```

### 2. `build-and-run.ps1` (PowerShell - Windows)
Advanced version with parameters and custom options.

```powershell
# Basic usage
.\build-and-run.ps1

# Skip build step
.\build-and-run.ps1 -SkipBuild

# Custom project path
.\build-and-run.ps1 -ProjectsPath "C:\MyProjects"

# Custom ports
.\build-and-run.ps1 -FrontendPort 3001 -BackendPort 5001
```

### 3. `build-and-run.bat` (Batch - Windows)
Simple batch file for basic operations.

```cmd
build-and-run.bat
```

## How It Works

1. **Builds** the main application
2. **Scans** for projects in:
   - `./projects/` directory
   - `~/Downloads/` (folders with 'fullstack' or 'my-fullstack')
3. **Installs** dependencies for each project
4. **Starts** servers automatically
5. **Opens** URLs in browser

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Usage Workflow

1. **Export** a project from the Fullstack App Generator
2. **Extract** the ZIP file to Downloads or projects folder
3. **Run** the script:
   ```bash
   node build-and-run.js
   ```

## Project Detection

The scripts automatically detect:
- **Frontend**: Contains `src/App.js`, `src/App.tsx`, or `src/app/`
- **Backend**: Contains `server.js`, `app.js`, or `index.js`
- **Ports**: Frontend (3000), Backend (5000), others (incremental)

## Troubleshooting

### "No projects found"
- Export a project first using the app
- Check `~/Downloads/` for extracted ZIP files

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
- ✅ Parameter support (PowerShell)
- ✅ Custom project paths (PowerShell) 