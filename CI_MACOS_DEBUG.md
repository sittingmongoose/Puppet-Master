# macOS CI Build – Debugger Analysis

**Context:** Linux and Windows installer builds pass in GitHub Actions; macOS build fails (run after commit `c7b3cb8`). This doc follows the **debugger agent** methodology: symptom analysis, hypotheses, and fixes.

---

## 1. Getting the actual error

Without the exact log, we can’t confirm root cause. To get it:

1. Open **Actions** → **Build installers** → latest run.
2. Open the **Build (macos-14)** job (failed or with failed steps).
3. Find the **first failed step** (often **Build installer** or **Smoke test (macOS)**).
4. Expand that step and copy the **last 50–100 lines** (error message and stack/command output).

**If you're still seeing macOS errors, paste that output here or in an issue** so we can fix the root cause.

**Where failures usually appear:**

| Step | If it fails here |
|------|-------------------|
| Install dependencies | `npm ci` (lockfile/node version; rare) |
| Build TypeScript | `npm run build` (TS errors) |
| Build GUI | `npm run gui:build` (React/build errors) |
| **Build installer** | **Most likely:** `npm run build:mac:tauri` – Tauri build, staging, pkgbuild, or hdiutil |
| Smoke test (macOS) | DMG mount, PKG install, or CLI path (step has `continue-on-error: true`) |

Focus first on the **Build installer** step.

---

## 2. Likely causes (hypotheses)

From codebase review:

### A. Tauri / code signing (high)

- **Symptom:** Tauri/cargo step fails; message may mention “signing”, “identity”, or “certificate”.
- **Cause:** macOS expects a signing identity; in CI there is none.
- **Fix applied:** In `src-tauri/tauri.conf.json`, `bundle.macOS.signingIdentity` set to `null` so Tauri does not require a real signing identity in CI.

### B. pkgbuild / hdiutil argument handling (medium)

- **Symptom:** `pkgbuild` or `hdiutil` fails; paths or “Puppet Master” appear in the error.
- **Cause:** Paths with spaces passed via shell and split incorrectly.
- **Status:** Script already uses `run(..., { shell: false })` for both commands in `scripts/build-installer.ts`, so args are passed as an array. If the failure persists, the log will show the exact command and error.

### C. Exit 137 (OOM) during `installer -pkg` (fixed)

- **Symptom:** `sudo installer -pkg "$pkg" -target /` is killed: "Killed: 9", exit code 137.
- **Cause:** Exit 137 = SIGKILL. Postinstall runs `npm rebuild`, which is memory-heavy and triggers OOM on GitHub-hosted runners.
- **Fix:** Workflow creates `/tmp/.puppet-master-ci-install` before the installer. Postinstall skips native-module rebuild (and auto-launch) when this file exists.

### D. Staging / npm / Playwright (medium)

- **Symptom:** Failure during “Staging …”, “npm ci”, “Rebuilding native modules”, or “Installing Playwright”.
- **Cause:** Network, lockfile, or disk in CI.
- **Action:** Check the exact command and error in the log; retries are already in place for native rebuild and copy.

### E. Xcode / license (lower on GitHub-hosted)

- **Symptom:** Error about Xcode license or `xcodebuild`.
- **Cause:** Runner not accepting license.
- **Action:** Only if the log shows this; GitHub’s `macos-14` usually has license pre-accepted.

---

## 3. Fixes applied in this session

1. **Disable Tauri code signing requirement on macOS (CI and local without cert)**  
   - In `src-tauri/tauri.conf.json`, added:
   - `"macOS": { "signingIdentity": null }` under `bundle`.
   - So Tauri does not require a real signing identity when building the macOS app.

2. **This doc**  
   - How to get the failing step and log.
   - Likely failure points and what’s already fixed (e.g. `shell: false` for pkgbuild/hdiutil).

---

## 4. If macOS still fails after the next run

1. **Paste the failing step log** (Build installer or the step that actually fails) into this doc or a follow-up issue.
2. **Check the exact failing command** in the log (e.g. `cargo`, `npx tauri build`, `pkgbuild`, `hdiutil`, or a Node script).
3. **Optional:** Add a temporary “Diagnostics (macOS)” step in `.github/workflows/build-installers.yml` before “Build installer”:
   - `node --version && npm --version && cargo --version && which pkgbuild hdiutil`
   - So we can confirm versions and paths on the runner.

---

## 5. Summary

- **Root cause:** Unknown until the failed step log is checked; most likely **Tauri/code signing** on macOS.
- **Change made:** `bundle.macOS.signingIdentity: null` in `src-tauri/tauri.conf.json`.
- **Next:** Re-run the workflow, then if it still fails, use the log from the **Build installer** (or first failing) step to drive the next fix.
