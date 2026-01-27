@echo off
REM Build installer script for Windows (Batch fallback)
REM Usage: scripts\build-installer-windows.bat

echo === Puppet Master Windows Installer Build ===
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: Node.js not found. Please install Node.js 20+ from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   Node.js: %NODE_VERSION%

REM Check npm
echo Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: npm not found. npm should come with Node.js.
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   npm: %NPM_VERSION%

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
    echo   If NSIS is already installed, add its folder (e.g. C:\Program Files ^(x86^)\NSIS^) to your PATH,
    echo   or set MAKENSIS_PATH to the full path of makensis.exe and try again.
    echo   Restart the terminal after installing NSIS so PATH updates are picked up.
    exit /b 1
)

echo   NSIS found

REM Get repository root
cd /d "%~dp0\.."
set REPO_ROOT=%CD%

echo.
echo === Building Installer ===
echo.

REM Install dependencies
echo Installing dependencies...
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: npm ci failed
    exit /b 1
)

REM Build TypeScript
echo Building TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: TypeScript build failed
    exit /b 1
)

REM Build GUI
echo Building GUI...
call npm run gui:build
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: GUI build failed
    exit /b 1
)

REM Build installer
echo Building Windows installer...
call npm run build:win
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: Installer build failed
    exit /b 1
)

REM Verify output
echo.
echo === Build Complete ===
if exist "dist\installers\win32-x64\*.exe" (
    echo Installer created in dist\installers\win32-x64\
) else (
    echo WARNING: Installer file not found in dist\installers\win32-x64\
)

echo.
echo Done!
