$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host " Wedding Planner - local server"
Write-Host " --------------------------------------------------"
Write-Host " URL:  http://localhost:8080/planner.html"
Write-Host " Home: http://localhost:8080/wedding.html"
Write-Host ""
Write-Host " Press Ctrl+C to stop."
Write-Host ""

function Start-PythonServer {
    Write-Host "Using Python server - no auto-reload."
    python -m http.server 8080
}

try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node not found"
    }

    if (-not (Test-Path "node_modules\live-server")) {
        Write-Host "Installing live-server - first run only..."
        npm install
    }

    npm start
}
catch {
    Write-Host "Falling back to Python server..."
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Start-PythonServer
    }
    else {
        Write-Host ""
        Write-Host "ERROR: Install Node.js or Python to run a local server."
        Read-Host "Press Enter to close"
    }
}
