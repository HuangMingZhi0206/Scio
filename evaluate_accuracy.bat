@echo off
title Scio RAG Evaluation
color 0D

echo ============================================
echo    SCIO RAG ACCURACY EVALUATION
echo ============================================
echo.
echo This will test the chatbot accuracy with 10 test cases:
echo - 8 IT questions (should be answered)
echo - 2 Non-IT questions (should be rejected)
echo.
echo Make sure backend is running first!
echo.
pause

cd /d "%~dp0backend"

echo.
echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Running evaluation...
echo ============================================
echo.

python scripts/evaluate_rag.py

echo.
pause
