@echo off
title Scio Frontend Server
color 0E

echo ============================================
echo    SCIO FRONTEND SERVER
echo ============================================
echo.

cd /d "%~dp0frontend"

echo Starting Next.js development server...
echo Frontend UI: http://localhost:3000
echo.

npm run dev

pause
