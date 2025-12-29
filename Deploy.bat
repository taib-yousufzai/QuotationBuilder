@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: Lifeasy Interior - Quotation Builder Deployment Script
:: =============================================================================

echo.
echo ========================================
echo  Lifeasy Interior - Quotation Builder
echo  Deployment Script v1.0
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not available
    echo Please ensure npm is installed with Node.js
    pause
    exit /b 1
)

echo [INFO] Node.js and npm are available
echo.

:: Display deployment options
echo Select deployment option:
echo.
echo 1. Build for Production (dist folder)
echo 2. Deploy to Firebase Hosting
echo 3. Deploy to Netlify
echo 4. Deploy to Vercel
echo 5. Build and Preview Locally
echo 6. Full Clean Build (delete node_modules)
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto :build_production
if "%choice%"=="2" goto :deploy_firebase
if "%choice%"=="3" goto :deploy_netlify
if "%choice%"=="4" goto :deploy_vercel
if "%choice%"=="5" goto :build_preview
if "%choice%"=="6" goto :clean_build
if "%choice%"=="7" goto :exit
goto :invalid_choice

:build_production
echo.
echo ========================================
echo  Building for Production
echo ========================================
echo.

echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [INFO] Building production bundle...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Production build completed!
echo [INFO] Files are ready in the 'dist' folder
echo [INFO] You can upload the 'dist' folder contents to any web server
echo.

:: Display build statistics
if exist "dist" (
    echo Build Statistics:
    echo ==================
    for /f %%i in ('dir /s /b dist\*.* ^| find /c /v ""') do echo Total files: %%i
    for /f "tokens=3" %%i in ('dir /s dist 2^>nul ^| find "File(s)"') do echo Total size: %%i bytes
    echo.
)

echo [INFO] To test the build locally, run: npm run preview
pause
goto :end

:deploy_firebase
echo.
echo ========================================
echo  Deploying to Firebase Hosting
echo ========================================
echo.

:: Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Firebase CLI not found. Installing...
    call npm install -g firebase-tools
    if errorlevel 1 (
        echo [ERROR] Failed to install Firebase CLI
        echo Please install manually: npm install -g firebase-tools
        pause
        exit /b 1
    )
)

echo [INFO] Building for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [INFO] Initializing Firebase (if not already done)...
if not exist "firebase.json" (
    echo [ERROR] Firebase configuration missing!
    echo [INFO] Firebase configuration files should be present
    echo [INFO] Please ensure firebase.json exists in the project root
    pause
    exit /b 1
)

echo [INFO] Using Firebase project: quotationbuilder-d79e9
echo [INFO] Deploying to Firebase Hosting...
call firebase deploy --only hosting
if errorlevel 1 (
    echo [ERROR] Firebase deployment failed
    echo [INFO] Make sure you're logged in: firebase login
    echo [INFO] Your project ID: quotationbuilder-d79e9
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployed to Firebase Hosting!
echo [INFO] Your app should be available at your Firebase hosting URL
pause
goto :end

:deploy_netlify
echo.
echo ========================================
echo  Deploying to Netlify
echo ========================================
echo.

:: Check if Netlify CLI is installed
netlify --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Netlify CLI not found. Installing...
    call npm install -g netlify-cli
    if errorlevel 1 (
        echo [ERROR] Failed to install Netlify CLI
        echo Please install manually: npm install -g netlify-cli
        pause
        exit /b 1
    )
)

echo [INFO] Building for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [INFO] Deploying to Netlify...
echo [INFO] You may need to login to Netlify first
call netlify deploy --prod --dir=dist
if errorlevel 1 (
    echo [ERROR] Netlify deployment failed
    echo [INFO] Try running 'netlify login' first
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployed to Netlify!
pause
goto :end

:deploy_vercel
echo.
echo ========================================
echo  Deploying to Vercel
echo ========================================
echo.

:: Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Vercel CLI not found. Installing...
    call npm install -g vercel
    if errorlevel 1 (
        echo [ERROR] Failed to install Vercel CLI
        echo Please install manually: npm install -g vercel
        pause
        exit /b 1
    )
)

echo [INFO] Deploying to Vercel...
echo [INFO] You may need to login to Vercel first
call vercel --prod
if errorlevel 1 (
    echo [ERROR] Vercel deployment failed
    echo [INFO] Try running 'vercel login' first
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployed to Vercel!
pause
goto :end

:build_preview
echo.
echo ========================================
echo  Building and Previewing Locally
echo ========================================
echo.

echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [INFO] Building for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [INFO] Starting preview server...
echo [INFO] Press Ctrl+C to stop the server
echo.
call npm run preview

pause
goto :end

:clean_build
echo.
echo ========================================
echo  Clean Build (Full Reinstall)
echo ========================================
echo.

echo [WARNING] This will delete node_modules and package-lock.json
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" goto :end

echo [INFO] Cleaning up...
if exist "node_modules" (
    echo [INFO] Removing node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo [INFO] Removing package-lock.json...
    del package-lock.json
)

if exist "dist" (
    echo [INFO] Removing old build...
    rmdir /s /q dist
)

echo [INFO] Installing fresh dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [INFO] Building production bundle...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Clean build completed!
pause
goto :end

:invalid_choice
echo.
echo [ERROR] Invalid choice. Please select 1-7.
echo.
pause
goto :end

:exit
echo.
echo Goodbye!
goto :end

:end
echo.
echo ========================================
echo  Deployment Script Finished
echo ========================================
endlocal