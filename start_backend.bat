@echo off
title Scio Backend Server
color 0A

echo ============================================
echo    SCIO BACKEND SERVER
echo ============================================
echo.

cd /d "%~dp0backend"

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Starting FastAPI server on port 8000...
echo API Docs: http://localhost:8000/docs
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
