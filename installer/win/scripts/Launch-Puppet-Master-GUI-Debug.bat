@echo off
REM Launch Puppet Master GUI with console visible so errors can be seen.
REM Used by Start Menu shortcut "Puppet Master (Debug)".
REM Note: The native desktop app logs to AppData; use this launcher when troubleshooting CLI/server issues.

set "SCRIPT_DIR=%~dp0"
cd /d "%USERPROFILE%"

if exist "%SCRIPT_DIR%app\\puppet-master-gui.exe" (
  echo Launching native GUI: %SCRIPT_DIR%app\puppet-master-gui.exe
  start "" "%SCRIPT_DIR%app\\puppet-master-gui.exe"
  echo If the window is blank, check logs under:
  echo   %LOCALAPPDATA%\com.rwm.puppet-master\logs\
  pause
  exit /b 0
)

call "%SCRIPT_DIR%bin\puppet-master.cmd" gui --verbose
pause
