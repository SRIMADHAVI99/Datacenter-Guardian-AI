# DataCenter Guardian AI - Quick Start Launcher
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   DATACENTER GUARDIAN AI - SYSTEM START" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start Backend FastAPI
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "main.py" -WorkingDirectory "$PSScriptRoot\backend"

# 2. Start Frontend Vite
Write-Host "[2/2] Launching Vite React Frontend on http://127.0.0.1:5173..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev", "--", "--host", "127.0.0.1" -WorkingDirectory "$PSScriptRoot\frontend"

Write-Host ""
Write-Host "Dashboard Available at: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "API Swagger Docs at:    http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to terminate services." -ForegroundColor Gray
