Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:R10Utf8 = [System.Text.UTF8Encoding]::new($false, $true)

function Get-R10Sha256Hex([byte[]]$Bytes) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([BitConverter]::ToString($sha.ComputeHash($Bytes))).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $sha.Dispose()
    }
}

function Get-R10FileSha256([string]$Path) {
    return Get-R10Sha256Hex ([System.IO.File]::ReadAllBytes($Path))
}

function Write-R10NewJson([string]$Path, [object]$Value) {
    $json = $Value | ConvertTo-Json -Depth 16 -Compress
    $bytes = $script:R10Utf8.GetBytes($json)
    $publishing = "$Path.publishing-$PID"
    if (Test-Path -LiteralPath $Path) { throw "Refusing to replace $Path" }
    if (Test-Path -LiteralPath $publishing) { throw "Publishing path already exists: $publishing" }
    $stream = [System.IO.File]::Open(
        $publishing,
        [System.IO.FileMode]::CreateNew,
        [System.IO.FileAccess]::Write,
        [System.IO.FileShare]::None
    )
    try {
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush($true)
    }
    finally {
        $stream.Dispose()
    }
    [System.IO.File]::Move($publishing, $Path, $false)
}

function Read-R10Json([string]$Path) {
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    return $script:R10Utf8.GetString($bytes) | ConvertFrom-Json
}

function Test-R10ExactArray([object[]]$Actual, [object[]]$Expected) {
    if ($Actual.Count -ne $Expected.Count) { return $false }
    for ($index = 0; $index -lt $Expected.Count; $index++) {
        if ([string]$Actual[$index] -cne [string]$Expected[$index]) { return $false }
    }
    return $true
}

function Assert-R10ExactKeys([object]$Value, [string[]]$Expected, [string]$Label) {
    $actual = [string[]]@($Value.PSObject.Properties.Name | Sort-Object)
    $wanted = [string[]]@($Expected | Sort-Object)
    if (-not (Test-R10ExactArray $actual $wanted)) { throw "$Label key set mismatch" }
}

function Get-R10Contract([string]$StageRoot) {
    $path = Join-Path $StageRoot 'probe_contract.json'
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw 'Probe contract is absent' }
    $contract = Read-R10Json $path
    Assert-R10ExactKeys $contract @('schema', 'probe_id', 'nonce', 'windows', 'runtime', 'schedule', 'fake_native_argv', 'inert_input', 'ceilings', 'qualification_credit') 'contract'
    Assert-R10ExactKeys $contract.windows @('host', 'user', 'user_sid', 'required_session_id', 'stage_root', 'evidence_root', 'pwsh_path', 'wt_path', 'window_id', 'title') 'contract.windows'
    Assert-R10ExactKeys $contract.runtime @('ps_version', 'ps_edition', 'clr_version', 'native_argument_passing', 'input_struct_bytes') 'contract.runtime'
    Assert-R10ExactKeys $contract.schedule @('task_name', 'multiple_instances', 'restart_count', 'execution_time_limit_ms') 'contract.schedule'
    Assert-R10ExactKeys $contract.ceilings @('reviewed_script_direct_omp_invocations', 'reviewed_script_direct_provider_invocations', 'reviewed_script_direct_subject_invocations', 'omp_endpoint_count_before', 'omp_endpoint_count_after', 'sendinput_calls_in_driver', 'receiver_readline_calls', 'retry_count', 'receiver_timeout_ms', 'driver_receipt_deadline_ms', 'scheduled_task_execution_limit_ms') 'contract.ceilings'

    if ($contract.schema -cne 'puppetmaster.r10.omp_tui_zero_model_probe.v2') { throw 'Contract schema mismatch' }
    if ($contract.probe_id -cne 'r10-omp-tui-zero-model-001') { throw 'Contract probe id mismatch' }
    if ($contract.nonce -cne '64b55fe75fe02651') { throw 'Contract nonce mismatch' }
    if ($contract.windows.host -cne 'JAREDGAMINGPC' -or $contract.windows.user -cne 'sitti') { throw 'Contract host/user mismatch' }
    if ($contract.windows.user_sid -cne 'S-1-5-21-2726046746-5803018-3664408702-1001') { throw 'Contract SID mismatch' }
    if ([int]$contract.windows.required_session_id -ne 4) { throw 'Contract session mismatch' }
    if ($contract.windows.stage_root -cne 'C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651') { throw 'Contract stage root mismatch' }
    if ($contract.windows.evidence_root -cne 'C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651\evidence') { throw 'Contract evidence root mismatch' }
    if ($contract.windows.pwsh_path -cne 'C:\Program Files\PowerShell\7\pwsh.exe') { throw 'Contract pwsh path mismatch' }
    if ($contract.windows.wt_path -cne 'C:\Users\sitti\AppData\Local\Microsoft\WindowsApps\wt.exe') { throw 'Contract wt path mismatch' }
    if ($contract.windows.window_id -cne 'PM-R10-ZM-WIN-64b55fe75fe02651' -or $contract.windows.title -cne 'PM-R10-ZM-64b55fe75fe02651') { throw 'Contract window identity mismatch' }
    if ($contract.runtime.ps_version -cne '7.6.5' -or $contract.runtime.ps_edition -cne 'Core' -or $contract.runtime.clr_version -cne '10.0.11') { throw 'Contract runtime version mismatch' }
    if ($contract.runtime.native_argument_passing -cne 'Windows' -or [int]$contract.runtime.input_struct_bytes -ne 40) { throw 'Contract native runtime mismatch' }
    if ($contract.schedule.task_name -cne 'PM-R10-ZM-64b55fe75fe02651' -or $contract.schedule.multiple_instances -cne 'IgnoreNew') { throw 'Contract schedule identity mismatch' }
    if ([int]$contract.schedule.restart_count -ne 0 -or [int]$contract.schedule.execution_time_limit_ms -ne 120000) { throw 'Contract schedule ceiling mismatch' }

    $expectedArgv = [string[]]@(
        '--cwd=P:\'
        '--profile=r10-zero-model-64b55fe75fe02651'
        '--model=r10-zero-model'
        '--thinking=xhigh'
        '--session-dir=C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651\sessions'
        '--no-title'
    )
    if (-not (Test-R10ExactArray @($contract.fake_native_argv) $expectedArgv)) { throw 'Contract fake-native argv mismatch' }
    if ($contract.inert_input -cne 'R10_ZERO_MODEL_64b55fe75fe02651') { throw 'Contract inert input mismatch' }
    foreach ($name in @('reviewed_script_direct_omp_invocations', 'reviewed_script_direct_provider_invocations', 'reviewed_script_direct_subject_invocations', 'omp_endpoint_count_before', 'omp_endpoint_count_after', 'retry_count')) {
        if ([int]$contract.ceilings.$name -ne 0) { throw "Contract zero ceiling mismatch: $name" }
    }
    if ([int]$contract.ceilings.sendinput_calls_in_driver -ne 1 -or [int]$contract.ceilings.receiver_readline_calls -ne 1) { throw 'Contract call ceiling mismatch' }
    if ([int]$contract.ceilings.receiver_timeout_ms -ne 30000 -or [int]$contract.ceilings.driver_receipt_deadline_ms -ne 110000 -or [int]$contract.ceilings.scheduled_task_execution_limit_ms -ne 120000) { throw 'Contract time ceiling mismatch' }
    if ([int]$contract.qualification_credit -ne 0) { throw 'Contract qualification credit mismatch' }
    return $contract
}

