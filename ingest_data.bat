@echo off
title Scio Data Ingestion
color 0D

echo ============================================
echo    SCIO KNOWLEDGE BASE INGESTION
echo ============================================
echo.
echo This will load all datasets into ChromaDB.
echo This may take 2-5 minutes depending on your system.
echo.
pause

cd /d "%~dp0backend"

echo.
echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Starting data ingestion...
echo ============================================
echo.

python scripts/ingest_data.py

echo.
echo ============================================
echo    INGESTION COMPLETE!
echo ============================================
echo.
echo You can now start the chatbot with start_all.bat
echo.
pause
