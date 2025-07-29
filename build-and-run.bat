@echo off
setlocal enabledelayedexpansion

REM Fullstack App Generator - Build and Run Script (Batch)
REM This script builds the main application and helps run generated projects

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

REM Step 1: Build the main application
echo 📦 Step 1: Building the main application...
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build the main application
    pause
    exit /b 1
)
echo ✓ Main application built successfully
echo.

REM Step 2: Find projects
echo 🔍 Step 2: Scanning for projects...
set "projectsDir=%~dp0projects"
set "downloadsDir=%USERPROFILE%\Downloads"
set "foundProjects="

REM Check projects directory
if exist "%projectsDir%" (
    for /d %%i in ("%projectsDir%\*") do (
        if exist "%%i\package.json" (
            set "foundProjects=!foundProjects! %%i"
        )
    )
)

REM Check Downloads directory
if exist "%downloadsDir%" (
    for /d %%i in ("%downloadsDir%\*") do (
        echo %%i | findstr /i "fullstack" >nul
        if not errorlevel 1 (
            if exist "%%i\package.json" (
                set "foundProjects=!foundProjects! %%i"
            )
        )
    )
)

if "!foundProjects!"=="" (
    echo ⚠ No projects found. Please export a project first using the app.
    echo The script will look for projects in:
    echo   - %projectsDir%
    echo   - %downloadsDir% (folders containing 'fullstack')
    echo.
    pause
    exit /b 0
)

echo ✓ Found projects
echo.

REM Step 3: Install dependencies
echo 📦 Step 3: Installing dependencies...
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

REM Step 4: Start servers
echo 🚀 Step 4: Starting servers...
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

pause 