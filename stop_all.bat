@echo off
title Stop All Scio Services
color 0C

echo ============================================
echo    STOPPING ALL SCIO SERVICES
echo ============================================
echo.

echo Stopping Node.js (Frontend)...
taskkill /F /IM node.exe 2>NUL
echo.

echo Stopping Python (Backend)...
taskkill /F /IM python.exe 2>NUL
echo.

echo.
echo ============================================
echo    ALL SERVICES STOPPED!
echo ============================================
echo.
echo Note: Ollama is still running (shared service).
echo To stop Ollama, run: taskkill /F /IM ollama.exe
echo.
pause
