@echo off
echo ========================================
echo Quotation Builder - Installation
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Dependencies installed successfully!
echo.
echo ========================================
echo IMPORTANT: Configure Firebase
echo ========================================
echo.
echo Before running the app, you need to:
echo 1. Create a Firebase project at https://console.firebase.google.com/
echo 2. Enable Firestore Database
echo 3. Copy your Firebase config
echo 4. Update src/firebase.js with your config
echo.
echo See FIREBASE_SETUP.md for detailed instructions
echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
pause
