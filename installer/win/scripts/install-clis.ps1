# PowerShell script to check and install platform CLIs
# Called from NSIS installer after Puppet Master installation
# Usage: .\install-clis.ps1 [--check-only] [--install <cli1,cli2,...>]

param(
    [switch]$CheckOnly,
    [string]$Install = ""
)

$ErrorActionPreference = "Stop"

# Get Puppet Master installation directory from environment or use default
$PuppetMasterDir = $env:PuppetMasterInstallDir
if (-not $PuppetMasterDir) {
    $PuppetMasterDir = "${env:ProgramFiles}\Puppet Master"
}

$PuppetMasterCmd = Join-Path $PuppetMasterDir "bin\puppet-master.cmd"

# Check if puppet-master is available
if (-not (Test-Path $PuppetMasterCmd)) {
    Write-Error "Puppet Master not found at: $PuppetMasterCmd"
    exit 1
}

# Run doctor --json to check CLI status
Write-Host "Checking platform CLI status..." -ForegroundColor Yellow
try {
    $doctorOutput = & $PuppetMasterCmd doctor --json 2>&1 | Out-String
    $doctorJson = $doctorOutput | ConvertFrom-Json
    
    # Map check names to CLI display names and install commands
    $cliMap = @{
        'cursor-cli' = @{
            Name = 'Cursor CLI'
            InstallCmd = 'curl https://cursor.com/install -fsSL | bash'
            Note = 'Requires WSL or Git Bash (no Windows native installer)'
        }
        'codex-cli' = @{
            Name = 'Codex CLI'
            InstallCmd = 'npm install -g @openai/codex'
        }
        'claude-cli' = @{
            Name = 'Claude Code CLI'
            InstallCmd = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://claude.ai/install.ps1 | iex"'
        }
        'gemini-cli' = @{
            Name = 'Gemini CLI'
            InstallCmd = 'npm install -g @google/gemini-cli'
        }
        'copilot-cli' = @{
            Name = 'GitHub Copilot CLI'
            InstallCmd = 'npm install -g @github/copilot'
        }
    }
    
    # Find failed CLI checks
    $missingClis = @()
    foreach ($check in $doctorJson) {
        if ($cliMap.ContainsKey($check.name) -and -not $check.passed) {
            $cliInfo = $cliMap[$check.name]
            $missingClis += @{
                CheckName = $check.name
                DisplayName = $cliInfo.Name
                InstallCmd = $cliInfo.InstallCmd
                Note = $cliInfo.Note
            }
        }
    }
    
    # Output JSON for NSIS to parse (only when -CheckOnly)
    if ($CheckOnly) {
        $missingClis | ConvertTo-Json -Compress
        exit 0
    }
    
    # When run with no args (e.g. after install): show friendly message, do not dump JSON
    if (-not $Install) {
        if ($missingClis.Count -eq 0) {
            Write-Host "All platform CLIs are installed. Run 'puppet-master doctor' to verify." -ForegroundColor Green
        } else {
            Write-Host "`nMissing platform CLIs:" -ForegroundColor Yellow
            foreach ($cli in $missingClis) {
                Write-Host "  - $($cli.DisplayName)" -ForegroundColor Cyan
                Write-Host "    Install: $($cli.InstallCmd)" -ForegroundColor Gray
                if ($cli.Note) { Write-Host "    Note: $($cli.Note)" -ForegroundColor Gray }
            }
            Write-Host "`nTo install later: Run 'puppet-master doctor' for full checks, or use Start Menu > Puppet Master to open the GUI." -ForegroundColor Yellow
        }
        exit 0
    }
    
    # Install selected CLIs
    if ($Install) {
        $clisToInstall = $Install -split ','
        $results = @()
        
        foreach ($cliName in $clisToInstall) {
            $cli = $missingClis | Where-Object { $_.CheckName -eq $cliName }
            if (-not $cli) {
                Write-Warning "CLI not found or already installed: $cliName"
                continue
            }
            
            Write-Host "Installing $($cli.DisplayName)..." -ForegroundColor Yellow
            
            # Check if npm is required
            if ($cli.InstallCmd -like '*npm install*') {
                # Check for npm
                if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
                    $results += @{
                        CheckName = $cli.CheckName
                        DisplayName = $cli.DisplayName
                        Success = $false
                        Error = 'npm not found. Please install Node.js first.'
                    }
                    continue
                }
            }
            
            # Execute installation
            try {
                if ($cli.InstallCmd -like '*curl*' -or $cli.InstallCmd -like '*powershell*') {
                    # Execute via cmd.exe for curl/bash commands
                    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cli.InstallCmd -Wait -NoNewWindow -PassThru
                    $success = $process.ExitCode -eq 0
                } else {
                    # Execute npm commands directly
                    Invoke-Expression $cli.InstallCmd
                    $success = $true
                }
                
                $results += @{
                    CheckName = $cli.CheckName
                    DisplayName = $cli.DisplayName
                    Success = $success
                    Error = if ($success) { $null } else { "Installation failed with exit code $($process.ExitCode)" }
                }
            } catch {
                $results += @{
                    CheckName = $cli.CheckName
                    DisplayName = $cli.DisplayName
                    Success = $false
                    Error = $_.Exception.Message
                }
            }
        }
        
        # Output results as JSON
        $results | ConvertTo-Json -Compress
        exit 0
    }
    
} catch {
    Write-Error "Failed to check CLI status: $_"
    exit 1
}
