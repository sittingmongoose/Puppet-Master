# CI Run 21537135157 - Fix Validation Checklist

**Purpose:** Validate that all 4 fixes from run 21537135157 are working correctly  
**Status:** ✅ Fixes Applied | 🔄 Awaiting CI Validation

---

## Quick Validation Commands

### 1. Verify WebView2 SDK Step Exists

```bash
# Check workflow includes WebView2 SDK installation
grep -A 15 "Install WebView2 SDK" .github/workflows/build-installers.yml
```

**Expected Output:**
```yaml
- name: Install WebView2 SDK (Windows for Tauri)
  if: runner.os == 'Windows'
  shell: pwsh
  run: |
    $sdkUrl = "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2592.51"
    ...
    echo "WEBVIEW2_LIB_PATH=$libPath" | Out-File -FilePath $env:GITHUB_ENV
```

**Status:** ✅ / ❌

---

### 2. Verify Build Script Fails on Tauri Error

```bash
# Check build-installer.ts throws error instead of warning
grep -A 5 "When using --with-tauri flag" scripts/build-installer.ts
```

**Expected Output:**
```typescript
throw new Error(
  'Tauri build failed or artifacts not found. ' +
  'When using --with-tauri flag, the build must include the Tauri desktop application. ' +
  'Check the logs above for the actual build error.'
);
```

**Status:** ✅ / ❌

---

### 3. Verify Redundant Build Removed

```bash
# Check tauri.conf.json has empty beforeBuildCommand
grep -A 2 "beforeBuildCommand" src-tauri/tauri.conf.json
```

**Expected Output:**
```json
"beforeBuildCommand": "",
```

**Status:** ✅ / ❌

---

### 4. Verify Defensive Console.warn

```bash
# Check copilot-sdk-runner.ts has defensive wrapper
grep -A 8 "Suppress console output errors" src/platforms/copilot-sdk-runner.ts
```

**Expected Output:**
```typescript
// Suppress console output errors that may occur if streams are destroyed
try {
  if (process.stdout.writable) {
    console.warn(`[CopilotSdkRunner] SDK unavailable: ${this.sdkUnavailableReason}`);
  }
} catch {
  // Stream already destroyed, silently skip warning
}
```

**Status:** ✅ / ❌

---

## Local Build Test

### Quick Test Commands

```bash
# 1. Verify TypeScript compiles
npm run build

# 2. Verify GUI builds
npm run gui:build

# 3. Test build script (dry-run, no actual installer)
# Check that script loads and parses arguments correctly
node -e "import('./dist/scripts/build-installer.js')"
```

**All Pass?** ✅ / ❌

---

## CI Validation Checklist

### Before Triggering CI

- [ ] All 4 fixes verified locally (commands above)
- [ ] TypeScript compiles without errors
- [ ] GUI builds without errors
- [ ] Git status shows no unexpected changes
- [ ] Latest commit includes fix changes

### Trigger CI

```bash
# Option 1: Push to main (if changes not pushed)
git push origin main

# Option 2: Manual trigger via GitHub UI
# Go to Actions → Build installers → Run workflow
```

### Monitor CI Run

Watch for these log entries:

#### Windows Build

**WebView2 SDK Installation:**
```
Downloading WebView2 SDK...
WebView2 SDK installed at: C:\Users\runneradmin\AppData\Local\Temp\webview2-sdk
```

**Tauri Compilation:**
```
🦀 Building Tauri desktop app...
   Compiling windows v0.52.0
   Compiling tauri v2.x.x
   Compiling puppet-master v0.1.0
    Finished release [optimized] target(s) in 45.23s
✅ Tauri app staged successfully
```

**No This Error:**
```
❌ SHOULD NOT SEE: LINK : fatal error LNK1181: cannot open input file 'WebView2Loader.dll.lib'
```

#### macOS Build

**GUI Build:**
```
Building GUI...
✓ built in 1.23s
```

**Tauri Build:**
```
🦀 Building Tauri desktop app...
   Compiling puppet-master v0.1.0
    Finished release [optimized] target(s) in 32.15s
✅ Tauri app staged successfully
```

**GUI Smoke Test:**
```
Launching GUI...
❌ SHOULD NOT SEE: CopilotSdkRunner SDK unavailable: Failed to initialize Copilot SDK: Cannot call write after a stream was destroyed
✅ Should only see: WARNING: GUI did not start within 15s (if timeout occurs)
```

#### Linux Build

**Tauri Build:**
```
🦀 Building Tauri desktop app...
   Compiling webkit2gtk v2.x.x
   Compiling puppet-master v0.1.0
    Finished release [optimized] target(s) in 52.34s
✅ Tauri app staged successfully
```

---

## Success Criteria

### ✅ Windows Build Success

- [ ] WebView2 SDK downloads successfully
- [ ] Tauri compilation completes (no LNK1181 error)
- [ ] Installer artifact includes Tauri desktop .exe
- [ ] Smoke test passes (CLI installs and runs)

### ✅ macOS Build Success

- [ ] GUI builds without double-build (single "Building GUI..." message)
- [ ] Tauri compilation completes
- [ ] Installer artifact includes Tauri .app bundle
- [ ] CLI smoke test passes
- [ ] GUI smoke test: No stream destruction errors (timeout acceptable)

### ✅ Linux Build Success

- [ ] Tauri compilation completes
- [ ] DEB and RPM artifacts include Tauri binary
- [ ] Smoke test passes (DEB installs, CLI runs)

### ✅ All Platforms

- [ ] No silent Tauri build failures
- [ ] All artifacts uploaded
- [ ] Build completes in reasonable time (<60 minutes)

