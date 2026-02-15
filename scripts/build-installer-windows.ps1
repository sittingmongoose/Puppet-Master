#!/usr/bin/env pwsh
# Build installer script for Windows (Rust/Iced)
# Usage: .\scripts\build-installer-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Puppet Master Windows Installer Build (Rust/Iced) ===" -ForegroundColor Cyan
Write-Host ""

# Check Rust/Cargo
Write-Host "Checking Rust/Cargo..." -ForegroundColor Yellow
try {
    $cargoVersion = cargo --version
    Write-Host "  Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: cargo not found. Please install Rust from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# Check NSIS: try PATH first, then standard install locations; set PATH and MAKENSIS_PATH when found
function Find-Nsis {
    $cmd = Get-Command makensis -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }
    $paths = @(
        "${env:ProgramFiles}\NSIS\makensis.exe",
        "${env:ProgramFiles(x86)}\NSIS\makensis.exe",
        "C:\Program Files\NSIS\makensis.exe",
        "C:\Program Files (x86)\NSIS\makensis.exe"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) {
            return $p
        }
    }
    return $null
}

Write-Host "Checking NSIS..." -ForegroundColor Yellow
$nsisPath = Find-Nsis

if (-not $nsisPath) {
    Write-Host "  NSIS not found. Attempting to install via Chocolatey..." -ForegroundColor Yellow
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "  Installing NSIS via Chocolatey (requires admin privileges)..." -ForegroundColor Yellow
        try {
            Start-Process -FilePath "choco" -ArgumentList "install", "nsis", "-y" -Wait -Verb RunAs
            Write-Host "  NSIS installed successfully" -ForegroundColor Green
            $nsisPath = Find-Nsis
        } catch {
            Write-Host "  ERROR: Failed to install NSIS. Please install manually:" -ForegroundColor Red
            Write-Host "    1. Download from https://nsis.sourceforge.io/Download" -ForegroundColor Yellow
            Write-Host "    2. Or run: choco install nsis" -ForegroundColor Yellow
            exit 1
        }
    } else {
        $nsisPath = $null
    }
}

if (-not $nsisPath) {
    Write-Host "  ERROR: NSIS not found." -ForegroundColor Red
    Write-Host "  Please install NSIS:" -ForegroundColor Yellow
    Write-Host "    1. Download from https://nsis.sourceforge.io/Download" -ForegroundColor Yellow
    Write-Host "    2. Or install Chocolatey and run: choco install nsis" -ForegroundColor Yellow
    Write-Host "  If NSIS is already installed, add its folder (e.g. C:\Program Files (x86)\NSIS) to your PATH," -ForegroundColor Yellow
    Write-Host "  or set MAKENSIS_PATH to the full path of makensis.exe and try again." -ForegroundColor Yellow
    Write-Host "  Restart the terminal after installing NSIS so PATH updates are picked up." -ForegroundColor Yellow
    exit 1
}

# Ensure npm/tsx can find makensis: add to PATH and set MAKENSIS_PATH when resolved from a fixed path
$nsisDir = Split-Path -Parent $nsisPath
if ($env:PATH -notlike "*$nsisDir*") {
    $env:PATH = "$nsisDir;$env:PATH"
}
$env:MAKENSIS_PATH = $nsisPath
Write-Host "  NSIS found: $nsisPath" -ForegroundColor Green

# Get repository root (script is in scripts/, parent is repo root)
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Extract version from Cargo.toml
Write-Host ""
Write-Host "Extracting version from puppet-master-rs\Cargo.toml..." -ForegroundColor Yellow
$cargoTomlContent = Get-Content "puppet-master-rs\Cargo.toml" -Raw
if ($cargoTomlContent -match 'version\s*=\s*"([^"]+)"') {
    $version = $matches[1]
    Write-Host "  Version: $version" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Could not extract version from Cargo.toml" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Building Installer ===" -ForegroundColor Cyan
Write-Host ""

# Build Rust binary
Write-Host "Building Rust binary..." -ForegroundColor Yellow
Set-Location "puppet-master-rs"
cargo build --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Cargo build failed" -ForegroundColor Red
    exit 1
}
Set-Location ".."

# Verify binary exists
if (-not (Test-Path "puppet-master-rs\target\release\puppet-master.exe")) {
    Write-Host "  ERROR: Binary not found at puppet-master-rs\target\release\puppet-master.exe" -ForegroundColor Red
    exit 1
}

# Build installer with NSIS
Write-Host "Building Windows installer with NSIS..." -ForegroundColor Yellow
Set-Location "installer\windows"
if ($nsisPath) {
    & $nsisPath "/DVERSION=$version" "puppet-master.nsi"
} else {
    makensis "/DVERSION=$version" "puppet-master.nsi"
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: NSIS build failed" -ForegroundColor Red
    exit 1
}
Set-Location "..\..\"

# Verify output
Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
$installerFile = "installer\windows\RWM-Puppet-Master-$version-setup.exe"
if (Test-Path $installerFile) {
    $fileSize = [math]::Round((Get-Item $installerFile).Length / 1MB, 2)
    Write-Host "Installer created: $installerFile" -ForegroundColor Green
    Write-Host "Size: $fileSize MB" -ForegroundColor Green
} else {
    Write-Host "WARNING: Installer file not found at $installerFile" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
