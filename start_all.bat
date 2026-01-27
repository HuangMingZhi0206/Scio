@echo off
title Scio IT Helpdesk - Full System Startup
color 0B

echo ============================================
echo    SCIO IT HELPDESK RAG CHATBOT
echo    Starting All Services...
echo ============================================
echo.

:: Check if Ollama is running
echo [1/3] Checking Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       Ollama is already running!
) else (
    echo       Starting Ollama...
    start "Ollama Server" cmd /k "ollama serve"
    timeout /t 3 /nobreak >NUL
)

:: Start Backend
echo.
echo [2/3] Starting Backend Server...
cd /d "%~dp0backend"
start "Scio Backend" cmd /k "call venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to initialize
timeout /t 5 /nobreak >NUL

:: Start Frontend
echo.
echo [3/3] Starting Frontend Server...
cd /d "%~dp0frontend"
start "Scio Frontend" cmd /k "npm run dev"

:: Wait and open browser
timeout /t 8 /nobreak >NUL

echo.
echo ============================================
echo    ALL SERVICES STARTED!
echo ============================================
echo.
echo    Backend API:  http://localhost:8000
echo    Frontend UI:  http://localhost:3000
echo    API Docs:     http://localhost:8000/docs
echo.
echo    Opening browser...
echo ============================================

start http://localhost:3000

echo.
echo Press any key to close this window...
pause >NUL