function Assert-R10Bundle([string]$StageRoot, [object]$Contract) {
    $manifestPath = Join-Path $StageRoot 'bundle_manifest.json'
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'Bundle manifest is absent' }
    $manifest = Read-R10Json $manifestPath
    Assert-R10ExactKeys $manifest @('schema', 'probe_id', 'nonce', 'files') 'bundle manifest'
    if ($manifest.schema -cne 'puppetmaster.r10.omp_tui_zero_model_bundle.v1' -or $manifest.probe_id -cne $Contract.probe_id -or $manifest.nonce -cne $Contract.nonce) { throw 'Bundle manifest identity mismatch' }
    $expectedNames = [string[]]@('probe_contract.json', 'R10_PROBE_COMMON.ps1', 'R10_ZERO_MODEL_DRIVER.ps1', 'R10_ZERO_MODEL_RECEIVER.ps1', 'R10_ZERO_MODEL_WRAPPER.ps1')
    $actualNames = [string[]]@($manifest.files | ForEach-Object { [string]$_.name })
    if (-not (Test-R10ExactArray $actualNames $expectedNames)) { throw 'Bundle manifest roster mismatch' }
    foreach ($record in $manifest.files) {
        Assert-R10ExactKeys $record @('name', 'bytes', 'sha256') "bundle file $($record.name)"
        $path = Join-Path $StageRoot $record.name
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Bundle file absent: $($record.name)" }
        $info = Get-Item -LiteralPath $path
        if ([long]$info.Length -ne [long]$record.bytes) { throw "Bundle byte mismatch: $($record.name)" }
        if ((Get-R10FileSha256 $path) -cne [string]$record.sha256) { throw "Bundle hash mismatch: $($record.name)" }
    }
    return $manifest
}

function Assert-R10HostIdentity([object]$Contract, [bool]$RequireInteractiveSession) {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $process = [Diagnostics.Process]::GetCurrentProcess()
    if ($env:COMPUTERNAME -cne $Contract.windows.host) { throw 'Host mismatch' }
    if ([Environment]::UserName -cne $Contract.windows.user) { throw 'User mismatch' }
    if ($identity.User.Value -cne $Contract.windows.user_sid) { throw 'User SID mismatch' }
    if ($PSVersionTable.PSVersion.ToString() -cne $Contract.runtime.ps_version) { throw 'PowerShell version mismatch' }
    if ($PSVersionTable.PSEdition -cne $Contract.runtime.ps_edition) { throw 'PowerShell edition mismatch' }
    if ([Environment]::Version.ToString() -cne $Contract.runtime.clr_version) { throw 'CLR version mismatch' }
    if ([string]$PSNativeCommandArgumentPassing -cne $Contract.runtime.native_argument_passing) { throw 'Native argument passing mode mismatch' }
    if ($RequireInteractiveSession -and $process.SessionId -ne [int]$Contract.windows.required_session_id) { throw 'Interactive session mismatch' }
}
