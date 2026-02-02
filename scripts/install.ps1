$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $RepoRoot

function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $name"
  }
}

try {
  Require-Command node
  Require-Command npm

  Write-Host "Installing dependencies..."
  if (Test-Path ".\\package-lock.json") {
    npm ci
  } else {
    npm install
  }

  Write-Host "Building..."
  npm run build

  Write-Host "Installing puppet-master globally..."
  npm install -g .

  Write-Host "OK: Installed. Try: puppet-master --version"
} catch {
  Write-Host ""
  Write-Host "Install failed: $($_.Exception.Message)"
  Write-Host ""
  Write-Host "Fallback:"
  Write-Host "  node .\\dist\\cli\\index.js --help"
  exit 1
}

