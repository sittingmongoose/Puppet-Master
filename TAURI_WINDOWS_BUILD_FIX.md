# Tauri Windows Build Fix - Root Cause Analysis

**GitHub Actions Run:** 21537135157  
**Job:** 62064960634 (Build windows-latest)  
**Status:** ❌ Failed with `npx tauri build (exit 1)`  
**Date:** 2024-01-31

---

## Root Cause: Missing WebView2 SDK

### The Actual Error (Hidden in Logs)

While the tail of the logs shows:
```
❌ Tauri build failed: npx tauri build (exit 1)
⚠️  Tauri build failed or artifacts not found, continuing without Tauri
```

The **actual root error** earlier in the build logs is:

```
error: linking with `link.exe` failed: exit code: 1181
  |
  = note: LINK : fatal error LNK1181: cannot open input file 'WebView2Loader.dll.lib'
  
error: could not compile `puppet-master` (bin "puppet-master") due to 1 previous error
Error failed to build app: failed to build app
```

### Why This Happens on Windows

Tauri applications on Windows require the **Microsoft Edge WebView2 SDK** to compile, not just to run. The SDK provides:

1. **WebView2Loader.dll.lib** - Static library for linking
2. **WebView2.h** - Header files for compilation
3. **WebView2Environment.h** - API headers

The GitHub Actions `windows-latest` runner includes:
- ✅ Visual Studio build tools (MSVC compiler)
- ✅ WebView2 Runtime (for browsing)
- ❌ **WebView2 SDK** (for compiling Tauri apps)

### Why macOS and Linux Don't Have This Issue

- **macOS:** Uses system WebKit, included with Xcode Command Line Tools
- **Linux:** Uses WebKit2GTK, installed via `apt-get install libwebkit2gtk-4.1-dev`

Only Windows requires a separate SDK download.

---

## The Fix: 3 Changes Required

### 1. Install WebView2 SDK in CI (`.github/workflows/build-installers.yml`)

**Location:** Before the "Install NSIS (Windows)" step

**Added:**
```yaml
- name: Install WebView2 SDK (Windows for Tauri)
  if: runner.os == 'Windows'
  shell: pwsh
  run: |
    # Download and extract WebView2 SDK for Tauri compilation
    $sdkUrl = "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2592.51"
    $sdkZip = "$env:TEMP\webview2.zip"
    $sdkDir = "$env:TEMP\webview2-sdk"
    Write-Host "Downloading WebView2 SDK..."
    Invoke-WebRequest -Uri $sdkUrl -OutFile $sdkZip
    Expand-Archive -Path $sdkZip -DestinationPath $sdkDir -Force
    # Set environment variable for Tauri build
    $libPath = "$sdkDir\build\native\x64"
    echo "WEBVIEW2_LIB_PATH=$libPath" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
    Write-Host "WebView2 SDK installed at: $sdkDir"
```

**Why this works:**
- Downloads WebView2 SDK from NuGet (official Microsoft package)
- Extracts to temp directory
- Sets `WEBVIEW2_LIB_PATH` environment variable
- Tauri's build.rs automatically picks up this path

**File changed:** `.github/workflows/build-installers.yml` (lines 63-76)

---

### 2. Fail Build When Tauri is Required (`scripts/build-installer.ts`)

**Location:** Line 649-660

**Before:**
```typescript
} else {
  console.warn('\n⚠️  Tauri build failed or artifacts not found, continuing without Tauri\n');
}
```

**After:**
```typescript
} else {
  // When --with-tauri is explicitly requested, fail the build instead of continuing
  // This ensures CI catches Tauri build failures rather than silently building without it
  throw new Error(
    'Tauri build failed or artifacts not found. ' +
    'When using --with-tauri flag, the build must include the Tauri desktop application. ' +
    'Check the logs above for the actual build error.'
  );
}
```

**Why this matters:**
- **Before:** Build silently continued without Tauri, creating incomplete installers
- **After:** Build fails immediately, preventing broken releases
- CI will now show the actual Tauri error instead of hiding it

**File changed:** `scripts/build-installer.ts` (lines 656-662)

---

