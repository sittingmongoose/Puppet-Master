#!/usr/bin/env pwsh
# Build installer script for Windows
# Usage: .\scripts\build-installer-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Puppet Master Windows Installer Build ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
    
    # Check if version is 20+
    $majorVersion = [int]($nodeVersion -replace '^v(\d+)\..*', '$1')
    if ($majorVersion -lt 20) {
        Write-Host "  ERROR: Node.js 20+ required (found $nodeVersion)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ERROR: Node.js not found. Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: npm not found. npm should come with Node.js." -ForegroundColor Red
    exit 1
}

# Check NSIS
Write-Host "Checking NSIS..." -ForegroundColor Yellow
$nsisPath = $null
$nsisPaths = @(
    "${env:ProgramFiles}\NSIS\makensis.exe",
    "${env:ProgramFiles(x86)}\NSIS\makensis.exe",
    "C:\Program Files\NSIS\makensis.exe",
    "C:\Program Files (x86)\NSIS\makensis.exe"
)

foreach ($path in $nsisPaths) {
    if (Test-Path $path) {
        $nsisPath = $path
        break
    }
}

if (-not $nsisPath) {
    Write-Host "  NSIS not found. Attempting to install via Chocolatey..." -ForegroundColor Yellow
    
    # Check if Chocolatey is available
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "  Installing NSIS via Chocolatey (requires admin privileges)..." -ForegroundColor Yellow
        try {
            Start-Process -FilePath "choco" -ArgumentList "install", "nsis", "-y" -Wait -Verb RunAs
            Write-Host "  NSIS installed successfully" -ForegroundColor Green
        } catch {
            Write-Host "  ERROR: Failed to install NSIS. Please install manually:" -ForegroundColor Red
            Write-Host "    1. Download from https://nsis.sourceforge.io/Download" -ForegroundColor Yellow
            Write-Host "    2. Or run: choco install nsis" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "  ERROR: NSIS not found and Chocolatey not available." -ForegroundColor Red
        Write-Host "  Please install NSIS manually:" -ForegroundColor Yellow
        Write-Host "    1. Download from https://nsis.sourceforge.io/Download" -ForegroundColor Yellow
        Write-Host "    2. Or install Chocolatey and run: choco install nsis" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  NSIS found: $nsisPath" -ForegroundColor Green
}

# Get repository root
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

Write-Host ""
Write-Host "=== Building Installer ===" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: npm ci failed" -ForegroundColor Red
    exit 1
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: TypeScript build failed" -ForegroundColor Red
    exit 1
}

# Build GUI
Write-Host "Building GUI..." -ForegroundColor Yellow
npm run gui:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: GUI build failed" -ForegroundColor Red
    exit 1
}

# Build installer
Write-Host "Building Windows installer..." -ForegroundColor Yellow
npm run build:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Installer build failed" -ForegroundColor Red
    exit 1
}

# Verify output
Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
$installerPath = Get-ChildItem -Path "dist\installers\win32-x64" -Filter "*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($installerPath) {
    Write-Host "Installer created: $($installerPath.FullName)" -ForegroundColor Green
    Write-Host "Size: $([math]::Round($installerPath.Length / 1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "WARNING: Installer file not found in dist\installers\win32-x64\" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
