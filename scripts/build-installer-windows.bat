@echo off
REM Build installer script for Windows (Batch - Rust/Iced)
REM Usage: scripts\build-installer-windows.bat

echo === Puppet Master Windows Installer Build (Rust/Iced) ===
echo.

REM Check Rust/Cargo
echo Checking Rust/Cargo...
where cargo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: cargo not found. Please install Rust from https://rustup.rs/
    exit /b 1
)

for /f "tokens=*" %%i in ('cargo --version') do set CARGO_VERSION=%%i
echo   Cargo: %CARGO_VERSION%

REM Check NSIS
echo Checking NSIS...
set NSIS_OK=0
where makensis >nul 2>&1 && set NSIS_OK=1
if %NSIS_OK%==0 (
    if exist "%ProgramFiles%\NSIS\makensis.exe" (
        set "MAKENSIS_PATH=%ProgramFiles%\NSIS\makensis.exe"
        set "PATH=%ProgramFiles%\NSIS;%PATH%"
        set NSIS_OK=1
    )
)
if %NSIS_OK%==0 (
    if exist "%ProgramFiles(x86)%\NSIS\makensis.exe" (
        set "MAKENSIS_PATH=%ProgramFiles(x86)%\NSIS\makensis.exe"
        set "PATH=%ProgramFiles(x86)%\NSIS;%PATH%"
        set NSIS_OK=1
    )
)
if %NSIS_OK%==0 (
    echo   ERROR: NSIS not found. Please install NSIS:
    echo     1. Download from https://nsis.sourceforge.io/Download
    echo     2. Or install Chocolatey and run: choco install nsis
    echo.
    echo   If NSIS is already installed, add its folder to your PATH.
    echo   Restart the terminal after installing NSIS so PATH updates are picked up.
    exit /b 1
)

echo   NSIS found

REM Get repository root
cd /d "%~dp0\.."
set REPO_ROOT=%CD%

REM Extract version from Cargo.toml
echo.
echo Extracting version from puppet-master-rs\Cargo.toml...
for /f "tokens=3 delims= =""" %%v in ('findstr /r "^version = " puppet-master-rs\Cargo.toml') do set VERSION=%%v
if "%VERSION%"=="" (
    echo   ERROR: Could not extract version from Cargo.toml
    exit /b 1
)
echo   Version: %VERSION%

echo.
echo === Building Installer ===
echo.

REM Build Rust binary
echo Building Rust binary...
cd puppet-master-rs
cargo build --release
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: Cargo build failed
    exit /b 1
)
cd ..

REM Verify binary exists
if not exist "puppet-master-rs\target\release\puppet-master.exe" (
    echo   ERROR: Binary not found at puppet-master-rs\target\release\puppet-master.exe
    exit /b 1
)

REM Build installer with NSIS
echo Building Windows installer with NSIS...
cd installer\windows
if defined MAKENSIS_PATH (
    "%MAKENSIS_PATH%" /DVERSION=%VERSION% puppet-master.nsi
) else (
    makensis /DVERSION=%VERSION% puppet-master.nsi
)
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: NSIS build failed
    exit /b 1
)
cd ..\..

REM Verify output
echo.
echo === Build Complete ===
if exist "installer\windows\RWM-Puppet-Master-%VERSION%-setup.exe" (
    echo Installer created: installer\windows\RWM-Puppet-Master-%VERSION%-setup.exe
    for %%A in ("installer\windows\RWM-Puppet-Master-%VERSION%-setup.exe") do echo Size: %%~zA bytes
) else (
    echo WARNING: Installer file not found at installer\windows\RWM-Puppet-Master-%VERSION%-setup.exe
)

echo.
echo Done!
