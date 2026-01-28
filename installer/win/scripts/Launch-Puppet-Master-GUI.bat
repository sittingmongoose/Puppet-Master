@echo off
REM Launch Puppet Master GUI - opens console and runs puppet-master gui
REM This batch file is used by Start Menu and Desktop shortcuts

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
call "%SCRIPT_DIR%bin\puppet-master.cmd" gui
