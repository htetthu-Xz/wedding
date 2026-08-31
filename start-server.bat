@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Wedding Planner - Live Server

echo.
echo  Wedding Planner - local server
echo  --------------------------------------------------
echo  URL:  http://localhost:8080/planner.html
echo  Home: http://localhost:8080/wedding.html
echo.
echo  Press Ctrl+C to stop.
echo.

where node >nul 2>&1
if errorlevel 1 goto try_python

if not exist "node_modules\live-server" (
    echo Installing live-server - first run only...
    call npm install
    if errorlevel 1 (
        echo npm install failed. Trying Python server instead...
        goto try_python
    )
    echo.
)

call npm start
if errorlevel 1 (
    echo npm start failed. Trying Python server instead...
    goto try_python
)
goto end

:try_python
where python >nul 2>&1
if errorlevel 1 goto no_runtime

echo Node not found or failed. Using Python server - no auto-reload.
echo Open http://localhost:8080/planner.html in your browser.
python -m http.server 8080
goto end

:no_runtime
echo.
echo ERROR: Install Node.js or Python to run a local server.
echo   Node: https://nodejs.org/
echo   Python: https://www.python.org/
echo.
pause

:end
endlocal
