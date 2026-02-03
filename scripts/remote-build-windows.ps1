# Remote Windows build (Tauri): replicate CI.
# Run from repo root: pwsh -ExecutionPolicy Bypass -File scripts/remote-build-windows.ps1
# Or: .\scripts\remote-build-windows.ps1

$ErrorActionPreference = "Stop"

$RepoRoot = if ($env:REPO_ROOT) { $env:REPO_ROOT } else { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path }
$ResultFile = if ($env:RESULT_FILE) { $env:RESULT_FILE } else { Join-Path $RepoRoot "BUILD_RESULT.txt" }
Set-Location $RepoRoot

Write-Host "=== Remote Windows build (Tauri) ===" -ForegroundColor Cyan
Write-Host "REPO_ROOT=$RepoRoot"

# WebView2 SDK for Tauri (match CI)
if (-not $env:WEBVIEW2_LIB_PATH -or -not (Test-Path $env:WEBVIEW2_LIB_PATH)) {
    Write-Host "Downloading WebView2 SDK..."
    $sdkUrl = "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2592.51"
    $sdkZip = "$env:TEMP\webview2.zip"
    $sdkDir = "$env:TEMP\webview2-sdk"
    Invoke-WebRequest -Uri $sdkUrl -OutFile $sdkZip -UseBasicParsing
    Expand-Archive -Path $sdkZip -DestinationPath $sdkDir -Force
    $env:WEBVIEW2_LIB_PATH = "$sdkDir\build\native\x64"
    Write-Host "WebView2 at: $env:WEBVIEW2_LIB_PATH"
}

# NSIS
function Find-Nsis {
    $cmd = Get-Command makensis -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $paths = @(
        "${env:ProgramFiles(x86)}\NSIS\makensis.exe",
        "C:\Program Files (x86)\NSIS\makensis.exe"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) { return $p }
    }
    return $null
}
$nsisPath = Find-Nsis
if (-not $nsisPath) {
    Write-Host "ERROR: NSIS not found. Install: choco install nsis" -ForegroundColor Red
    "FAIL" | Set-Content $ResultFile
    exit 1
}
$nsisDir = Split-Path -Parent $nsisPath
if ($env:PATH -notlike "*$nsisDir*") { $env:PATH = "$nsisDir;$env:PATH" }
$env:MAKENSIS_PATH = $nsisPath

# Rust in PATH; install via rustup if missing
$cargoPath = "$env:USERPROFILE\.cargo\bin"
if (Test-Path $cargoPath) { $env:PATH = "$cargoPath;$env:PATH" }
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Rust (rustup)..."
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe" -UseBasicParsing
    & "$env:TEMP\rustup-init.exe" -y --default-toolchain stable
    $env:PATH = "$cargoPath;$env:PATH"
}
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: cargo not found after install. Install Rust: https://rustup.rs" -ForegroundColor Red
    "FAIL" | Set-Content $ResultFile
    exit 1
}

$env:npm_config_update_notifier = "false"

Write-Host "npm ci..."
npm ci
if ($LASTEXITCODE -ne 0) { "FAIL" | Set-Content $ResultFile; exit 1 }

Write-Host "GUI deps..."
npm --prefix src/gui/react ci
if ($LASTEXITCODE -ne 0) { "FAIL" | Set-Content $ResultFile; exit 1 }

Write-Host "TypeScript build..."
npm run build
if ($LASTEXITCODE -ne 0) { "FAIL" | Set-Content $ResultFile; exit 1 }

Write-Host "GUI build..."
npm run gui:build
if ($LASTEXITCODE -ne 0) { "FAIL" | Set-Content $ResultFile; exit 1 }

Write-Host "Windows Tauri installer..."
npm run build:win:tauri
if ($LASTEXITCODE -ne 0) { "FAIL" | Set-Content $ResultFile; exit 1 }

# Cleanup per check command
if (Test-Path ".test-cache") { Remove-Item -Recurse -Force ".test-cache" }
Get-ChildItem -Path "." -Filter ".test-quota*" -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

$installer = Get-ChildItem -Path "dist\installers\win32-x64" -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($installer) {
    "PASS" | Set-Content $ResultFile
    Write-Host "Artifact: $($installer.FullName)" -ForegroundColor Green
} else {
    "FAIL" | Set-Content $ResultFile
    Write-Host "No .exe in dist\installers\win32-x64" -ForegroundColor Red
    exit 1
}
Write-Host "Done." -ForegroundColor Green
