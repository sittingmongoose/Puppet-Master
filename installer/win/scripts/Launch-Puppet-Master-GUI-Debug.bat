@echo off
REM Launch Puppet Master GUI with console visible so errors can be seen.
REM Used by Start Menu shortcut "Puppet Master (Debug)".

set "SCRIPT_DIR=%~dp0"
cd /d "%USERPROFILE%"
call "%SCRIPT_DIR%bin\puppet-master.cmd" gui --verbose
pause
