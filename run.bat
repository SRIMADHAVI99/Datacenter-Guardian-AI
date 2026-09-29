@echo off
title DATACENTER GUARDIAN AI
echo ========================================================
echo         DATACENTER GUARDIAN AI - SYSTEM STARTUP
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Guardian AI Backend" /D "%~dp0backend" python main.py

echo Starting Vite React Frontend on http://127.0.0.1:5173 ...
start "Guardian AI Frontend" /D "%~dp0frontend" npm run dev -- --host 127.0.0.1

echo.
echo ========================================================
echo Application running:
echo - Frontend Dashboard: http://127.0.0.1:5173
echo - Backend API Docs:   http://127.0.0.1:8000/docs
echo ========================================================
pause
