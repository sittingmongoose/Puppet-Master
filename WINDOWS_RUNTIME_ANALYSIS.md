# Windows Tauri Runtime Dependencies: Analysis & Recommendations

**Platform:** Windows 10+ (x64/ARM64)  
**Tauri Version:** 2.x  
**Build Target:** MSVC (Microsoft Visual C++)

---

## Current Implementation Analysis

### What `build-installer.ts` Does (Lines 127-136)

```typescript
// Copy .exe (and any adjacent .dlls, if present) to app directory
const appDir = path.join(payloadRoot, 'app');
await cp(tauriPath, path.join(appDir, 'puppet-master-gui.exe'));

try {
  const releaseDir = path.dirname(tauriPath);
  const entries = await readdir(releaseDir);
  const dlls = entries.filter((e) => e.toLowerCase().endsWith('.dll'));
  for (const dll of dlls) {
    await cp(path.join(releaseDir, dll), path.join(appDir, dll));
  }
} catch {
  // Best-effort
}
```

**What This Captures:**
- ✅ Tauri-generated DLLs (if any)
- ✅ Third-party native dependencies (e.g., SQLite, OpenSSL)
- ✅ Rust-compiled native modules

**What This MISSES:**
- ❌ System DLLs (VC++ Runtime)
- ❌ WebView2 Runtime (not a DLL, it's a system component)

---

## Required Runtime Components

### 1. Visual C++ Redistributable (VC++ Runtime)

**Required DLLs:**
- `vcruntime140.dll` - Base runtime
- `msvcp140.dll` - C++ standard library
- `vcruntime140_1.dll` - Extended runtime (x64 only)

**Source:** Microsoft Visual C++ 2015-2022 Redistributable

**Typical Locations:**
- `C:\Windows\System32\` (system-wide install)
- `C:\Windows\SysWOW64\` (32-bit on 64-bit Windows)

**Why NOT Copied by Current Script:**
- These DLLs are NOT in `target/release/` directory
- They're system DLLs installed via redistributable package

**Recommended Approach:** ✅ **Prerequisite Check in Installer**

---

### 2. Microsoft Edge WebView2 Runtime

**Type:** System Component (not a DLL)

**Required For:** 
- Rendering web content in Tauri window
- JavaScript execution
- CSS styling
- Modern web APIs

**Installation:**
- **Evergreen Runtime:** Auto-updates via Windows Update (~100MB)
- **Fixed Version:** Bundled with app (~150MB+)

**Current Implementation:** ❌ Not handled

**Recommended Approach:** ✅ **Runtime Prerequisite Check**

---

### 3. Tauri-Specific DLLs

**Potential DLLs in `target/release/`:**
- None by default for basic Tauri v2 apps
- May include plugin-specific DLLs (rare)

**Current Implementation:** ✅ **Already handled** by DLL copying loop

---

## Recommendation: Keep Current Approach + Add Prerequisites

### ✅ What to Keep

**Current DLL copying is CORRECT for:**
1. **Rust-compiled libraries** - Any Rust dependencies that build to DLLs
2. **Third-party native modules** - SQLite, OpenSSL, etc. (if used)
3. **Tauri plugins** - Native plugin DLLs (if used)

**Why it works:**
- These DLLs ARE in `target/release/` after build
- They must be co-located with the .exe
- Copying them is correct and necessary

### ⚠️ What to Add

**1. VC++ Runtime Check in NSIS Installer**

Add to `installer/win/puppet-master.nsi`:

```nsis
; ============================================================================
; Section: Check VC++ Runtime Prerequisites
; ============================================================================
Section "Check Prerequisites"
  ; Check for vcruntime140.dll in System32
  IfFileExists "$SYSDIR\vcruntime140.dll" vcruntime_ok vcruntime_missing
  
  vcruntime_missing:
    MessageBox MB_YESNO "Microsoft Visual C++ 2015-2022 Redistributable is required.$\n$\nDownload and install now?" IDYES download_vcruntime
    DetailPrint "Warning: VC++ Runtime not found. Application may not start."
    Goto vcruntime_ok
  
  download_vcruntime:
    ; x64 download
    ${If} ${RunningX64}
      ExecShell "open" "https://aka.ms/vs/17/release/vc_redist.x64.exe"
    ${Else}
      ; x86 download (if we support 32-bit)
      ExecShell "open" "https://aka.ms/vs/17/release/vc_redist.x86.exe"
    ${EndIf}
    MessageBox MB_OK "Please complete the VC++ Runtime installation and then rerun this installer."
    Abort
  
  vcruntime_ok:
    DetailPrint "VC++ Runtime check passed"
    
SectionEnd
```

**2. WebView2 Runtime Check in NSIS Installer**

Add to `installer/win/puppet-master.nsi`:

```nsis
; ============================================================================
; Section: Check WebView2 Runtime Prerequisites
; ============================================================================
Section "Check WebView2"
  ; Check for WebView2 registry key (Evergreen runtime)
  ReadRegStr $0 HKLM "SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
  ${If} $0 != ""
    DetailPrint "WebView2 Runtime found: $0"
    Goto webview2_ok
  ${EndIf}
  
  ; Check 32-bit registry (on 32-bit Windows)
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" "pv"
  ${If} $0 != ""
    DetailPrint "WebView2 Runtime found: $0"
    Goto webview2_ok
  ${EndIf}
  
  webview2_missing:
    MessageBox MB_YESNO "Microsoft Edge WebView2 Runtime is required.$\n$\nDownload and install now?" IDYES download_webview2
    DetailPrint "Warning: WebView2 Runtime not found. Application may not start."
    Goto webview2_ok
  
  download_webview2:
    ExecShell "open" "https://go.microsoft.com/fwlink/p/?LinkId=2124703"
    MessageBox MB_OK "Please complete the WebView2 Runtime installation and then rerun this installer."
    Abort
  
  webview2_ok:
    DetailPrint "WebView2 Runtime check passed"
    
SectionEnd
```

**3. Runtime Check in Tauri App Startup (Optional)**

Add to `src-tauri/src/main.rs`:

```rust
#[cfg(target_os = "windows")]
fn check_webview2_available() -> Result<(), Box<dyn std::error::Error>> {
    use std::process::Command;
    
    // Query registry for WebView2
    let output = Command::new("reg")
        .args(&[
            "query",
            "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\EdgeUpdate\\Clients\\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
            "/v",
            "pv"
        ])
        .output()?;
    
    if !output.status.success() {
        return Err("WebView2 Runtime not found. Please install it from: https://go.microsoft.com/fwlink/p/?LinkId=2124703".into());
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "windows")]
    if let Err(e) = check_webview2_available() {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
    
    tauri::Builder::default()
        // ... rest of builder ...
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## Alternative: Bundle VC++ Runtime (Not Recommended)

### Option: Local DLL Deployment

You could manually copy system DLLs to the app directory:

```typescript
// DON'T DO THIS - just showing what it would look like
const systemDlls = [
  'C:\\Windows\\System32\\vcruntime140.dll',
  'C:\\Windows\\System32\\msvcp140.dll',
  'C:\\Windows\\System32\\vcruntime140_1.dll'
];

for (const dll of systemDlls) {
  if (existsSync(dll)) {
    await cp(dll, path.join(appDir, path.basename(dll)));
  }
}
```

**Why This is BAD:**
- ❌ Violates Microsoft redistribution terms (must use installer)
- ❌ DLLs won't receive security updates
- ❌ Version conflicts with other apps
- ❌ Adds ~2-3MB to installer
- ❌ May not work on all Windows versions

**Better:** Use proper redistributable installer prerequisite

---

## Recommended Implementation Plan

### Phase 1: Minimal (Current - Sufficient for Most Cases)

**Status:** ✅ Already Done

- Keep existing DLL copying logic
- Document WebView2 as prerequisite in README
- Rely on Windows Update for WebView2 (most Windows 10+ have it)

**Works for:**
- Windows 10 version 1803+ (April 2018 or later)
- Windows 11 (all versions)
- Systems with Edge browser installed

### Phase 2: Add Installer Checks (Recommended)

**Changes Required:**
1. Update `installer/win/puppet-master.nsi` with prerequisite checks
2. Test on clean Windows VM
3. Document prerequisites in user guide

**Timeline:** 1-2 hours  
**Risk:** Low (non-breaking addition)

### Phase 3: Runtime Validation (Optional)

**Changes Required:**
1. Add WebView2 check to `src-tauri/src/main.rs`
2. Show user-friendly error with download link
3. Add telemetry for missing runtime failures

**Timeline:** 2-4 hours  
**Risk:** Very low (just better UX)

---

## Testing Matrix

### Test Scenarios

| OS | VC++ Runtime | WebView2 | Expected Result |
|----|--------------|----------|-----------------|
| Windows 11 | ✅ Present | ✅ Present | App launches |
| Windows 10 21H2 | ✅ Present | ✅ Present | App launches |
| Windows 10 1803 | ❌ Missing | ✅ Present | App fails with DLL error |
| Windows 10 21H2 | ✅ Present | ❌ Missing | App fails with WebView2 error |
| Windows 10 1803 | ❌ Missing | ❌ Missing | Installer prompts for both |

### Test VMs Needed

1. **Windows 10 LTSC 2019** (no WebView2 by default)
2. **Windows 10 21H2** (fresh install, minimal updates)
3. **Windows 11 22H2** (should have everything)

---

## FAQ

### Q: Why not just bundle everything?

**A:** 
- VC++ Runtime must be installed via official redistributable (licensing)
- WebView2 is 100-150MB (would double installer size)
- System updates keep runtimes patched (better security)
- Most Windows 10+ users already have these

### Q: Will the app work on fresh Windows 10?

**A:** 
- Depends on Windows version and update level
- Windows 10 1903+ usually has WebView2 from Windows Update
- VC++ Runtime is commonly installed by other apps
- Recommendation: Add prerequisite checks to be safe

### Q: What if user doesn't have internet to download prerequisites?

**A:**
- Provide offline installer download links in docs
- Consider creating "full" installer variant with bundled prerequisites
- WebView2 offline installer: ~150MB
- VC++ Runtime offline installer: ~25MB

### Q: Can we detect prerequisites before installation?

**A:** Yes, that's what the NSIS checks do:
- Check registry for WebView2
- Check System32 for VC++ Runtime DLLs
- Prompt user before installation completes
- Provide download links if missing

---

## Summary & Recommendation

### ✅ Current DLL Copying: SUFFICIENT

The existing implementation correctly handles:
- Tauri-generated DLLs (if any)
- Third-party native dependencies
- Rust-compiled libraries

**No changes needed** to the DLL copying logic.

### ⚠️ Add Prerequisite Checks: RECOMMENDED

Add to NSIS installer:
1. VC++ Runtime check (registry + file check)
2. WebView2 Runtime check (registry check)
3. User prompts with download links if missing

**Effort:** 1-2 hours  
**Benefit:** Prevents "app won't start" support tickets

### 📝 Document Requirements: ESSENTIAL

Add to README.md:

```markdown
## Windows Requirements

- Windows 10 version 1803 or later (64-bit)
- Microsoft Visual C++ 2015-2022 Redistributable (x64)
  - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
- Microsoft Edge WebView2 Runtime (Evergreen)
  - Download: https://go.microsoft.com/fwlink/p/?LinkId=2124703
  - Usually pre-installed on Windows 10 21H1+ and Windows 11

Most systems already have these components installed.
```

---

**Final Verdict:** Copy of adjacent DLLs is **sufficient** for Tauri-specific dependencies. System prerequisites should be handled via installer checks and documentation, not by copying system DLLs.

**Status:** ✅ Current implementation is CORRECT  
**Action Required:** Add installer prerequisite checks (recommended but not critical)