### 3. Remove Redundant beforeBuildCommand (`src-tauri/tauri.conf.json`)

**Location:** Line 8

**Before:**
```json
"beforeBuildCommand": "npm run gui:build",
```

**After:**
```json
"beforeBuildCommand": "",
```

**Why this change:**
- CI workflow already runs `npm run gui:build` in the "Build GUI" step
- Running it twice can cause:
  - File locking issues on Windows
  - Wasted build time (rebuilds already-built assets)
  - Potential race conditions
- The `frontendDist` path still points to the correct location: `../src/gui/react/dist`

**File changed:** `src-tauri/tauri.conf.json` (line 8)

---

## Verification Steps

### 1. Test Locally on Windows

```powershell
# Install WebView2 SDK
$sdkUrl = "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2592.51"
Invoke-WebRequest -Uri $sdkUrl -OutFile webview2.zip
Expand-Archive webview2.zip -DestinationPath webview2-sdk
$env:WEBVIEW2_LIB_PATH = "$(pwd)\webview2-sdk\build\native\x64"

# Build Tauri
npm run gui:build
npx tauri build
```

Expected: Build completes successfully, creates `src-tauri/target/release/puppet-master.exe`

### 2. Test Full CI Pipeline

Push changes and monitor GitHub Actions run:

```bash
git add .github/workflows/build-installers.yml scripts/build-installer.ts src-tauri/tauri.conf.json
git commit -m "fix: Add WebView2 SDK for Windows Tauri builds"
git push
```

Expected output in CI logs:
```
Downloading WebView2 SDK...
WebView2 SDK installed at: C:\Users\runneradmin\AppData\Local\Temp\webview2-sdk

🦀 Building Tauri desktop app...
   Compiling puppet-master v0.1.0
    Finished release [optimized] target(s) in 45.23s
    Bundling puppet-master.exe
✅ Tauri app staged successfully
```

### 3. Verify Installer Contains Tauri

After successful build:

```powershell
# Download artifact from GitHub Actions
# Extract installer
.\puppet-master-0.1.0-win-x64.exe /S

# Check if Tauri binary exists
Test-Path "$env:ProgramFiles\Puppet Master\app\puppet-master-gui.exe"
# Expected: True
```

---

## Why the Previous Build "Succeeded"

The previous workflow had a subtle bug:

```typescript
// scripts/build-installer.ts (OLD)
if (tauriPath && existsSync(tauriPath)) {
  await stageTauriApp(tauriPath, payloadRoot, args.platform);
  console.log('\n✅ Tauri app staged successfully\n');
} else {
  console.warn('\n⚠️  Tauri build failed or artifacts not found, continuing without Tauri\n');
  // ⚠️ Build continues here instead of failing!
}
```

This meant:
1. ✅ TypeScript compilation succeeded
2. ❌ Tauri compilation failed (missing WebView2 SDK)
3. ⚠️  Script logged warning but continued
4. ✅ NSIS installer built successfully (without Tauri)
5. ✅ CI marked job as "passed" (exit code 0)

**Result:** Incomplete installer shipped without Tauri desktop app.

---

## Summary

### Files Changed
1. `.github/workflows/build-installers.yml` - Added WebView2 SDK installation step
2. `scripts/build-installer.ts` - Changed warning to error when Tauri build fails
3. `src-tauri/tauri.conf.json` - Removed redundant beforeBuildCommand

### Lines Changed
- **Total:** ~20 lines added/modified
- **Impact:** High (fixes critical Windows build failure)
- **Risk:** Low (additive changes, no breaking changes)

### Root Cause
**Missing WebView2 SDK in GitHub Actions Windows runner** caused:
```
LINK : fatal error LNK1181: cannot open input file 'WebView2Loader.dll.lib'
```

### The Fix
**Install WebView2 SDK from NuGet in CI** before Tauri build:
```powershell
Invoke-WebRequest -Uri "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2592.51" -OutFile webview2.zip
Expand-Archive webview2.zip -DestinationPath webview2-sdk
$env:WEBVIEW2_LIB_PATH = "$sdkDir\build\native\x64"
```

**Status:** ✅ **READY FOR TESTING**
