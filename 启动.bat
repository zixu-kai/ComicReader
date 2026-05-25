@echo off
setlocal

set "ROOT=%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install Node.js 20+ first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing pnpm...
    npm install -g pnpm
)

if not exist "%ROOT%server\dist" goto :BUILD
if not exist "%ROOT%server\static\index.html" goto :BUILD
goto :START

:BUILD
echo [INFO] Building project...
cd /d "%ROOT%"
pnpm install
if %errorlevel% neq 0 (echo [ERROR] Install failed & pause & exit /b 1)
pnpm --filter server build
if %errorlevel% neq 0 (echo [ERROR] Server build failed & pause & exit /b 1)
pnpm --filter web build
if %errorlevel% neq 0 (echo [ERROR] Web build failed & pause & exit /b 1)
if not exist "%ROOT%server\static" mkdir "%ROOT%server\static"
xcopy /e /i /q /y "%ROOT%web\dist\*" "%ROOT%server\static\"
if %errorlevel% neq 0 (echo [ERROR] Static copy failed & pause & exit /b 1)
pnpm --filter server db:push
echo [INFO] Build complete!

:START
netstat -ano | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARN] Port 8080 is in use, releasing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING"') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo [INFO] Starting server...
echo [INFO] URL: http://localhost:8080
echo [INFO] Press Ctrl+C to stop
echo.

cd /d "%ROOT%server"
start http://localhost:8080
node dist/index.js

endlocal