---

## Failure Scenarios & Debugging

### Scenario 1: Windows Still Missing WebView2 SDK

**Symptoms:**
```
LINK : fatal error LNK1181: cannot open input file 'WebView2Loader.dll.lib'
```

**Debug Steps:**
1. Check if WebView2 SDK step ran:
   ```
   Search logs for: "Install WebView2 SDK (Windows for Tauri)"
   ```

2. Verify environment variable was set:
   ```
   Search logs for: "WEBVIEW2_LIB_PATH="
   ```

3. Check Tauri can find SDK:
   ```
   Search logs for: "Tauri build environment"
   ```

**Fix:** Verify workflow YAML syntax (lines 63-77)

---

### Scenario 2: Build Still Continues After Tauri Failure

**Symptoms:**
```
⚠️ Tauri build failed or artifacts not found, continuing without Tauri
✅ CI run marked as success
```

**Debug Steps:**
1. Check if error is thrown:
   ```
   Search logs for: "throw new Error"
   Search logs for: "When using --with-tauri flag"
   ```

2. Verify build-installer.ts was compiled:
   ```
   Check timestamp on dist/scripts/build-installer.js
   ```

**Fix:** Run `npm run build` and commit updated dist/

---

### Scenario 3: GUI Still Built Twice (Performance)

**Symptoms:**
```
Building GUI... (from workflow)
Building GUI... (from Tauri beforeBuildCommand)
```

**Debug Steps:**
1. Check tauri.conf.json:
   ```bash
   cat src-tauri/tauri.conf.json | grep beforeBuildCommand
   ```

2. Should be empty string: `"beforeBuildCommand": ""`

**Fix:** Ensure tauri.conf.json has empty beforeBuildCommand

---

### Scenario 4: macOS Still Shows Stream Error

**Symptoms:**
```
Cannot call write after a stream was destroyed
```

**Debug Steps:**
1. Check copilot-sdk-runner.ts was compiled:
   ```
   grep "process.stdout.writable" dist/platforms/copilot-sdk-runner.js
   ```

2. Verify defensive wrapper exists:
   ```
   grep -A 5 "try {" src/platforms/copilot-sdk-runner.ts | grep writable
   ```

**Fix:** Run `npm run build` and commit updated dist/

---

## Rollback Procedure

If critical failures occur:

### Individual Fix Rollback

```bash
# Revert WebView2 SDK step
git show HEAD:.github/workflows/build-installers.yml > workflow-backup.yml
# Edit lines 63-77, remove WebView2 step
git add .github/workflows/build-installers.yml
git commit -m "revert: Remove WebView2 SDK step"

# Revert fail-on-error behavior
git checkout HEAD~1 scripts/build-installer.ts
git commit -m "revert: Allow Tauri build to continue on error"

# Revert redundant build removal
git checkout HEAD~1 src-tauri/tauri.conf.json
git commit -m "revert: Restore beforeBuildCommand"

# Revert defensive console
git checkout HEAD~1 src/platforms/copilot-sdk-runner.ts
git commit -m "revert: Remove defensive console.warn wrapper"
```

### Full Rollback (All Fixes)

```bash
# Find commits with fixes
git log --oneline -20 | grep -E "(tauri|webview2|stream|redundant)"

# Revert range (example - adjust commit hashes)
git revert <earliest-fix-commit>^..<latest-fix-commit>
git push origin main
```

---

## Post-Validation Steps

### If All Tests Pass ✅

1. **Update Documentation:**
   - [ ] Mark fixes as validated in issue tracker
   - [ ] Update CHANGELOG with fixes
   - [ ] Close related GitHub issues

2. **Monitor Release:**
   - [ ] Download Windows installer artifact
   - [ ] Test local installation on Windows machine
   - [ ] Verify Tauri desktop app launches
   - [ ] Test CLI commands work

3. **Create Release:**
   - [ ] Tag commit: `git tag v0.x.x`
   - [ ] Push tag: `git push origin v0.x.x`
   - [ ] Create GitHub release with artifacts

### If Tests Fail ❌

1. **Triage Failure:**
   - [ ] Identify which fix failed (Windows/macOS/Linux)
   - [ ] Review error logs (not silent now!)
   - [ ] Determine if rollback needed

2. **Fix or Rollback:**
   - [ ] Apply additional fix if minor issue
   - [ ] Rollback if critical blocker found
   - [ ] Document learnings

3. **Re-Test:**
   - [ ] Trigger new CI run after fix
   - [ ] Validate specific failure is resolved

---

## Validation Timeline

| Step | Time | Status |
|------|------|--------|
| Local verification | 5 min | ⏳ |
| Trigger CI run | 1 min | ⏳ |
| Windows build | ~15 min | ⏳ |
| macOS build | ~20 min | ⏳ |
| Linux build | ~25 min | ⏳ |
| Download artifacts | 5 min | ⏳ |
| Local testing | 15 min | ⏳ |
| **Total** | **~80 min** | ⏳ |

---

## Contact Info

**Reviewer:** Senior Code Reviewer  
**Date:** 2024-01-31  
**CI Run Reference:** 21537135157  
**Documentation:** 
- [CI_RUN_21537135157_ACTIONABLE_SUMMARY.md](./CI_RUN_21537135157_ACTIONABLE_SUMMARY.md)
- [GITHUB_ACTIONS_RUN_21537135157_REVIEW.md](./GITHUB_ACTIONS_RUN_21537135157_REVIEW.md)

---

**Next Action:** Run local verification commands above, then trigger CI
