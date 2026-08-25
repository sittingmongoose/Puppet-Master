Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$stageRoot = 'C:\Users\sitti\AppData\Local\PuppetMaster\R10\omp_tui_probe_001_64b55fe75fe02651'
$evidenceRoot = Join-Path $stageRoot 'evidence'
$attemptPath = Join-Path $evidenceRoot 'attempt.json'
$terminalPath = Join-Path $evidenceRoot 'driver_terminal.json'
$bootstrapUtf8 = [System.Text.UTF8Encoding]::new($false, $true)
$commonLoaded = $false
$nativeUiLoaded = $false
$selectedWindow = $null
$wrapperPid = 0
$receiverPid = 0
$driverDeadline = [DateTime]::UtcNow.AddMilliseconds(110000)

function Write-BootstrapNewJson([string]$Path, [object]$Value) {
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

function Assert-DriverDeadline {
    if ([DateTime]::UtcNow -ge $driverDeadline) { throw 'Internal driver receipt deadline reached' }
}

if (Test-Path -LiteralPath $evidenceRoot) {
    exit 90
}
[void][System.IO.Directory]::CreateDirectory($evidenceRoot)
Write-BootstrapNewJson $attemptPath ([ordered]@{
    schema = 'puppetmaster.r10.omp_tui_zero_model_attempt.v2'
    probe_id = 'r10-omp-tui-zero-model-001'
    nonce = '64b55fe75fe02651'
    attempted_utc = [DateTime]::UtcNow.ToString('o')
    driver_pid = $PID
    observed_host = $env:COMPUTERNAME
    observed_user = [Environment]::UserName
    observed_user_sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    observed_session_id = [Diagnostics.Process]::GetCurrentProcess().SessionId
    retry_count = 0
    qualification_credit = 0
})

$nativeUiSource = @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

public sealed class R10WindowRecord {
    public IntPtr Hwnd { get; set; }
    public uint ProcessId { get; set; }
    public string Title { get; set; }
    public bool Visible { get; set; }
}

public static class R10NativeUi {
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct INPUT {
        public uint type;
        public INPUTUNION U;
    }

    [StructLayout(LayoutKind.Explicit)]
    private struct INPUTUNION {
        [FieldOffset(0)] public KEYBDINPUT ki;
        [FieldOffset(0)] public MOUSEINPUT mi;
        [FieldOffset(0)] public HARDWAREINPUT hi;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public UIntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MOUSEINPUT {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public UIntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct HARDWAREINPUT {
        public uint uMsg;
        public ushort wParamL;
        public ushort wParamH;
    }

    [DllImport("user32.dll")]
    private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    private static extern bool IsWindow(IntPtr hWnd);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")]
    private static extern int GetWindowTextLength(IntPtr hWnd);
    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint count, INPUT[] inputs, int size);
    [DllImport("kernel32.dll")]
    public static extern uint WTSGetActiveConsoleSessionId();

    private const uint INPUT_KEYBOARD = 1;
    private const uint KEYEVENTF_KEYUP = 0x0002;
    private const uint KEYEVENTF_UNICODE = 0x0004;
    private const ushort VK_RETURN = 0x000D;

    public static R10WindowRecord[] AllWindows() {
        var records = new List<R10WindowRecord>();
        EnumWindows(delegate(IntPtr hWnd, IntPtr lParam) {
            int length = GetWindowTextLength(hWnd);
            var text = new StringBuilder(Math.Max(length + 1, 1));
            if (length > 0) GetWindowText(hWnd, text, text.Capacity);
            uint processId;
            GetWindowThreadProcessId(hWnd, out processId);
            records.Add(new R10WindowRecord { Hwnd = hWnd, ProcessId = processId, Title = text.ToString(), Visible = IsWindowVisible(hWnd) });
            return true;
        }, IntPtr.Zero);
        return records.ToArray();
    }

    public static R10WindowRecord[] ExactTitle(string title) {
        var records = new List<R10WindowRecord>();
        foreach (R10WindowRecord record in AllWindows()) {
            if (String.Equals(record.Title, title, StringComparison.Ordinal)) records.Add(record);
        }
        return records.ToArray();
    }

    public static bool WindowExists(IntPtr hWnd) {
        return IsWindow(hWnd);
    }

    public static int InputSize() {
        return Marshal.SizeOf(typeof(INPUT));
    }

    public static uint SendUnicodeLine(string value) {
        var inputs = new List<INPUT>();
        foreach (char character in value) {
            inputs.Add(new INPUT { type = INPUT_KEYBOARD, U = new INPUTUNION { ki = new KEYBDINPUT { wVk = 0, wScan = character, dwFlags = KEYEVENTF_UNICODE } } });
            inputs.Add(new INPUT { type = INPUT_KEYBOARD, U = new INPUTUNION { ki = new KEYBDINPUT { wVk = 0, wScan = character, dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP } } });
        }
        inputs.Add(new INPUT { type = INPUT_KEYBOARD, U = new INPUTUNION { ki = new KEYBDINPUT { wVk = VK_RETURN, wScan = 0, dwFlags = 0 } } });
        inputs.Add(new INPUT { type = INPUT_KEYBOARD, U = new INPUTUNION { ki = new KEYBDINPUT { wVk = VK_RETURN, wScan = 0, dwFlags = KEYEVENTF_KEYUP } } });
        INPUT[] array = inputs.ToArray();
        return SendInput((uint)array.Length, array, Marshal.SizeOf(typeof(INPUT)));
    }
}
'@

function Wait-R10Leaf([string]$Path, [int]$TimeoutMs) {
    $localDeadline = [DateTime]::UtcNow.AddMilliseconds($TimeoutMs)
    while ([DateTime]::UtcNow -lt $localDeadline -and [DateTime]::UtcNow -lt $driverDeadline) {
        if (Test-Path -LiteralPath $Path -PathType Leaf) { return }
        Start-Sleep -Milliseconds 100
    }
    throw "Timed out waiting for $Path"
}

function Get-ExactTitleWindows([string]$Title) {
    return @([R10NativeUi]::ExactTitle($Title))
}

function Get-R10ProcessChain([int]$StartPid) {
    $records = [System.Collections.Generic.List[object]]::new()
    $seen = [System.Collections.Generic.HashSet[int]]::new()
    $current = $StartPid
    while ($current -gt 0 -and $records.Count -lt 16 -and $seen.Add($current)) {
        $item = Get-CimInstance Win32_Process -Filter "ProcessId=$current"
        if ($null -eq $item) { break }
        $records.Add([pscustomobject]@{
            process_id = [int]$item.ProcessId
            parent_process_id = [int]$item.ParentProcessId
            name = [string]$item.Name
            session_id = [int]$item.SessionId
            executable_path = [string]$item.ExecutablePath
            command_line = [string]$item.CommandLine
            creation_date = $item.CreationDate.ToUniversalTime().ToString('o')
        })
        if ([int]$item.ParentProcessId -eq $current) { break }
        $current = [int]$item.ParentProcessId
    }
    return @($records)
}

function Assert-R10ReceiptIdentity([object]$Receipt, [string]$Schema, [object]$Contract) {
    if ($Receipt.schema -cne $Schema -or $Receipt.probe_id -cne $Contract.probe_id -or $Receipt.nonce -cne $Contract.nonce) {
        throw "Receipt identity mismatch for $Schema"
    }
}

function Assert-R10WindowReady([object]$Window, [object]$Contract) {
    Assert-DriverDeadline
    $matches = Get-ExactTitleWindows $Contract.windows.title
    if ($matches.Count -ne 1 -or -not [bool]$matches[0].Visible -or $matches[0].Hwnd -ne $Window.Hwnd -or [int]$matches[0].ProcessId -ne [int]$Window.ProcessId) {
        throw 'Exact-title HWND binding changed'
    }
    if ([R10NativeUi]::GetForegroundWindow() -ne $Window.Hwnd) { throw 'Exact-title HWND is not foreground' }
    $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($Window.ProcessId)"
    if ($null -eq $owner -or $owner.Name -cne 'WindowsTerminal.exe' -or [int]$owner.SessionId -ne [int]$Contract.windows.required_session_id) {
        throw 'Exact-title HWND owner changed'
    }
    if (@(Get-CimInstance Win32_Process -Filter "Name='omp.exe'").Count -ne 0) { throw 'An omp.exe endpoint appeared before or after inert input' }
}

function Test-R10PidExists([int]$ProcessId) {
    return $null -ne (Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId")
}

function Write-R10DeadlineBoundPassJson([string]$Path, [object]$Value) {
    $bytes = $bootstrapUtf8.GetBytes(($Value | ConvertTo-Json -Depth 16 -Compress))
    $publishing = "$Path.pass-publishing-$PID"
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
    Assert-DriverDeadline
    [System.IO.File]::Move($publishing, $Path, $false)
}

function Write-R10DriverTerminal([string]$Status, [string]$Detail, [int]$TitleMatches) {
    $value = [ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_driver_terminal.v2'
        probe_id = 'r10-omp-tui-zero-model-001'
        nonce = '64b55fe75fe02651'
        status = $Status
        detail = $Detail
        observed_utc = [DateTime]::UtcNow.ToString('o')
        exact_title_match_count = $TitleMatches
        claim_scope = 'reviewed bundle has no direct OMP/provider/subject invocation; omp.exe endpoint sampled before and after input only'
        retry_count = 0
        qualification_credit = 0
    }
    if ($Status -ceq 'PASS_ZERO_MODEL_TRANSPORT_ONLY') {
        Write-R10DeadlineBoundPassJson $terminalPath $value
    }
    elseif ($commonLoaded) {
        Write-R10NewJson $terminalPath $value
    }
    else {
        Write-BootstrapNewJson $terminalPath $value
    }
}

try {
    . (Join-Path $stageRoot 'R10_PROBE_COMMON.ps1')
    $commonLoaded = $true
    $contract = Get-R10Contract $stageRoot
    $manifest = Assert-R10Bundle $stageRoot $contract
    Assert-R10HostIdentity $contract $true
    Write-R10NewJson (Join-Path $evidenceRoot 'bundle_preflight.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_bundle_preflight.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        observed_utc = [DateTime]::UtcNow.ToString('o')
        manifest_sha256 = Get-R10FileSha256 (Join-Path $stageRoot 'bundle_manifest.json')
        contract_sha256 = Get-R10FileSha256 (Join-Path $stageRoot 'probe_contract.json')
        host = $env:COMPUTERNAME
        user = [Environment]::UserName
        user_sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
        session_id = [Diagnostics.Process]::GetCurrentProcess().SessionId
        ps_version = $PSVersionTable.PSVersion.ToString()
        clr_version = [Environment]::Version.ToString()
        native_argument_passing = [string]$PSNativeCommandArgumentPassing
    })
    Add-Type -TypeDefinition $nativeUiSource
    $nativeUiLoaded = $true
    Assert-DriverDeadline
    if ([R10NativeUi]::InputSize() -ne [int]$contract.runtime.input_struct_bytes) { throw 'INPUT structure size mismatch' }
    $activeSessionId = [int][R10NativeUi]::WTSGetActiveConsoleSessionId()
    if ($activeSessionId -ne [int]$contract.windows.required_session_id) { throw 'Active console session mismatch' }
    if (@(Get-CimInstance Win32_Process -Filter "Name='omp.exe'").Count -ne [int]$contract.ceilings.omp_endpoint_count_before) { throw 'Preflight omp.exe endpoint count mismatch' }

    $prelaunchWindows = @([R10NativeUi]::AllWindows())
    $prelaunchHwnds = [long[]]@($prelaunchWindows | ForEach-Object { $_.Hwnd.ToInt64() })
    if ((Get-ExactTitleWindows $contract.windows.title).Count -ne 0) { throw 'Exact title already exists' }
    Write-R10NewJson (Join-Path $evidenceRoot 'prelaunch_windows.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_prelaunch_windows.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        observed_utc = [DateTime]::UtcNow.ToString('o')
        windows = @($prelaunchWindows | ForEach-Object { [ordered]@{ hwnd = $_.Hwnd.ToInt64(); process_id = [int]$_.ProcessId; title = $_.Title; visible = [bool]$_.Visible } })
    })

    $wtArgv = [string[]]@(
        '--window', [string]$contract.windows.window_id,
        'new-tab',
        '--title', [string]$contract.windows.title,
        '--suppressApplicationTitle',
        '--startingDirectory', [string]$contract.windows.stage_root,
        [string]$contract.windows.pwsh_path,
        '-NoLogo',
        '-NoProfile',
        '-File',
        (Join-Path $stageRoot 'R10_ZERO_MODEL_WRAPPER.ps1')
    )
    $psi = [Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = [string]$contract.windows.wt_path
    $psi.UseShellExecute = $false
    foreach ($token in $wtArgv) { [void]$psi.ArgumentList.Add($token) }
    $launchProcess = [Diagnostics.Process]::Start($psi)
    Write-R10NewJson (Join-Path $evidenceRoot 'wt_launch.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_wt_launch.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        observed_utc = [DateTime]::UtcNow.ToString('o')
        executable = $contract.windows.wt_path
        argv = $wtArgv
        returned_pid = $launchProcess.Id
        wrapper_argument_count = 0
    })

    Wait-R10Leaf (Join-Path $evidenceRoot 'receiver_ready.json') 15000
    $wrapperLaunch = Read-R10Json (Join-Path $evidenceRoot 'wrapper_launch.json')
    $receiverArgv = Read-R10Json (Join-Path $evidenceRoot 'receiver_argv.json')
    $receiverReady = Read-R10Json (Join-Path $evidenceRoot 'receiver_ready.json')
    Assert-R10ReceiptIdentity $wrapperLaunch 'puppetmaster.r10.omp_tui_zero_model_wrapper_launch.v2' $contract
    Assert-R10ReceiptIdentity $receiverArgv 'puppetmaster.r10.omp_tui_zero_model_receiver_argv.v2' $contract
    Assert-R10ReceiptIdentity $receiverReady 'puppetmaster.r10.omp_tui_zero_model_receiver_ready.v2' $contract
    if ([int]$wrapperLaunch.wrapper_arg_count -ne 0 -or @($wrapperLaunch.wrapper_argv).Count -ne 0) { throw 'Wrapper received an argument' }
    if ($receiverArgv.exact -isnot [bool] -or $receiverArgv.exact -ne $true) { throw 'Receiver argv exact flag is not Boolean true' }
    if (-not (Test-R10ExactArray @($receiverArgv.argv) @($contract.fake_native_argv))) { throw 'Receiver argv value mismatch' }
    $wrapperPid = [int]$wrapperLaunch.wrapper_pid
    $receiverPid = [int]$receiverArgv.receiver_pid
    if ($wrapperPid -le 0 -or $receiverPid -le 0 -or [int]$receiverArgv.parent_pid -ne $wrapperPid -or [int]$receiverReady.parent_pid -ne $wrapperPid -or [int]$receiverReady.receiver_pid -ne $receiverPid) { throw 'Wrapper/receiver PID join mismatch' }
    if ([int]$wrapperLaunch.session_id -ne 4 -or [int]$receiverArgv.session_id -ne 4 -or [int]$receiverReady.session_id -ne 4) { throw 'Wrapper/receiver session mismatch' }

    $titleDeadline = [DateTime]::UtcNow.AddSeconds(15)
    $titleWindows = @()
    while ([DateTime]::UtcNow -lt $titleDeadline -and [DateTime]::UtcNow -lt $driverDeadline) {
        $titleWindows = Get-ExactTitleWindows $contract.windows.title
        if ($titleWindows.Count -eq 1) { break }
        if ($titleWindows.Count -gt 1) { throw 'Multiple exact-title windows' }
        Start-Sleep -Milliseconds 100
    }
    if ($titleWindows.Count -ne 1 -or -not [bool]$titleWindows[0].Visible) { throw 'One visible exact-title window was not found' }
    $selectedWindow = $titleWindows[0]
    if ($prelaunchHwnds -contains $selectedWindow.Hwnd.ToInt64()) { throw 'Selected HWND existed before launch' }
    $windowProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$($selectedWindow.ProcessId)"
    if ($null -eq $windowProcess -or $windowProcess.Name -cne 'WindowsTerminal.exe' -or [int]$windowProcess.SessionId -ne 4) { throw 'Selected HWND owner mismatch' }
    $processChain = Get-R10ProcessChain $receiverPid
    if (@($processChain | Where-Object { $_.process_id -eq [int]$selectedWindow.ProcessId }).Count -ne 1) { throw 'Selected Windows Terminal PID is not in receiver ancestry' }
    Write-R10NewJson (Join-Path $evidenceRoot 'custody.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_custody.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        observed_utc = [DateTime]::UtcNow.ToString('o')
        hwnd = $selectedWindow.Hwnd.ToInt64()
        windows_terminal_pid = [int]$selectedWindow.ProcessId
        title = $selectedWindow.Title
        visible = [bool]$selectedWindow.Visible
        wrapper_pid = $wrapperPid
        receiver_pid = $receiverPid
        process_chain = $processChain
    })

    $shell = New-Object -ComObject WScript.Shell
    $appActivated = $shell.AppActivate([string]$contract.windows.title)
    $setForeground = [R10NativeUi]::SetForegroundWindow($selectedWindow.Hwnd)
    Start-Sleep -Milliseconds 300
    Assert-R10WindowReady $selectedWindow $contract

    $inputBytes = $script:R10Utf8.GetBytes([string]$contract.inert_input)
    $inputSha = Get-R10Sha256Hex $inputBytes
    $expectedEvents = ([string]$contract.inert_input).Length * 2 + 2
    Write-R10NewJson (Join-Path $evidenceRoot 'input_reservation.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_input_reservation.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        reserved_utc = [DateTime]::UtcNow.ToString('o')
        input_ordinal = 1
        input_utf8_bytes = $inputBytes.Length
        input_sha256 = $inputSha
        expected_sendinput_events = $expectedEvents
        app_activate_returned = [bool]$appActivated
        set_foreground_returned = [bool]$setForeground
        foreground_hwnd = $selectedWindow.Hwnd.ToInt64()
    })
    if (-not $appActivated) { throw 'Live-title AppActivate returned false' }
    Assert-R10WindowReady $selectedWindow $contract
    $sentEvents = [R10NativeUi]::SendUnicodeLine([string]$contract.inert_input)
    Assert-R10WindowReady $selectedWindow $contract
    Write-R10NewJson (Join-Path $evidenceRoot 'input_result.json') ([ordered]@{
        schema = 'puppetmaster.r10.omp_tui_zero_model_input_result.v2'
        probe_id = $contract.probe_id
        nonce = $contract.nonce
        observed_utc = [DateTime]::UtcNow.ToString('o')
        input_ordinal = 1
        expected_sendinput_events = $expectedEvents
        returned_sendinput_events = $sentEvents
        exact = $sentEvents -eq $expectedEvents
    })
    if ($sentEvents -ne $expectedEvents) { throw "SendInput returned $sentEvents of $expectedEvents events" }

    Wait-R10Leaf (Join-Path $evidenceRoot 'receiver_terminal.json') 35000
    Wait-R10Leaf (Join-Path $evidenceRoot 'wrapper_terminal.json') 5000
    $receiverInput = Read-R10Json (Join-Path $evidenceRoot 'receiver_input.json')
    $receiverTerminal = Read-R10Json (Join-Path $evidenceRoot 'receiver_terminal.json')
    $wrapperTerminal = Read-R10Json (Join-Path $evidenceRoot 'wrapper_terminal.json')
    Assert-R10ReceiptIdentity $receiverInput 'puppetmaster.r10.omp_tui_zero_model_receiver_input.v2' $contract
    Assert-R10ReceiptIdentity $receiverTerminal 'puppetmaster.r10.omp_tui_zero_model_receiver_terminal.v2' $contract
    Assert-R10ReceiptIdentity $wrapperTerminal 'puppetmaster.r10.omp_tui_zero_model_wrapper_terminal.v2' $contract
    if ([int]$receiverInput.receiver_pid -ne $receiverPid -or [int]$receiverTerminal.receiver_pid -ne $receiverPid -or [int]$wrapperTerminal.wrapper_pid -ne $wrapperPid) { throw 'Terminal receipt PID join mismatch' }
    if ([int]$receiverInput.session_id -ne 4 -or [int]$receiverTerminal.session_id -ne 4 -or [int]$wrapperTerminal.session_id -ne 4) { throw 'Terminal receipt session mismatch' }
    if ($receiverInput.exact -isnot [bool] -or $receiverInput.exact -ne $true -or $receiverInput.line -cne $contract.inert_input) { throw 'Receiver input was not exact Boolean true' }
    if ($receiverTerminal.status -cne 'PASS' -or $wrapperTerminal.status -cne 'PASS' -or [int]$wrapperTerminal.receiver_exit_code -ne 0) { throw 'Receiver or wrapper terminal was not PASS' }

    $exitDeadline = [DateTime]::UtcNow.AddSeconds(10)
    while ([DateTime]::UtcNow -lt $exitDeadline -and [DateTime]::UtcNow -lt $driverDeadline) {
        if (-not (Test-R10PidExists $receiverPid) -and -not (Test-R10PidExists $wrapperPid) -and -not [R10NativeUi]::WindowExists($selectedWindow.Hwnd)) { break }
        Start-Sleep -Milliseconds 100
    }
    if ((Test-R10PidExists $receiverPid) -or (Test-R10PidExists $wrapperPid)) { throw 'Wrapper or receiver PID remained after terminal receipt' }
    if ([R10NativeUi]::WindowExists($selectedWindow.Hwnd)) { throw 'Original selected HWND remained after receiver exit' }
    if ((Get-ExactTitleWindows $contract.windows.title).Count -ne 0) { throw 'Exact title remained after receiver exit' }
    if (@(Get-CimInstance Win32_Process -Filter "Name='omp.exe'").Count -ne [int]$contract.ceilings.omp_endpoint_count_after) { throw 'Terminal omp.exe endpoint count mismatch' }

    Write-R10DriverTerminal 'PASS_ZERO_MODEL_TRANSPORT_ONLY' 'Exact argv, new HWND, live-title activation, one inert input, joined receiver custody, and terminal teardown passed.' 0
    exit 0
}
catch {
    $detail = "$($_.Exception.GetType().FullName): $($_.Exception.Message)"
    if (-not (Test-Path -LiteralPath $terminalPath)) {
        try { Write-R10DriverTerminal 'FAIL_ZERO_MODEL_TRANSPORT_NO_RETRY' $detail -1 } catch { }
    }
    if ($nativeUiLoaded -and -not (Test-Path -LiteralPath (Join-Path $evidenceRoot 'residual_observation.json'))) {
        try {
            $residualDeadline = [DateTime]::UtcNow.AddSeconds(10)
            while ([DateTime]::UtcNow -lt $residualDeadline) {
                $windowAlive = $null -ne $selectedWindow -and [R10NativeUi]::WindowExists($selectedWindow.Hwnd)
                $wrapperAlive = $wrapperPid -gt 0 -and (Test-R10PidExists $wrapperPid)
                $receiverAlive = $receiverPid -gt 0 -and (Test-R10PidExists $receiverPid)
                if (-not $windowAlive -and -not $wrapperAlive -and -not $receiverAlive) { break }
                Start-Sleep -Milliseconds 100
            }
            Write-R10NewJson (Join-Path $evidenceRoot 'residual_observation.json') ([ordered]@{
                schema = 'puppetmaster.r10.omp_tui_zero_model_residual_observation.v2'
                probe_id = 'r10-omp-tui-zero-model-001'
                nonce = '64b55fe75fe02651'
                observed_utc = [DateTime]::UtcNow.ToString('o')
                selected_hwnd_exists = $null -ne $selectedWindow -and [R10NativeUi]::WindowExists($selectedWindow.Hwnd)
                wrapper_pid_exists = $wrapperPid -gt 0 -and (Test-R10PidExists $wrapperPid)
                receiver_pid_exists = $receiverPid -gt 0 -and (Test-R10PidExists $receiverPid)
                exact_title_match_count = (Get-ExactTitleWindows 'PM-R10-ZM-64b55fe75fe02651').Count
            })
        }
        catch { }
    }
    exit 1
}
