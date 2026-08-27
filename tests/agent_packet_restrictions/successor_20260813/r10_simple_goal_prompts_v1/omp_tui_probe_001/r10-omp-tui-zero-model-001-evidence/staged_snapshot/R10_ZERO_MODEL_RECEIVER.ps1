Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$stageRoot = 'C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651'
. (Join-Path $stageRoot 'R10_PROBE_COMMON.ps1')
$contract = Get-R10Contract $stageRoot
[void](Assert-R10Bundle $stageRoot $contract)
Assert-R10HostIdentity $contract $true
$evidenceRoot = [string]$contract.windows.evidence_root
$actualArgv = [string[]]@($args)
$expectedArgv = [string[]]@($contract.fake_native_argv)
$process = [Diagnostics.Process]::GetCurrentProcess()
$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$PID"
$argvExact = Test-R10ExactArray $actualArgv $expectedArgv

Write-R10NewJson (Join-Path $evidenceRoot 'receiver_argv.json') ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_receiver_argv.v2'
    probe_id = $contract.probe_id
    nonce = $contract.nonce
    observed_utc = [DateTime]::UtcNow.ToString('o')
    receiver_pid = $PID
    parent_pid = [int]$processInfo.ParentProcessId
    session_id = $process.SessionId
    executable_path = $process.MainModule.FileName
    argv = $actualArgv
    expected_argv = $expectedArgv
    exact = $argvExact
})

if (-not $argvExact) {
    Write-R10NewJson (Join-Path $evidenceRoot 'receiver_terminal.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_receiver_terminal.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        receiver_pid = $PID
        session_id = $process.SessionId
        status = 'FAIL_ARGV'
        observed_utc = [DateTime]::UtcNow.ToString('o')
        qualification_credit = 0
    })
    exit 64
}

Write-R10NewJson (Join-Path $evidenceRoot 'receiver_ready.json') ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_receiver_ready.v2'
    probe_id = $contract.probe_id
    nonce = $contract.nonce
    status = 'READY_FOR_ONE_INERT_LINE'
    observed_utc = [DateTime]::UtcNow.ToString('o')
    receiver_pid = $PID
    parent_pid = [int]$processInfo.ParentProcessId
    session_id = $process.SessionId
    requested_title = $contract.windows.title
})

$readTask = [Console]::In.ReadLineAsync()
if (-not $readTask.Wait([int]$contract.ceilings.receiver_timeout_ms)) {
    Write-R10NewJson (Join-Path $evidenceRoot 'receiver_terminal.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_receiver_terminal.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        receiver_pid = $PID
        session_id = $process.SessionId
        status = 'FAIL_INPUT_TIMEOUT'
        observed_utc = [DateTime]::UtcNow.ToString('o')
        qualification_credit = 0
    })
    exit 65
}

$line = $readTask.Result
$exactInput = $null -ne $line -and $line -ceq [string]$contract.inert_input
Write-R10NewJson (Join-Path $evidenceRoot 'receiver_input.json') ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_receiver_input.v2'
    probe_id = $contract.probe_id
    nonce = $contract.nonce
    receiver_pid = $PID
    session_id = $process.SessionId
    observed_utc = [DateTime]::UtcNow.ToString('o')
    line = $line
    expected_line = $contract.inert_input
    exact = $exactInput
})
Write-R10NewJson (Join-Path $evidenceRoot 'receiver_terminal.json') ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_receiver_terminal.v2'
    probe_id = $contract.probe_id
    nonce = $contract.nonce
    receiver_pid = $PID
    session_id = $process.SessionId
    status = $(if ($exactInput) { 'PASS' } else { 'FAIL_INPUT_MISMATCH' })
    observed_utc = [DateTime]::UtcNow.ToString('o')
    qualification_credit = 0
})

if (-not $exactInput) { exit 66 }
exit 0
