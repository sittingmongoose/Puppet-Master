Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$stageRoot = 'C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651'
. (Join-Path $stageRoot 'R10_PROBE_COMMON.ps1')
$contract = Get-R10Contract $stageRoot
[void](Assert-R10Bundle $stageRoot $contract)
Assert-R10HostIdentity $contract $true
$evidenceRoot = [string]$contract.windows.evidence_root
$wrapperArgv = [string[]]@($args)
$fakeNativeArgv = [string[]]@($contract.fake_native_argv)
$receiverPath = Join-Path $stageRoot 'R10_ZERO_MODEL_RECEIVER.ps1'
$pwshPath = [string]$contract.windows.pwsh_path
$process = [Diagnostics.Process]::GetCurrentProcess()

Write-R10NewJson (Join-Path $evidenceRoot 'wrapper_launch.json') ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_wrapper_launch.v2'
    probe_id = $contract.probe_id
    nonce = $contract.nonce
    observed_utc = [DateTime]::UtcNow.ToString('o')
    wrapper_pid = $PID
    session_id = $process.SessionId
    executable_path = $process.MainModule.FileName
    wrapper_argv = $wrapperArgv
    wrapper_arg_count = $wrapperArgv.Count
    receiver_path = $receiverPath
    fake_native_argv = $fakeNativeArgv
})

if ($wrapperArgv.Count -ne 0) {
    Write-R10NewJson (Join-Path $evidenceRoot 'wrapper_terminal.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_wrapper_terminal.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        wrapper_pid = $PID
        session_id = $process.SessionId
        status = 'FAIL_UNEXPECTED_WRAPPER_ARGUMENT'
        observed_utc = [DateTime]::UtcNow.ToString('o')
        qualification_credit = 0
    })
    exit 63
}
if (-not (Test-Path -LiteralPath $receiverPath -PathType Leaf)) { throw 'Receiver is absent' }
if ($fakeNativeArgv.Where({ -not $_.StartsWith('--', [StringComparison]::Ordinal) }).Count -ne 0) { throw 'Unexpected positional fake-native token' }

& $pwshPath -NoLogo -NoProfile -File $receiverPath @fakeNativeArgv
$receiverExit = $LASTEXITCODE
Write-R10NewJson (Join-Path $evidenceRoot 'wrapper_terminal.json') ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_wrapper_terminal.v2'
    probe_id = $contract.probe_id
    nonce = $contract.nonce
    wrapper_pid = $PID
    session_id = $process.SessionId
    observed_utc = [DateTime]::UtcNow.ToString('o')
    receiver_exit_code = $receiverExit
    status = $(if ($receiverExit -eq 0) { 'PASS' } else { 'FAIL_RECEIVER' })
    qualification_credit = 0
})
exit $receiverExit
