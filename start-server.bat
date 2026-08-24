@echo off
cd /d "%~dp0"
title Wedding Planner - Live Server

echo.
echo  Wedding Planner - local server (Live Server style)
echo  --------------------------------------------------
echo  URL:  http://localhost:8080/planner.html
echo  Home: http://localhost:8080/wedding.html
echo.
echo  Press Ctrl+C to stop.
echo.

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    if not exist "node_modules\live-server" (
        echo Installing live-server (first run only)...
        call npm install
        echo.
    )
    call npm start
    goto :done
)

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node not found — using Python server (no auto-reload).
    echo Open http://localhost:8080/planner.html in your browser.
    python -m http.server 8080
    goto :done
)

echo ERROR: Install Node.js or Python to run a local server.
pause

:done
