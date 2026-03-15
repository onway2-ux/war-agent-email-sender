@echo off
setlocal
:: Ensure we are in the script's directory
cd /d "%~dp0"

echo ------------------------------------------
echo Starting AI Agent Command Center Dashboard
echo ------------------------------------------

if not exist dashboard\node_modules (
    echo [ERROR] Dependencies not found. Run 'npm install' in dashboard folder first.
    pause
    exit /b
)

cd dashboard
call npm run dev

echo.
echo Dashboard has stopped.
pause
