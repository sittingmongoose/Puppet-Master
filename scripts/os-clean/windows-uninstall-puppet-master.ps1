[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [Alias("n")]
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Uninstall Puppet Master from Windows and remove common leftovers.
# Intended for installer smoke tests (fresh install each run).
#
# Usage (Admin PowerShell recommended):
#   powershell -ExecutionPolicy Bypass -File scripts\\os-clean\\windows-uninstall-puppet-master.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\\os-clean\\windows-uninstall-puppet-master.ps1 -DryRun

# Dry-run switch maps to WhatIf semantics for safe previews.
if ($DryRun -and -not $WhatIfPreference) {
  $WhatIfPreference = $true
}

$protectedCliNames = @(
  "agent", "agent.exe",
  "codex", "codex.exe",
  "claude", "claude.exe",
  "gemini", "gemini.exe",
  "copilot", "copilot.exe",
  "gh", "gh.exe",
  "node", "node.exe"
)

function Test-ProtectedCliTarget {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $leaf = [System.IO.Path]::GetFileName($Path)
  if ([string]::IsNullOrWhiteSpace($leaf)) {
    return $false
  }

  return $protectedCliNames -contains $leaf.ToLowerInvariant()
}

function Test-UnsafeRootPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return $true
  }

  $full = [System.IO.Path]::GetFullPath($Path)
  $root = [System.IO.Path]::GetPathRoot($full)
  return $full -eq $root
}

function Remove-PathSafe {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [switch]$Directory
  )

  if (Test-ProtectedCliTarget -Path $Path) {
    Write-Host "[windows-uninstall] skipping protected CLI target: $Path"
    return
  }

  if (Test-UnsafeRootPath -Path $Path) {
    Write-Host "[windows-uninstall] skipping unsafe root target: $Path"
    return
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  $action = if ($Directory) { "Remove directory" } else { "Remove file" }
  if ($PSCmdlet.ShouldProcess($Path, $action)) {
    if ($Directory) {
      Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
    } else {
      Remove-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    }
  }
}

function Invoke-Uninstaller {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return
  }

  if ($PSCmdlet.ShouldProcess($Path, "Run uninstaller /S")) {
    Start-Process -FilePath $Path -ArgumentList "/S" -Wait -ErrorAction SilentlyContinue
  }
}

$isDryRun = $DryRun.IsPresent -or $WhatIfPreference
Write-Host "[windows-uninstall] starting (dry-run: $isDryRun)"

$programFilesRoot = if ($env:ProgramW6432) {
  $env:ProgramW6432
} elseif ($env:ProgramFiles) {
  $env:ProgramFiles
} else {
  $null
}

if ($programFilesRoot) {
  $installDirs = @(
    (Join-Path $programFilesRoot "Puppet Master")
  )

  foreach ($installDir in $installDirs) {
    foreach ($uninstallerName in @("uninstall.exe", "Uninstall.exe")) {
      $uninstaller = Join-Path $installDir $uninstallerName
      Invoke-Uninstaller -Path $uninstaller
    }

    Remove-PathSafe -Path $installDir -Directory
  }
} else {
  Write-Host "[windows-uninstall] ProgramFiles environment variable is unavailable; skipping install-dir cleanup"
}

# Remove Start Menu folders and Desktop shortcuts.
if (${env:ProgramData}) {
  $startMenuRoot = Join-Path ${env:ProgramData} "Microsoft\\Windows\\Start Menu\\Programs"
  foreach ($menuName in @("Puppet Master")) {
    Remove-PathSafe -Path (Join-Path $startMenuRoot $menuName) -Directory
  }
}

foreach ($desktopRoot in @(${env:Public}, ${env:USERPROFILE})) {
  if (-not $desktopRoot) {
    continue
  }

  foreach ($shortcut in @("Puppet Master.lnk")) {
    Remove-PathSafe -Path (Join-Path (Join-Path $desktopRoot "Desktop") $shortcut)
  }
}

# Runtime paths changed across releases.
if (${env:USERPROFILE}) {
  Remove-PathSafe -Path (Join-Path ${env:USERPROFILE} ".puppet-master") -Directory
}

Write-Host "[windows-uninstall] done"
