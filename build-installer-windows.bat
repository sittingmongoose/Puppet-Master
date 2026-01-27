@echo off
REM Puppet Master Windows Installer Build Launcher
REM Double-click this file to build the Windows installer
REM Or run from command line: build-installer-windows.bat

echo ========================================
echo Puppet Master Windows Installer Builder
echo ========================================
echo.
echo This will build the Windows installer (.exe)
echo.
echo Press Ctrl+C to cancel, or
pause

REM Change to script directory and run the build script
cd /d "%~dp0"
call scripts\build-installer-windows.bat

REM Pause at end to see results
echo.
echo ========================================
echo Build process completed
echo ========================================
pause
