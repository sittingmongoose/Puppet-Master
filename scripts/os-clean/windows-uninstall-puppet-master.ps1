$ErrorActionPreference = "Stop"

# Uninstall Puppet Master from Windows and remove common leftovers.
# Intended for installer smoke tests (fresh install each run).
#
# Usage (Admin PowerShell recommended):
#   powershell -ExecutionPolicy Bypass -File scripts\\os-clean\\windows-uninstall-puppet-master.ps1

Write-Host "[windows-uninstall] starting"

$installDir = Join-Path ${env:ProgramFiles} "Puppet Master"
$uninstaller = Join-Path $installDir "Uninstall.exe"

if (Test-Path $uninstaller) {
  Write-Host "[windows-uninstall] running uninstaller: $uninstaller"
  # NSIS silent uninstall
  Start-Process -FilePath $uninstaller -ArgumentList "/S" -Wait
} else {
  Write-Host "[windows-uninstall] uninstaller not found at $uninstaller"
}

# Remove leftovers if any remain
if (Test-Path $installDir) {
  Write-Host "[windows-uninstall] removing install dir: $installDir"
  Remove-Item -Recurse -Force $installDir
}

# Remove Start Menu folder and Desktop shortcut (all users)
$startMenuDir = Join-Path ${env:ProgramData} "Microsoft\\Windows\\Start Menu\\Programs\\Puppet Master"
if (Test-Path $startMenuDir) {
  Write-Host "[windows-uninstall] removing Start Menu dir: $startMenuDir"
  Remove-Item -Recurse -Force $startMenuDir
}

$desktopLink = Join-Path ${env:Public} "Desktop\\Puppet Master.lnk"
if (Test-Path $desktopLink) {
  Write-Host "[windows-uninstall] removing Desktop link: $desktopLink"
  Remove-Item -Force $desktopLink
}

# Remove per-user runtime state
$home = ${env:USERPROFILE}
if ($home) {
  $runtime = Join-Path $home ".puppet-master"
  if (Test-Path $runtime) {
    Write-Host "[windows-uninstall] removing runtime dir: $runtime"
    Remove-Item -Recurse -Force $runtime
  }
}

Write-Host "[windows-uninstall] done"

