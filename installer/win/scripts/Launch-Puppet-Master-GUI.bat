@echo off
REM Launch Puppet Master GUI - prefer native desktop app, fallback to web UI
REM This batch file is used by Start Menu and Desktop shortcuts

set "SCRIPT_DIR=%~dp0"
cd /d "%USERPROFILE%"

if exist "%SCRIPT_DIR%app\\puppet-master-gui.exe" (
  start "" "%SCRIPT_DIR%app\\puppet-master-gui.exe"
  exit /b 0
)

call "%SCRIPT_DIR%bin\\puppet-master.cmd" gui
