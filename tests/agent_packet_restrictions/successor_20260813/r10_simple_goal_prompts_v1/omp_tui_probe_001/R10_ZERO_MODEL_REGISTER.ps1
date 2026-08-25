Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$stageRoot = 'C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651'
$attemptPath = Join-Path $stageRoot 'registration_attempt.json'
$terminalPath = Join-Path $stageRoot 'registration_terminal.json'
$bootstrapUtf8 = [System.Text.UTF8Encoding]::new($false, $true)
$commonLoaded = $false

function Write-RegistrationBootstrapJson([string]$Path, [object]$Value) {
    $bytes = $bootstrapUtf8.GetBytes(($Value | ConvertTo-Json -Depth 12 -Compress))
    $publishing = "$Path.publishing-$PID"
    if (Test-Path -LiteralPath $Path) { throw "Refusing to replace $Path" }
    if (Test-Path -LiteralPath $publishing) { throw "Publishing path already exists: $publishing" }
    $stream = [System.IO.File]::Open($publishing, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
    try {
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush($true)
    }
    finally {
        $stream.Dispose()
    }
    [System.IO.File]::Move($publishing, $Path, $false)
}

if (Test-Path -LiteralPath $attemptPath) {
    exit 90
}
Write-RegistrationBootstrapJson $attemptPath ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_registration_attempt.v1'
    probe_id = 'r10-omp-tui-zero-model-001'
    nonce = '64b55fe75fe02651'
    attempted_utc = [DateTime]::UtcNow.ToString('o')
    registrar_pid = $PID
    observed_host = $env:COMPUTERNAME
    observed_user = [Environment]::UserName
    observed_user_sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    observed_session_id = [Diagnostics.Process]::GetCurrentProcess().SessionId
    start_call_ceiling = 1
    retry_count = 0
    qualification_credit = 0
})

try {
    . (Join-Path $stageRoot 'R10_PROBE_COMMON.ps1')
    $commonLoaded = $true
    $contract = Get-R10Contract $stageRoot
    $manifest = Assert-R10Bundle $stageRoot $contract
    Assert-R10HostIdentity $contract $false
    if (Test-Path -LiteralPath $contract.windows.evidence_root) { throw 'Driver evidence root already exists' }
    if ($null -ne (Get-ScheduledTask -TaskName $contract.schedule.task_name -ErrorAction SilentlyContinue)) { throw 'Scheduled task already exists' }

    $driverPath = Join-Path $stageRoot 'R10_ZERO_MODEL_DRIVER.ps1'
    $actionArguments = "-NoLogo -NoProfile -File $driverPath"
    $action = New-ScheduledTaskAction -Execute $contract.windows.pwsh_path -Argument $actionArguments
    $principal = New-ScheduledTaskPrincipal -UserId $contract.windows.user_sid -LogonType Interactive -RunLevel Limited
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::FromMilliseconds([int]$contract.schedule.execution_time_limit_ms)) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $definition = New-ScheduledTask -Action $action -Principal $principal -Settings $settings
    [void](Register-ScheduledTask -TaskName $contract.schedule.task_name -InputObject $definition)

    $registered = Get-ScheduledTask -TaskName $contract.schedule.task_name -ErrorAction Stop
    $taskXmlText = Export-ScheduledTask -TaskName $contract.schedule.task_name
    $taskXml = [xml]$taskXmlText
    $xmlAction = $taskXml.Task.Actions.Exec
    $xmlSettings = $taskXml.Task.Settings
    $xmlPrincipal = $taskXml.Task.Principals.Principal
    if ($xmlAction.Command -cne $contract.windows.pwsh_path -or $xmlAction.Arguments -cne $actionArguments) { throw 'Scheduled task action mismatch' }
    if ($xmlSettings.MultipleInstancesPolicy -cne 'IgnoreNew') { throw 'Scheduled task multiple-instance policy mismatch' }
    if ($null -ne $xmlSettings.RestartOnFailure) { throw 'Scheduled task unexpectedly permits restart on failure' }
    if ($xmlSettings.ExecutionTimeLimit -cne 'PT2M') { throw 'Scheduled task execution limit mismatch' }
    if ($xmlSettings.StartWhenAvailable -eq 'true') { throw 'Scheduled task start-when-available must be false' }
    if ($xmlPrincipal.LogonType -cne 'InteractiveToken') { throw 'Scheduled task logon type mismatch' }
    if ($xmlPrincipal.UserId -cne $contract.windows.user_sid) { throw 'Scheduled task principal SID mismatch' }

    $taskXmlBytes = $script:R10Utf8.GetBytes($taskXmlText)
    Write-R10NewJson (Join-Path $stageRoot 'registration.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_registration.v1'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        registered_utc = [DateTime]::UtcNow.ToString('o')
        task_name = $contract.schedule.task_name
        action_executable = $xmlAction.Command
        action_arguments = $xmlAction.Arguments
        principal_sid = $xmlPrincipal.UserId
        logon_type = $xmlPrincipal.LogonType
        multiple_instances = $xmlSettings.MultipleInstancesPolicy
        execution_time_limit = $xmlSettings.ExecutionTimeLimit
        restart_on_failure_present = $null -ne $xmlSettings.RestartOnFailure
        manifest_sha256 = Get-R10FileSha256 (Join-Path $stageRoot 'bundle_manifest.json')
        contract_sha256 = Get-R10FileSha256 (Join-Path $stageRoot 'probe_contract.json')
        task_xml_utf8_bytes = $taskXmlBytes.Length
        task_xml_sha256 = Get-R10Sha256Hex $taskXmlBytes
    })

    Start-ScheduledTask -TaskName $contract.schedule.task_name
    Write-R10NewJson (Join-Path $stageRoot 'registration_start.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_registration_start.v1'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        start_requested_utc = [DateTime]::UtcNow.ToString('o')
        task_name = $contract.schedule.task_name
        start_call_count = 1
        retry_count = 0
    })
    Write-R10NewJson $terminalPath ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_registration_terminal.v1'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        status = 'TASK_START_REQUESTED_ONCE'
        observed_utc = [DateTime]::UtcNow.ToString('o')
        qualification_credit = 0
    })
    exit 0
}
catch {
    $detail = "$($_.Exception.GetType().FullName): $($_.Exception.Message)"
    if (-not (Test-Path -LiteralPath $terminalPath)) {
        $value = [ordered]@{
            schema = 'puppetmaster.r10.omp_tui_zero_model_registration_terminal.v1'
            probe_id = 'r10-omp-tui-zero-model-001'
            nonce = '64b55fe75fe02651'
            status = 'FAIL_REGISTRATION_NO_RETRY'
            detail = $detail
            observed_utc = [DateTime]::UtcNow.ToString('o')
            qualification_credit = 0
        }
        try {
            if ($commonLoaded) { Write-R10NewJson $terminalPath $value } else { Write-RegistrationBootstrapJson $terminalPath $value }
        }
        catch { }
    }
    exit 1
}
