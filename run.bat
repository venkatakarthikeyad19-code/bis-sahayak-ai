@echo off
setlocal enabledelayedexpansion
title BIS Sahayak AI - Launcher

echo ================================================================
echo           BIS SAHAYAK AI - FROM PRODUCT IDEA TO BIS READINESS
echo                   Smart India Hackathon Prototype
echo ================================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

echo [1/3] Checking Backend Python Environment...
set "VENV_OK=0"
if exist "%BACKEND_DIR%\venv\Scripts\python.exe" (
    "%BACKEND_DIR%\venv\Scripts\python.exe" -c "import sys" >nul 2>&1
    if !errorlevel! equ 0 (
        set "VENV_OK=1"
    ) else (
        echo [WARN] Existing venv is invalid or from another computer. Recreating...
        rmdir /s /q "%BACKEND_DIR%\venv"
    )
)

if "!VENV_OK!"=="0" (
    echo [INFO] Creating Python virtual environment...
    cd /d "%BACKEND_DIR%"
    python -m venv venv
    echo [INFO] Installing Python requirements...
    call "%BACKEND_DIR%\venv\Scripts\pip.exe" install -r requirements.txt
) else (
    echo [OK] Backend virtual environment found and verified.
)

echo.
echo [2/3] Checking Frontend Dependencies...
if not exist "%FRONTEND_DIR%\node_modules\.bin\next.cmd" (
    echo [INFO] Installing frontend packages ^(this takes about 1-2 minutes^)...
    cd /d "%FRONTEND_DIR%"
    call npm install
) else (
    echo [OK] Frontend packages already installed.
)

echo.
echo [3/3] Launching BIS Sahayak AI Services...
echo.
echo Launching Backend API on http://127.0.0.1:8000 ...
pushd "%BACKEND_DIR%"
start "BIS Sahayak AI - Backend (Port 8000)" cmd /k "title BIS Sahayak AI - Backend (Port 8000) && .\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
popd

echo Launching Frontend UI on http://localhost:3000 ...
pushd "%FRONTEND_DIR%"
start "BIS Sahayak AI - Frontend (Port 3000)" cmd /k "title BIS Sahayak AI - Frontend (Port 3000) && npm run dev"
popd

echo.
echo ================================================================
echo  Servers are starting up in the two new console windows!
echo.
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend API Docs: http://localhost:8000/docs
echo.
echo  You can now open your browser and navigate to:
echo  http://localhost:3000
echo ================================================================
echo.
echo Press any key to exit this launcher window (servers will remain running).
pause >nul
