# =============================================================================
# Lifeasy Interior - Quotation Builder Deployment Script (PowerShell)
# =============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Lifeasy Interior - Quotation Builder" -ForegroundColor Cyan
Write-Host " Deployment Script v1.0 (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Node.js not found" }
    Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "npm not found" }
    Write-Host "[INFO] npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm is not available" -ForegroundColor Red
    Write-Host "Please ensure npm is installed with Node.js" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Display deployment options
Write-Host "Select deployment option:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Build for Production (dist folder)" -ForegroundColor White
Write-Host "2. Deploy to Firebase Hosting" -ForegroundColor White
Write-Host "3. Deploy to Netlify" -ForegroundColor White
Write-Host "4. Deploy to Vercel" -ForegroundColor White
Write-Host "5. Build and Preview Locally" -ForegroundColor White
Write-Host "6. Full Clean Build (delete node_modules)" -ForegroundColor White
Write-Host "7. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-7)"

switch ($choice) {
    "1" { Build-Production }
    "2" { Deploy-Firebase }
    "3" { Deploy-Netlify }
    "4" { Deploy-Vercel }
    "5" { Build-Preview }
    "6" { Clean-Build }
    "7" { 
        Write-Host ""
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "[ERROR] Invalid choice. Please select 1-7." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

function Build-Production {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Building for Production" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Building production bundle..." -ForegroundColor Blue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "[SUCCESS] Production build completed!" -ForegroundColor Green
    Write-Host "[INFO] Files are ready in the 'dist' folder" -ForegroundColor Blue
    Write-Host "[INFO] You can upload the 'dist' folder contents to any web server" -ForegroundColor Blue
    Write-Host ""

    # Display build statistics
    if (Test-Path "dist") {
        Write-Host "Build Statistics:" -ForegroundColor Yellow
        Write-Host "=================" -ForegroundColor Yellow
        $fileCount = (Get-ChildItem -Recurse dist | Where-Object { !$_.PSIsContainer }).Count
        $totalSize = (Get-ChildItem -Recurse dist | Where-Object { !$_.PSIsContainer } | Measure-Object -Property Length -Sum).Sum
        Write-Host "Total files: $fileCount" -ForegroundColor White
        Write-Host "Total size: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor White
        Write-Host ""
    }

    Write-Host "[INFO] To test the build locally, run: npm run preview" -ForegroundColor Blue
    Read-Host "Press Enter to continue"
}

function Deploy-Firebase {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Deploying to Firebase Hosting" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if Firebase CLI is installed
    try {
        firebase --version 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Firebase CLI not found" }
        Write-Host "[INFO] Firebase CLI is available" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Firebase CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g firebase-tools
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install Firebase CLI" -ForegroundColor Red
            Write-Host "Please install manually: npm install -g firebase-tools" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    Write-Host "[INFO] Building for production..." -ForegroundColor Blue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Checking Firebase configuration..." -ForegroundColor Blue
    if (!(Test-Path "firebase.json")) {
        Write-Host "[ERROR] Firebase configuration missing!" -ForegroundColor Red
        Write-Host "[INFO] firebase.json should exist in the project root" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Using Firebase project: quotationbuilder-d79e9" -ForegroundColor Blue
    Write-Host "[INFO] Deploying to Firebase Hosting..." -ForegroundColor Blue
    
    firebase deploy --only hosting
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Firebase deployment failed" -ForegroundColor Red
        Write-Host "[INFO] Make sure you're logged in: firebase login" -ForegroundColor Yellow
        Write-Host "[INFO] Your project ID: quotationbuilder-d79e9" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "[SUCCESS] Deployed to Firebase Hosting!" -ForegroundColor Green
    Write-Host "[INFO] Your app should be available at: https://quotationbuilder-d79e9.firebaseapp.com" -ForegroundColor Blue
    Read-Host "Press Enter to continue"
}

function Deploy-Netlify {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Deploying to Netlify" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if Netlify CLI is installed
    try {
        netlify --version 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Netlify CLI not found" }
        Write-Host "[INFO] Netlify CLI is available" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Netlify CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g netlify-cli
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install Netlify CLI" -ForegroundColor Red
            Write-Host "Please install manually: npm install -g netlify-cli" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    Write-Host "[INFO] Building for production..." -ForegroundColor Blue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Deploying to Netlify..." -ForegroundColor Blue
    Write-Host "[INFO] You may need to login to Netlify first" -ForegroundColor Yellow
    
    netlify deploy --prod --dir=dist
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Netlify deployment failed" -ForegroundColor Red
        Write-Host "[INFO] Try running 'netlify login' first" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "[SUCCESS] Deployed to Netlify!" -ForegroundColor Green
    Read-Host "Press Enter to continue"
}

function Deploy-Vercel {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Deploying to Vercel" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if Vercel CLI is installed
    try {
        vercel --version 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Vercel CLI not found" }
        Write-Host "[INFO] Vercel CLI is available" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Vercel CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install Vercel CLI" -ForegroundColor Red
            Write-Host "Please install manually: npm install -g vercel" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
    }

    Write-Host "[INFO] Deploying to Vercel..." -ForegroundColor Blue
    Write-Host "[INFO] You may need to login to Vercel first" -ForegroundColor Yellow
    
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Vercel deployment failed" -ForegroundColor Red
        Write-Host "[INFO] Try running 'vercel login' first" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "[SUCCESS] Deployed to Vercel!" -ForegroundColor Green
    Read-Host "Press Enter to continue"
}

function Build-Preview {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Building and Previewing Locally" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Building for production..." -ForegroundColor Blue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Starting preview server..." -ForegroundColor Blue
    Write-Host "[INFO] Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    npm run preview
    Read-Host "Press Enter to continue"
}

function Clean-Build {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Clean Build (Full Reinstall)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "[WARNING] This will delete node_modules and package-lock.json" -ForegroundColor Yellow
    $confirm = Read-Host "Are you sure? (y/N)"
    
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        return
    }

    Write-Host "[INFO] Cleaning up..." -ForegroundColor Blue
    
    if (Test-Path "node_modules") {
        Write-Host "[INFO] Removing node_modules..." -ForegroundColor Blue
        Remove-Item -Recurse -Force node_modules
    }

    if (Test-Path "package-lock.json") {
        Write-Host "[INFO] Removing package-lock.json..." -ForegroundColor Blue
        Remove-Item package-lock.json
    }

    if (Test-Path "dist") {
        Write-Host "[INFO] Removing old build..." -ForegroundColor Blue
        Remove-Item -Recurse -Force dist
    }

    Write-Host "[INFO] Installing fresh dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host "[INFO] Building production bundle..." -ForegroundColor Blue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-Host ""
    Write-Host "[SUCCESS] Clean build completed!" -ForegroundColor Green
    Read-Host "Press Enter to continue"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Deployment Script Finished" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan