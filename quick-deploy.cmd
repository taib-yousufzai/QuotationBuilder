@echo off
echo.
echo ========================================
echo  Quick Firebase Deploy
echo ========================================
echo.

echo [INFO] Building for production...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [INFO] Deploying to Firebase...
call firebase deploy --only hosting
if errorlevel 1 (
    echo [ERROR] Firebase deployment failed
    echo [INFO] Make sure you're logged in: firebase login
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployed to Firebase!
echo [INFO] Your app is live at: https://quotationbuilder-d79e9.firebaseapp.com
echo.
pause