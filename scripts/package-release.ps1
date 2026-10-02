param(
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$PKG = Join-Path $ROOT "release\OwnShelf-$Version"

Write-Host "=== 打包 OwnShelf-$Version ===" -ForegroundColor Cyan
if (Test-Path $PKG) { Remove-Item $PKG -Recurse -Force }
New-Item -ItemType Directory -Path "$PKG\server", "$PKG\web", "$PKG\shared" -Force | Out-Null

# 顶层文件
foreach ($f in @("package.json", "Dockerfile", "entrypoint.sh", ".env.example", ".dockerignore", ".npmrc", "README.md", "LICENSE")) {
    $src = Join-Path $ROOT $f
    if (Test-Path $src) { Copy-Item $src $PKG }
}

# 部署用 compose（build: .）
Copy-Item (Join-Path $ROOT "scripts\nas-docker-compose.yaml") (Join-Path $PKG "docker-compose.yaml")

# 后端源码
foreach ($f in @("package.json", "tsconfig.json", "tsup.config.ts", "drizzle.config.ts")) {
    $src = Join-Path $ROOT "server\$f"
    if (Test-Path $src) { Copy-Item $src "$PKG\server\" }
}
Copy-Item (Join-Path $ROOT "server\src") "$PKG\server\src" -Recurse
if (Test-Path (Join-Path $ROOT "server\drizzle")) { Copy-Item (Join-Path $ROOT "server\drizzle") "$PKG\server\drizzle" -Recurse }

# 前端源码
foreach ($f in @("package.json", "tsconfig.json", "vite.config.ts", "index.html")) {
    $src = Join-Path $ROOT "web\$f"
    if (Test-Path $src) { Copy-Item $src "$PKG\web\" }
}
Copy-Item (Join-Path $ROOT "web\src") "$PKG\web\src" -Recurse
if (Test-Path (Join-Path $ROOT "web\public")) { Copy-Item (Join-Path $ROOT "web\public") "$PKG\web\public" -Recurse }

# 共享类型
Copy-Item (Join-Path $ROOT "shared\package.json") "$PKG\shared\"
Copy-Item (Join-Path $ROOT "shared\types") "$PKG\shared\types" -Recurse

# 部署说明
if (Test-Path (Join-Path $ROOT "USAGE.md")) { Copy-Item (Join-Path $ROOT "USAGE.md") "$PKG\部署说明.md" }

# 打包 zip
$zipFile = Join-Path $ROOT "release\OwnShelf-$Version.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
Compress-Archive -Path $PKG -DestinationPath $zipFile -CompressionLevel Optimal
Write-Host "已生成: release\OwnShelf-$Version.zip" -ForegroundColor Green
