[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
System.Text.ASCIIEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ComicReader - Yi Jian Qi Dong" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "[Info] Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

$needBuild = $false
if (-not (Test-Path "$ROOT\server\dist")) { $needBuild = $true }
if (-not (Test-Path "$ROOT\server\static\index.html")) { $needBuild = $true }

if ($needBuild) {
    Write-Host "[Info] Building project..." -ForegroundColor Yellow
    Set-Location $ROOT
    pnpm install
    if ($LASTEXITCODE -ne 0) { Write-Host "[Error] Install failed" -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }
    pnpm --filter server build
    if ($LASTEXITCODE -ne 0) { Write-Host "[Error] Server build failed" -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }
    pnpm --filter web build
    if ($LASTEXITCODE -ne 0) { Write-Host "[Error] Web build failed" -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }
    if (-not (Test-Path "$ROOT\server\static")) { New-Item -ItemType Directory -Path "$ROOT\server\static" | Out-Null }
    Copy-Item -Path "$ROOT\web\dist\*" -Destination "$ROOT\server\static\" -Recurse -Force
    pnpm --filter server db:push
    Write-Host "[Info] Build complete!" -ForegroundColor Green
}

Write-Host "[Info] Starting server..." -ForegroundColor Yellow
Write-Host "[Info] URL: http://localhost:8080" -ForegroundColor Green
Write-Host ""

Set-Location "$ROOT\server"
Start-Process "http://localhost:8080"
node dist/index.js