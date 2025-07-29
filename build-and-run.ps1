# Fullstack App Generator - Build and Run Script (PowerShell)
# This script builds the main application, finds generated projects, installs dependencies, and starts servers

param(
    [switch]$SkipBuild,
    [switch]$SkipInstall,
    [switch]$SkipStart,
    [string]$ProjectsPath = "",
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
    
    # Step 1: Build the main application
    if (-not $SkipBuild) {
        Write-Info "Step 1: Building the main application..."
        try {
            npm run build
            Write-Success "Main application built successfully"
        }
        catch {
            Write-Error "Failed to build the main application"
            exit 1
        }
    }
    else {
        Write-Info "Skipping build step..."
    }
    
    # Step 2: Find all projects
    Write-Info "Step 2: Scanning for projects..."
    
    $projectPaths = @()
    
    # Check if projects directory exists
    $projectsDir = Join-Path $PSScriptRoot "projects"
    if (Test-Path $projectsDir) {
        $projects = Get-ChildItem -Path $projectsDir -Directory
        foreach ($project in $projects) {
            $projectPaths += $project.FullName
        }
    }
    
    # Check Downloads directory for extracted ZIP files
    $downloadsDir = [Environment]::GetFolderPath("UserProfile") + "\Downloads"
    if (Test-Path $downloadsDir) {
        $downloads = Get-ChildItem -Path $downloadsDir -Directory
        foreach ($item in $downloads) {
            if ($item.Name -like "*fullstack*" -or $item.Name -like "*my-fullstack*") {
                $projectPaths += $item.FullName
            }
        }
    }
    
    # Check custom projects path if provided
    if ($ProjectsPath -and (Test-Path $ProjectsPath)) {
        $customProjects = Get-ChildItem -Path $ProjectsPath -Directory
        foreach ($project in $customProjects) {
            $projectPaths += $project.FullName
        }
    }
    
    if ($projectPaths.Count -eq 0) {
        Write-Warning "No projects found. Please export a project first using the app."
        Write-Info "The script will look for projects in:"
        Write-Info "  - $projectsDir"
        Write-Info "  - $downloadsDir (folders containing 'fullstack' or 'my-fullstack')"
        if ($ProjectsPath) {
            Write-Info "  - $ProjectsPath (custom path)"
        }
        return
    }
    
    Write-Success "Found $($projectPaths.Count) project(s)"
    
    # Step 3: Install dependencies for each project
    if (-not $SkipInstall) {
        Write-Info "Step 3: Installing dependencies..."
        $packageJsonFiles = @()
        
        foreach ($projectPath in $projectPaths) {
            $files = Find-PackageJsonFiles -Directory $projectPath
            $packageJsonFiles += $files
        }
        
        foreach ($packageJsonPath in $packageJsonFiles) {
            $projectDir = Split-Path $packageJsonPath -Parent
            Install-Dependencies -ProjectPath $projectDir
        }
    }
    else {
        Write-Info "Skipping dependency installation..."
    }
    
    # Step 4: Start servers
    if (-not $SkipStart) {
        Write-Info "Step 4: Starting servers..."
        $servers = @()
        $currentPort = 3000
        
        foreach ($packageJsonPath in $packageJsonFiles) {
            $projectDir = Split-Path $packageJsonPath -Parent
            $projectName = Split-Path $projectDir -Leaf
            
            # Check if this is a frontend or backend project
            $isFrontend = $projectName -like "*frontend*" -or 
                         (Test-Path (Join-Path $projectDir "src\App.js")) -or
                         (Test-Path (Join-Path $projectDir "src\App.tsx")) -or
                         (Test-Path (Join-Path $projectDir "src\app"))
            
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
        
        # Step 5: Open URLs in browser
        Write-Info "Step 5: Opening URLs in browser..."
        
        # Wait a bit for servers to start
        Start-Sleep -Seconds 5
        
        foreach ($server in $servers) {
            Write-Info "Opening $($server.Name) at $($server.URL)"
            Open-URL -URL $server.URL
            
            # Wait a bit between opening URLs
            Start-Sleep -Seconds 1
        }
        
        # Step 6: Show summary
        Write-Info "Summary:"
        Write-Info "Main application: http://localhost:3000 (if running)"
        
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
} 