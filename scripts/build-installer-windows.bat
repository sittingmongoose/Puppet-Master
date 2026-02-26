@echo off
REM Wrapper for the canonical Windows NSIS installer build.
setlocal enabledelayedexpansion

cd /d "%~dp0\.."

REM Extract version from puppet-master-rs\Cargo.toml
set VERSION=
for /f "tokens=2 delims==" %%A in ('findstr /b "version" puppet-master-rs\Cargo.toml') do (
  set VERSION=%%~A
  goto :version_done
)
:version_done
set VERSION=%VERSION: =%
set VERSION=%VERSION:"=%

if "%VERSION%"=="" (
  echo Error: could not parse version from puppet-master-rs\Cargo.toml
  exit /b 1
)

REM Determine Cargo target directory
set TARGET_DIR=
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "(cargo metadata --no-deps --format-version 1 ^| ConvertFrom-Json).target_directory"`) do set TARGET_DIR=%%I

if "%TARGET_DIR%"=="" (
  echo Error: could not determine Cargo target directory
  exit /b 1
)

echo Using version: %VERSION%
echo Using Cargo target directory: %TARGET_DIR%

cd /d puppet-master-rs
cargo build --release
if errorlevel 1 exit /b 1

cd /d ..\installer\windows
makensis /DVERSION="%VERSION%" /DTARGET_DIR="%TARGET_DIR%" puppet-master.nsi
if errorlevel 1 exit /b 1

if not exist ..\..\dist\installers\win32-x64 mkdir ..\..\dist\installers\win32-x64
copy /Y "Puppet-Master-%VERSION%-setup.exe" "..\..\dist\installers\win32-x64\" >nul

echo [OK] Created dist\installers\win32-x64\Puppet-Master-%VERSION%-setup.exe
endlocal
